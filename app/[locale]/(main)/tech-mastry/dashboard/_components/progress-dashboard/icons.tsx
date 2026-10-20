import { Award, Brain, Code2, Compass, FileText, Flame, Server, Shield, Target, Trophy, Users } from "lucide-react";
import type { AchievementIcon, PathIcon } from "./types";

export const PATH_ICONS: Record<PathIcon, React.ReactNode> = {
  algorithms: <Code2 className="h-5 w-5" aria-hidden="true" />,
  systemDesign: <Brain className="h-5 w-5" aria-hidden="true" />,
  frontend: <FileText className="h-5 w-5" aria-hidden="true" />,
  backend: <Server className="h-5 w-5" aria-hidden="true" />,
  security: <Shield className="h-5 w-5" aria-hidden="true" />,
  career: <Users className="h-5 w-5" aria-hidden="true" />,
};

export const ACHIEVEMENT_ICONS: Record<AchievementIcon, React.ReactNode> = {
  compass: <Compass className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  target: <Target className="h-5 w-5 text-green-500" aria-hidden="true" />,
  flame: <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />,
  award: <Award className="h-5 w-5 text-purple-500" aria-hidden="true" />,
  trophy: <Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
};

/** "dataStructures" -> "data Structures" -> label shown in the UI */
export const skillLabel = (skill: string) => skill.replace(/([A-Z])/g, " $1").trim();
