import type {
  Challenge,
  PerformanceMetrics,
  SubmissionResult,
  TestCase,
} from "./types";

// Mock result - in a real implementation this would run the code and compare outputs
export const createMockSubmissionResult = (
  selectedChallenge: Challenge
): SubmissionResult => ({
  passed: Math.random() > 0.3, // 70% chance of passing for demo
  output: "Execution completed successfully",
  executionTime: Math.floor(Math.random() * 500) + 50, // 50-550 ms
  memoryUsed: parseFloat((Math.random() * 10 + 5).toFixed(2)), // 5-15 MB
  testCasesPassed:
    Math.floor(Math.random() * selectedChallenge.testCases.length) + 1,
  totalTestCases: selectedChallenge.testCases.length,
  detailedResults: selectedChallenge.testCases.map((testCase: TestCase) => ({
    testCaseId: testCase.id,
    passed: Math.random() > 0.4, // 60% chance of passing each test case
    input: testCase.input,
    expected: testCase.expectedOutput,
    actual:
      Math.random() > 0.4 ? testCase.expectedOutput : "different output",
    executionTime: Math.floor(Math.random() * 100) + 10, // 10-110 ms per test
  })),
});

// Calculate performance metrics
export const computePerformanceMetrics = (
  mockResult: SubmissionResult,
  selectedChallenge: Challenge
): PerformanceMetrics => {
  const accuracy = Math.round(
    (mockResult.testCasesPassed / mockResult.totalTestCases) * 100,
  );
  const efficiency = Math.max(0, 100 - mockResult.executionTime / 10); // Lower execution time = higher efficiency

  return {
    accuracy,
    efficiency,
    timeTaken:
      selectedChallenge.estimatedTime - Math.floor(Math.random() * 5), // Time taken compared to estimate
    attempts: 1,
    rating: Math.floor((accuracy + efficiency) / 2),
  };
};

// Mock result for a single test case
export const createMockTestCaseResult = (
  testCase: TestCase,
  testCaseId: string
): SubmissionResult => ({
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
});
