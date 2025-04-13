import { z } from "zod";

// Define the types for AI code analysis
export const CodeAnalysisSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum([
        "optimization",
        "bug",
        "security",
        "style",
        "performance",
        "logic",
      ]),
      description: z.string(),
      lineNumber: z.number().optional(),
      severity: z.enum(["info", "warning", "critical"]),
      code: z.string().optional(),
    })
  ),
  explanation: z.string(),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
    score: z.number().min(1).max(10),
  }),
  summary: z.string(),
});

export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;

export const CodeHintSchema = z.object({
  hint: z.string(),
  code: z.string().optional(),
  explanation: z.string(),
});

export type CodeHint = z.infer<typeof CodeHintSchema>;

export type RequestType =
  | "analyze"
  | "explain"
  | "optimize"
  | "debug"
  | "hint"
  | "chat";

export interface AICodeAssistRequest {
  code: string;
  language: string;
  query?: string;
  challengeId?: string;
  context?: string;
  requestType: RequestType;
}

// These utility functions are used by the server action in ai-code-actions.ts

// Simulated code analysis
export function generateCodeAnalysis(
  code: string,
  language: string
): CodeAnalysis {
  // This would be replaced with actual AI analysis
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
}

// Simulated code explanation
export function generateCodeExplanation(
  code: string,
  language: string,
  query?: string
): Record<string, unknown> {
  const lines = code.split("\n");
  const lineByLine = lines
    .map((line, index) => {
      if (!line.trim()) return null;
      return {
        line: index + 1,
        code: line,
        explanation: `Line ${index + 1}: ${getLineExplanation(line, language)}`,
      };
    })
    .filter(Boolean);

  return {
    overview: `This ${language} code ${
      code.includes("function") ? "defines a function that " : ""
    }${code.includes("class") ? "implements a class that " : ""}${
      code.includes("for") || code.includes("while")
        ? "uses loops for iteration"
        : ""
    }${code.includes("if") ? " with conditional logic" : ""}.`,
    lineByLine,
    concepts: extractConcepts(code, language),
    query: query
      ? {
          question: query,
          answer: `Based on your question about "${query}", ${generateQueryResponse(
            query,
            code,
            language
          )}`,
        }
      : null,
  };
}

// Simulated optimization suggestions
export function generateOptimizationSuggestions(
  code: string,
  language: string
): Record<string, unknown> {
  return {
    suggestions: [
      {
        title: "Use memoization for expensive calculations",
        description:
          "If your function performs expensive calculations with the same inputs multiple times, consider using memoization to cache results.",
        code: "const memo = {};\nfunction memoizedFn(n) {\n  if (n in memo) return memo[n];\n  // Your calculation\n  memo[n] = result;\n  return result;\n}",
        complexity: {
          before: "O(2^n)",
          after: "O(n)",
        },
      },
      {
        title: "Replace nested loops with more efficient algorithms",
        description:
          "Nested loops often indicate O(n²) complexity. Consider if there's a more efficient algorithm or data structure.",
        code: "// Instead of:\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    // O(n²) operation\n  }\n}\n\n// Consider using a Map or Set for O(n) complexity",
        complexity: {
          before: "O(n²)",
          after: "O(n)",
        },
      },
      {
        title: "Use appropriate data structures",
        description:
          "Choose the right data structure for your operations. For example, use Sets for unique values or Maps for key-value lookups.",
        code: "// Instead of array search (O(n)):\nconst set = new Set(array);\nif (set.has(value)) { /* O(1) operation */ }",
        complexity: {
          before: "O(n)",
          after: "O(1)",
        },
      },
    ],
    optimizedCode: generateOptimizedVersion(code, language),
    explanation:
      "The optimized version improves performance by reducing unnecessary operations and using more efficient data structures.",
  };
}

// Simulated debug suggestions
export function generateDebugSuggestions(
  _code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): Record<string, unknown> {
  // In a real implementation, this would analyze the actual code
  // For now, we'll return static suggestions
  const potentialIssues = [
    {
      type: "off-by-one",
      lineNumber: 5,
      description:
        "Check your loop bounds. Off-by-one errors are common in loops.",
      fix: "Ensure your loop condition uses the correct comparison (< vs <=).",
    },
    {
      type: "null-reference",
      lineNumber: 8,
      description:
        "Potential null reference when accessing object properties or array elements.",
      fix: "Add null checks before accessing properties: `if (obj && obj.property)`",
    },
    {
      type: "infinite-loop",
      lineNumber: 12,
      description: "Check for potential infinite loops.",
      fix: "Ensure your loop has a proper exit condition and the counter is updated correctly.",
    },
  ];

  return {
    issues: potentialIssues,
    suggestions: [
      "Add console.log statements to track variable values",
      "Use a debugger to step through your code",
      "Check for edge cases in your input data",
    ],
    fixedCode: _code, // In a real implementation, this would attempt to fix issues
  };
}

// Simulated hint generation for coding challenges
export function generateHint(
  challengeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _code: string
): CodeHint {
  // In a real implementation, this would be based on the specific challenge
  // and the user's current code
  const hints: Record<string, CodeHint> = {
    "1": {
      hint: "Try using a hash map (object) to store each number and its index as you iterate through the array.",
      code: "function twoSum(nums, target) {\n  const seen = {};\n  \n  for (let i = 0; i < nums.length; i++) {\n    // Your logic here\n  }\n}",
      explanation:
        "By storing each number in a hash map, you can check if the complement (target - current number) exists in constant time.",
    },
    "2": {
      hint: "Use a stack data structure to keep track of opening brackets and pop them when you encounter closing brackets.",
      code: "function isValid(s) {\n  const stack = [];\n  \n  for (let char of s) {\n    // Your logic here\n  }\n  \n  return stack.length === 0;\n}",
      explanation:
        "A stack is perfect for this problem because brackets follow a last-in-first-out pattern.",
    },
  };

  return (
    hints[challengeId] || {
      hint: "Break down the problem into smaller steps. What's the core operation you need to perform?",
      explanation:
        "Sometimes the best approach is to start with a simple solution and then optimize.",
    }
  );
}

