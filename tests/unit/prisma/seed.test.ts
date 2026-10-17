import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";

/**
 * Characterisation of prisma/seed.ts: the script is run against an in-memory
 * recorder instead of a database. Math.random is seeded and Date is frozen, so
 * the exact sequence (and payloads) of Prisma calls is reproducible. Any
 * reordering of steps or change of seed data changes the pinned hashes.
 */
const h = vi.hoisted(() => ({
  log: [] as unknown[],
  done: null as null | Promise<void>,
  resolveDone: null as null | (() => void),
}));

vi.mock("@/lib/generated/prisma/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated/prisma/client")>();
  const store = new Map<string, Record<string, unknown>[]>();
  let n = 0;
  const rowsOf = (model: string) => {
    if (!store.has(model)) store.set(model, []);
    return store.get(model)!;
  };
  const make = (model: string, data: Record<string, unknown>) => {
    const row = { id: `${model}_${++n}`, ...data };
    rowsOf(model).push(row);
    return row;
  };
  class MockPrismaClient {
    $disconnect = async () => {
      h.log.push(["$disconnect"]);
      h.resolveDone?.();
    };
    constructor() {
      return new Proxy(this, {
        get: (target, prop: string) => {
          if (prop in target) return (target as never)[prop];
          if (prop.startsWith("$") || prop === "then") return undefined;
          return new Proxy(
            {},
            {
              get: (_m, method: string) => async (args?: Record<string, any>) => {
                h.log.push([`${prop}.${method}`, args]);
                switch (method) {
                  case "create":
                    return make(prop, { ...(args?.data ?? {}) });
                  case "upsert":
                    return make(prop, { ...(args?.create ?? {}) });
                  case "createMany": {
                    const data = (args?.data ?? []) as Record<string, unknown>[];
                    data.forEach((d) => make(prop, { ...d }));
                    return { count: data.length };
                  }
                  case "update":
                    return { id: args?.where?.id ?? `${prop}_u`, ...(args?.data ?? {}) };
                  case "findMany": {
                    let rows = [...rowsOf(prop)];
                    const where = (args?.where ?? {}) as Record<string, unknown>;
                    for (const [k, v] of Object.entries(where)) {
                      if (typeof v === "string") rows = rows.filter((r) => r[k] === v);
                    }
                    return rows;
                  }
                  default:
                    return { id: `${prop}_${method}` };
                }
              },
            },
          );
        },
      });
    }
  }
  return { ...actual, PrismaClient: MockPrismaClient };
});

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("prisma/seed.ts (pinned Prisma call sequence)", () => {
  it("issues the same Prisma calls in the same order", async () => {
    // Load the driver and the generated client first: module initialisation may
    // draw from Math.random, which would shift the pinned sequence below.
    await import("@prisma/adapter-pg");
    await import("@/lib/generated/prisma/client");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
    vi.spyOn(Math, "random").mockImplementation(mulberry32(1234));
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...a) => {
      const line = a.join(" ");
      logs.push(line);
      h.log.push(["console.log", line]);
    });
    vi.spyOn(console, "error").mockImplementation((...a) => {
      h.log.push(["console.error", a.map(String).join(" ")]);
    });
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    h.done = new Promise<void>((res) => (h.resolveDone = res));
    await import("../../../prisma/seed");
    await h.done;

    expect(exit).not.toHaveBeenCalled();

    // split the call log into steps delimited by console.log lines
    const steps: Array<{ header: string; calls: number; hash: string }> = [];
    let current: { header: string; calls: unknown[] } = { header: "<start>", calls: [] };
    for (const entry of h.log as Array<[string, unknown]>) {
      if (entry[0] === "console.log") {
        if (current.calls.length) steps.push({ header: current.header, calls: current.calls.length, hash: hash(current.calls) });
        current = { header: String(entry[1]), calls: [] };
      } else current.calls.push(entry);
    }
    steps.push({ header: current.header, calls: current.calls.length, hash: hash(current.calls) });

    const counts: Record<string, number> = {};
    for (const e of h.log as Array<[string, unknown]>) {
      if (e[0] !== "console.log" && e[0] !== "console.error") counts[e[0]] = (counts[e[0]] ?? 0) + 1;
    }

    expect(counts).toMatchSnapshot();
    expect(steps).toMatchSnapshot();
    expect(logs).toMatchSnapshot();
    expect(hash(h.log)).toMatchSnapshot();
  });
});
