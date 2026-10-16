export interface PerformanceMetrics {
  accuracy: number;
  efficiency: number;
  timeTaken: number; // in minutes
  attempts: number;
  rating: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Hint {
  id: string;
  content: string;
  revealCost: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  estimatedTime: number;
  tags: string[];
  testCases: TestCase[];
  starterCode: string;
  solution: string;
  hints: Hint[];
  explanation: string;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  executionTime: number;
}

export interface SubmissionResult {
  passed: boolean;
  output: string;
  executionTime: number;
  memoryUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  detailedResults: TestCaseResult[];
}
