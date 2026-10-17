import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7 talks to PostgreSQL through the `pg` driver adapter. The connection
// is opened lazily, so importing this module (e.g. during `next build`) does
// not need a reachable database. This module is Node-only (the `pg` driver needs
// TCP sockets): never import it from a route that declares `runtime = "edge"`.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Prisma 6 failed after 5s when no connection was available; `pg` waits
    // forever by default, which would hang requests instead of failing.
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
