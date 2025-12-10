"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Clock,
  Code,
  GitBranch,
  GraduationCap,
  Heart,
  Target,
  Trophy,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SkillProgress {
  name: string;
  level: number; // 0-100
  category: string;
  lastPracticed: Date;
  mastery: "beginner" | "intermediate" | "advanced" | "expert";
}

interface ChallengeProgress {
  id: string;
  title: string;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
  completedAt?: Date;
  score?: number;
  timeSpent: number; // in minutes
}

interface LearningPathProgress {
  id: string;
  title: string;
  progress: number; // 0-100
  completedChallenges: number;
  totalChallenges: number;
  estimatedTimeRemaining: number; // in minutes
}

interface WeeklyProgress {
  date: Date;
  progress: number; // 0-100
}

interface AssessmentData {
  overallScore: number;
  completedChallenges: number;
  totalChallenges: number;
  streak: number;
  timeSpent: number; // in minutes
  skills: SkillProgress[];
  challenges: ChallengeProgress[];
  learningPaths: LearningPathProgress[];
  weeklyProgress: WeeklyProgress[];
}

const mockAssessmentData: AssessmentData = {
  overallScore: 78,
  completedChallenges: 42,
  totalChallenges: 85,
  streak: 12,
  timeSpent: 3240, // 54 hours
  skills: [
    {
      name: "Algorithms",
      level: 85,
      category: "Core",
      lastPracticed: new Date(Date.now() - 1000 * 60 * 2),
      mastery: "advanced"
    },
    {
      name: "Data Structures",
      level: 92,
      category: "Core",
      lastPracticed: new Date(Date.now() - 1000 * 60 * 5),
      mastery: "expert"
    },
    {
      name: "System Design",
      level: 45,
      category: "Advanced",
      lastPracticed: new Date(Date.now() - 1000 * 60 * 24 * 3),
      mastery: "beginner"
    },
    {
      name: "Frontend",
      level: 72,
      category: "Application",
      lastPracticed: new Date(Date.now() - 1000 * 60 * 1),
      mastery: "intermediate"
    },
    {
      name: "Backend",
      level: 68,
      category: "Application",
      lastPracticed: new Date(Date.now() - 1000 * 60 * 3),
      mastery: "intermediate"
    }
  ],
  challenges: [
    {
      id: "1",
      title: "Two Sum",
      completed: true,
      difficulty: "easy",
      completedAt: new Date(Date.now() - 1000 * 60 * 30),
      score: 100,
      timeSpent: 15
    },
    {
      id: "2",
      title: "Valid Parentheses",
      completed: true,
      difficulty: "easy",
      completedAt: new Date(Date.now() - 1000 * 60 * 2),
      score: 100,
      timeSpent: 12
    },
    {
      id: "3",
      title: "Merge Intervals",
      completed: true,
      difficulty: "medium",
      completedAt: new Date(Date.now() - 1000 * 60 * 24),
      score: 85,
      timeSpent: 28
    },
    {
      id: "4",
      title: "Serialize and Deserialize Binary Tree",
      completed: false,
      difficulty: "hard",
      timeSpent: 45
    },
    {
      id: "5",
      title: "Design Twitter",
      completed: false,
      difficulty: "hard",
      timeSpent: 120
    }
  ],
  learningPaths: [
    {
      id: "1",
      title: "Algorithm Mastery",
      progress: 78,
      completedChallenges: 18,
      totalChallenges: 23,
      estimatedTimeRemaining: 180 // 3 hours
    },
    {
      id: "2",
      title: "System Design Fundamentals",
      progress: 35,
      completedChallenges: 7,
      totalChallenges: 20,
      estimatedTimeRemaining: 420 // 7 hours
    },
    {
      id: "3",
      title: "Frontend Performance",
      progress: 92,
      completedChallenges: 23,
      totalChallenges: 25,
      estimatedTimeRemaining: 30 // 30 minutes
    }
  ],
  weeklyProgress: [
    { date: new Date(Date.now() - 1000 * 60 * 24 * 7), progress: 65 },
    { date: new Date(Date.now() - 1000 * 60 * 24 * 6), progress: 68 },
    { date: new Date(Date.now() - 1000 * 60 * 24 * 5), progress: 70 },
    { date: new Date(Date.now() - 1000 * 60 * 24 * 4), progress: 72 },
    { date: new Date(Date.now() - 1000 * 60 * 24 * 3), progress: 74 },
    { date: new Date(Date.now() - 1000 * 60 * 24 * 2), progress: 76 },
    { date: new Date(), progress: 78 }
  ]
};

