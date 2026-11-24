import { describe, it, expect } from "vitest";
import { createTopology } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication/lib";
import {
  simulateTick,
  type SimulationSettings,
} from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication/simulation";

const NOW = 1_000_000;
const always = () => 0; // every load check passes, every pick takes the first candidate
const never = () => 0.999; // no load check passes
const settings = (over: Partial<SimulationSettings> = {}): SimulationSettings => ({
  writeLoad: 100,
  readLoad: 100,
  consistencyModel: "async",
  failedNode: null,
  ...over,
});

describe("simulateTick", () => {
  it("writes on a master and reads on a node", () => {
    const { nodes: before, links } = createTopology("master-slave");
    const { nodes } = simulateTick(before, links, settings(), NOW, always);
    expect(nodes.find((n) => n.id === "master")?.operations).toEqual(["write", "read"]);
    expect(nodes.filter((n) => n.id !== "master").every((n) => n.operations.length === 0)).toBe(true);
  });

  it("propagates writes to the targets only for the synchronous models", () => {
    const { nodes: before, links: beforeLinks } = createTopology("master-slave");
    const async = simulateTick(before, beforeLinks, settings({ consistencyModel: "async" }), NOW, never);
    expect(async.links.every((l) => l.status === "active")).toBe(true);

    // writeLoad 100 passes the write check at random() < 1; readLoad 0 never reads
    const sync = simulateTick(before, beforeLinks, settings({ consistencyModel: "sync", readLoad: 0 }), NOW, always);
    expect(sync.links.every((l) => l.status === "syncing" && l.lastSync === NOW)).toBe(true);
    expect(sync.nodes.filter((n) => n.type === "slave").every((n) => n.operations.join() === "sync")).toBe(true);
    expect(sync.nodes.find((n) => n.type === "master")?.operations).toEqual(["write"]);
  });

  it("honours the write and read load it is given", () => {
    const { nodes: before, links } = createTopology("master-slave");
    const idle = simulateTick(before, links, settings({ writeLoad: 0, readLoad: 0 }), NOW, always);
    expect(idle.nodes.every((n) => n.operations.length === 0)).toBe(true);
  });

  it("leaves the failed node out of writes and reads", () => {
    const { nodes: before, links } = createTopology("master-master");
    const { nodes } = simulateTick(before, links, settings({ failedNode: "master-0" }), NOW, always);
    expect(nodes.find((n) => n.id === "master-0")?.operations).toEqual([]);
    expect(nodes.find((n) => n.id === "master-1")?.operations).toEqual(["write", "read"]);
  });

  it("returns syncing links to active once they are over a second old", () => {
    const { nodes, links } = createTopology("master-slave");
    const syncing = links.map((l, i) => ({ ...l, status: "syncing" as const, lastSync: NOW - (i === 0 ? 1500 : 500) }));
    const next = simulateTick(nodes, syncing, settings({ writeLoad: 0, readLoad: 0 }), NOW, never).links;
    expect(next.map((l) => l.status)).toEqual(["active", "syncing", "syncing"]);
  });

  it("does not mutate its input", () => {
    const { nodes, links } = createTopology("multi-master");
    const frozenNodes = JSON.stringify(nodes);
    const frozenLinks = JSON.stringify(links);
    simulateTick(nodes, links, settings({ consistencyModel: "sync" }), NOW, always);
    expect(JSON.stringify(nodes)).toBe(frozenNodes);
    expect(JSON.stringify(links)).toBe(frozenLinks);
  });
});
