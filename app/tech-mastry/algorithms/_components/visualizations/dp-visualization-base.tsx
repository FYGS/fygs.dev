"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";

export interface DPVisualizationBaseProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onReset?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
  currentStep?: number;
  totalSteps?: number;
  speed?: number;
  onSpeedChange?: (value: number) => void;
  disableControls?: boolean;
}

export function DPVisualizationBase({
  title,
  description,
  children,
  onReset,
  onStepForward,
  onStepBackward,
  onPlay,
  onPause,
  isPlaying = false,
  currentStep = 0,
  totalSteps = 0,
  speed = 1,
  onSpeedChange,
  disableControls = false,
}: DPVisualizationBaseProps) {
  return (
    <Card className="overflow-hidden border-border/40">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="p-6">{children}</div>

      {!disableControls && (
        <div className="p-4 border-t bg-muted/30 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onReset}
                disabled={currentStep === 0}
                title="Réinitialiser"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={onStepBackward}
                disabled={currentStep === 0}
                title="Étape précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant={isPlaying ? "default" : "outline"}
                size="icon"
                onClick={isPlaying ? onPause : onPlay}
                title={isPlaying ? "Pause" : "Lecture"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={onStepForward}
                disabled={currentStep === totalSteps}
                title="Étape suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Vitesse:</span>
              <div className="w-24">
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={3}
                  step={0.5}
                  onValueChange={(value) => onSpeedChange?.(value[0])}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Étape {currentStep} sur {totalSteps}
            </div>
            <div className="h-1 bg-muted w-full max-w-[200px] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
