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

import type { HeapType, OperationType } from "./types";

interface OperationPanelProps {
  heapType: HeapType;
  onHeapTypeChange: (heapType: HeapType) => void;
  operation: OperationType;
  onOperationChange: (operation: OperationType) => void;
  value: string;
  onValueChange: (value: string) => void;
  onExecute: () => void;
  onReset: () => void;
}

export function OperationPanel({
  heapType,
  onHeapTypeChange,
  operation,
  onOperationChange,
  value,
  onValueChange,
  onExecute,
  onReset,
}: OperationPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Opérations sur le Tas</h3>

      <div className="space-y-2">
        <Label htmlFor="heapType">Type de tas</Label>
        <Select
          value={heapType}
          onValueChange={(value) => onHeapTypeChange(value as HeapType)}
        >
          <SelectTrigger id="heapType">
            <SelectValue placeholder="Sélectionner un type de tas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="max">Tas maximum</SelectItem>
            <SelectItem value="min">Tas minimum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="operation">Opération</Label>
        <Select
          value={operation}
          onValueChange={(value) => onOperationChange(value as OperationType)}
        >
          <SelectTrigger id="operation">
            <SelectValue placeholder="Sélectionner une opération" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insert">Insertion</SelectItem>
            <SelectItem value="extractMax">
              {heapType === "max" ? "Extraire Max" : "Extraire Min"}
            </SelectItem>
            <SelectItem value="heapify">Heapify</SelectItem>
            <SelectItem value="clear">Réinitialiser</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {operation === "insert" && (
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

      <div className="flex justify-between">
        <Button onClick={onExecute}>Exécuter</Button>
        <Button variant="outline" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
