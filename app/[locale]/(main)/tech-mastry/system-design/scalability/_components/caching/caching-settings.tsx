"use client";

import { Slider } from "@/components/ui/slider";
import type { Dispatch, SetStateAction } from "react";

export function CachingSettings({ cacheSize, popularitySkew, requestRate, setCacheSize, setPopularitySkew, setRequestRate }: {
  cacheSize: number;
  popularitySkew: number;
  requestRate: number;
  setCacheSize: Dispatch<SetStateAction<number>>;
  setPopularitySkew: Dispatch<SetStateAction<number>>;
  setRequestRate: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">
            Taux de Requêtes (par seconde)
          </label>
          <span className="text-sm text-muted-foreground">
            {requestRate}
          </span>
        </div>
        <Slider
          value={[requestRate]}
          min={0.5}
          max={5}
          step={0.5}
          onValueChange={(value) => setRequestRate(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Taille du Cache</label>
          <span className="text-sm text-muted-foreground">
            {cacheSize} éléments
          </span>
        </div>
        <Slider
          value={[cacheSize]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => setCacheSize(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">
            Distribution des Requêtes (% de popularité)
          </label>
          <span className="text-sm text-muted-foreground">
            {popularitySkew}%
          </span>
        </div>
        <Slider
          value={[popularitySkew]}
          min={0}
          max={100}
          step={5}
          onValueChange={(value) => setPopularitySkew(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          Contrôle la probabilité qu&apos;une requête demande un élément
          populaire (potentiellement en cache)
        </p>
      </div>
    </div>
  );
}
