export interface TestCase {
  id: string;
  /** The arguments of the call, as JavaScript source: `[2,7,11,15], 9` */
  input: string;
  /** The expected result, as JavaScript source: `[0,1]` */
  expectedOutput: string;
  /** Hidden tests only show whether they passed: their input and expected value stay secret */
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
  /** `tree`: the first argument is described by a level-order array and handed over as a tree */
  adapter?: "tree";
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  /** What the function returned (or the error it threw) */
  actual: string;
  error?: string;
  executionTime: number;
}

/** The outcome of running a solution against (some of) the tests of a challenge */
export interface SubmissionResult {
  /** Every test that was run passed (and there was at least one) */
  passed: boolean;
  /** The code could not be loaded: syntax error, function missing... */
  compileError?: string;
  timedOut: boolean;
  /** What the code logged, one line per entry */
  logs: string[];
  /** Total time spent in the tests, in milliseconds */
  executionTime: number;
  testCasesPassed: number;
  totalTestCases: number;
  detailedResults: TestCaseResult[];
}
