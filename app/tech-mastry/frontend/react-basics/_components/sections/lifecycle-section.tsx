"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions-new";

// Simple demo component for lifecycle
function LifecycleDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-medium mb-2 text-center">Counter: {count}</h3>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
        >
          Increment
        </button>
      </div>
    </div>
  );
}

export function LifecycleSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Component Lifecycle</CardTitle>
          <CardDescription>
            The lifecycle of a React component includes mounting, updating, and
            unmounting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            In functional components, the lifecycle is primarily managed with
            the useEffect Hook, which replaces the lifecycle methods of class
            components.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Mounting</Badge>
            <Badge>Updating</Badge>
            <Badge>Unmounting</Badge>
            <Badge>useEffect</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="Lifecycle with useEffect"
        description="How to manage different lifecycle phases with useEffect"
        code={`import React, { useState, useEffect } from 'react';

function LifecycleComponent() {
  const [count, setCount] = useState(0);

  // 1. Similar to componentDidMount (runs once after first render)
  useEffect(() => {
    console.log('Component mounted');

    // Similar to componentWillUnmount (cleanup on unmount)
    return () => {
      console.log('Component unmounted');
    };
  }, []); // Empty dependency array = run once

  // 2. Similar to componentDidUpdate (runs after each count update)
  useEffect(() => {
    if (count > 0) { // Avoid running on first render
      console.log(\`Counter updated: \${count}\`);

      // Cleanup before next execution of this effect
      return () => {
        console.log(\`Cleanup before update. Old value: \${count}\`);
      };
    }
  }, [count]); // Only runs when count changes

  // 3. Runs after every render (no dependency array)
  useEffect(() => {
    console.log('Component rendered or updated');
  });

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Usage with conditional mounting/unmounting
function App() {
  const [showComponent, setShowComponent] = useState(true);

  return (
    <div>
      <button onClick={() => setShowComponent(!showComponent)}>
        {showComponent ? 'Hide' : 'Show'}
      </button>

      {showComponent && <LifecycleComponent />}
    </div>
  );
}`}
        demo={<LifecycleDemo />}
        explanation={
          <div>
            <p>
              In functional components, the <code>useEffect</code> Hook is used
              to handle side effects that were traditionally managed by
              lifecycle methods in class components.
            </p>
            <p className="mt-3">
              <code>useEffect</code> can be used to simulate the three main
              lifecycle phases:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Mounting (componentDidMount)</strong>: Use{" "}
                <code>useEffect</code> with an empty dependency array{" "}
                <code>[]</code> to run code once after the first render.
              </li>
              <li>
                <strong>Updating (componentDidUpdate)</strong>: Use{" "}
                <code>useEffect</code> with a dependency array containing values
                to watch for running code when those values change.
              </li>
              <li>
                <strong>Unmounting (componentWillUnmount)</strong>: Return a
                cleanup function from <code>useEffect</code> to run code when
                the component is unmounted or before the effect is re-run.
              </li>
            </ol>
            <p className="mt-3">
              The example above shows how to use <code>useEffect</code> to
              handle these different lifecycle phases.
            </p>
          </div>
        }
        tips={[
          "Use multiple effects to separate concerns rather than a single effect that does everything",
          "Don't forget to clean up resources (subscriptions, timers, etc.) in the return function of useEffect",
          "Include all values used in the effect in the dependency array",
          "Use conditions inside the effect to avoid execution on the first render if needed",
        ]}
        interviewQuestions={[
          {
            question:
              "How do you simulate componentDidMount, componentDidUpdate, and componentWillUnmount with useEffect?",
            answer:
              "For componentDidMount: useEffect(() => { /* code */ }, []). For componentDidUpdate for a specific variable: useEffect(() => { if (count > 0) { /* code */ } }, [count]). For componentWillUnmount: useEffect(() => { return () => { /* cleanup code */ }; }, []). To combine componentDidMount and componentWillUnmount: useEffect(() => { /* mount code */ return () => { /* unmount code */ }; }, []).",
          },
          {
            question:
              "Why is it important to specify the dependency array correctly in useEffect?",
            answer:
              "The dependency array determines when the effect will re-run. If you omit a dependency, the effect might use stale values, causing subtle bugs. If you include too many dependencies, the effect might run too often, causing performance issues. An empty array ([]) means the effect only runs once at mount, while no array means it runs after every render. The ESLint tool with the react-hooks plugin can help you detect missing dependencies.",
          },
        ]}
      />

      <CodeExample
        title="Comparison: Class vs Hooks"
        description="Comparing lifecycle methods of class components with Hooks"
        code={`// Class component with lifecycle methods
class ClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('Constructor');
  }

  componentDidMount() {
    console.log('Component mounted');
    document.title = \`Counter: \${this.state.count}\`;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.count !== this.state.count) {
      console.log(\`Counter updated: \${this.state.count}\`);
      document.title = \`Counter: \${this.state.count}\`;
    }
  }

  componentWillUnmount() {
    console.log('Component unmounted');
    document.title = 'React App';
  }

  render() {
    console.log('Render');
    return (
      <div>
        <p>Counter: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

// Equivalent with Hooks
function HooksComponent() {
  const [count, setCount] = useState(0);
  console.log('Render (function body)');

  // Combines componentDidMount and componentDidUpdate
  useEffect(() => {
    document.title = \`Counter: \${count}\`;
    console.log(\`Title updated: Counter: \${count}\`);

    // Equivalent to componentWillUnmount
    return () => {
      console.log('Cleanup of effect');
      if (count === 0) {
        document.title = 'React App';
      }
    };
  }, [count]); // Runs on mount and when count changes

  // Equivalent to componentDidMount only
  useEffect(() => {
    console.log('Component mounted');

    // Equivalent to componentWillUnmount only
    return () => {
      console.log('Component unmounted');
      document.title = 'React App';
    };
  }, []); // Runs only on mount

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              React has evolved from a class-based model with specific lifecycle
              methods to a Hooks-based model in functional components. This
              evolution offers a more flexible and composable approach to
              managing component lifecycle.
            </p>
            <p className="mt-3">
              Here&apos;s how class component lifecycle methods translate to
              Hooks:
            </p>
            <table className="w-full mt-2 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 text-left border">Class Method</th>
                  <th className="p-2 text-left border">Hooks Equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">
                    <code>constructor</code>
                  </td>
                  <td className="p-2 border">
                    <code>useState</code>, <code>useRef</code> (initialization)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>componentDidMount</code>
                  </td>
                  <td className="p-2 border">
                    <code>{"useEffect(() => {}, [])"}</code>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>componentDidUpdate</code>
                  </td>
                  <td className="p-2 border">
                    <code>{"useEffect(() => {}, [dep1, dep2])"}</code>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>componentWillUnmount</code>
                  </td>
                  <td className="p-2 border">
                    <code>{"useEffect(() => { return () => {}; }, [])"}</code>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>shouldComponentUpdate</code>
                  </td>
                  <td className="p-2 border">
                    <code>React.memo</code>, <code>useMemo</code>,{" "}
                    <code>useCallback</code>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>getDerivedStateFromProps</code>
                  </td>
                  <td className="p-2 border">State update during render</td>
                </tr>
                <tr>
                  <td className="p-2 border">
                    <code>getSnapshotBeforeUpdate</code>
                  </td>
                  <td className="p-2 border">No direct equivalent (rare)</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3">
              Hooks offer several advantages over class lifecycle methods:
            </p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Better reuse of logic between components</li>
              <li>Grouping code by concern rather than by lifecycle method</li>
              <li>
                Avoids issues with <code>this</code> in JavaScript
              </li>
              <li>Allows better optimization by compilers</li>
            </ul>
          </div>
        }
        tips={[
          "Prefer functional components with Hooks for new development",
          "Group related logic in the same useEffect rather than spreading it across different lifecycle methods",
          "Use multiple effects to separate unrelated concerns",
          "Think in terms of 'synchronization' with external effects rather than 'lifecycle'",
        ]}
        interviewQuestions={[
          {
            question:
              "What are the advantages of Hooks over class component lifecycle methods?",
            answer:
              "Hooks offer several advantages: 1) Better reuse of logic via custom Hooks, avoiding issues with HOCs and render props. 2) Grouping code by feature rather than by lifecycle method, which improves readability and maintainability. 3) Reduced bundle size through better minification and tree-shaking. 4) Avoids issues with 'this' in JavaScript. 5) Allows compilers to more efficiently optimize code. 6) More consistent and less error-prone API.",
          },
          {
            question: "How do you handle asynchronous effects in useEffect?",
            answer:
              "To handle asynchronous effects in useEffect: 1) Declare an async function inside the effect and call it immediately (useEffect itself cannot be directly async). 2) Make sure to properly handle cancellations to avoid updates on unmounted components. 3) Use a cancellation flag or AbortController for fetch requests. 4) Clean up pending promises in the cleanup function. Example: useEffect(() => { let isMounted = true; const fetchData = async () => { const data = await api.get(); if (isMounted) setState(data); }; fetchData(); return () => { isMounted = false; }; }, []);",
          },
        ]}
      />

      <InterviewQuestions
        title="Interview Questions on Component Lifecycle"
        questions={[
          {
            question:
              "Explain React's rendering cycle and how it interacts with component lifecycle.",
            answer:
              "React's rendering cycle includes several phases: 1) Render: React calls the component's render function and calculates changes in the virtual DOM. 2) Commit: React applies these changes to the real DOM. After commit, React calls effects (useEffect). For functional components, the function body runs on each render, then effects run after the DOM has been updated, in the order they are defined. Effect cleanup functions run before the component is unmounted or before the effect is re-run if dependencies change.",
            difficulty: "medium",
            tags: ["Fundamentals", "Rendering"],
          },
          {
            question: "How do you avoid infinite loops with useEffect?",
            answer:
              "To avoid infinite loops with useEffect: 1) Make sure to specify the dependency array correctly. 2) Don't update state used in dependencies without a condition inside the effect. 3) Use conditions to avoid unnecessary updates. 4) For objects and functions, use useMemo and useCallback to stabilize references. 5) Use refs to store values that shouldn't trigger re-renders. 6) Use tools like eslint-plugin-react-hooks to detect missing or problematic dependencies.",
            difficulty: "medium",
            tags: ["Debugging", "Best Practices"],
          },
          {
            question:
              "How do you implement an effect that runs only once after the first render, even if props or state change?",
            answer:
              "To run an effect only once after the first render, use useEffect with an empty dependency array: useEffect(() => { /* code that runs only once */ }, []). This tells React that this effect doesn't depend on any values from the component and should therefore only run after the initial mount. If you need to access current props or state in this effect, you can use a ref to store these values without triggering a re-execution of the effect.",
            difficulty: "easy",
            tags: ["useEffect", "Optimization"],
          },
          {
            question:
              "How do you handle cleanup effects in useEffect and why are they important?",
            answer:
              "Cleanup effects are important to prevent memory leaks and unexpected behaviors. To implement cleanup, return a function from useEffect: useEffect(() => { const subscription = source.subscribe(); return () => { subscription.unsubscribe(); }; }, [source]). This cleanup function runs: 1) Before the component is unmounted. 2) Before the effect is re-run if dependencies change. Common cases requiring cleanup include: canceling subscriptions, canceling network requests, clearing timers (clearTimeout, clearInterval), and removing event listeners.",
            difficulty: "medium",
            tags: ["useEffect", "Memory"],
          },
        ]}
      />
    </div>
  );
}
