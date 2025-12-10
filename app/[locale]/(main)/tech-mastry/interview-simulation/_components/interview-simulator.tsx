"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import {
  User,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Code,
  FileText,
  Clock,
  Users,
  GraduationCap,
  Lightbulb,
  X,
  Sparkles,
  Star,
  CheckCircle,
  GitBranch,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: "technical" | "behavioral" | "system-design";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  answer?: string;
  explanation?: string;
  hints?: string[];
  timeLimit?: number; // in minutes
  resources?: string[];
}

interface InterviewSession {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  startTime?: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  userAnswers: string[];
  scores: number[];
  completed: boolean;
}

interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceBreakdown: {
    category: string;
    score: number;
    maxScore: number;
  }[];
}

export function InterviewSimulator() {
  const [activeTab, setActiveTab] = useState("technical");
  const [interviewMode, setInterviewMode] = useState<
    "inactive" | "active" | "review"
  >("inactive");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewSession, setInterviewSession] =
    useState<InterviewSession | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Sample interview templates
  const interviewTemplates = [
    {
      id: "full-stack",
      title: "Full Stack Developer Interview",
      description:
        "Technical, behavioral, and system design questions for full stack positions",
      categories: ["React", "Node.js", "Database", "System Design"],
      duration: 90,
      questions: [
        {
          id: "1",
          type: "technical",
          category: "React",
          difficulty: "medium",
          question:
            "Explain the difference between controlled and uncontrolled components in React. When would you use each approach?",
          hints: [
            "Think about form handling",
            "Consider state management implications",
            "Think about accessibility",
          ],
        },
        {
          id: "2",
          type: "technical",
          category: "Node.js",
          difficulty: "medium",
          question:
            "How would you implement rate limiting in a Node.js application?",
          hints: [
            "Consider using middleware",
            "Think about storing request counts",
            "Consider memory vs persistent storage",
          ],
        },
        {
          id: "3",
          type: "behavioral",
          category: "Behavioral",
          difficulty: "medium",
          question:
            "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        },
        {
          id: "4",
          type: "system-design",
          category: "System Design",
          difficulty: "hard",
          question:
            "Design a URL shortening service like Bit.ly. Consider scalability, reliability, and performance.",
          timeLimit: 30,
        },
        {
          id: "5",
          type: "technical",
          category: "Database",
          difficulty: "hard",
          question:
            "How would you optimize a slow SQL query? What tools and techniques would you use?",
          hints: [
            "Consider indexing strategies",
            "Look at query execution plan",
            "Think about normalization vs denormalization",
          ],
        },
      ],
    },
    {
      id: "frontend",
      title: "Frontend Developer Interview",
      description: "Technical and behavioral questions for frontend positions",
      categories: ["JavaScript", "React", "CSS", "Performance"],
      duration: 60,
      questions: [
        {
          id: "1",
          type: "technical",
          category: "JavaScript",
          difficulty: "easy",
          question: "What is the difference between == and === in JavaScript?",
          hints: [
            "Think about type coercion",
            "Consider the implicit conversions",
          ],
        },
        {
          id: "2",
          type: "technical",
          category: "React",
          difficulty: "medium",
          question:
            "Explain the React reconciliation process and how the virtual DOM works.",
          hints: [
            "Consider how React compares elements",
            "Think about the fiber algorithm",
            "Understand the diffing algorithm",
          ],
        },
        {
          id: "3",
          type: "technical",
          category: "CSS",
          difficulty: "medium",
          question:
            "How would you center an element both horizontally and vertically in CSS? Provide multiple approaches.",
          hints: [
            "Flexbox approach",
            "Grid approach",
            "Absolute positioning approach",
          ],
        },
        {
          id: "4",
          type: "behavioral",
          category: "Behavioral",
          difficulty: "medium",
          question:
            "Describe a situation where you had to learn a new technology quickly. How did you approach it?",
        },
        {
          id: "5",
          type: "technical",
          category: "Performance",
          difficulty: "hard",
          question:
            "How would you optimize a React application that's rendering thousands of list items?",
          hints: [
            "Consider virtualization",
            "Think about memoization",
            "Consider pagination",
          ],
        },
      ],
    },
    {
      id: "backend",
      title: "Backend Developer Interview",
      description:
        "Technical and system design questions for backend positions",
      categories: ["API Design", "Database", "System Design", "Security"],
      duration: 75,
      questions: [
        {
          id: "1",
          type: "technical",
          category: "API Design",
          difficulty: "medium",
          question:
            "What are the key differences between REST and GraphQL? When would you choose one over the other?",
          hints: [
            "Consider flexibility",
            "Think about over-fetching and under-fetching",
            "Consider caching strategies",
          ],
        },
        {
          id: "2",
          type: "technical",
          category: "Database",
          difficulty: "hard",
          question:
            "How would you design a database schema for a social media platform with posts, comments, and likes?",
          timeLimit: 20,
        },
        {
          id: "3",
          type: "system-design",
          category: "System Design",
          difficulty: "hard",
          question:
            "Design a distributed caching system for a high-traffic application.",
          timeLimit: 25,
        },
        {
          id: "4",
          type: "technical",
          category: "Security",
          difficulty: "medium",
          question:
            "How would you implement authentication and authorization in a microservices architecture?",
          hints: [
            "Consider JWT tokens",
            "Think about centralized auth service",
            "Consider OAuth patterns",
          ],
        },
      ],
    },
  ];

  // Technical questions
  const technicalQuestions: Question[] = [
    {
      id: "t1",
      type: "technical",
      category: "JavaScript",
      difficulty: "easy",
      question:
        "What is the difference between var, let, and const in JavaScript?",
      answer:
        "var is function-scoped and can be redeclared, let is block-scoped and can be reassigned but not redeclared in the same scope, const is block-scoped and cannot be reassigned or redeclared.",
      explanation:
        "Understanding variable declarations is fundamental to JavaScript development. var has function scope and can be hoisted, while let and const have block scope and temporal dead zones.",
      hints: [
        "Consider scoping differences",
        "Think about redeclaration rules",
        "Consider hoisting behavior",
      ],
    },
    {
      id: "t2",
      type: "technical",
      category: "React",
      difficulty: "medium",
      question:
        "Explain the React lifecycle methods and their modern equivalents with hooks.",
      answer:
        "In class components, lifecycle methods include componentDidMount, componentDidUpdate, and componentWillUnmount. With hooks, useEffect replaces these methods based on its dependencies.",
      explanation:
        "Modern React development uses functional components with hooks. useEffect can replicate the behavior of componentDidMount (empty deps array), componentDidUpdate (with dependencies), and componentWillUnmount (cleanup function).",
      hints: [
        "Consider useEffect hook",
        "Think about dependency arrays",
        "Remember the cleanup function",
      ],
    },
    {
      id: "t3",
      type: "technical",
      category: "Algorithms",
      difficulty: "hard",
      question:
        "How would you implement a function to find the kth largest element in an unsorted array?",
      answer:
        "Use a min-heap of size k. Iterate through the array, adding elements to the heap. If the heap size exceeds k, remove the smallest element. The root of the heap will be the kth largest element.",
      explanation:
        "This approach has O(n log k) time complexity and O(k) space complexity, which is more efficient than sorting the entire array (O(n log n)).",
      hints: [
        "Consider using a heap data structure",
        "Think about maintaining only k elements",
        "Remember to use a min-heap for kth largest",
      ],
    },
  ];

  // Behavioral questions
  const behavioralQuestions: Question[] = [
    {
      id: "b1",
      type: "behavioral",
      category: "Leadership",
      difficulty: "medium",
      question:
        "Tell me about a time when you had to lead a team through a difficult technical challenge.",
      explanation:
        "This question assesses leadership skills, problem-solving abilities, and communication skills under pressure.",
      hints: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Focus on your specific actions and contributions",
        "Quantify the results when possible",
      ],
    },
    {
      id: "b2",
      type: "behavioral",
      category: "Conflict Resolution",
      difficulty: "medium",
      question:
        "Describe a situation where you disagreed with a team member on a technical decision. How did you handle it?",
      explanation:
        "This evaluates collaboration, communication, and conflict resolution skills in a professional setting.",
      hints: [
        "Emphasize listening and understanding perspectives",
        "Focus on the process rather than who was right",
        "Highlight the positive outcome",
      ],
    },
    {
      id: "b3",
      type: "behavioral",
      category: "Adaptability",
      difficulty: "easy",
      question:
        "Give an example of how you handled a major change in project requirements.",
      explanation:
        "Tests adaptability and resilience in changing environments.",
      hints: [
        "Show how you remained calm under pressure",
        "Highlight your problem-solving approach",
        "Focus on positive outcomes despite challenges",
      ],
    },
  ];

  // System design questions
  const systemDesignQuestions: Question[] = [
    {
      id: "s1",
      type: "system-design",
      category: "Scalability",
      difficulty: "hard",
      question:
        "Design a system like Instagram that handles millions of users uploading photos daily.",
      explanation:
        "This tests understanding of scalable architecture, storage solutions, caching, and content delivery networks.",
      hints: [
        "Consider image storage and optimization",
        "Think about feed generation and distribution",
        "Address scalability and performance concerns",
      ],
      timeLimit: 30,
      resources: [
        "https://www.freecodecamp.org/news/system-design-for-interviews/",
        "https://github.com/donnemartin/system-design-primer",
      ],
    },
    {
      id: "s2",
      type: "system-design",
      category: "Distributed Systems",
      difficulty: "hard",
      question: "How would you design a distributed task queue system?",
      explanation:
        "This assesses knowledge of distributed systems, fault tolerance, and message passing.",
      hints: [
        "Consider job prioritization",
        "Think about failure handling and retries",
        "Address load balancing across workers",
      ],
      timeLimit: 25,
      resources: [
        "https://www.rabbitmq.com/tutorials/tutorial-one-python.html",
        "https://redis.io/topics/pubsub",
      ],
    },
  ];

  // Start an interview session
  const startInterview = (template: (typeof interviewTemplates)[0]) => {
    const session: InterviewSession = {
      id: crypto.randomUUID(),
      title: template.title,
      description: template.description,
      questions: template.questions as Question[],
      currentQuestionIndex: 0,
      userAnswers: [],
      scores: [],
      completed: false,
    };

    setInterviewSession(session);
    setCurrentQuestion(template.questions[0] as Question);
    setUserAnswer("");
    setInterviewMode("active");
    setTimeRemaining(
      template.questions[0].timeLimit
        ? template.questions[0].timeLimit * 60
        : 300
    ); // default to 5 min if no time limit
  };

  // Move to next question
  const nextQuestion = () => {
    if (!interviewSession) return;

    const nextIndex = interviewSession.currentQuestionIndex + 1;
    if (nextIndex < interviewSession.questions.length) {
      const updatedSession = {
        ...interviewSession,
        currentQuestionIndex: nextIndex,
        userAnswers: [...interviewSession.userAnswers, userAnswer],
      };

      setInterviewSession(updatedSession);
      setCurrentQuestion(interviewSession.questions[nextIndex]);
      setUserAnswer("");
      setTimeRemaining(
        interviewSession.questions[nextIndex].timeLimit
          ? interviewSession.questions[nextIndex].timeLimit * 60
          : 300
      );
    } else {
      finishInterview();
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (!interviewSession || interviewSession.currentQuestionIndex === 0)
      return;

    const prevIndex = interviewSession.currentQuestionIndex - 1;
    const updatedSession = {
      ...interviewSession,
      currentQuestionIndex: prevIndex,
    };

    setInterviewSession(updatedSession);
    setCurrentQuestion(interviewSession.questions[prevIndex]);
    setUserAnswer(interviewSession.userAnswers[prevIndex] || "");
    setTimeRemaining(
      interviewSession.questions[prevIndex].timeLimit
        ? interviewSession.questions[prevIndex].timeLimit * 60
        : 300
    );
  };

  // Finish interview and generate feedback
  const finishInterview = () => {
    if (!interviewSession) return;

    // Add the last answer
    const updatedSession = {
      ...interviewSession,
      userAnswers: [...interviewSession.userAnswers, userAnswer],
      completed: true,
      endTime: new Date(),
    };

    setInterviewSession(updatedSession);
    setInterviewMode("review");

    // Generate mock feedback
    const mockFeedback: InterviewFeedback = {
      overallScore: 78,
      strengths: [
        "Strong understanding of React fundamentals",
        "Good communication skills",
        "Clear problem-solving approach",
      ],
      weaknesses: [
        "Could improve on system design scalability patterns",
        "More practice needed with advanced algorithms",
      ],
      recommendations: [
        "Review scalability patterns like load balancing and caching",
        "Practice more system design problems focusing on trade-offs",
        "Study database optimization techniques",
      ],
      performanceBreakdown: [
        { category: "React", score: 85, maxScore: 100 },
        { category: "JavaScript", score: 75, maxScore: 100 },
        { category: "System Design", score: 65, maxScore: 100 },
        { category: "Algorithms", score: 70, maxScore: 100 },
      ],
    };

    setFeedback(mockFeedback);
  };

  // Reset interview
  const resetInterview = () => {
    setInterviewSession(null);
    setCurrentQuestion(null);
    setUserAnswer("");
    setInterviewMode("inactive");
    setFeedback(null);
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  // Toggle audio
  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interviewMode === "active" && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (interviewMode === "active" && timeRemaining === 0) {
      // Time's up - automatically move to next question
      nextQuestion();
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewMode, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Simulator
        </h1>
        <p className="text-muted-foreground mt-2">
          Practice technical, behavioral, and system design interviews with
          realistic simulations and personalized feedback
        </p>
      </div>

      {interviewMode === "inactive" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Behavioral
            </TabsTrigger>
            <TabsTrigger
              value="system-design"
              className="flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              System Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-6">
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Technical Interview Questions</span>
                </CardTitle>
                <CardDescription>
                  Practice coding and technical questions commonly asked in
                  interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicalQuestions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{question.question}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Try
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-6">
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Behavioral Interview Questions</span>
                </CardTitle>
                <CardDescription>
                  Prepare for behavioral questions with the STAR method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behavioralQuestions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{question.question}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Practice
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system-design" className="space-y-6">
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <span>System Design Interview Questions</span>
                </CardTitle>
                <CardDescription>
                  Practice designing scalable and robust systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemDesignQuestions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{question.question}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                          {question.timeLimit && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Time limit: {question.timeLimit} minutes
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Design
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : interviewMode === "active" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>
                      {interviewSession?.title || "Interview Session"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Question {(interviewSession?.currentQuestionIndex ?? 0) + 1}{" "}
                    of {interviewSession?.questions.length}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-mono">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>

                  <Badge variant="outline">{currentQuestion?.difficulty}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium">Question</span>
                  </div>
                  <h3 className="text-lg font-medium">
                    {currentQuestion?.question}
                  </h3>

                  {currentQuestion?.hints &&
                    currentQuestion.hints.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Hints</span>
                        </div>
                        <div className="space-y-2">
                          {currentQuestion.hints.map((hint, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                              <p>{hint}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">Your Answer</span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Provide your answer
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleAudio}
                        >
                          {isAudioOn ? (
                            <Mic className="h-4 w-4" />
                          ) : (
                            <MicOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleVideo}
                        >
                          {isVideoOn ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <VideoOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleRecording}
                        >
                          {isRecording ? (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span>Stop</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                              <span>Record</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>

                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[200px] p-4 font-mono text-sm resize-none focus:outline-hidden bg-background/50"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={interviewSession?.currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUserAnswer("");
                        if (
                          currentQuestion?.hints &&
                          currentQuestion.hints.length > 0
                        ) {
                          // Show first hint if available
                          toast.success("Hint revealed", {
                            description: currentQuestion.hints[0],
                          });
                        }
                      }}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Hint
                    </Button>

                    <Button onClick={nextQuestion} className="gap-2">
                      {interviewSession?.currentQuestionIndex ===
                      (interviewSession?.questions.length ?? 0) - 1 ? (
                        <>
                          <Trophy className="h-4 w-4" />
                          Finish Interview
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          Next Question
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Progress
                    value={
                      ((interviewSession?.currentQuestionIndex ?? 0) * 100) /
                      (interviewSession?.questions.length ?? 1)
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {(interviewSession?.currentQuestionIndex ?? 0) + 1} of{" "}
                    {interviewSession?.questions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Interview Results</span>
                </div>

                <Badge variant="outline">
                  Score: {feedback?.overallScore}/100
                </Badge>
              </CardTitle>
              <CardDescription>
                Review your performance and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mb-4">
                    <Trophy className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Interview Complete!</h2>
                  <p className="text-muted-foreground mt-2">
                    Your overall score:{" "}
                    <span className="font-bold text-primary">
                      {feedback?.overallScore}/100
                    </span>
                  </p>
                </div>

                {feedback && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Strengths
                      </h3>
                      <div className="space-y-3">
                        {feedback.strengths.map((strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>

                      <h3 className="font-medium flex items-center gap-2 mt-6">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Areas for Improvement
                      </h3>
                      <div className="space-y-3">
                        {feedback.weaknesses.map((weakness, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                          >
                            <X className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Performance Breakdown
                      </h3>
                      <div className="space-y-4">
                        {feedback.performanceBreakdown.map(
                          (category, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {category.category}
                                </span>
                                <span>
                                  {category.score}/{category.maxScore}
                                </span>
                              </div>
                              <Progress
                                value={category.score}
                                max={category.maxScore}
                                className="h-2"
                              />
                            </div>
                          )
                        )}
                      </div>

                      <h3 className="font-medium flex items-center gap-2 mt-6">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Recommendations
                      </h3>
                      <div className="space-y-3">
                        {feedback.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                          >
                            <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetInterview}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start New
                  </Button>
                  <Button className="gap-2">
                    <FileText className="h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Interview Templates</span>
              </CardTitle>
              <CardDescription>
                Choose from pre-built interview templates for different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {interviewTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -5 }}
                    className={cn(
                      "border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer",
                      selectedTemplate === template.id &&
                        "ring-2 ring-primary/50 border-primary/30"
                    )}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">{template.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.categories.map((cat, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{template.duration} min</span>
                      </div>
                      <Button
                        onClick={() => startInterview(template)}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
