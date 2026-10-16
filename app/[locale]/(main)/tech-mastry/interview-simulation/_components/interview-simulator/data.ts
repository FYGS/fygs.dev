import type { InterviewFeedback, Question } from "./types";

// Sample interview templates
export const interviewTemplates = [
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

export type InterviewTemplate = (typeof interviewTemplates)[0];

// Technical questions
export const technicalQuestions: Question[] = [
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
export const behavioralQuestions: Question[] = [
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
export const systemDesignQuestions: Question[] = [
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

// Generate mock feedback
export const generateMockFeedback = (): InterviewFeedback => ({
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
});
