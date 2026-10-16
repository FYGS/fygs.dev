"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { OperationType } from "./types";

interface OperationPanelProps {
  operation: OperationType;
  onOperationChange: (operation: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  index: string;
  onIndexChange: (index: string) => void;
  onExecute: () => void;
  onGenerateArray: () => void;
}

export function OperationPanel({
  operation,
  onOperationChange,
  value,
  onValueChange,
  index,
  onIndexChange,
  onExecute,
  onGenerateArray,
}: OperationPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Opérations sur le Tableau</h3>

      <div className="space-y-2">
        <Label htmlFor="operation">Opération</Label>
        <Select value={operation} onValueChange={onOperationChange}>
          <SelectTrigger id="operation">
            <SelectValue placeholder="Sélectionner une opération" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="access">Accès par index</SelectItem>
            <SelectItem value="search">Recherche de valeur</SelectItem>
            <SelectItem value="insertEnd">Insertion à la fin</SelectItem>
            <SelectItem value="insertStart">Insertion au début</SelectItem>
            <SelectItem value="insertAt">Insertion à un index</SelectItem>
            <SelectItem value="removeEnd">Suppression à la fin</SelectItem>
            <SelectItem value="removeStart">
              Suppression au début
            </SelectItem>
            <SelectItem value="removeAt">Suppression à un index</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Champs d'entrée conditionnels */}
      {(operation === "insertEnd" ||
        operation === "insertStart" ||
        operation === "insertAt" ||
        operation === "search") && (
        <div className="space-y-2">
          <Label htmlFor="value">Valeur</Label>
          <Input
            id="value"
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Entrez une valeur"
          />
        </div>
      )}

      {(operation === "access" ||
        operation === "insertAt" ||
        operation === "removeAt") && (
        <div className="space-y-2">
          <Label htmlFor="index">Index</Label>
          <Input
            id="index"
            type="number"
            value={index}
            onChange={(e) => onIndexChange(e.target.value)}
            placeholder="Entrez un index"
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onExecute}>Exécuter</Button>
        <Button variant="outline" onClick={onGenerateArray}>
          Nouveau Tableau
        </Button>
      </div>
    </div>
  );
}