export function ProgressDashboard() {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch assessment data
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssessmentData(mockAssessmentData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-muted rounded-md"></div>
          <div className="h-8 w-48 bg-muted rounded-md"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl p-6 space-y-4">
              <div className="h-4 w-24 bg-muted/50 rounded"></div>
              <div className="h-8 w-16 bg-muted/50 rounded"></div>
              <div className="h-2 w-full bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-medium">No assessment data available</h3>
          <p className="text-muted-foreground max-w-md">
            Complete some challenges to see your progress and analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress, identify strengths and weaknesses, and plan your learning journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Overall Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {assessmentData.overallScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessmentData.completedChallenges}/{assessmentData.totalChallenges} challenges completed
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {assessmentData.overallScore >= 80 
                    ? "Expert" 
                    : assessmentData.overallScore >= 60 
                    ? "Advanced" 
                    : assessmentData.overallScore >= 40 
                    ? "Intermediate" 
                    : "Beginner"}
                </Badge>
              </div>
              <Progress value={assessmentData.overallScore} className="mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Current Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {assessmentData.streak} days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Keep it going!
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
                  🔥 Hot Streak
                </Badge>
              </div>
              <div className="mt-3 h-2 w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Time Invested</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(assessmentData.timeSpent / 60)}h
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessmentData.timeSpent % 60}m total
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Avg: 45m/day
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(100, (assessmentData.timeSpent / 6000) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">5d</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-green-500" />
                <span>Learning Paths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {assessmentData.learningPaths.filter(lp => lp.progress === 100).length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessmentData.learningPaths.length} total
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(assessmentData.learningPaths.reduce((sum, lp) => sum + lp.progress, 0) / assessmentData.learningPaths.length)}% avg
                </Badge>
              </div>
              <div className="mt-3 space-y-1">
                {assessmentData.learningPaths.slice(0, 2).map((lp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground w-16 truncate">
                      {lp.title}
                    </div>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-1.5 bg-green-500 rounded-full" 
                        style={{ width: `${lp.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full max-w-sm grid-cols-3 mx-auto">
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>Skill Development</span>
              </CardTitle>
              <CardDescription>
                Track your progress across different technology domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assessmentData.skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{skill.name}</h4>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {skill.mastery.charAt(0).toUpperCase() + skill.mastery.slice(1)}
                        </Badge>
                        <span className="text-sm font-medium">{skill.level}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={skill.level} className="flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {skill.lastPracticed.toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Challenge Progress</span>
              </CardTitle>
              <CardDescription>
                Review your completed and in-progress challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessmentData.challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={challenge.difficulty === 'easy' ? 'default' : challenge.difficulty === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                            {challenge.difficulty}
                          </Badge>
                          {challenge.completed && challenge.score && (
                            <Badge variant="outline" className="text-xs">
                              Score: {challenge.score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {challenge.completed ? (
                        <span className="text-sm text-muted-foreground">
                          Completed: {challenge.completedAt?.toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Time spent: {challenge.timeSpent}m
                        </span>
                      )}
                      <Button variant="outline" size="sm">
                        {challenge.completed ? 'Review' : 'Continue'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Learning Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights about your learning patterns and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Weekly Progress
                    </h4>
                    <div className="space-y-3">
                      {assessmentData.weeklyProgress.map((day, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-20 text-xs text-muted-foreground">
                            {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{day.progress}%</span>
                            </div>
                            <Progress value={day.progress} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Recommended Focus Areas
                    </h4>
                    <div className="space-y-3">
                      {assessmentData.skills
                        .filter(skill => skill.level < 70)
                        .sort((a, b) => a.level - b.level)
                        .slice(0, 3)
                        .map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <span className="font-medium">{skill.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {skill.level}% complete
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Learning Insights
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Trophy className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium">Best Performance</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              You&apos;re strongest in {assessmentData.skills.reduce((best, skill) => 
                                skill.level > best.level ? skill : best, 
                                assessmentData.skills[0]
                              ).name}. Keep up the great work!
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Target className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h5 className="font-medium">Areas for Improvement</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              Focus on {assessmentData.skills.reduce((worst, skill) => 
                                skill.level < worst.level ? skill : worst, 
                                assessmentData.skills[0]
                              ).name} to balance your skills.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Zap className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h5 className="font-medium">Learning Pattern</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              You&apos;re most productive in the {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, spending an average of 45 minutes per session.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Next Steps
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md">
                        <div className="mt-0.5">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Complete System Design Path</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            You&apos;re 35% through the System Design path. Finish it to strengthen your architecture skills.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md">
                        <div className="mt-0.5">
                          <Code className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Practice Hard Challenges</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            You&apos;ve solved 80% of medium challenges but only 30% of hard ones. Try tackling more difficult problems.
                          </p>
                        </div>
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