"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";
import { ReactMemoDemo } from "./memoization-section/react-memo-demo";
import { UseCallbackDemo } from "./memoization-section/use-callback-demo";
import { UseMemoDemo } from "./memoization-section/use-memo-demo";

export function MemoizationSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Memoization in React</CardTitle>
          <CardDescription>
            Techniques for preventing unnecessary re-renders and optimizing
            performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Memoization is a performance optimization technique that caches the
            results of expensive function calls and returns the cached result
            when the same inputs occur again.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>React.memo</Badge>
            <Badge>useMemo</Badge>
            <Badge>useCallback</Badge>
            <Badge>Performance</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="React.memo for Component Memoization"
        description="Prevent unnecessary re-renders of components when props don't change"
        code={`import React, { useState } from 'react';

// Regular component that will re-render on every parent render
function RegularComponent({ label }) {
  console.log(\`RegularComponent rendered: \${label}\`);
  return (
    <div className="component">
      <p>{label}</p>
    </div>
  );
}

// Memoized component that will only re-render when its props change
const MemoizedComponent = React.memo(function MemoizedComponent({ label }) {
  console.log(\`MemoizedComponent rendered: \${label}\`);
  return (
    <div className="component">
      <p>{label}</p>
    </div>
  );
});

// Parent component that renders both components
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("Hello World");

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment Count: {count}
      </button>
      <button onClick={() => setText(text === "Hello World" ? "Hello React" : "Hello World")}>
        Toggle Text
      </button>

      <RegularComponent label={text} />
      <MemoizedComponent label={text} />
    </div>
  );
}

// Custom comparison function example
const MemoizedWithCustomComparison = React.memo(
  function MemoizedWithCustomComparison({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if the user ID changes
    return prevProps.user.id === nextProps.user.id;
  }
);`}
        demo={<ReactMemoDemo />}
        explanation={
          <div>
            <p>
              <code>React.memo</code> is a higher-order component that memoizes
              the result of a component render. This means that React will skip
              rendering the component and reuse the last rendered result if the
              props haven&apos;t changed.
            </p>

            <p className="mt-3">
              Key points about <code>React.memo</code>:
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Shallow comparison</strong>: By default, it only does a
                shallow comparison of props. If you need deep comparison or
                custom logic, you can provide a second argument.
              </li>
              <li>
                <strong>Function components only</strong>: It works only with
                function components, not class components (use{" "}
                <code>PureComponent</code> for those).
              </li>
              <li>
                <strong>Not a silver bullet</strong>: It adds overhead for the
                comparison, so it&apos;s only beneficial when the component is
                expensive to render and re-renders often with the same props.
              </li>
              <li>
                <strong>Doesn&apos;t prevent children renders</strong>: If a
                parent component re-renders, React will still attempt to
                re-render the children, but <code>React.memo</code> can skip the
                actual DOM update if props haven&apos;t changed.
              </li>
            </ol>

            <p className="mt-3">
              In the example above, when you click &quot;Increment Count&quot;,
              the parent component re-renders, causing both child components to
              be evaluated. However, the memoized component skips the actual
              rendering process because its props haven&apos;t changed.
            </p>

            <p className="mt-3">
              When you click &quot;Toggle Text&quot;, both components re-render
              because their props have changed.
            </p>
          </div>
        }
        tips={[
          "Only use React.memo for components that render often with the same props",
          "Be careful with object and function props, as they create new references on each render",
          "Consider using useCallback for function props and useMemo for object props",
          "Use the React DevTools Profiler to identify components that would benefit from memoization",
        ]}
        interviewQuestions={[
          {
            question: "When should you use React.memo?",
            answer:
              "You should use React.memo when: 1) The component renders often with the same props. 2) The component is computationally expensive to render. 3) The component is pure (its output is determined solely by its props). React.memo adds some overhead for the comparison, so it's not beneficial for simple components or components that always receive different props. It's most effective for components in the middle of the render tree that receive the same props on parent re-renders.",
            difficulty: "medium",
            tags: ["React", "Performance", "Optimization"],
          },
          {
            question: "What are the limitations of React.memo?",
            answer:
              "Limitations of React.memo include: 1) It only performs shallow comparison of props by default. 2) It doesn't prevent renders when the context changes. 3) It doesn't help with state changes within the component. 4) It adds overhead for the comparison, which might not be worth it for simple components. 5) It doesn't work with class components (use PureComponent instead). 6) It doesn't prevent the function component from being called, it just potentially skips the reconciliation. 7) It can be ineffective if you pass new object references or inline functions as props on each render.",
            difficulty: "hard",
            tags: ["React", "Performance", "Limitations"],
          },
        ]}
      />

      <CodeExample
        title="useMemo for Value Memoization"
        description="Cache the results of expensive calculations to prevent unnecessary recalculations"
        code={`import React, { useState, useMemo } from 'react';

function ExpensiveCalculation({ list, filter }) {
  // Without memoization - recalculates on every render
  const calculateWithoutMemo = () => {
    console.log('Calculating without memo...');
    return list.filter(item => item.includes(filter))
      .map(item => item.toUpperCase())
      .sort();
  };

  // With memoization - only recalculates when dependencies change
  const calculateWithMemo = useMemo(() => {
    console.log('Calculating with memo...');
    return list.filter(item => item.includes(filter))
      .map(item => item.toUpperCase())
      .sort();
  }, [list, filter]); // Dependencies array

  return (
    <div>
      <div>
        <h3>Without useMemo:</h3>
        <ul>
          {calculateWithoutMemo().map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>With useMemo:</h3>
        <ul>
          {calculateWithMemo.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Example usage
function App() {
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState('');
  const list = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment Count: {count}
      </button>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter fruits..."
      />

      <ExpensiveCalculation list={list} filter={filter} />
    </div>
  );
}`}
        demo={<UseMemoDemo />}
        explanation={
          <div>
            <p>
              <code>useMemo</code> is a React Hook that memoizes the result of a
              function call between renders. It&apos;s useful for expensive
              calculations that you don&apos;t want to repeat on every render.
            </p>

            <p className="mt-3">
              Key points about <code>useMemo</code>:
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Dependency array</strong>: The second argument is an
                array of dependencies. The memoized value will only be
                recalculated when one of these dependencies changes.
              </li>
              <li>
                <strong>Performance optimization</strong>: It&apos;s primarily a
                performance optimization, not a semantic guarantee. React may
                choose to &quot;forget&quot; memoized values in certain cases.
              </li>
              <li>
                <strong>Expensive calculations</strong>: Use it for
                computationally expensive operations like filtering large
                arrays, complex mathematical calculations, or transforming data.
              </li>
              <li>
                <strong>Referential equality</strong>: It&apos;s also useful for
                maintaining referential equality of objects and arrays that
                would otherwise be recreated on each render.
              </li>
            </ol>

            <p className="mt-3">
              In the example above, the calculation without <code>useMemo</code>{" "}
              runs on every render, even when unrelated state like{" "}
              <code>count</code> changes. The memoized calculation only runs
              when its dependencies (<code>list</code> or <code>filter</code>)
              change.
            </p>

            <p className="mt-3">
              This optimization is particularly important when:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The calculation is expensive</li>
              <li>The component renders frequently</li>
              <li>The dependencies don&apos;t change often</li>
            </ul>
          </div>
        }
        tips={[
          "Only memoize values that are expensive to calculate",
          "Make sure to include all variables used in the calculation in the dependency array",
          "Use the React DevTools Profiler to measure the actual performance impact",
          "Consider using useMemo for objects passed as props to memoized child components",
        ]}
        interviewQuestions={[
          {
            question: "What's the difference between useMemo and React.memo?",
            answer:
              "useMemo and React.memo serve different purposes: 1) useMemo memoizes the result of a function call or value calculation within a component. It's used to avoid expensive recalculations on every render. 2) React.memo memoizes an entire component. It prevents a component from re-rendering when its props haven't changed. useMemo works at the value level within a component, while React.memo works at the component level. useMemo takes a function and a dependency array, while React.memo takes a component and an optional comparison function. useMemo is a hook that can only be used in function components, while React.memo is a higher-order component that can wrap any function component.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Comparison"],
          },
          {
            question: "When would you use useMemo vs. useCallback?",
            answer:
              "Use useMemo vs. useCallback in these scenarios: 1) useMemo: For memoizing expensive calculated values like filtered arrays, sorted data, or complex objects. Example: `const sortedItems = useMemo(() => items.sort(), [items])`. 2) useCallback: For memoizing function references to prevent unnecessary re-renders of child components that receive functions as props. Example: `const handleClick = useCallback(() => console.log(value), [value])`. The key difference is that useMemo returns a memoized value from a function, while useCallback returns a memoized function itself. Both accept a dependency array and only recompute when dependencies change. A simplified way to think about it: useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).",
            difficulty: "hard",
            tags: ["React", "Hooks", "Best Practices"],
          },
        ]}
      />

      <CodeExample
        title="useCallback for Function Memoization"
        description="Prevent unnecessary recreation of function references"
        code={`import React, { useState, useCallback } from 'react';

// Child component that uses React.memo
const Button = React.memo(function Button({ onClick, label }) {
  console.log(\`Button rendered: \${label}\`);
  return <button onClick={onClick}>{label}</button>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [enabled, setEnabled] = useState(true);

  // Without useCallback - new function reference on every render
  const handleClickWithoutCallback = () => {
    console.log('Button clicked without callback');
    if (enabled) setCount(count + 1);
  };

  // With useCallback - stable function reference
  const handleClickWithCallback = useCallback(() => {
    console.log('Button clicked with callback');
    if (enabled) setCount(count + 1);
  }, [count, enabled]); // Dependencies array

  return (
    <div>
      <div>Count: {count}</div>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        Enabled
      </label>

      <div>
        {/* This button will re-render on every parent render */}
        <Button
          onClick={handleClickWithoutCallback}
          label="Without useCallback"
        />

        {/* This button will only re-render when its props change */}
        <Button
          onClick={handleClickWithCallback}
          label="With useCallback"
        />
      </div>
    </div>
  );
}`}
        demo={<UseCallbackDemo />}
        explanation={
          <div>
            <p>
              <code>useCallback</code> is a React Hook that returns a memoized
              callback function. It&apos;s useful for preventing unnecessary
              re-renders of child components that rely on referential equality
              of functions.
            </p>

            <p className="mt-3">
              Key points about <code>useCallback</code>:
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Function stability</strong>: It returns the same
                function instance between renders until dependencies change.
              </li>
              <li>
                <strong>Dependency array</strong>: Like <code>useMemo</code>, it
                takes a dependency array that determines when to recreate the
                function.
              </li>
              <li>
                <strong>Optimization for child components</strong>: It&apos;s
                primarily useful when passing callbacks to optimized child
                components that rely on reference equality to prevent
                unnecessary renders.
              </li>
              <li>
                <strong>Relationship with React.memo</strong>: It works well
                with <code>React.memo</code> to prevent child re-renders when
                the parent renders.
              </li>
            </ol>

            <p className="mt-3">
              In the example above, without <code>useCallback</code>, a new
              function reference is created on every render of the parent
              component. This means that even though the <code>Button</code>{" "}
              component is wrapped in <code>React.memo</code>, it will still
              re-render because it receives a new function reference as a prop.
            </p>

            <p className="mt-3">
              With <code>useCallback</code>, the function reference remains
              stable between renders (unless <code>count</code> or{" "}
              <code>enabled</code> changes), allowing <code>React.memo</code> to
              prevent unnecessary re-renders of the button.
            </p>

            <p className="mt-3">
              This optimization is particularly important when:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Passing callbacks to memoized child components</li>
              <li>Using callbacks as dependencies in useEffect hooks</li>
              <li>
                Working with complex component trees where performance is
                critical
              </li>
            </ul>
          </div>
        }
        tips={[
          "Only use useCallback when passing functions to optimized child components",
          "Make sure to include all variables used in the function in the dependency array",
          "Consider using useCallback for event handlers in forms with many inputs",
          "Combine with React.memo on child components for maximum benefit",
        ]}
        interviewQuestions={[
          {
            question:
              "What's the relationship between useCallback and useMemo?",
            answer:
              "The relationship between useCallback and useMemo: 1) useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). 2) Both are memoization hooks that help optimize performance. 3) useMemo memoizes a computed value, while useCallback memoizes a function reference. 4) Both accept a dependency array and only recompute when dependencies change. 5) useCallback is specifically designed for function references, making the code more readable when the intent is to memoize a function. 6) Both help prevent unnecessary re-renders in child components, but in different scenarios: useMemo for computed values passed as props, useCallback for function references passed as props. 7) Neither should be used prematurely - they add complexity and are only beneficial in specific performance scenarios. In essence, useCallback is a specialized version of useMemo optimized for the common case of needing to maintain function reference equality.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Comparison"],
          },
          {
            question:
              "Why doesn't React automatically memoize all functions in components?",
            answer:
              "React doesn't automatically memoize all functions because: 1) Performance overhead: Memoization itself has a cost (memory for storing functions and comparison operations). 2) Complexity: Automatic deep comparison of function closures would be complex and potentially expensive. 3) Unnecessary in most cases: Most components don't need memoization for good performance. 4) Developer control: Explicit memoization gives developers control over what and when to optimize. 5) Closure variables: React would need to track all variables in the closure to know when to invalidate memoization. 6) Bundle size: Adding automatic memoization would increase React's core size. 7) Different needs: Different functions have different memoization requirements that can't be automatically determined. 8) Debugging difficulty: Automatic memoization would make behavior less predictable and harder to debug. Instead, React provides tools like useCallback and useMemo so developers can apply memoization strategically where it provides measurable benefits.",
            difficulty: "hard",
            tags: ["React", "Performance", "Design Decisions"],
          },
        ]}
      />

      <InterviewQuestions
        title="Memoization Interview Questions"
        questions={[
          {
            question:
              "Explain the concept of memoization in React and why it's important for performance.",
            answer:
              "Memoization in React is a performance optimization technique that involves caching the results of expensive function calls or component renders and reusing them when the same inputs occur again. It's important for performance because: 1) It reduces unnecessary calculations and renders. 2) It helps maintain a smooth user experience by preventing UI jank. 3) It optimizes CPU usage, especially for computationally intensive operations. 4) It reduces battery consumption on mobile devices. React provides several tools for memoization: React.memo for component memoization, useMemo for value memoization, and useCallback for function memoization. These tools help prevent expensive operations from running repeatedly when they would produce the same result, which is particularly important in large applications with complex component trees and data transformations.",
            difficulty: "medium",
            tags: ["React", "Performance", "Fundamentals"],
          },
          {
            question:
              "What are some common pitfalls when using memoization in React?",
            answer:
              "Common pitfalls when using memoization in React: 1) Over-optimization: Adding memoization everywhere without measuring performance impact can add unnecessary complexity and even decrease performance due to the comparison overhead. 2) Missing dependencies: Forgetting to include all variables in the dependency array can lead to stale values and bugs. 3) Object and function references: Creating new object or function references in render that are passed to memoized components, defeating the purpose of memoization. 4) Deep equality needs: React.memo and useMemo perform shallow comparisons by default, which might not be sufficient for nested objects. 5) Premature optimization: Implementing memoization before identifying actual performance bottlenecks. 6) Context changes: Memoized components will still re-render when context values change, even if props don't. 7) Memoizing simple calculations: Adding memoization overhead for calculations that are already fast. 8) Not considering the bigger picture: Focusing on micro-optimizations when architectural changes might yield better results.",
            difficulty: "hard",
            tags: ["React", "Anti-patterns", "Debugging"],
          },
          {
            question:
              "How would you optimize a React application that renders a large list of items?",
            answer:
              "To optimize a React application rendering a large list: 1) Virtualization: Implement windowing with react-window or react-virtualized to only render items currently visible in the viewport. 2) Pagination: Split the list into pages and only load/render one page at a time. 3) Infinite scrolling: Load and render more items as the user scrolls down. 4) Memoization: Use React.memo on list items to prevent unnecessary re-renders. 5) Stable keys: Use stable, unique keys for list items to help React's reconciliation process. 6) Data normalization: Structure your data efficiently to minimize unnecessary re-renders. 7) Debounce/throttle: Limit the frequency of updates for search/filter operations. 8) Web Workers: Move heavy computations off the main thread. 9) Skeleton screens: Show placeholders while data is loading. 10) Code splitting: Split your bundle to load only necessary code. 11) Lazy loading: Load components only when needed. 12) Measure first: Use React DevTools Profiler to identify actual bottlenecks before optimizing.",
            difficulty: "hard",
            tags: ["React", "Performance", "Large Lists"],
          },
          {
            question:
              "How does the dependency array in useMemo and useCallback work, and what happens if you provide an empty array?",
            answer:
              "The dependency array in useMemo and useCallback works as follows: 1) Purpose: It tells React when to recalculate the memoized value or recreate the memoized function. 2) Comparison: React uses Object.is comparison on each dependency to determine if any have changed since the last render. 3) Behavior: If any dependency has changed, the memoized value is recalculated or the function is recreated. 4) Empty array []: This means the value or function should never be recalculated/recreated after the initial render. It's equivalent to componentDidMount in class components. 5) No array: If you omit the dependency array entirely, the value/function will be recalculated on every render, defeating the purpose of memoization. 6) Incorrect dependencies: If you don't include all values used in the calculation, you may get stale values or unexpected behavior. The ESLint rule 'exhaustive-deps' can help catch missing dependencies. When you provide an empty array, the memoized value is calculated only once during the initial render and then reused for the component's lifetime, regardless of any state or prop changes.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Dependencies"],
          },
        ]}
      />
    </div>
  );
}
