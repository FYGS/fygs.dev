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

import type { GraphNode, GraphType, OperationType } from "./types";

interface OperationPanelProps {
  graphType: GraphType;
  onGraphTypeChange: (graphType: GraphType) => void;
  operation: OperationType;
  onOperationChange: (operation: OperationType) => void;
  nodes: GraphNode[];
  nodeLabel: string;
  onNodeLabelChange: (value: string) => void;
  sourceNode: string;
  onSourceNodeChange: (value: string) => void;
  targetNode: string;
  onTargetNodeChange: (value: string) => void;
  edgeWeight: string;
  onEdgeWeightChange: (value: string) => void;
  onExecute: () => void;
  onReset: () => void;
}

export function OperationPanel({
  graphType,
  onGraphTypeChange,
  operation,
  onOperationChange,
  nodes,
  nodeLabel,
  onNodeLabelChange,
  sourceNode,
  onSourceNodeChange,
  targetNode,
  onTargetNodeChange,
  edgeWeight,
  onEdgeWeightChange,
  onExecute,
  onReset,
}: OperationPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Opérations sur le Graphe</h3>

      <div className="space-y-2">
        <Label htmlFor="graphType">Type de graphe</Label>
        <Select
          value={graphType}
          onValueChange={(value) => onGraphTypeChange(value as GraphType)}
        >
          <SelectTrigger id="graphType">
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="directed">Orienté</SelectItem>
            <SelectItem value="undirected">Non orienté</SelectItem>
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
            <SelectItem value="addNode">Ajouter un nœud</SelectItem>
            <SelectItem value="addEdge">Ajouter une arête</SelectItem>
            <SelectItem value="removeNode">Supprimer un nœud</SelectItem>
            <SelectItem value="removeEdge">Supprimer une arête</SelectItem>
            <SelectItem value="bfs">Parcours en largeur (BFS)</SelectItem>
            <SelectItem value="dfs">
              Parcours en profondeur (DFS)
            </SelectItem>
            <SelectItem value="dijkstra">
              Plus court chemin (Dijkstra)
            </SelectItem>
            <SelectItem value="clear">Vider le graphe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Champs d'entrée conditionnels */}
      {operation === "addNode" && (
        <div className="space-y-2">
          <Label htmlFor="nodeLabel">Étiquette du nœud</Label>
          <Input
            id="nodeLabel"
            value={nodeLabel}
            onChange={(e) => onNodeLabelChange(e.target.value)}
            placeholder="Entrez une étiquette"
          />
        </div>
      )}

      {(operation === "addEdge" || operation === "removeEdge") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sourceNode">Nœud source</Label>
            <Select value={sourceNode} onValueChange={onSourceNodeChange}>
              <SelectTrigger id="sourceNode">
                <SelectValue placeholder="Sélectionner un nœud" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetNode">Nœud cible</Label>
            <Select value={targetNode} onValueChange={onTargetNodeChange}>
              <SelectTrigger id="targetNode">
                <SelectValue placeholder="Sélectionner un nœud" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {operation === "addEdge" && (
            <div className="space-y-2">
              <Label htmlFor="edgeWeight">Poids de l&apos;arête</Label>
              <Input
                id="edgeWeight"
                type="number"
                min={1}
                value={edgeWeight}
                onChange={(e) => onEdgeWeightChange(e.target.value)}
                placeholder="Entrez un poids"
              />
            </div>
          )}
        </>
      )}

      {(operation === "removeNode" ||
        operation === "bfs" ||
        operation === "dfs" ||
        operation === "dijkstra") && (
        <div className="space-y-2">
          <Label htmlFor="startNode">Nœud de départ</Label>
          <Select value={sourceNode} onValueChange={onSourceNodeChange}>
            <SelectTrigger id="startNode">
              <SelectValue placeholder="Sélectionner un nœud" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {operation === "dijkstra" && (
        <div className="space-y-2">
          <Label htmlFor="endNode">Nœud d&apos;arrivée</Label>
          <Select value={targetNode} onValueChange={onTargetNodeChange}>
            <SelectTrigger id="endNode">
              <SelectValue placeholder="Sélectionner un nœud" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onExecute}>
          Exécuter
        </Button>
        <Button variant="outline" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
