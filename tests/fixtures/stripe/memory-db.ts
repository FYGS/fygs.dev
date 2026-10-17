/**
 * Minimal in-memory stand-in for the Prisma models the Stripe code touches
 * (payment, subscription, user, course, enrollment, invoiceAudit). It understands
 * only what that code queries: equality, `{ in: [...] }` and the `userId_courseId`
 * compound key. Enough to check what a sequence of webhook deliveries leaves behind.
 */
type Row = Record<string, any>;

const matches = (row: Row, where: Row = {}): boolean =>
  Object.entries(where).every(([key, expected]) => {
    if (expected && typeof expected === "object" && "in" in expected) {
      return (expected.in as unknown[]).includes(row[key]);
    }
    return row[key] === expected;
  });

function table(name: string, calls: unknown[]) {
  const rows: Row[] = [];
  let seq = 0;
  const find = (where?: Row) => rows.find((r) => matches(r, where));
  return {
    rows,
    findFirst: async (args: { where?: Row } = {}) => {
      calls.push([`${name}.findFirst`, args.where]);
      return find(args.where) ?? null;
    },
    findUnique: async (args: { where: Row }) => {
      calls.push([`${name}.findUnique`, args.where]);
      const compound = args.where.userId_courseId;
      return find(compound ?? args.where) ?? null;
    },
    create: async ({ data }: { data: Row }) => {
      calls.push([`${name}.create`, data]);
      const row = { id: `${name}_${++seq}`, ...data };
      rows.push(row);
      return row;
    },
    update: async ({ where, data }: { where: Row; data: Row }) => {
      calls.push([`${name}.update`, where, data]);
      const row = find(where);
      if (!row) throw new Error(`${name}.update: no row for ${JSON.stringify(where)}`);
      Object.assign(row, data);
      return row;
    },
    updateMany: async ({ where, data }: { where: Row; data: Row }) => {
      calls.push([`${name}.updateMany`, where, data]);
      const hit = rows.filter((r) => matches(r, where));
      hit.forEach((r) => Object.assign(r, data));
      return { count: hit.length };
    },
    upsert: async ({ where, create, update }: { where: Row; create: Row; update: Row }) => {
      calls.push([`${name}.upsert`, where]);
      const row = find(where);
      if (row) return Object.assign(row, update);
      const created = { id: `${name}_${++seq}`, ...create };
      rows.push(created);
      return created;
    },
  };
}

export function createMemoryDb() {
  const calls: unknown[] = [];
  const db = {
    payment: table("payment", calls),
    subscription: table("subscription", calls),
    user: table("user", calls),
    course: table("course", calls),
    enrollment: table("enrollment", calls),
    invoiceAudit: table("invoiceAudit", calls),
  };
  return {
    db,
    calls,
    reset() {
      calls.length = 0;
      for (const t of Object.values(db)) t.rows.length = 0;
    },
  };
}
