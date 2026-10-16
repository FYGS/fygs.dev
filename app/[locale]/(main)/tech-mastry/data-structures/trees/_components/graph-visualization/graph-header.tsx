"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Graph, TraversalType } from "./types";

interface GraphHeaderProps {
  graph: Graph | null;
  startNode: string;
  traversalType: TraversalType;
  handleStartNodeChange: (nodeId: string) => void;
  handleTraversalTypeChange: (type: TraversalType) => void;
}

export function GraphHeader({
  graph,
  startNode,
  traversalType,
  handleStartNodeChange,
  handleTraversalTypeChange,
}: GraphHeaderProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          Visualisation d&apos;un Graphe
        </h3>
        <p className="text-sm text-muted-foreground">
          Explorez les différents types de parcours d&apos;un graphe
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm">Départ:</span>
          <Select value={startNode} onValueChange={handleStartNodeChange}>
            <SelectTrigger className="w-16">
              <SelectValue placeholder={startNode} />
            </SelectTrigger>
            <SelectContent>
              {graph?.nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={traversalType === "dfs" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTraversalTypeChange("dfs")}
          >
            DFS
          </Button>
          <Button
            variant={traversalType === "bfs" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTraversalTypeChange("bfs")}
          >
            BFS
          </Button>
        </div>
      </div>
    </div>
  );
}
