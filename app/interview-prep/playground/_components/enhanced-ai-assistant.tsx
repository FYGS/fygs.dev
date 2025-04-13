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
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Analyze code when tab changes to "analyze"
  useEffect(() => {
    if (activeTab === "analyze" && !codeAnalysis && !isAnalyzing) {
      analyzeCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, codeAnalysis, isAnalyzing]);

  // Reset code analysis when code changes significantly
  useEffect(() => {
    if (codeAnalysis) {
      setCodeAnalysis(null);
    }
  }, [code, codeAnalysis]);

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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please write some code first.",
        variant: "default",
      });
      return;
    }

    setIsAnalyzing(true);

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
      setTimeout(() => {
        const analysis = simulateCodeAnalysis(code, language);
        setCodeAnalysis(analysis);
        setIsAnalyzing(false);
      }, 1500);
    } catch (error) {
      console.error("Error analyzing code:", error);
      toast({
        title: "Error",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const getHint = async () => {
    if (!challengeId) {
      toast({
        title: "No challenge selected",
        description: "Please select a challenge first.",
        variant: "default",
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
      toast({
        title: "Error",
        description: "Failed to get hint. Please try again.",
        variant: "destructive",
      });
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Sparkles className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>AI Code Assistant</p>
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
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          Analyzing your code...
                        </p>
                      </div>
                    ) : codeAnalysis ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Summary</h3>
                          <p className="text-sm text-muted-foreground">
                            {codeAnalysis.explanation}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Complexity
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                Time
                              </p>
                              <p className="text-sm font-medium">
                                {codeAnalysis.complexity.time}
                              </p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                Space
                              </p>
                              <p className="text-sm font-medium">
                                {codeAnalysis.complexity.space}
                              </p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                Score
                              </p>
                              <p className="text-sm font-medium">
                                {codeAnalysis.complexity.score}/10
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Suggestions
                          </h3>
                          <div className="space-y-2">
                            {codeAnalysis.suggestions.map(
                              (suggestion, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "p-3 rounded-md border flex items-start gap-2",
                                    getSeverityColor(suggestion.severity)
                                  )}
                                >
                                  <div className="mt-0.5">
                                    {getTypeIcon(suggestion.type)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium capitalize">
                                        {suggestion.type}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-4"
                                      >
                                        {suggestion.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {suggestion.description}
                                    </p>
                                    {suggestion.code && (
                                      <div className="mt-2 p-2 bg-background/50 rounded-md text-xs font-mono overflow-x-auto">
                                        <pre>{suggestion.code}</pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <CodeXml className="h-12 w-12 text-muted-foreground" />
                        <div className="text-center">
                          <h3 className="font-medium">Analyze Your Code</h3>
                          <p className="text-sm text-muted-foreground max-w-xs mt-1">
                            Get insights about your code&apos;s complexity,
                            potential issues, and optimization opportunities.
                          </p>
                        </div>
                        <Button onClick={analyzeCode} className="mt-2">
                          <Search className="mr-2 h-4 w-4" />
                          Analyze Code
                        </Button>
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
