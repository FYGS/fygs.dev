# Storage hardening: what the code does, what the owner must set

Context: audit of 2026-11 (findings S5-1 to S5-8, S2-6, S2-12). Everything below is about files uploaded by authors: course
images, lesson videos, lesson resources, captions.

## What the code guarantees

| Topic | Rule |
|-------|------|
| Who uploads | `ADMIN` and `INSTRUCTOR` only; limited per address **and per account** (`user:<id>`), so changing address gives no extra room. |
| What is stored | The key is built on the server (`folder/<user>/<time>-<random>.<ext>`); the file name sent by the browser plays no part. The extension comes from the **accepted content type**, never from the name. |
| Images | The bytes decide (PNG, JPEG, GIF, WebP signatures); the announced type and the extension are claims. SVG and HTML are never accepted. The body is refused before being read if the announced length is above 5 MB. |
| Upload addresses | 15 minutes; the content type and the exact length are part of the signature (the storage refuses a PUT that announces another type or size). |
| Quotas | Per account and kind: images 200 MB, videos 5 GB, files 1 GB, captions 50 MB. Administrators are exempt. Every upload is recorded in `MediaObject` when its address is issued, so abandoned uploads count until cleaned. A single object is at most 500 MB (videos). |
| Ownership | Only the owner of an image, or an administrator, can delete it, and only a key the upload route could have written. Each deletion is written to the audit log. |
| Reading paid media | The learner's browser never receives the stored address. The lesson page points the player at `/api/learn/media/<lessonId>`, downloads at `/api/learn/resource/<resourceId>`; both check the right to open the lesson (same rule as the lesson page and the captions) and redirect to a **15 minute signed address**. A refused viewer gets the same 404 as a lesson that does not exist. The player asks for a new address by itself if one expires during playback. |
| Captions | Served by the site (`/api/learn/captions/<lessonId>`), fetched by the server with a hardened client (`lib/net/safe-fetch.ts`: https and port 443 only, the name is resolved by the server and every answer must be a public address, the checked address is the one connected to, no redirect, 2 MB cap while streaming, 10 s). Any failure gives the same answer. |
| Public images | The public-read policy is applied only to the image folders (`images`, `courses`, `lessons`, `paths`, `avatars`) and only when `S3_IMAGES_PUBLIC_POLICY=1`. Nothing else in that bucket is made public by the application. |

## What the owner must do

The code can sign addresses; only the storage decides whether an unsigned address works.

1. **Make the media bucket private** (`S3_BUCKET`, default `fygs-videos`: videos, resources, captions). Remove any anonymous
   `GetObject` policy on it. After that a copied address stops working after 15 minutes, and a refund or a lapsed subscription
   ends access to the files too. Existing lessons keep working: their stored `videoUrl` is turned into a signed address by
   the route.
2. **Keep the image bucket (`S3_IMAGES_BUCKET`, default `S3_BUCKET`) public for the image folders only.**
   Set `S3_IMAGES_PUBLIC_POLICY=1` once in the environment so that the application applies that policy, or apply an equivalent
   policy yourself. A bucket policy persists: a new environment shows images only after this step. If both buckets are the
   same bucket, the policy still covers only the image folders, so videos are private.
3. **Use two keys**: one allowed to read/write/delete in the media bucket only (`S3_*`), one for the image bucket only (`S3_IMAGES_ACCESS_KEY_ID` / `S3_IMAGES_SECRET_ACCESS_KEY`).
   The cleanup script needs delete rights on the bucket it cleans.
4. **Response headers of the storage** (a CDN or proxy in front can add them): `X-Content-Type-Options: nosniff` on every
   object; `Content-Disposition: attachment` for the resources bucket if you serve it directly; a restrictive CORS
   configuration (only the site origin, `GET`/`HEAD` for the media bucket, `PUT` for the upload origin if the browser uploads
   straight to it: `Access-Control-Allow-Origin: https://fygs.dev`, never `*`).
5. **Use an owned domain** for the storage in `S3_PUBLIC_URL` and `S3_IMAGES_PUBLIC_URL`; `next.config.mjs` adds their hosts to `images.remotePatterns` at build time.
6. **Check it** after deploying (replace the address with a real stored one):

   ```
   curl -sI https://<storage>/videos/<user>/<file>.mp4          # expect 403 once the bucket is private
   curl -sI https://<storage>/courses/<an image>.png            # expect 200 with Content-Type image/png and nosniff
   ```

   In a browser: open a paid lesson, copy the video address from the network tab, wait 15 minutes, open it in a private
   window: it must be refused. A learner without access must get a 404 from `/api/learn/media/<lessonId>`.
7. **Clean up regularly** (weekly is plenty), from a trusted machine or a scheduled job:

   ```
   node scripts/cleanup-media.mjs                                # dry run: lists unreferenced uploads older than 2 days
   node scripts/cleanup-media.mjs --apply                        # removes them from the storage and marks them deleted
   node scripts/cleanup-media.mjs --target=images --apply        # same for the image bucket
   ```

   An object is kept if any course, lesson, resource, path, profile or slide still points at it. Removals are written to the
   audit log.
8. **Scan what authors upload if you can.** Documents (Office files, ZIP) are accepted from instructors and downloaded by
   learners; the application does not scan them. A scanner on the bucket (for example ClamAV on a schedule) is the missing
   layer. Legacy Office formats (`.doc`, `.xls`, `.ppt`) can carry macros: remove them from `RESOURCE_CONTENT_TYPES` in
   `lib/resource-types.ts` if you do not need them.

## Known limits

- A video address copied while it is valid works until it expires (15 minutes). Shorter lifetimes would break long playback
  without the automatic renewal the player already does; the limit is deliberate.
- The free sample lessons (`isPreview`) are served to anyone, with no account, by design.
- Instructors can still point a lesson at an https address elsewhere (their own CDN). Such media is not under the signing
  scheme, and the host can see who watches. Restrict it by policy if this matters to you.
