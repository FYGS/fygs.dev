"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  FileCode,
  Trophy,
  BarChart3,
  Target,
  Clock,
  Star,
  RotateCcw,
  ArrowLeft,
  Play,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetrics {
  accuracy: number;
  efficiency: number;
  timeTaken: number; // in minutes
  attempts: number;
  rating: number;
}

export function AdvancedCodingChallenges() {
  const [activeTab, setActiveTab] = useState("challenges");
  const [challenges] = useState([
    {
      id: "1",
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "beginner",
      category: "Arrays",
      estimatedTime: 15,
      tags: ["array", "hash-map", "two-pointers"],
      testCases: [
        {
          id: "1",
          input: "[2,7,11,15], 9",
          expectedOutput: "[0,1]",
          isHidden: false,
        },
        {
          id: "2",
          input: "[3,2,4], 6",
          expectedOutput: "[1,2]",
          isHidden: false,
        },
        {
          id: "3",
          input: "[3,3], 6",
          expectedOutput: "[0,1]",
          isHidden: true,
        },
        {
          id: "4",
          input: "[1,2,3,4,5], 8",
          expectedOutput: "[2,4]",
          isHidden: true,
        },
      ],
      starterCode: `function twoSum(nums, target) {
  // Your code here
  
}`,
      solution: `function twoSum(nums, target) {
  const seen = {};
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in seen) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  
  return [];
}`,
      hints: [
        {
          id: "1",
          content:
            "Try using a hash map (object) to store each number and its index as you iterate through the array.",
          revealCost: 0,
        },
        {
          id: "2",
          content:
            "For each number, check if target - number exists in your hash map before adding the current number.",
          revealCost: 10,
        },
        {
          id: "3",
          content:
            "The optimal solution has O(n) time complexity and O(n) space complexity.",
          revealCost: 20,
        },
      ],
      explanation: `The optimal solution uses a hash map to store numbers we've seen and their indices. As we iterate through the array, for each number we calculate its complement (target - number). If the complement exists in our hash map, we've found our two numbers. This approach has O(n) time complexity and O(n) space complexity.`,
    },
    {
      id: "2",
      title: "Valid Parentheses",
      description:
        "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      difficulty: "beginner",
      category: "Stacks",
      estimatedTime: 20,
      tags: ["stack", "string", "validation"],
      testCases: [
        {
          id: "1",
          input: '"()"',
          expectedOutput: "true",
          isHidden: false,
        },
        {
          id: "2",
          input: '"()[]{}"',
          expectedOutput: "true",
          isHidden: false,
        },
        {
          id: "3",
          input: '"(]"',
          expectedOutput: "false",
          isHidden: true,
        },
      ],
      starterCode: `function isValid(s) {
  // Your code here
  
}`,
      solution: `function isValid(s) {
  const stack = [];
  const pairs = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
      hints: [
        {
          id: "1",
          content:
            "Use a stack data structure to keep track of opening brackets.",
          revealCost: 0,
        },
        {
          id: "2",
          content:
            "When you encounter a closing bracket, check if it matches the most recent opening bracket.",
          revealCost: 10,
        },
      ],
      explanation: `This problem is perfectly suited for a stack data structure. We iterate through the string, pushing opening brackets onto the stack. When we encounter a closing bracket, we check if it matches the most recently pushed opening bracket by popping from the stack. If all brackets are properly matched, the stack will be empty at the end.`,
    },
    {
      id: "3",
      title: "Binary Tree Level Order Traversal",
      description:
        "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level)",
      difficulty: "intermediate",
      category: "Trees",
      estimatedTime: 25,
      tags: ["tree", "bfs", "recursion"],
      testCases: [
        {
          id: "1",
          input: "[3,9,20,null,null,15,7]",
          expectedOutput: "[[3],[9,20],[15,7]]",
          isHidden: false,
        },
        {
          id: "2",
          input: "[1]",
          expectedOutput: "[[1]]",
          isHidden: false,
        },
        {
          id: "3",
          input: "[]",
          expectedOutput: "[[]]",
          isHidden: true,
        },
      ],
      starterCode: `function levelOrder(root) {
  // Your code here
  
}`,
      solution: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}`,
      hints: [
        {
          id: "1",
          content:
            "Use breadth-first search (BFS) with a queue to traverse the tree level by level.",
          revealCost: 0,
        },
        {
          id: "2",
          content:
            "At each level, process all nodes currently in the queue before adding their children.",
          revealCost: 15,
        },
      ],
      explanation: `This solution uses BFS with a queue. At each level, we process all nodes currently in the queue (which represents the current level) before adding their children. This ensures we traverse the tree level by level from left to right.`,
    },
  ]);

  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState(100);

  // Handle code submission
  const submitCode = async () => {
    if (!selectedChallenge) return;

    setIsSubmitting(true);

    // Simulate code execution
    setTimeout(() => {
      // Mock result - in a real implementation this would run the code and compare outputs
      const mockResult = {
        passed: Math.random() > 0.3, // 70% chance of passing for demo
        output: "Execution completed successfully",
        executionTime: Math.floor(Math.random() * 500) + 50, // 50-550 ms
        memoryUsed: parseFloat((Math.random() * 10 + 5).toFixed(2)), // 5-15 MB
        testCasesPassed:
          Math.floor(Math.random() * selectedChallenge.testCases.length) + 1,
        totalTestCases: selectedChallenge.testCases.length,
        detailedResults: selectedChallenge.testCases.map((testCase: any) => ({
          testCaseId: testCase.id,
          passed: Math.random() > 0.4, // 60% chance of passing each test case
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual:
            Math.random() > 0.4 ? testCase.expectedOutput : "different output",
          executionTime: Math.floor(Math.random() * 100) + 10, // 10-110 ms per test
        })),
      };

      setSubmissionResult(mockResult);
      setIsSubmitting(false);

      // Calculate performance metrics
      const accuracy = Math.round(
        (mockResult.testCasesPassed / mockResult.totalTestCases) * 100
      );
      const efficiency = Math.max(0, 100 - mockResult.executionTime / 10); // Lower execution time = higher efficiency

      setPerformanceMetrics({
        accuracy,
        efficiency,
        timeTaken:
          selectedChallenge.estimatedTime - Math.floor(Math.random() * 5), // Time taken compared to estimate
        attempts: 1,
        rating: Math.floor((accuracy + efficiency) / 2),
      });
    }, 1500);
  };

  // Run test cases individually
  const runTestCase = async (testCaseId: string) => {
    if (!selectedChallenge) return;

    setIsSubmitting(true);

    // Simulate test execution
    setTimeout(() => {
      const testCase = selectedChallenge.testCases.find(
        (tc: any) => tc.id === testCaseId
      );
      if (!testCase) return;

      const mockResult = {
        passed: Math.random() > 0.4, // 60% chance of passing
        output: "Test executed",
        executionTime: Math.floor(Math.random() * 100) + 10,
        memoryUsed: parseFloat((Math.random() * 5 + 2).toFixed(2)),
        testCasesPassed: Math.random() > 0.4 ? 1 : 0,
        totalTestCases: 1,
        detailedResults: [
          {
            testCaseId,
            passed: Math.random() > 0.4,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual:
              Math.random() > 0.4
                ? testCase.expectedOutput
                : "incorrect output",
            executionTime: Math.floor(Math.random() * 100) + 10,
          },
        ],
      };

      setSubmissionResult(mockResult);
      setIsSubmitting(false);
    }, 1000);
  }; // Reveal a hint
  const revealHint = (hint: any) => {
    if (userPoints >= hint.revealCost) {
      setRevealedHints((prev) => [...prev, hint.id]);
      setUserPoints((prev) => prev - hint.revealCost);
    } else {
      alert(
        `You need ${hint.revealCost} points to reveal this hint. You currently have ${userPoints} points.`
      );
    }
  };

  // Reset challenge
  const resetChallenge = () => {
    if (selectedChallenge) {
      setSubmissionResult(null);
      setPerformanceMetrics(null);
    }
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return (
          <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded border border-green-500/20">
            Beginner
          </span>
        );
      case "intermediate":
        return (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20">
            Intermediate
          </span>
        );
      case "advanced":
        return (
          <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded border border-orange-500/20">
            Advanced
          </span>
        );
      case "expert":
        return (
          <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20">
            Expert
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-xs rounded border border-gray-500/20">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Advanced Coding Challenges
        </h1>
        <p className="text-muted-foreground mt-2">
          Practice with real-time feedback, performance metrics, and
          comprehensive test suites
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {!selectedChallenge ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedChallenge(challenge);
                  }}
                >
                  <Card className="h-full border border-border/50 hover:shadow-lg transition-all duration-300 backdrop-blur-xl bg-background/80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {challenge.title}
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full">
                          <div className="h-4 w-4 rounded-full"></div>
                        </div>
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
                      {getDifficultyBadge(challenge.difficulty)}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedChallenge(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Challenges
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Points: {userPoints}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={resetChallenge}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              <Card className="backdrop-blur-xl bg-background/80 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {selectedChallenge.title}
                        <span className="text-xs">
                          {getDifficultyBadge(selectedChallenge.difficulty)}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{selectedChallenge.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{selectedChallenge.estimatedTime} min</span>
                        </div>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={submitCode}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span>Running...</span>
                          </div>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Submit Solution
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        Problem Statement
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedChallenge.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Hints
                      </h3>
                      <div className="space-y-3">
                        {selectedChallenge.hints.map(
                          (hint: any, index: number) => (
                            <div
                              key={hint.id}
                              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
                            >
                              <div className="mt-0.5">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  {revealedHints.includes(hint.id)
                                    ? hint.content
                                    : `Click to reveal hint ${index + 1} (-${
                                        hint.revealCost
                                      } pts)`}
                                </p>
                                {!revealedHints.includes(hint.id) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-6 px-2 text-xs"
                                    onClick={() => revealHint(hint)}
                                  >
                                    Reveal Hint
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Test Cases
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedChallenge.testCases.map((testCase: any) => (
                          <Card
                            key={testCase.id}
                            className={cn(
                              "border border-border/50",
                              submissionResult?.detailedResults.find(
                                (r: any) => r.testCaseId === testCase.id
                              )?.passed
                                ? "border-green-500/30 bg-green-500/5"
                                : submissionResult &&
                                  !submissionResult.detailedResults.find(
                                    (r: any) => r.testCaseId === testCase.id
                                  )?.passed
                                ? "border-red-500/30 bg-red-500/5"
                                : ""
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Input
                                  </p>
                                  <p className="text-sm font-mono">
                                    {testCase.input}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Expected Output
                                  </p>
                                  <p className="text-sm font-mono">
                                    {testCase.expectedOutput}
                                  </p>
                                </div>
                                {submissionResult && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Actual Output
                                    </p>
                                    <p className="text-sm font-mono">
                                      {submissionResult.detailedResults.find(
                                        (r: any) => r.testCaseId === testCase.id
                                      )?.actual || "Not executed"}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={() => runTestCase(testCase.id)}
                                disabled={isSubmitting}
                              >
                                Run Test
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {submissionResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2 mb-3">
                            {submissionResult.passed ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium text-green-500">
                                  All Tests Passed!
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="font-medium text-red-500">
                                  Some Tests Failed
                                </span>
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Test Cases Passed
                              </p>
                              <p className="text-lg font-medium">
                                {submissionResult.testCasesPassed}/
                                {submissionResult.totalTestCases}
                              </p>
                              <Progress
                                value={
                                  (submissionResult.testCasesPassed /
                                    submissionResult.totalTestCases) *
                                  100
                                }
                                className="mt-1 h-2"
                              />
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">
                                Execution Time
                              </p>
                              <p className="text-lg font-medium">
                                {submissionResult.executionTime}ms
                              </p>
                              <div className="text-xs text-muted-foreground">
                                Memory: {submissionResult.memoryUsed}MB
                              </div>
                            </div>
                          </div>
                        </div>

                        {performanceMetrics && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  Accuracy
                                </span>
                              </div>
                              <p className="text-2xl font-bold">
                                {performanceMetrics.accuracy}%
                              </p>
                              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div
                                  className="h-1.5 rounded-full bg-blue-500"
                                  style={{
                                    width: `${performanceMetrics.accuracy}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  Efficiency
                                </span>
                              </div>
                              <p className="text-2xl font-bold">
                                {performanceMetrics.efficiency}%
                              </p>
                              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div
                                  className="h-1.5 rounded-full bg-green-500"
                                  style={{
                                    width: `${performanceMetrics.efficiency}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">
                                  Time Taken
                                </span>
                              </div>
                              <p className="text-2xl font-bold">
                                {performanceMetrics.timeTaken}m
                              </p>
                              <div className="text-xs text-muted-foreground">
                                vs {selectedChallenge.estimatedTime}m est.
                              </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">
                                  Rating
                                </span>
                              </div>
                              <p className="text-2xl font-bold">
                                {performanceMetrics.rating}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i <
                                        Math.floor(
                                          performanceMetrics.rating / 20
                                        )
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Challenge Leaderboard</span>
              </CardTitle>
              <CardDescription>
                Top performers in coding challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div
                    key={rank}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      rank === 1 && "bg-yellow-500/10 border-yellow-500/20",
                      rank === 2 && "bg-gray-500/10 border-gray-500/20",
                      rank === 3 && "bg-orange-800/10 border-orange-800/20",
                      rank > 3 && "border-border/50 hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                        rank === 1 && "bg-yellow-500/20 text-yellow-500",
                        rank === 2 && "bg-gray-500/20 text-gray-500",
                        rank === 3 && "bg-orange-800/20 text-orange-800",
                        rank > 3 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {rank}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">User {rank}</p>
                      <p className="text-sm text-muted-foreground">
                        @username{rank}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{1000 - rank * 100} pts</p>
                      <p className="text-xs text-muted-foreground">
                        {50 - rank * 5} challenges
                      </p>
                    </div>
                  </div>
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
                <span>Performance Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights about your challenge performance and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Overall Performance
                  </h3>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Average Efficiency</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Time Efficiency</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Challenge Completion
                  </h3>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Arrays & Strings</span>
                      <span className="font-medium">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Trees & Graphs</span>
                      <span className="font-medium">8/12</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">System Design</span>
                      <span className="font-medium">3/8</span>
                    </div>
                    <Progress value={38} className="h-2" />
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
