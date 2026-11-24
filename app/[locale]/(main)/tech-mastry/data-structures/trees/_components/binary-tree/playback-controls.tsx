"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { VisualizationState } from "./types";

interface PlaybackControlsProps {
  state: VisualizationState;
  showHint: boolean;
  setShowHint: (show: boolean) => void;
  stepBackward: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  skipToEnd: () => void;
  resetTraversal: () => void;
  handleSpeedChange: (value: number[]) => void;
}

export function PlaybackControls({
  state,
  showHint,
  setShowHint,
  stepBackward,
  togglePlay,
  stepForward,
  skipToEnd,
  resetTraversal,
  handleSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={stepBackward}
          disabled={state.currentStep <= 0}
          title="Reculer d'une étape"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          title={state.isPlaying ? "Pause" : "Lecture"}
        >
          {state.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={stepForward}
          disabled={state.currentStep >= state.traversalSteps.length - 1}
          title="Avancer d'une étape"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={skipToEnd}
          disabled={state.currentStep >= state.traversalSteps.length - 1}
          title="Aller à la fin"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={resetTraversal}
          title="Réinitialiser le parcours"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="text-sm text-muted-foreground"
          title="Ajuster la vitesse d'animation"
        >
          Vitesse:
        </span>
        <Slider
          value={[state.speed]}
          min={0.5}
          max={3}
          step={0.5}
          onValueChange={handleSpeedChange}
          className="w-32"
          title="Ajuster la vitesse d'animation"
        />

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHint(!showHint)}
            aria-label="Afficher/masquer les explications"
            title="Afficher/masquer les explications"
          >
            <Lightbulb
              className={`h-4 w-4 ${showHint ? "text-yellow-500" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
