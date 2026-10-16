"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw } from "lucide-react";

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
}

export function SimulationControls({
  isRunning,
  onToggleRunning,
  onReset,
}: SimulationControlsProps) {
  return (
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant={isRunning ? "destructive" : "default"}
              onClick={() => onToggleRunning()}
              className={
                isRunning
                  ? "bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-none shadow-md shadow-red-500/20"
                  : "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
              }
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onReset}
              className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
  );
}
