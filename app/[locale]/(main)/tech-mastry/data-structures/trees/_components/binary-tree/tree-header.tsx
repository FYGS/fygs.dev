"use client";

import { Button } from "@/components/ui/button";
import type { TraversalType } from "./types";

interface TreeHeaderProps {
  traversalType: TraversalType;
  handleTraversalTypeChange: (type: TraversalType) => void;
}

export function TreeHeader({
  traversalType,
  handleTraversalTypeChange,
}: TreeHeaderProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          Visualisation d&apos;un Arbre Binaire
        </h3>
        <p className="text-sm text-muted-foreground">
          Explorez les différents types de parcours d&apos;un arbre binaire
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={traversalType === "inorder" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTraversalTypeChange("inorder")}
        >
          Inordre
        </Button>
        <Button
          variant={traversalType === "preorder" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTraversalTypeChange("preorder")}
        >
          Préordre
        </Button>
        <Button
          variant={traversalType === "postorder" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTraversalTypeChange("postorder")}
        >
          Postordre
        </Button>
        <Button
          variant={traversalType === "levelorder" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTraversalTypeChange("levelorder")}
        >
          Par niveau
        </Button>
      </div>
    </div>
  );
}
