"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Code2, GitFork, Star, Users } from "lucide-react";

export interface ProjectStats {
  stars?: number;
  forks?: number;
  contributors?: number;
  linesOfCode?: number;
}

interface ProjectStatsProps {
  stats?: ProjectStats;
}

const StatItem = ({
  icon: Icon,
  value = 0,
  label,
}: {
  icon: typeof Star;
  value?: number;
  label: string;
}) => (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono"
          >
            {value.toLocaleString()}
          </motion.span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
);

export function ProjectStats({ stats = {} }: ProjectStatsProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <StatItem icon={Star} value={stats.stars} label="GitHub Stars" />
        <StatItem icon={GitFork} value={stats.forks} label="Forks" />
        <StatItem
          icon={Users}
          value={stats.contributors}
          label="Contributors"
        />
        <StatItem
          icon={Code2}
          value={stats.linesOfCode}
          label="Lines of Code"
        />
      </div>
    </Card>
  );
}
