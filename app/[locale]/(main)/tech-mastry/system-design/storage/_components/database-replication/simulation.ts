import type {
  ConsistencyModel,
  DatabaseNode,
  ReplicationLink,
} from "./types";

export interface SimulationSettings {
  writeLoad: number;
  readLoad: number;
  consistencyModel: ConsistencyModel;
  failedNode: string | null;
}

/**
 * One tick of the replication simulation: a write on a random master (with
 * propagation to its targets for the synchronous models), a read on a random
 * node, and the end of the "syncing" state of links synced over a second ago.
 * Never mutates its arguments; draws random numbers and reads the clock only
 * through `random` and `now`, so it runs once per tick, outside state updaters.
 */
export function simulateTick(
  prevNodes: DatabaseNode[],
  prevLinks: ReplicationLink[],
  { writeLoad, readLoad, consistencyModel, failedNode }: SimulationSettings,
  now: number,
  random: () => number = Math.random
): { nodes: DatabaseNode[]; links: ReplicationLink[] } {
  // Reset operations
  const nodes = prevNodes.map((node) => ({ ...node, operations: [] as DatabaseNode["operations"] }));
  let links = prevLinks;

  // Simulate write operations
  if (random() * 100 < writeLoad) {
    // Find master nodes
    const masterNodes = nodes.filter(
      (node) =>
        node.type === "master" &&
        node.status === "active" &&
        node.id !== failedNode
    );

    if (masterNodes.length > 0) {
      // Select a random master for the write
      const randomMaster = masterNodes[Math.floor(random() * masterNodes.length)];
      randomMaster.operations.push("write");
      randomMaster.lastUpdated = now;

      // Propagate to other nodes based on consistency model
      if (consistencyModel === "sync" || consistencyModel === "semi-sync") {
        // Synchronous replication - update all nodes immediately
        links = links.map((link) => {
          if (link.source !== randomMaster.id || link.status !== "active") {
            return link;
          }

          // Find the target node and update it
          const targetNode = nodes.find((n) => n.id === link.target);
          if (
            targetNode &&
            targetNode.status === "active" &&
            targetNode.id !== failedNode
          ) {
            targetNode.operations.push("sync");
            targetNode.lastUpdated = now;
          }

          return { ...link, status: "syncing", lastSync: now };
        });
      }
    }
  }

  // Simulate read operations
  if (random() * 100 < readLoad) {
    // In master-slave, reads can go to any node
    // In master-master and multi-master, reads can also go to any node
    const availableNodes = nodes.filter(
      (node) => node.status === "active" && node.id !== failedNode
    );

    if (availableNodes.length > 0) {
      const randomNode = availableNodes[Math.floor(random() * availableNodes.length)];
      randomNode.operations.push("read");
    }
  }

  // Update links status: after some time, change syncing back to active
  links = links.map((link) =>
    link.status === "syncing" && now - link.lastSync > 1000
      ? { ...link, status: "active" }
      : link
  );

  return { nodes, links };
}
