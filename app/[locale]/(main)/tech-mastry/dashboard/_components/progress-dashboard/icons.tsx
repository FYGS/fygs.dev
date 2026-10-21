import {
  Award,
  Braces,
  Brain,
  Code2,
  Compass,
  Database,
  Dumbbell,
  FileText,
  Flame,
  GitBranch,
  Server,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { AchievementIcon, PathIcon, SkillKey } from "./types";

export const PATH_ICONS: Record<PathIcon, React.ReactNode> = {
  algorithms: <Code2 className="h-5 w-5" aria-hidden="true" />,
  systemDesign: <Brain className="h-5 w-5" aria-hidden="true" />,
  frontend: <FileText className="h-5 w-5" aria-hidden="true" />,
  backend: <Server className="h-5 w-5" aria-hidden="true" />,
  security: <Shield className="h-5 w-5" aria-hidden="true" />,
  career: <Users className="h-5 w-5" aria-hidden="true" />,
  data: <Database className="h-5 w-5" aria-hidden="true" />,
  ai: <Sparkles className="h-5 w-5" aria-hidden="true" />,
  git: <GitBranch className="h-5 w-5" aria-hidden="true" />,
  types: <Braces className="h-5 w-5" aria-hidden="true" />,
  practice: <Dumbbell className="h-5 w-5" aria-hidden="true" />,
};

export const ACHIEVEMENT_ICONS: Record<AchievementIcon, React.ReactNode> = {
  compass: <Compass className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  target: <Target className="h-5 w-5 text-green-500" aria-hidden="true" />,
  flame: <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />,
  award: <Award className="h-5 w-5 text-purple-500" aria-hidden="true" />,
  trophy: <Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
};

export const SKILL_LABELS: Record<SkillKey, string> = {
  algorithms: "Algorithmes",
  dataStructures: "Structures de données",
  systemDesign: "Architecture et system design",
  frontend: "Frontend et TypeScript",
  backend: "Backend et sécurité",
  problemSolving: "Résolution de problèmes",
  communication: "Carrière et bonnes pratiques",
};

export const skillLabel = (skill: string) => SKILL_LABELS[skill as SkillKey] ?? skill;
