"use client";

import { GraphData } from "./graph-database-view/graph-data";
import { GraphDiagram } from "./graph-database-view/graph-diagram";
import { GraphQueries } from "./graph-database-view/graph-queries";

export function GraphDatabaseView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <>
      {/* Graph Data */}
      <GraphData />

      {/* Graph Visualization */}
      <GraphDiagram />

      {/* Query & Results */}
      <GraphQueries queryType={queryType} />
    </>
  );
}
