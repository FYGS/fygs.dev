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

import type { OperationType, TraversalType } from "./types";

interface OperationPanelProps {
  operation: OperationType;
  onOperationChange: (operation: OperationType) => void;
  traversalType: TraversalType;
  onTraversalTypeChange: (traversalType: TraversalType) => void;
  value: string;
  onValueChange: (value: string) => void;
  onExecute: () => void;
  onReset: () => void;
}

export function OperationPanel({
  operation,
  onOperationChange,
  traversalType,
  onTraversalTypeChange,
  value,
  onValueChange,
  onExecute,
  onReset,
}: OperationPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">
        Opérations sur l&apos;Arbre Binaire
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
            <SelectItem value="insert">Insertion</SelectItem>
            <SelectItem value="search">Recherche</SelectItem>
            <SelectItem value="delete">Suppression</SelectItem>
            <SelectItem value="traverse">Parcours</SelectItem>
            <SelectItem value="clear">Réinitialiser</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {operation === "traverse" ? (
        <div className="space-y-2">
          <Label htmlFor="traversalType">Type de parcours</Label>
          <Select
            value={traversalType}
            onValueChange={(value) =>
              onTraversalTypeChange(value as TraversalType)
            }
          >
            <SelectTrigger id="traversalType">
              <SelectValue placeholder="Sélectionner un type de parcours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inorder">Infixe (Inorder)</SelectItem>
              <SelectItem value="preorder">Préfixe (Preorder)</SelectItem>
              <SelectItem value="postorder">
                Postfixe (Postorder)
              </SelectItem>
              <SelectItem value="levelorder">
                Par niveau (Level Order)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : operation !== "clear" ? (
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
      ) : null}

      <div className="flex justify-between">
        <Button onClick={onExecute}>Exécuter</Button>
        <Button variant="outline" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
