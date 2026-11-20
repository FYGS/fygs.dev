#!/usr/bin/env node
/**
 * Removes uploaded media that nothing refers to any more: a reservation whose upload never happened, a video replaced
 * in the editor, a file removed from a lesson. Every upload is recorded in "MediaObject" when its address is issued,
 * so the candidates are known without listing the storage.
 *
 *   node scripts/cleanup-media.mjs                    dry run: lists what would be removed
 *   node scripts/cleanup-media.mjs --apply            removes it from the storage and marks it deleted
 *   options: --older-than-days=2   (default 2: an upload address lives 15 minutes, a day is plenty)
 *            --target=media|images (media: S3_* storage, videos/resources/captions; images: S3_IMAGES_* storage, S3_* when unset)
 *
 * Needs DATABASE_URL, and the S3_* variables. Refuses to touch an object that any column still points at.
 * Run it from a trusted machine or a scheduled job, with a storage key allowed to delete in that bucket only.
 */
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";

const args = new Map(process.argv.slice(2).map((arg) => arg.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? "true"]));
const apply = args.has("apply");
const olderThanDays = Number(args.get("older-than-days") ?? 2);
const target = args.get("target") ?? "media";
if (!["media", "images"].includes(target) || !Number.isFinite(olderThanDays) || olderThanDays < 1) {
  console.error("Usage: cleanup-media.mjs [--apply] [--older-than-days=N>=1] [--target=media|images]");
  process.exit(2);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}

const kinds = target === "images" ? ["IMAGE"] : ["VIDEO", "FILE", "CAPTIONS"];

function storage() {
  const images = target === "images";
  const publicBase = (images ? process.env.S3_IMAGES_PUBLIC_URL || process.env.S3_PUBLIC_URL : process.env.S3_PUBLIC_URL)?.trim().replace(/\/+$/, "");
  const accessKeyId = (images && process.env.S3_IMAGES_ACCESS_KEY_ID) || process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = (images && process.env.S3_IMAGES_SECRET_ACCESS_KEY) || process.env.S3_SECRET_ACCESS_KEY;
  if (!publicBase || !accessKeyId || !secretAccessKey) {
    console.error(`${images ? "S3_IMAGES_PUBLIC_URL (or S3_PUBLIC_URL)" : "S3_PUBLIC_URL"} and the S3 access key are required for --target=${target}`);
    process.exit(2);
  }
  return {
    bucket: (images && process.env.S3_IMAGES_BUCKET) || process.env.S3_BUCKET || "fygs-videos",
    publicBase,
    client: new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

/** Every column that can hold the address of an uploaded object (or HTML / JSON that embeds one). */
const REFERENCES = [
  ['"Lesson"', '"videoUrl"'],
  ['"Lesson"', '"captionsUrl"'],
  ['"Lesson"', '"content"'],
  ['"LessonResource"', '"url"'],
  ['"Course"', '"thumbnail"'],
  ['"Course"', '"trailerUrl"'],
  ['"Course"', '"publicStructure"'],
  ['"Course"', '"publicResources"'],
  ['"Course"', '"publicEvaluation"'],
  ['"Course"', '"publicPrerequisites"'],
  ['"Path"', '"thumbnail"'],
  ['"user"', '"image"'],
  ['"visual_support"', '"content"::text'],
];

const { bucket, publicBase, client } = storage();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

async function isReferenced(address) {
  const like = `%${address.replace(/[\\%_]/g, "\\$&")}%`;
  const sql = REFERENCES.map(([table, column]) => `SELECT 1 FROM ${table} WHERE ${column} LIKE $1`).join(" UNION ALL ");
  const { rowCount } = await pool.query(`${sql} LIMIT 1`, [like]);
  return rowCount > 0;
}

try {
  const { rows } = await pool.query(
    `SELECT "id", "key", "kind", "sizeBytes", "createdAt" FROM "MediaObject"
     WHERE "deletedAt" IS NULL AND "kind" = ANY($1::"MediaKind"[]) AND "createdAt" < now() - ($2 || ' days')::interval
     ORDER BY "createdAt"`,
    [kinds, String(olderThanDays)],
  );

  let candidates = 0;
  let bytes = 0;
  for (const row of rows) {
    if (await isReferenced(`${publicBase}/${row.key}`)) continue;
    candidates += 1;
    bytes += row.sizeBytes;
    console.log(`${apply ? "remove" : "would remove"}  ${row.kind.padEnd(8)} ${String(row.sizeBytes).padStart(10)} B  ${row.key}`);
    if (!apply) continue;
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: row.key }));
    await pool.query(`UPDATE "MediaObject" SET "deletedAt" = now() WHERE "id" = $1`, [row.id]);
    await pool.query(
      `INSERT INTO "AuditLog" ("id", "action", "targetType", "targetId", "metadata") VALUES (gen_random_uuid()::text, 'media.deleted', 'media', $1, $2::jsonb)`,
      [row.key, JSON.stringify({ reason: "unreferenced", job: "cleanup-media" })],
    );
  }
  console.log(`\n${candidates} unreferenced object(s), ${(bytes / (1024 * 1024)).toFixed(1)} MB ${apply ? "removed" : "(dry run: nothing removed, add --apply)"}`);
} finally {
  await pool.end();
}
