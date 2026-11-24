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
  onOperationChange: (operation: OperationType) => void;
  entryKey: string;
  onKeyChange: (key: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  size: number;
  onSizeChange: (size: number) => void;
  onExecute: () => void;
  onReset: () => void;
}

export function OperationPanel({
  operation,
  onOperationChange,
  entryKey,
  onKeyChange,
  value,
  onValueChange,
  size,
  onSizeChange,
  onExecute,
  onReset,
}: OperationPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">
        Opérations sur la Table de Hachage
      </h3>

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
            <SelectItem value="insert">Insertion (put)</SelectItem>
            <SelectItem value="get">Recherche (get)</SelectItem>
            <SelectItem value="remove">Suppression (remove)</SelectItem>
            <SelectItem value="clear">Vider (clear)</SelectItem>
            <SelectItem value="resize">Redimensionner (resize)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Champs d'entrée conditionnels */}
      {operation === "insert" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="key">Clé</Label>
            <Input
              id="key"
              value={entryKey}
              onChange={(e) => onKeyChange(e.target.value)}
              placeholder="Entrez une clé"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valeur</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="Entrez une valeur"
            />
          </div>
        </>
      )}

      {(operation === "get" || operation === "remove") && (
        <div className="space-y-2">
          <Label htmlFor="key">Clé</Label>
          <Input
            id="key"
            value={entryKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="Entrez une clé"
          />
        </div>
      )}

      {operation === "resize" && (
        <div className="space-y-2">
          <Label htmlFor="size">Nouvelle taille</Label>
          <Input
            id="size"
            type="number"
            min={1}
            max={20}
            value={size.toString()}
            onChange={(e) => onSizeChange(parseInt(e.target.value) || 7)}
            placeholder="Entrez la nouvelle taille"
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
