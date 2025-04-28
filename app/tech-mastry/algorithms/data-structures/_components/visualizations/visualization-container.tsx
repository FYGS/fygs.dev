"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface VisualizationContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (value: number[]) => void;
  message?: string;
  stats?: { label: string; value: string | number }[];
}

export function VisualizationContainer({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  message,
  stats,
}: VisualizationContainerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visualization Area */}
        <div className="border rounded-lg p-4 min-h-[300px] bg-muted/20">
          {children}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onStepBackward}
              disabled={currentStep <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {isPlaying ? (
              <Button variant="outline" size="icon" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={onPlay}
                disabled={currentStep >= totalSteps}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onStepForward}
              disabled={currentStep >= totalSteps}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">Vitesse:</span>
              <Slider
                value={[speed]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={onSpeedChange}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{speed}x</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Étape {currentStep + 1}</span>
              <span>Total: {totalSteps + 1} étapes</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / (totalSteps + 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Message and Stats */}
          {(message || stats) && (
            <div className="bg-muted p-4 rounded-lg">
              <ScrollArea className="h-[100px]">
                {message && <p className="text-sm font-medium mb-2">{message}</p>}
                {stats && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats.map((stat, index) => (
                      <Badge key={index} variant="outline" className="px-2 py-1">
                        {stat.label}: {stat.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
