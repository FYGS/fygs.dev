"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Code2,
  FileQuestion,
  Hourglass,
  Lightbulb,
  Mic,
  MonitorPlay,
  Pause,
  Play,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../_stores/editor-store";

interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  hints: string[];
  starterCode: string;
  language: string;
  timeLimit: number; // in minutes
}

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    hints: [
      "Consider using a hash map to store values you've seen.",
      "For each number, check if target - number exists in your hash map.",
    ],
    starterCode: "function twoSum(nums, target) {\n  // Your code here\n  \n}",
    language: "javascript",
    timeLimit: 15,
  },
  {
    id: "2",
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stacks",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
    hints: [
      "Consider using a stack data structure.",
      "Push opening brackets onto the stack and pop when you encounter closing brackets.",
    ],
    starterCode: "function isValid(s) {\n  // Your code here\n  \n}",
    language: "javascript",
    timeLimit: 15,
  },
];

export function InterviewMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("challenges");
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const { setCode, setLanguage } = useEditorStore();

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setTimeRemaining(challenge.timeLimit * 60); // Convert to seconds
    setCode(challenge.starterCode);
    setLanguage(challenge.language);
    setIsSimulationActive(true);
    setActiveTab("simulation");
  };

  const showNextHint = () => {
    if (
      selectedChallenge &&
      currentHintIndex < selectedChallenge.hints.length - 1
    ) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setCurrentHintIndex(-1);
    setActiveTab("challenges");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted/50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-500/20"
        >
          <Brain className="w-4 h-4" />
          <span>Interview Mode</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Interview Simulation Mode
          </DialogTitle>
          <DialogDescription>
            Practice coding challenges with realistic interview conditions and
            AI-powered feedback.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="challenges" disabled={isSimulationActive}>
              <FileQuestion className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="simulation">
              <MonitorPlay className="w-4 h-4 mr-2" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="challenges"
            className="flex-1 overflow-auto p-1 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="arrays">Arrays</SelectItem>
                    <SelectItem value="strings">Strings</SelectItem>
                    <SelectItem value="stacks">Stacks & Queues</SelectItem>
                    <SelectItem value="trees">Trees & Graphs</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {SAMPLE_CHALLENGES.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => startChallenge(challenge)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                      {challenge.title}
                    </h3>
                    <div
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        getDifficultyColor(challenge.difficulty)
                      )}
                    >
                      {challenge.difficulty}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {challenge.category} • {challenge.timeLimit} min
                  </div>
                  <p className="text-sm line-clamp-2">
                    {challenge.description}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        startChallenge(challenge);
                      }}
                    >
                      <Play className="w-3 h-3" />
                      Start Challenge
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="simulation"
            className="flex-1 overflow-auto space-y-4 p-1"
          >
            {selectedChallenge ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">
                    {selectedChallenge.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full",
                        isSimulationActive
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {isSimulationActive ? (
                        <Clock className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Hourglass className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setIsSimulationActive(!isSimulationActive)}
                    >
                      {isSimulationActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-2">Problem Description</h4>
                  <p className="text-sm">{selectedChallenge.description}</p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/10">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Hints</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={showNextHint}
                      disabled={
                        currentHintIndex >= selectedChallenge.hints.length - 1
                      }
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {currentHintIndex < 0 ? "Show First Hint" : "Next Hint"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentHintIndex < 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No hints revealed yet. Click the button to show a hint.
                      </p>
                    ) : (
                      selectedChallenge.hints
                        .slice(0, currentHintIndex + 1)
                        .map((hint, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 rounded bg-primary/5 border border-primary/10"
                          >
                            <span className="font-medium">
                              Hint {index + 1}:
                            </span>{" "}
                            {hint}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-2">Interview Tools</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start gap-2">
                      <Mic className="w-4 h-4" />
                      Voice Recording
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Video className="w-4 h-4" />
                      Screen Recording
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Code2 className="w-4 h-4" />
                      Submit Solution
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => {
                        // Close the dialog and let the AI assistant handle the feedback
                        setIsOpen(false);
                        // The AI assistant will be triggered separately
                      }}
                    >
                      <Brain className="w-4 h-4" />
                      AI Feedback
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-center space-y-2">
                  <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Challenge Selected</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Select a challenge from the Challenges tab to start your
                    interview simulation.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "simulation" && selectedChallenge && (
            <Button variant="outline" onClick={resetSimulation}>
              Exit Simulation
            </Button>
          )}
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