// Simulated chat response
export function generateChatResponse(
  _code: string,
  language: string,
  query: string
): Record<string, unknown> {
  const responses: Record<string, string> = {
    help: `I would be happy to help with your ${language} code! What specific aspect are you struggling with?`,
    optimize: `Looking at your ${language} code, here are some optimization suggestions:\n\n1. Consider using more efficient data structures\n2. Reduce unnecessary computations\n3. Use built-in methods where applicable`,
    explain: `Your ${language} code appears to define functions and process data. What specific part would you like me to explain?`,
    debug: `Let us debug your ${language} code. I notice a few potential issues:\n\n1. Check for off-by-one errors in loops\n2. Ensure all variables are properly initialized\n3. Verify your logic handles edge cases`,
  };

  const lowerQuery = query.toLowerCase();

  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery.includes(key)) {
      return { response };
    }
  }

  return {
    response: `I have analyzed your ${language} code. It appears to be a typical implementation. Could you clarify what you would like to know about it?`,
  };
}

// Helper functions
function getLineExplanation(
  line: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): string {
  if (line.includes("function")) return "Defines a function";
  if (line.includes("class")) return "Declares a class";
  if (line.includes("for")) return "Starts a for loop for iteration";
  if (line.includes("while")) return "Starts a while loop for iteration";
  if (line.includes("if"))
    return "Conditional statement that checks a condition";
  if (line.includes("return")) return "Returns a value from the function";
  if (line.includes("const") || line.includes("let") || line.includes("var"))
    return "Declares a variable";
  if (line.includes("import"))
    return "Imports functionality from another module";
  if (line.includes("export"))
    return "Exports functionality for use in other modules";
  if (line.includes("try"))
    return "Starts a try-catch block for error handling";
  if (line.includes("catch")) return "Catches errors thrown in the try block";
  if (line.includes("async")) return "Declares an asynchronous function";
  if (line.includes("await")) return "Waits for a promise to resolve";
  return "General code statement";
}

function extractConcepts(
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): string[] {
  const concepts: string[] = [];

  if (code.includes("for") || code.includes("while"))
    concepts.push("Loops and Iteration");
  if (
    code.includes("function") &&
    code.includes("return") &&
    code.includes(code.match(/function\s+(\w+)/)?.[1] || "")
  )
    concepts.push("Recursion");
  if (code.includes("try") && code.includes("catch"))
    concepts.push("Error Handling");
  if (code.includes("class")) concepts.push("Object-Oriented Programming");
  if (
    code.includes("async") ||
    code.includes("await") ||
    code.includes("Promise")
  )
    concepts.push("Asynchronous Programming");
  if (code.includes("Map") || code.includes("Set") || code.includes("WeakMap"))
    concepts.push("Advanced Data Structures");
  if (
    code.includes("reduce") ||
    code.includes("map") ||
    code.includes("filter")
  )
    concepts.push("Functional Programming");
  if (code.includes("=>")) concepts.push("Arrow Functions");
  if (code.includes("[...") || code.includes("{..."))
    concepts.push("Spread Syntax");
  if (code.includes("const {") || code.includes("const ["))
    concepts.push("Destructuring");

  return concepts.length > 0 ? concepts : ["Basic Programming Concepts"];
}

function generateQueryResponse(
  query: string,
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): string {
  if (query.includes("time complexity")) {
    return `The time complexity of this code is approximately ${
      code.includes("for") && code.includes("for", code.indexOf("for") + 1)
        ? "O(n²)"
        : code.includes("for") || code.includes("while")
        ? "O(n)"
        : "O(1)"
    } because ${
      code.includes("for") && code.includes("for", code.indexOf("for") + 1)
        ? "it uses nested loops"
        : code.includes("for") || code.includes("while")
        ? "it iterates through the data once"
        : "it performs a constant number of operations"
    }.`;
  }

  if (query.includes("space complexity")) {
    return `The space complexity is approximately ${
      code.includes("new Array") || code.includes("[]") ? "O(n)" : "O(1)"
    } because ${
      code.includes("new Array") || code.includes("[]")
        ? "it creates data structures proportional to the input size"
        : "it uses a constant amount of extra space"
    }.`;
  }

  if (query.includes("recursive")) {
    return code.includes("function") &&
      code.includes("return") &&
      code.includes(code.match(/function\s+(\w+)/)?.[1] || "")
      ? "Yes, this code uses recursion. The function calls itself as part of its execution."
      : "No, this code doesn't use recursion. It uses an iterative approach instead.";
  }

  return `I'd need more specific information about what aspect of the code you're asking about.`;
}

function generateOptimizedVersion(
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): string {
  // In a real implementation, this would use AI to generate optimized code
  // For now, we'll just add some comments to simulate optimization
  const lines = code.split("\n");
  const optimizedLines = lines.map((line) => {
    if (line.includes("for")) {
      return (
        line +
        " // Optimized: Consider using array methods for better performance"
      );
    }
    if (line.includes("indexOf") || line.includes("includes")) {
      return line + " // Optimized: Consider using Set or Map for O(1) lookups";
    }
    return line;
  });

  return optimizedLines.join("\n");
}
