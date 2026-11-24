"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Database, Layers, Lock } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { DurabilityDemo } from "./acid-properties/durability-demo";
import { IsolationDemo } from "./acid-properties/isolation-demo";
import { ConsistencyDemo } from "./acid-properties/consistency-demo";
import { AtomicityDemo } from "./acid-properties/atomicity-demo";

export function AcidView({ activeAcidProperty, setActiveAcidProperty }: {
  activeAcidProperty: "consistency" | "atomicity" | "isolation" | "durability";
  setActiveAcidProperty: Dispatch<SetStateAction<"consistency" | "atomicity" | "isolation" | "durability">>;
}) {
  return (
    <div className="space-y-4">
      {/* ACID Property Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md border p-1 bg-muted/30">
          <Button
            variant={
              activeAcidProperty === "atomicity" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setActiveAcidProperty("atomicity")}
            className="flex items-center gap-1"
          >
            <Layers className="h-4 w-4" />
            <span>Atomicité</span>
          </Button>
          <Button
            variant={
              activeAcidProperty === "consistency"
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() => setActiveAcidProperty("consistency")}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Cohérence</span>
          </Button>
          <Button
            variant={
              activeAcidProperty === "isolation" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setActiveAcidProperty("isolation")}
            className="flex items-center gap-1"
          >
            <Lock className="h-4 w-4" />
            <span>Isolation</span>
          </Button>
          <Button
            variant={
              activeAcidProperty === "durability"
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() => setActiveAcidProperty("durability")}
            className="flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            <span>Durabilité</span>
          </Button>
        </div>
      </div>

      {/* ACID Visualization Canvas */}
      <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
        <div className="p-4 h-full flex flex-col">
          {/* ACID Visualization */}
          <div className="h-full">
            {/* Atomicity Visualization */}
            {activeAcidProperty === "atomicity" && (
              <AtomicityDemo />
            )}

            {/* Consistency Visualization */}
            {activeAcidProperty === "consistency" && (
              <ConsistencyDemo />
            )}

            {/* Isolation Visualization */}
            {activeAcidProperty === "isolation" && (
              <IsolationDemo />
            )}

            {/* Durability Visualization */}
            {activeAcidProperty === "durability" && (
              <DurabilityDemo />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
