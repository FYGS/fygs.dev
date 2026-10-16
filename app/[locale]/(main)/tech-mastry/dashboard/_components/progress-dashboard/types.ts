export interface ProgressStats {
  challengesCompleted: number;
  totalChallenges: number;
  streakDays: number;
  skillLevels: {
    algorithms: number;
    dataStructures: number;
    systemDesign: number;
    frontend: number;
    backend: number;
    problemSolving: number;
    communication: number;
  };
  recentActivities: {
    id: string;
    type: "challenge" | "quiz" | "interview" | "learning";
    title: string;
    timestamp: Date;
    result?: "success" | "partial" | "failed";
    score?: number;
  }[];
  learningPaths: {
    id: string;
    title: string;
    description: string;
    progress: number;
    totalModules: number;
    completedModules: number;
    icon: React.ReactNode;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    unlockedAt?: Date;
    progress?: number;
    isUnlocked: boolean;
  }[];
}
