"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flame,
  GraduationCap,
  LineChart,
  ListTodo,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SkillRadarChart } from "./skill-radar-chart";
import { StreakCalendar } from "./streak-calendar";
import { LearningPathCard } from "./learning-path-card";
import { RecentActivities } from "./recent-activities";
import { useProgress } from "../../_hooks/use-progress";

interface ProgressStats {
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

// Mock data - in a real app, this would come from an API
const mockProgressData: ProgressStats = {
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

export function ProgressDashboard() {
  const [progressData, setProgressData] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { progress, isLoaded, getStreakDays } = useProgress();

  useEffect(() => {
    // Merge real localStorage progress with mock data
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Hydrate mock data with real progress from localStorage
      const realStreak = isLoaded
        ? getStreakDays()
        : mockProgressData.streakDays;
      const realChallenges = isLoaded
        ? progress.challengesCompleted.length
        : mockProgressData.challengesCompleted;
      const realTimeHours = isLoaded
        ? Math.round(progress.totalTimeMinutes / 60)
        : 42;

      setProgressData({
        ...mockProgressData,
        streakDays: Math.max(realStreak, mockProgressData.streakDays),
        challengesCompleted: Math.max(
          realChallenges,
          mockProgressData.challengesCompleted,
        ),
      });
      setIsLoading(false);
    };

    fetchData();
  }, [isLoaded, progress, getStreakDays]);

  if (isLoading || !progressData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-muted/50 rounded-md animate-pulse"></div>
          <div className="h-4 w-96 bg-muted/30 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-muted/50 rounded-md"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 w-24 bg-muted/30 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Challenges Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">
                {progressData.challengesCompleted}
                <span className="text-foreground/70 text-sm font-normal ml-1">
                  / {progressData.totalChallenges}
                </span>
              </div>
              <Progress
                value={
                  (progressData.challengesCompleted /
                    progressData.totalChallenges) *
                  100
                }
                className="h-2 mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">
                {progressData.streakDays}
              </div>
              <div className="text-foreground/70 mb-1">days</div>
            </div>
            <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last activity: Today
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">
                {progressData.achievements.filter((a) => a.isUnlocked).length}
              </div>
              <div className="text-muted-foreground mb-1">
                / {progressData.achievements.length} unlocked
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Latest:{" "}
              {progressData.achievements.find((a) => a.isUnlocked)?.title}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Learning Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">42</div>
              <div className="text-muted-foreground mb-1">hours</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              This week: 8 hours
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <LineChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex gap-2 items-center">
            <Brain className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex gap-2 items-center">
            <GraduationCap className="h-4 w-4" />
            <span>Learning Paths</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex gap-2 items-center">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skill Radar Chart */}
            <Card className="lg:col-span-2 backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <SkillRadarChart skills={progressData.skillLevels} />
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivities activities={progressData.recentActivities} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streak Calendar */}
            <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Activity Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StreakCalendar streakDays={progressData.streakDays} />
              </CardContent>
            </Card>

            {/* Learning Paths Progress */}
            <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Paths
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.learningPaths.map((path) => (
                  <div key={path.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {path.icon}
                        <span className="font-medium">{path.title}</span>
                      </div>
                      <span className="text-sm text-foreground/70">
                        {path.completedModules}/{path.totalModules} modules
                      </span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Skill Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(progressData.skillLevels).map(
                  ([skill, level]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize">
                          {skill.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-sm font-medium">{level}%</span>
                      </div>
                      <Progress
                        value={level}
                        className={cn(
                          "h-2",
                          level < 40
                            ? "bg-red-500/20"
                            : level < 70
                              ? "bg-yellow-500/20"
                              : "bg-green-500/20",
                        )}
                        indicatorClassName={cn(
                          level < 40
                            ? "bg-red-500"
                            : level < 70
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                      />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recommended Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(progressData.skillLevels)
                  .sort(([, a], [, b]) => a - b)
                  .slice(0, 3)
                  .map(([skill, level]) => (
                    <div
                      key={skill}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="mt-0.5">
                        <div
                          className={cn(
                            "p-1.5 rounded-md",
                            level < 40
                              ? "bg-red-500/10 text-red-500"
                              : level < 70
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-green-500/10 text-green-500",
                          )}
                        >
                          <Brain className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">
                          {skill.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <p className="text-sm text-foreground/70">
                          {level < 40
                            ? "Needs significant improvement. Focus on fundamentals."
                            : level < 70
                              ? "Good progress, but more practice needed."
                              : "Strong skills. Consider advanced topics."}
                        </p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary text-sm mt-1"
                        >
                          View recommended resources
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Skill Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-foreground/60">
                Skill progress chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.learningPaths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>

          <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Recommended Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                    <Brain className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">System Design Mastery</h4>
                  <p className="text-sm text-foreground/70">
                    Based on your skill assessment, focusing on system design
                    would be beneficial for your career growth.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm mt-1"
                  >
                    Start this path
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <Code2 className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Advanced Data Structures</h4>
                  <p className="text-sm text-foreground/70">
                    Enhance your understanding of complex data structures to
                    solve challenging problems more efficiently.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm mt-1"
                  >
                    Start this path
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {progressData.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={cn(
                  "backdrop-blur-xs border-border/50 shadow-md transition-all",
                  achievement.isUnlocked
                    ? "bg-background/80"
                    : "bg-muted/30 opacity-70",
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {achievement.icon}
                    {achievement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-2">
                    {achievement.description}
                  </p>
                  {achievement.isUnlocked ? (
                    <div className="flex items-center gap-2 text-xs text-green-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress
                        value={achievement.progress}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievement Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-8 relative">
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <h4 className="font-medium">First Steps</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete your first coding challenge
                    </p>
                    <div className="text-xs text-green-500 mt-1">
                      Completed on{" "}
                      {new Date(
                        Date.now() - 1000 * 60 * 60 * 24 * 30,
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <h4 className="font-medium">Consistent Learner</h4>
                    <p className="text-sm text-muted-foreground">
                      Maintain a 7-day learning streak
                    </p>
                    <div className="text-xs text-green-500 mt-1">
                      Completed on {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <div className="h-4 w-4 text-muted-foreground">3</div>
                    </div>
                    <h4 className="font-medium">Algorithm Expert</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete all algorithm challenges
                    </p>
                    <div className="mt-1">
                      <Progress value={65} className="h-1.5 max-w-[200px]" />
                      <div className="text-xs text-muted-foreground mt-1">
                        65% complete
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <div className="h-4 w-4 text-muted-foreground">4</div>
                    </div>
                    <h4 className="font-medium">Team Player</h4>
                    <p className="text-sm text-muted-foreground">
                      Participate in 5 collaborative coding sessions
                    </p>
                    <div className="mt-1">
                      <Progress value={40} className="h-1.5 max-w-[200px]" />
                      <div className="text-xs text-muted-foreground mt-1">
                        40% complete (2/5 sessions)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
