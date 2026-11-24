"use client";

import { Badge } from "@/components/ui/badge";

import { dataStructures } from "./data";
import type { DataStructureType } from "./types";

interface StructureSelectorProps {
  selectedStructures: DataStructureType[];
  onToggle: (type: DataStructureType) => void;
}

export function StructureSelector({
  selectedStructures,
  onToggle,
}: StructureSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        Sélectionner les structures à comparer:
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(dataStructures).map(([type, info]) => (
          <Badge
            key={type}
            variant={
              selectedStructures.includes(type as DataStructureType)
                ? "default"
                : "outline"
            }
            className="cursor-pointer"
            onClick={() => onToggle(type as DataStructureType)}
          >
            {info.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
