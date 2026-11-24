"use client";

import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { Service, Request, Stats } from "./types";

export function SimulationControls({ isRunning, scenario, services, setIsRunning, setRequests, setScenario, setServices, setStats }: {
  isRunning: boolean;
  scenario: "normal" | "high-load" | "failure";
  services: Service[];
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setRequests: Dispatch<SetStateAction<Request[]>>;
  setScenario: Dispatch<SetStateAction<"normal" | "high-load" | "failure">>;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setStats: Dispatch<SetStateAction<Stats>>;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsRunning(true)}
        disabled={isRunning}
      >
        Démarrer la Simulation
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsRunning(false)}
        disabled={!isRunning}
      >
        Pause
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsRunning(false);
          setRequests([]);
          setStats({
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
          });
          setServices(
            services.map((service) => ({
              ...service,
              requests: 0,
              errors: 0,
            }))
          );
        }}
      >
        Réinitialiser
      </Button>

      <div className="ml-auto flex gap-2">
        <Button
          variant={scenario === "normal" ? "default" : "outline"}
          size="sm"
          onClick={() => setScenario("normal")}
        >
          Charge Normale
        </Button>
        <Button
          variant={scenario === "high-load" ? "default" : "outline"}
          size="sm"
          onClick={() => setScenario("high-load")}
        >
          Charge Élevée
        </Button>
        <Button
          variant={scenario === "failure" ? "default" : "outline"}
          size="sm"
          onClick={() => setScenario("failure")}
        >
          Défaillance
        </Button>
      </div>
    </div>
  );
}
