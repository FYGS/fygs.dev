"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";

interface SizeControlProps {
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  onGenerate: () => void;
}

export function SizeControl({
  arraySize,
  onArraySizeChange,
  onGenerate,
}: SizeControlProps) {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <label htmlFor="array-size" className="text-sm font-medium">
          Taille du tableau: {arraySize}
        </label>
        <Slider
          id="array-size"
          value={[arraySize]}
          min={5}
          max={30}
          step={1}
          onValueChange={(value) => onArraySizeChange(value[0])}
        />
      </div>
      <Button variant="outline" size="sm" onClick={onGenerate}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Nouveau
      </Button>
    </div>
  );
}

interface PlaybackControlsProps {
  currentStepIndex: number;
  stepCount: number;
  isPlaying: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export function PlaybackControls({
  currentStepIndex,
  stepCount,
  isPlaying,
  speed,
  onSpeedChange,
  onStepBackward,
  onStepForward,
  onPlay,
  onPause,
}: PlaybackControlsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Contrôles</label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onStepBackward}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {isPlaying ? (
          <Button variant="outline" size="icon" onClick={onPause}>
            <Pause className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={onPlay}
            disabled={currentStepIndex === stepCount - 1}
          >
            <Play className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onStepForward}
          disabled={currentStepIndex === stepCount - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <Slider
            value={[speed]}
            min={0.5}
            max={3}
            step={0.5}
            onValueChange={(value) => onSpeedChange(value[0])}
          />
        </div>
        <span className="text-xs text-muted-foreground w-12">
          {speed}x
        </span>
      </div>
    </div>
  );
}
