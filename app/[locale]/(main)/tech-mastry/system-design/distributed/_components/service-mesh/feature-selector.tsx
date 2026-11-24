"use client";

import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, Settings, Shield } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function FeatureSelector({ activeFeature, setActiveFeature }: {
  activeFeature: "traffic" | "security" | "observability" | "control-plane";
  setActiveFeature: Dispatch<SetStateAction<"traffic" | "security" | "observability" | "control-plane">>;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={activeFeature === "traffic" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFeature("traffic")}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Gestion du Trafic
      </Button>
      <Button
        variant={activeFeature === "security" ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFeature("security")}
        className="flex items-center gap-1"
      >
        <Shield className="h-4 w-4" />
        Sécurité
      </Button>
      <Button
        variant={
          activeFeature === "observability" ? "default" : "outline"
        }
        size="sm"
        onClick={() => setActiveFeature("observability")}
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        Observabilité
      </Button>
      <Button
        variant={
          activeFeature === "control-plane" ? "default" : "outline"
        }
        size="sm"
        onClick={() => setActiveFeature("control-plane")}
        className="flex items-center gap-1"
      >
        <Settings className="h-4 w-4" />
        Plan de Contrôle
      </Button>
    </div>
  );
}
