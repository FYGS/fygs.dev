"use client";

import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";

export function QueryControls({ queryType, setQueryType }: {
  queryType: "simple" | "complex" | "aggregation" | "update";
  setQueryType: Dispatch<SetStateAction<"simple" | "complex" | "aggregation" | "update">>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant={queryType === "simple" ? "default" : "outline"}
        size="sm"
        onClick={() => setQueryType("simple")}
      >
        Requête Simple
      </Button>
      <Button
        variant={queryType === "complex" ? "default" : "outline"}
        size="sm"
        onClick={() => setQueryType("complex")}
      >
        Requête Complexe
      </Button>
      <Button
        variant={queryType === "aggregation" ? "default" : "outline"}
        size="sm"
        onClick={() => setQueryType("aggregation")}
      >
        Agrégation
      </Button>
      <Button
        variant={queryType === "update" ? "default" : "outline"}
        size="sm"
        onClick={() => setQueryType("update")}
      >
        Mise à Jour
      </Button>
    </div>
  );
}
