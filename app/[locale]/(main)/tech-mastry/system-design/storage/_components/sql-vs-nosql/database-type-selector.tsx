"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Database, FileJson, LayoutGrid, Network, Table } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function DatabaseTypeSelector({ dbType, nosqlType, setDbType, setNosqlType }: {
  dbType: "sql" | "nosql";
  nosqlType: "document" | "key-value" | "column" | "graph";
  setDbType: Dispatch<SetStateAction<"sql" | "nosql">>;
  setNosqlType: Dispatch<SetStateAction<"document" | "key-value" | "column" | "graph">>;
}) {
  return (
    <div className="flex flex-col items-center gap-4 mb-4">
      <div className="inline-flex rounded-md border p-1 bg-muted/30">
        <Button
          variant={dbType === "sql" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDbType("sql")}
          className="flex items-center gap-1"
        >
          <Table className="h-4 w-4" />
          <span>SQL</span>
        </Button>
        <Button
          variant={dbType === "nosql" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDbType("nosql")}
          className="flex items-center gap-1"
        >
          <FileJson className="h-4 w-4" />
          <span>NoSQL</span>
        </Button>
      </div>

      {/* NoSQL Type Selector - Only visible when NoSQL is selected */}
      {dbType === "nosql" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex rounded-md border p-1 bg-muted/30"
        >
          <Button
            variant={nosqlType === "document" ? "default" : "ghost"}
            size="sm"
            onClick={() => setNosqlType("document")}
            className="flex items-center gap-1"
          >
            <FileJson className="h-4 w-4" />
            <span>Document</span>
          </Button>
          <Button
            variant={nosqlType === "key-value" ? "default" : "ghost"}
            size="sm"
            onClick={() => setNosqlType("key-value")}
            className="flex items-center gap-1"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Clé-Valeur</span>
          </Button>
          <Button
            variant={nosqlType === "column" ? "default" : "ghost"}
            size="sm"
            onClick={() => setNosqlType("column")}
            className="flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            <span>Colonne</span>
          </Button>
          <Button
            variant={nosqlType === "graph" ? "default" : "ghost"}
            size="sm"
            onClick={() => setNosqlType("graph")}
            className="flex items-center gap-1"
          >
            <Network className="h-4 w-4" />
            <span>Graphe</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
