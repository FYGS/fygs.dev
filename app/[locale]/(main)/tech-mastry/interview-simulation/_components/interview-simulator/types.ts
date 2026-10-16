export interface Question {
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

export interface InterviewSession {
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

export interface InterviewFeedback {
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
