"use client";

import { CodeAnalysis, CodeHint } from "@/app/_services/ai-code-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BrainCircuit,
  Code,
  CodeXml,
  Cpu,
  FileCode,
  Lightbulb,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Shield,
  Sparkles,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../_stores/editor-store";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "code" | "analysis" | "hint";
  metadata?: {
    code?: string;
    explanation?: string;
    [key: string]: unknown;
  };
}

interface EnhancedAIAssistantProps {
  challengeId?: string;
}

export function EnhancedAIAssistant({ challengeId }: EnhancedAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI coding assistant. I can help you with code suggestions, debugging, and optimization. What would you like help with today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis | null>(null);
  const [codeHint, setCodeHint] = useState<CodeHint | null>(null);
  const [hintRequested, setHintRequested] = useState(false);
  const { code, language } = useEditorStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track the current code for analysis to prevent repeated analysis
  const codeRef = useRef(code);
  const analyzedRef = useRef(false);

  // Analyze code when tab changes to "analyze"
  useEffect(() => {
    // Only auto-analyze when the tab is selected and we haven't analyzed this code yet
    if (
      activeTab === "analyze" &&
      !codeAnalysis &&
      !isAnalyzing &&
      !analyzedRef.current
    ) {
      analyzeCode();
      analyzedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, codeAnalysis, isAnalyzing]);

  // Reset analysis state when code changes significantly
  useEffect(() => {
    // If code has changed since last analysis
    if (code !== codeRef.current) {
      codeRef.current = code;
      analyzedRef.current = false;
      setCodeAnalysis(null);
    }
  }, [code]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a production environment, this would call an API
      // Commented out to avoid actual API calls during development
      // const response = await fetch("/api/ai/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     message: input,
      //     code,
      //     language,
      //     challengeId,
      //   }),
      // }).then((res) => res.json());

      // Simulate API call
      setTimeout(() => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: generateAIResponse(input, code, language),
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error("No code to analyze", {
        description: "Please write some code first.",
      });
      return;
    }

    // If we're already analyzing or have analyzed this code, don't do it again
    if (isAnalyzing || (analyzedRef.current && code === codeRef.current)) {
      return;
    }

    // Reset state and start analyzing
    setIsAnalyzing(true);
    setCodeAnalysis(null);

    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isAnalyzing) {
        setIsAnalyzing(false);
        analyzedRef.current = false; // Allow retry
        toast.error("Analysis timeout", {
          description: "The analysis took too long. Please try again.",
        });
      }
    }, 10000); // 10 second timeout

    try {
      // In a production environment, this would call an API
      // const response = await fetch("/api/ai/analyze", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     code,
      //     language,
      //   }),
      // }).then((res) => res.json());

      // Simulate API call
      const analysisPromise = new Promise<CodeAnalysis>((resolve) => {
        setTimeout(() => {
          const analysis = simulateCodeAnalysis(code, language);
          resolve(analysis);
        }, 1500);
      });

      // Wait for the analysis to complete
      const analysis = await analysisPromise;

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Update state with the analysis results
      setCodeAnalysis(analysis);
      setIsAnalyzing(false);
      analyzedRef.current = true;
      codeRef.current = code;

      // Show success toast
      toast.success("Analysis complete", {
        description: "Your code has been analyzed successfully.",
      });
    } catch (error) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);

      console.error("Error analyzing code:", error);
      toast.error("Failed to analyze code. Please try again.");
      setIsAnalyzing(false);
      analyzedRef.current = false; // Allow retry
    }
  };

  const getHint = async () => {
    if (!challengeId) {
      toast.error("No challenge selected", {
        description: "Please select a challenge first.",
      });
      return;
    }

    setHintRequested(true);

    try {
      // In a production environment, this would call an API
      // const response = await fetch("/api/ai/hint", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     challengeId,
      //     code,
      //     language,
      //   }),
      // }).then((res) => res.json());

      // Simulate API call
      setTimeout(() => {
        const hint = simulateHint(challengeId);
        setCodeHint(hint);

        // Add hint to messages
        const hintMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: hint.hint,
          timestamp: new Date(),
          type: "hint",
          metadata: {
            explanation: hint.explanation,
            code: hint.code,
          },
        };

        setMessages((prev) => [...prev, hintMessage]);
        setHintRequested(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting hint:", error);
      toast.error("Failed to get hint. Please try again.");
      setHintRequested(false);
    }
  };

  // Placeholder function - replace with actual AI integration
  const generateAIResponse = (
    query: string,
    _code: string,
    language: string
  ) => {
    // This is a placeholder. In a real implementation, you would call an AI API
    if (query.toLowerCase().includes("optimize")) {
      return `Here are some optimization suggestions for your ${language} code:\n\n1. Consider using memoization for recursive functions\n2. Avoid unnecessary array copies\n3. Use appropriate data structures for your operations`;
    } else if (query.toLowerCase().includes("explain")) {
      return `Your code appears to be a ${language} implementation that:\n\n- Initializes variables\n- Contains a main function with logic\n- Has error handling\n\nIs there a specific part you'd like me to explain in more detail?`;
    } else if (query.toLowerCase().includes("debug")) {
      return `I've analyzed your code and found potential issues:\n\n1. Check line 5 for possible null reference\n2. Your loop condition might cause off-by-one errors\n3. Consider adding error handling for edge cases`;
    } else if (
      query.toLowerCase().includes("hint") ||
      query.toLowerCase().includes("help")
    ) {
      if (challengeId) {
        const hint = simulateHint(challengeId);
        return `Here is a hint: ${hint.hint}\n\n${hint.explanation}`;
      } else {
        return "I would be happy to provide a hint, but it seems you are not working on a specific challenge. Could you clarify what you need help with?";
      }
    } else {
      return `I have analyzed your ${language} code. It looks like you are working on an algorithm implementation. Can you tell me more about what you are trying to achieve, or what specific help you need?`;
    }
  };

  // Simulate code analysis - replace with actual API call in production
  const simulateCodeAnalysis = (
    code: string,
    language: string
  ): CodeAnalysis => {
    const hasLoop = code.includes("for") || code.includes("while");
    const hasRecursion =
      code.includes("function") &&
      code.includes("return") &&
      code.includes(code.match(/function\s+(\w+)/)?.[1] || "");
    const hasErrorHandling = code.includes("try") && code.includes("catch");

    return {
      suggestions: [
        {
          type: "optimization" as const,
          description: hasLoop
            ? "Consider using array methods like map/filter/reduce instead of loops for better readability"
            : "Your code looks well-optimized",
          severity: "info" as const,
        },
        {
          type: "style" as const,
          description:
            "Add more descriptive variable names for better code readability",
          severity: "info" as const,
        },
        ...(hasErrorHandling
          ? []
          : [
              {
                type: "bug" as const,
                description: "Add error handling to make your code more robust",
                severity: "warning" as const,
              },
            ]),
        ...(hasRecursion
          ? [
              {
                type: "performance" as const,
                description: "Consider memoization to optimize recursive calls",
                severity: "info" as const,
                code: "const memo = {};\nfunction memoizedFn(n) {\n  if (n in memo) return memo[n];\n  // Your recursive logic\n  memo[n] = result;\n  return result;\n}",
              },
            ]
          : []),
      ],
      explanation: `This ${language} code ${
        code.length > 100 ? "is moderately complex and " : ""
      }${hasLoop ? "uses loops for iteration" : "doesn't use explicit loops"}${
        hasRecursion ? " and implements recursion" : ""
      }${
        hasErrorHandling
          ? " with proper error handling"
          : " without explicit error handling"
      }.`,
      complexity: {
        time: hasLoop ? "O(n)" : hasRecursion ? "O(2^n)" : "O(1)",
        space: hasRecursion ? "O(n)" : "O(1)",
        score: hasRecursion ? 7 : hasLoop ? 4 : 2,
      },
      summary: `${language} implementation that ${
        code.length < 50
          ? "is concise and "
          : code.length > 200
          ? "is extensive and "
          : ""
      }${hasLoop ? "uses iteration" : ""}${
        hasLoop && hasRecursion ? " and " : ""
      }${hasRecursion ? "uses recursion" : ""}${
        !hasLoop && !hasRecursion ? "uses simple operations" : ""
      }.`,
    };
  };

  // Simulate hint generation - replace with actual API call in production
  const simulateHint = (challengeId: string): CodeHint => {
    const hints: Record<string, CodeHint> = {
      "1": {
        hint: "Try using a hash map (object) to store each number and its index as you iterate through the array.",
        code: "function twoSum(nums, target) {\n  const seen = {};\n  \n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (complement in seen) {\n      return [seen[complement], i];\n    }\n    seen[nums[i]] = i;\n  }\n}",
        explanation:
          "By storing each number in a hash map, you can check if the complement (target - current number) exists in constant time.",
      },
      "2": {
        hint: "Use a stack data structure to keep track of opening brackets and pop them when you encounter closing brackets.",
        code: "function isValid(s) {\n  const stack = [];\n  const pairs = {\n    ')': '(',\n    '}': '{',\n    ']': '['\n  };\n  \n  for (let char of s) {\n    if (char in pairs) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  \n  return stack.length === 0;\n}",
        explanation:
          "A stack is perfect for this problem because brackets follow a last-in-first-out pattern.",
      },
    };

    return (
      hints[challengeId] || {
        hint: "Break down the problem into smaller steps. What's the core operation you need to perform?",
        explanation:
          "Sometimes the best approach is to start with a simple solution and then optimize.",
        code: "// Start with a simple approach\nfunction solve(input) {\n  // 1. Parse the input\n  // 2. Process the data\n  // 3. Return the result\n}",
      }
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "info":
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Zap className="h-4 w-4" />;
      case "bug":
        return <AlertCircle className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "style":
        return <FileCode className="h-4 w-4" />;
      case "performance":
        return <Cpu className="h-4 w-4" />;
      case "logic":
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg relative overflow-hidden group border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-violet-500/20 to-fuchsia-500/20 animate-gradient-xy"></div>
                    <Sparkles className="h-6 w-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-gradient-to-r from-sky-500/90 to-violet-500/90 border-0 text-white font-medium px-4 py-2 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <p>AI Code Assistant</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[450px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="border border-border/50 shadow-xl backdrop-blur-xl bg-background/80 overflow-hidden">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Code Assistant
                  </CardTitle>
                  <CardDescription>Get help with your code</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger
                    value="chat"
                    className="flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analyze"
                    className="flex items-center gap-1.5"
                  >
                    <Search className="h-4 w-4" />
                    <span>Analyze</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="hint"
                    className="flex items-center gap-1.5"
                    disabled={!challengeId}
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Hint</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="m-0">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[350px] px-4">
                      <div className="space-y-4 pt-1 pb-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex items-start gap-3 rounded-lg p-3",
                              message.role === "user"
                                ? "ml-10 bg-muted/50"
                                : "mr-10 bg-primary/10"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-sm",
                                message.role === "user"
                                  ? "bg-background"
                                  : "bg-primary/10 border-primary/20 text-primary"
                              )}
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}

                                {message.type === "hint" &&
                                  message.metadata?.code && (
                                    <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border/50 text-xs font-mono overflow-x-auto">
                                      <pre>{message.metadata.code}</pre>
                                    </div>
                                  )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex items-center justify-center py-4">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                              <div
                                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="pt-3 pb-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex w-full items-center space-x-2"
                    >
                      <Input
                        placeholder="Ask for help or suggestions..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-background/50"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="analyze" className="m-0">
                  <CardContent className="p-4 space-y-4">
                    {isAnalyzing ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/10"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            Analyzing your code...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Checking complexity, patterns, and potential
                            improvements
                          </p>
                        </div>
                      </motion.div>
                    ) : codeAnalysis ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-primary" />
                            Summary
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {codeAnalysis.explanation}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" />
                            Complexity
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            <motion.div
                              className="p-3 bg-muted/30 rounded-md border border-border/50 hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Time
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {codeAnalysis.complexity.time}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">
                                {codeAnalysis.complexity.time}
                              </p>
                            </motion.div>
                            <motion.div
                              className="p-3 bg-muted/30 rounded-md border border-border/50 hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Space
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {codeAnalysis.complexity.space}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">
                                {codeAnalysis.complexity.space}
                              </p>
                            </motion.div>
                            <motion.div
                              className="p-3 bg-muted/30 rounded-md border border-border/50 hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Score
                                </p>
                                <Badge
                                  variant={
                                    codeAnalysis.complexity.score >= 7
                                      ? "default"
                                      : codeAnalysis.complexity.score >= 4
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {codeAnalysis.complexity.score}/10
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <motion.div
                                  className={`h-1.5 rounded-full ${
                                    codeAnalysis.complexity.score >= 7
                                      ? "bg-green-500"
                                      : codeAnalysis.complexity.score >= 4
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${
                                      codeAnalysis.complexity.score * 10
                                    }%`,
                                  }}
                                  transition={{ duration: 0.5, delay: 0.4 }}
                                />
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Suggestions
                          </h3>
                          <div className="space-y-3">
                            {codeAnalysis.suggestions.map(
                              (suggestion, index) => (
                                <motion.div
                                  key={index}
                                  className={cn(
                                    "p-3 rounded-md border flex items-start gap-3",
                                    getSeverityColor(suggestion.severity),
                                    "hover:shadow-md transition-all duration-200"
                                  )}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.1 * index,
                                  }}
                                >
                                  <div className="mt-0.5">
                                    {getTypeIcon(suggestion.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-medium capitalize">
                                        {suggestion.type}
                                      </p>
                                      <Badge
                                        variant={
                                          suggestion.severity === "critical"
                                            ? "destructive"
                                            : suggestion.severity === "warning"
                                            ? "secondary"
                                            : "default"
                                        }
                                        className="text-[10px] h-4"
                                      >
                                        {suggestion.severity}
                                      </Badge>
                                      {suggestion.lineNumber && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] h-4 ml-auto"
                                        >
                                          Line {suggestion.lineNumber}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm mt-2">
                                      {suggestion.description}
                                    </p>
                                    {suggestion.code && (
                                      <motion.div
                                        className="mt-2 p-2 bg-background/50 rounded-md text-xs font-mono overflow-x-auto border border-border/50"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{
                                          duration: 0.3,
                                          delay: 0.2 + 0.1 * index,
                                        }}
                                      >
                                        <pre>{suggestion.code}</pre>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-5">
                        <div className="relative">
                          <div className="absolute -inset-4 rounded-full bg-primary/5 animate-pulse" />
                          <CodeXml className="h-16 w-16 text-primary relative" />
                        </div>

                        <div className="text-center">
                          <h3 className="font-medium text-lg">
                            Analyze Your Code
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-xs mt-2">
                            Get insights about your code&apos;s complexity,
                            potential issues, and optimization opportunities.
                          </p>
                        </div>

                        <div>
                          <Button
                            onClick={analyzeCode}
                            className="mt-2 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                            size="lg"
                          >
                            <Search className="h-4 w-4" />
                            Analyze Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="hint" className="m-0">
                  <CardContent className="p-4 space-y-4">
                    {hintRequested ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          Generating hint...
                        </p>
                      </div>
                    ) : codeHint ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Hint</h3>
                          </div>
                          <p className="text-sm">{codeHint.hint}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Explanation
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {codeHint.explanation}
                          </p>
                        </div>

                        {codeHint.code && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">
                              Example Code
                            </h3>
                            <div className="p-3 bg-muted/30 rounded-md text-sm font-mono overflow-x-auto">
                              <pre>{codeHint.code}</pre>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setCodeHint(null)}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Get Another Hint
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Lightbulb className="h-12 w-12 text-muted-foreground" />
                        <div className="text-center">
                          <h3 className="font-medium">Need a Hint?</h3>
                          <p className="text-sm text-muted-foreground max-w-xs mt-1">
                            Get a helpful hint for the current challenge without
                            revealing the full solution.
                          </p>
                        </div>
                        <Button onClick={getHint} className="mt-2">
                          <Wand2 className="mr-2 h-4 w-4" />
                          Get Hint
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
