"use client";

import { ColumnFamiliesPanel } from "./column-family/column-families-panel";
import { DataStructurePanel } from "./column-family/data-structure-panel";
import { QueryResultsPanel } from "./column-family/query-results-panel";

export function ColumnFamilyView({ queryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
}) {
  return (
    <>
      {/* Column Families */}
      <ColumnFamiliesPanel />

      {/* Data Structure */}
      <DataStructurePanel />

      {/* Query & Results */}
      <QueryResultsPanel queryType={queryType} />
    </>
  );
}
