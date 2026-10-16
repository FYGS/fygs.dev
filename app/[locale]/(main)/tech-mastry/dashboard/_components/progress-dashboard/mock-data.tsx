import {
  Award,
  Brain,
  Code2,
  FileText,
  Flame,
  Trophy,
  Users,
} from "lucide-react";
import type { ProgressStats } from "./types";

// Mock data - in a real app, this would come from an API
export const mockProgressData: ProgressStats = {
  challengesCompleted: 42,
  totalChallenges: 150,
  streakDays: 7,
  skillLevels: {
    algorithms: 65,
    dataStructures: 72,
    systemDesign: 45,
    frontend: 80,
    backend: 60,
    problemSolving: 75,
    communication: 68,
  },
  recentActivities: [
    {
      id: "1",
      type: "challenge",
      title: "Two Sum",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      result: "success",
      score: 100,
    },
    {
      id: "2",
      type: "interview",
      title: "Mock Interview: Frontend",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      result: "partial",
      score: 75,
    },
    {
      id: "3",
      type: "learning",
      title: "System Design Fundamentals",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      id: "4",
      type: "quiz",
      title: "Data Structures Quiz",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      result: "success",
      score: 90,
    },
    {
      id: "5",
      type: "challenge",
      title: "Valid Parentheses",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
      result: "failed",
      score: 40,
    },
  ],
  learningPaths: [
    {
      id: "1",
      title: "Algorithm Mastery",
      description: "Master common algorithms and problem-solving techniques",
      progress: 65,
      totalModules: 20,
      completedModules: 13,
      icon: <Code2 className="h-5 w-5" />,
    },
    {
      id: "2",
      title: "System Design",
      description: "Learn to design scalable and robust systems",
      progress: 30,
      totalModules: 15,
      completedModules: 4,
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: "3",
      title: "Frontend Development",
      description: "Modern frontend frameworks and best practices",
      progress: 80,
      totalModules: 25,
      completedModules: 20,
      icon: <FileText className="h-5 w-5" />,
    },
  ],
  achievements: [
    {
      id: "1",
      title: "First Blood",
      description: "Complete your first coding challenge",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      isUnlocked: true,
    },
    {
      id: "2",
      title: "Consistent Learner",
      description: "Maintain a 7-day learning streak",
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      unlockedAt: new Date(),
      isUnlocked: true,
    },
    {
      id: "3",
      title: "Algorithm Expert",
      description: "Complete all algorithm challenges",
      icon: <Award className="h-5 w-5 text-purple-500" />,
      progress: 65,
      isUnlocked: false,
    },
    {
      id: "4",
      title: "Team Player",
      description: "Participate in 5 collaborative coding sessions",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      progress: 40,
      isUnlocked: false,
    },
  ],
};
