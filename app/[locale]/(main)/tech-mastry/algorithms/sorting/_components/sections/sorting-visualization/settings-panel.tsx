"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RefreshCw } from "lucide-react";

interface SettingsPanelProps {
  showSettings: boolean;
  arraySize: number;
  speed: number;
  onGenerateArray: () => void;
  onArraySizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function SettingsPanel({
  showSettings,
  arraySize,
  speed,
  onGenerateArray,
  onArraySizeChange,
  onSpeedChange,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-muted/50 p-4 rounded-lg space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="array-size" className="text-sm font-medium">
                Taille du tableau: {arraySize}
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateArray}
                className="h-8 gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-xs">Nouveau</span>
              </Button>
            </div>
            <Slider
              id="array-size"
              value={[arraySize]}
              min={5}
              max={50}
              step={1}
              onValueChange={(value) => onArraySizeChange(value[0])}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="speed" className="text-sm font-medium">
              Vitesse: {speed}x
            </label>
            <Slider
              id="speed"
              value={[speed]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={(value) => onSpeedChange(value[0])}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
