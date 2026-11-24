"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle, Target } from "lucide-react";
import { DifficultyBadge } from "./difficulty-badge";
import type { Challenge } from "./types";

interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: (challenge: Challenge) => void;
  solved?: boolean;
}

export function ChallengeCard({ challenge, onSelect, solved = false }: ChallengeCardProps) {
  return (
    <motion.div
      key={challenge.id}
      whileHover={{ y: -5 }}
      className="relative cursor-pointer rounded-xl focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
    >
      <Card className="h-full border border-border/50 hover:shadow-lg transition-all duration-300 backdrop-blur-xl bg-background/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle as="h2" className="text-lg">
              {/* the button covers the whole card (after:inset-0): one control, named by the title */}
              <button
                type="button"
                className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-hidden"
                onClick={() => onSelect(challenge)}
              >
                {challenge.title}
                {solved && <span className="sr-only"> (résolu)</span>}
              </button>
            </CardTitle>
            {solved && <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />}
          </div>
          <CardDescription className="flex items-center gap-2">
            <span>{challenge.category}</span>
            <span>•</span>
            <span>{challenge.estimatedTime} min</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {challenge.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted/30 text-xs rounded border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{challenge.testCases.length} tests</span>
          </div>
          {<DifficultyBadge difficulty={challenge.difficulty} />}
        </div>
      </Card>
    </motion.div>
  );
}
