import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createTopology,
  getLinkGeometry,
  getLinkStyle,
  getNodeColors,
} from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication/lib";
import type { DatabaseNode } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication/types";

const node = (over: Partial<DatabaseNode>): DatabaseNode => ({
  id: "n",
  type: "slave",
  status: "active",
  operations: [],
  lastUpdated: 0,
  position: { x: 0, y: 0 },
  ...over,
});

describe("database replication helpers", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds the three topologies", () => {
    const ms = createTopology("master-slave");
    expect(ms.nodes.map((n) => n.id)).toEqual(["master", "slave-0", "slave-1", "slave-2"]);
    expect(ms.links.map((l) => `${l.source}>${l.target}`)).toEqual(["master>slave-0", "master>slave-1", "master>slave-2"]);
    expect(ms.nodes[1].position).toEqual({ x: 200, y: 250 });

    const mm = createTopology("master-master");
    expect(mm.nodes.map((n) => n.type)).toEqual(["master", "master"]);
    expect(mm.links.map((l) => `${l.source}>${l.target}`)).toEqual(["master-0>master-1", "master-1>master-0"]);

    const ring = createTopology("multi-master");
    expect(ring.nodes).toHaveLength(4);
    expect(ring.links.map((l) => `${l.source}>${l.target}`)).toEqual(["master-0>master-1", "master-1>master-2", "master-2>master-3", "master-3>master-0"]);
    expect(ring.nodes[0].position.x).toBeCloseTo(550);
    expect(ring.nodes[0].position.y).toBeCloseTo(200);
  });

  it("curves the link to the left of the source->target direction", () => {
    const g = getLinkGeometry(node({ position: { x: 0, y: 0 } }), node({ position: { x: 100, y: 0 } }));
    expect(g).toMatchObject({ startX: 0, startY: 0, endX: 100, endY: 0 });
    expect(g.controlX).toBeCloseTo(50);
    expect(g.controlY).toBeCloseTo(30);
  });

  it("styles links and nodes by status", () => {
    expect(getLinkStyle("active")).toEqual({ strokeColor: "stroke-slate-600", strokeWidth: "stroke-[2px]" });
    expect(getLinkStyle("syncing")).toEqual({ strokeColor: "stroke-blue-500", strokeWidth: "stroke-[3px]" });
    expect(getLinkStyle("down")).toEqual({ strokeColor: "stroke-red-500", strokeWidth: "stroke-[2px]" });
    expect(getNodeColors(node({ type: "slave" })).bgColor).toBe("bg-blue-900/30");
    expect(getNodeColors(node({ type: "master" })).textColor).toBe("text-indigo-300");
    expect(getNodeColors(node({ type: "master", status: "down" })).borderColor).toBe("border-red-800");
  });
});
