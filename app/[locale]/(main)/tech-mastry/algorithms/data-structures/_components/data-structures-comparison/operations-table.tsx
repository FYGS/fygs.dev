"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";

import { dataStructures } from "./data";
import type { DataStructureType, OperationType } from "./types";

interface OperationsTableProps {
  selectedStructures: DataStructureType[];
}

export function OperationsTable({ selectedStructures }: OperationsTableProps) {
  // Rendu de l'indicateur de performance
  const renderRating = (rating: "good" | "medium" | "bad") => {
    switch (rating) {
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "medium":
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
      case "bad":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Opération</TableHead>
          {selectedStructures.map((type) => (
            <TableHead key={type}>
              {dataStructures[type].name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {(
          Object.keys(
            dataStructures.array.operations
          ) as OperationType[]
        ).map((op) => (
          <TableRow key={op}>
            <TableCell className="font-medium capitalize">
              {op}
            </TableCell>
            {selectedStructures.map((type) => (
              <TableCell key={`${type}-${op}`}>
                <div className="flex items-center gap-2">
                  {renderRating(
                    dataStructures[type].operations[op].rating
                  )}
                  <span>
                    {dataStructures[type].operations[op].complexity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dataStructures[type].operations[op].note}
                </p>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
