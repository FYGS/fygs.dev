"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface PlaybackControlsProps {
  currentStepIndex: number;
  stepCount: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPause: () => void;
  onPlay: () => void;
}

export function PlaybackControls({
  currentStepIndex,
  stepCount,
  isPlaying,
  onPrevious,
  onNext,
  onPause,
  onPlay,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>

        {isPlaying ? (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={onPause}
            >
              <Pause className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={onPlay}
              disabled={currentStepIndex === stepCount - 1}
            >
              <Play className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={currentStepIndex === stepCount - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <div className="text-sm text-muted-foreground">
        Étape {currentStepIndex + 1} / {stepCount}
      </div>
    </div>
  );
}
