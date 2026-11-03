import { addPassword, closeDb, sql } from "./db";
import { enrollTwoFactor } from "./two-factor";

export const ADMIN_EMAIL = "fygs.dev@gmail.com"; // the seeded admin (prisma/seed/data/users.ts)

/** The seed creates users without credentials; give the seeded admin a password. */
export default async function globalSetup() {
  const [admin] = await sql<{ id: string; role: string }>(`SELECT id, role FROM "user" WHERE email = $1`, [ADMIN_EMAIL]);
  if (!admin) throw new Error("seeded admin user missing: was the database seeded?");
  if (admin.role !== "ADMIN") throw new Error("seeded admin user is not an ADMIN");
  const [existing] = await sql(`SELECT 1 FROM account WHERE "userId" = $1 AND "providerId" = 'credential'`, [admin.id]);
  if (!existing) await addPassword(admin.id);
  await enrollTwoFactor(sql, admin.id); // an administrator holds the role only with a second factor
  await closeDb();
}
