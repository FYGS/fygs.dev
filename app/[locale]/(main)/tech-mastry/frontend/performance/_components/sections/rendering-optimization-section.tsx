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

export function RenderingOptimizationSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rendering Optimization</CardTitle>
          <CardDescription>
            Techniques for optimizing the rendering process in React applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Rendering optimization involves minimizing unnecessary re-renders and making the rendering process as efficient as possible to improve the overall performance of your React application.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>State Management</Badge>
            <Badge>Component Structure</Badge>
            <Badge>Render Profiling</Badge>
            <Badge>Reconciliation</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Preventing Unnecessary Re-renders"
        description="Techniques to avoid unnecessary component re-renders"
        code={`import React, { useState, useCallback, memo } from 'react';

// Problem: Child re-renders on every parent render
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  // This function is recreated on every render
  const handleClick = () => {
    console.log(\`Hello, \${name}!\`);
  };
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment Count: {count}
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      
      {/* ChildComponent re-renders on every count change */}
      <ChildComponent name={name} onClick={handleClick} />
    </div>
  );
}

function ChildComponent({ name, onClick }) {
  console.log('ChildComponent rendered');
  return (
    <div>
      <p>Hello, {name}!</p>
      <button onClick={onClick}>Say Hello</button>
    </div>
  );
}

// Solution: Optimize with memo and useCallback
function OptimizedParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  // This function is only recreated when name changes
  const handleClick = useCallback(() => {
    console.log(\`Hello, \${name}!\`);
  }, [name]);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment Count: {count}
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      
      {/* MemoizedChildComponent only re-renders when name or handleClick changes */}
      <MemoizedChildComponent name={name} onClick={handleClick} />
    </div>
  );
}

// Memoized version of ChildComponent
const MemoizedChildComponent = memo(function ChildComponent({ name, onClick }) {
  console.log('MemoizedChildComponent rendered');
  return (
    <div>
      <p>Hello, {name}!</p>
      <button onClick={onClick}>Say Hello</button>
    </div>
  );
});`}
        explanation={
          <div>
            <p>
              One of the most common performance issues in React applications is unnecessary re-renders. A component re-renders when its state changes, its props change, or its parent component re-renders.
            </p>
            
            <p className="mt-3">
              In the first example, <code>ChildComponent</code> re-renders every time <code>ParentComponent</code> re-renders, even if the props passed to <code>ChildComponent</code> (<code>name</code> and <code>onClick</code>) haven&apos;t changed. This happens because:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Function recreation</strong>: <code>handleClick</code> is recreated on every render, creating a new function reference.
              </li>
              <li>
                <strong>No memoization</strong>: <code>ChildComponent</code> isn&apos;t memoized, so it re-renders whenever its parent re-renders.
              </li>
            </ol>
            
            <p className="mt-3">
              In the optimized version, we use two key techniques to prevent unnecessary re-renders:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>useCallback</strong>: The <code>handleClick</code> function is memoized with <code>useCallback</code>, so it only changes when <code>name</code> changes.
              </li>
              <li>
                <strong>React.memo</strong>: <code>MemoizedChildComponent</code> is wrapped with <code>memo</code>, so it only re-renders when its props change.
              </li>
            </ol>
            
            <p className="mt-3">
              With these optimizations, <code>MemoizedChildComponent</code> only re-renders when <code>name</code> changes or when <code>handleClick</code> is recreated (which only happens when <code>name</code> changes). It doesn&apos;t re-render when <code>count</code> changes, even though its parent does.
            </p>
            
            <p className="mt-3">
              This pattern is particularly useful when:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The child component is expensive to render</li>
              <li>The parent component re-renders frequently</li>
              <li>The props passed to the child component don&apos;t change often</li>
            </ul>
            
            <p className="mt-3">
              Remember that memoization itself has a cost, so it&apos;s not always beneficial to memoize every component. Use the React DevTools Profiler to identify components that would benefit from memoization.
            </p>
          </div>
        }
        tips={[
          "Use React DevTools Profiler to identify unnecessary re-renders",
          "Keep state as local as possible to minimize the scope of re-renders",
          "Split large components into smaller ones to create more granular re-render boundaries",
          "Consider using a state management library like Redux or Zustand for complex state"
        ]}
      />
      
      <CodeExample
        title="Optimizing Component Structure"
        description="Organize components to minimize the impact of state changes"
        code={`import React, { useState, memo } from 'react';

// Problem: Poor component structure causes unnecessary re-renders
function PoorlyStructuredApp() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'John', email: 'john@example.com' });
  
  // Expensive calculation that depends only on count
  const expensiveResult = calculateExpensiveValue(count);
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      
      <div>
        <button onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </button>
        <p>Expensive calculation result: {expensiveResult}</p>
      </div>
      
      <div>
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Name"
        />
        <input
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
        />
      </div>
      
      <div>
        <h2>User Profile</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>
    </div>
  );
}

// Solution: Better component structure
function WellStructuredApp() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'John', email: 'john@example.com' });
  
  return (
    <div>
      <UserHeader name={user.name} />
      
      <CounterSection count={count} setCount={setCount} />
      
      <UserForm user={user} setUser={setUser} />
      
      <UserProfile user={user} />
    </div>
  );
}

// Separate components for different sections
function UserHeader({ name }) {
  return <h1>Welcome, {name}</h1>;
}

// memo: CounterSection is skipped when only user changes (setCount is stable)
const CounterSection = memo(function CounterSection({ count, setCount }) {
  // Expensive calculation only runs when count changes
  const expensiveResult = calculateExpensiveValue(count);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment Count: {count}
      </button>
      <p>Expensive calculation result: {expensiveResult}</p>
    </div>
  );
});

function UserForm({ user, setUser }) {
  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />
    </div>
  );
}

function UserProfile({ user }) {
  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

// Helper function for the example
function calculateExpensiveValue(count) {
  console.log('Calculating expensive value...');
  // Simulate expensive calculation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += count;
  }
  return result;
}`}
        explanation={
          <div>
            <p>
              Component structure plays a crucial role in React performance. How you organize your components can significantly impact which parts of your application re-render when state changes.
            </p>
            
            <p className="mt-3">
              In the <code>PoorlyStructuredApp</code> example, we have several issues:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Monolithic component</strong>: Everything is in one component, so any state change causes the entire component to re-render.
              </li>
              <li>
                <strong>Mixed concerns</strong>: Unrelated functionality (counter and user profile) are mixed together.
              </li>
              <li>
                <strong>Expensive calculations</strong>: The expensive calculation runs on every render, even when <code>user</code> changes but <code>count</code> doesn&apos;t.
              </li>
            </ol>
            
            <p className="mt-3">
              In the <code>WellStructuredApp</code> example, we address these issues by:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Component decomposition</strong>: Breaking the monolithic component into smaller, focused components.
              </li>
              <li>
                <strong>Separation of concerns</strong>: Each component handles a specific part of the UI and its related state.
              </li>
              <li>
                <strong>Localized re-renders</strong>: When <code>user</code> changes, only the components that depend on <code>user</code> re-render. The <code>CounterSection</code>, wrapped in <code>memo</code>, doesn&apos;t re-render (without <code>memo</code>, every child of the component that owns the state would re-render).
              </li>
              <li>
                <strong>Optimized calculations</strong>: The expensive calculation only runs when <code>count</code> changes, not when <code>user</code> changes.
              </li>
            </ol>
            
            <p className="mt-3">
              This approach creates natural re-render boundaries in your application. When state changes, only the components that depend on that state will re-render, rather than the entire application.
            </p>
            
            <p className="mt-3">
              Key principles for optimizing component structure:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Single Responsibility Principle: Each component should have a single responsibility</li>
              <li>Lift state up only as high as necessary</li>
              <li>Push state down when possible to minimize the scope of re-renders</li>
              <li>Use composition to build complex UIs from simple components</li>
              <li>Consider using context for deeply nested components that need access to the same state</li>
            </ul>
          </div>
        }
        tips={[
          "Follow the Single Responsibility Principle for components",
          "Keep state as close as possible to where it's used",
          "Use composition to build complex UIs from simple components",
          "Consider using context for deeply nested components that need access to the same state"
        ]}
        interviewQuestions={[
          {
            question: "What are the most common causes of unnecessary re-renders in React and how would you fix them?",
            answer: "Common causes of unnecessary re-renders and solutions: 1) Parent component re-renders: When a parent re-renders, all children re-render by default. Solution: Use React.memo to memoize components that don't need to re-render when their props don't change. 2) New object/function references on every render: Creating new objects or functions in render creates new references. Solution: Use useMemo for objects and useCallback for functions to maintain referential equality between renders. 3) Context changes: All consumers re-render when any value in a context changes. Solution: Split contexts by concern or use memoization techniques to prevent unnecessary updates. 4) State updates that don't change values: React bails out when the new state is identical (Object.is), but setting a new object or array with the same content triggers a re-render. Solution: Avoid creating new references when nothing changed, or skip the update. 5) Inefficient list rendering: Not using keys or using index as keys. Solution: Use stable, unique keys for list items. 6) Prop drilling through many components: Passing props through many levels. Solution: Consider using context or state management libraries for deeply nested state. 7) Large, monolithic components: Components that do too much. Solution: Break into smaller, more focused components to create natural re-render boundaries. 8) Expensive calculations in render: Recalculating values on every render. Solution: Use useMemo to cache expensive calculations.",
            difficulty: "medium",
            tags: ["React", "Performance", "Optimization"]
          },
          {
            question: "How would you use the React DevTools Profiler to identify and fix performance issues?",
            answer: "Using React DevTools Profiler to identify and fix performance issues: 1) Record a session: Click the record button and perform the action you want to analyze. 2) Analyze the flame chart: Look for components with long render times (yellow/red bars) and frequent re-renders. 3) Examine render reasons: Click on components to see why they rendered (prop changes, state changes, etc.). 4) Check 'Ranked' view: Identify the slowest components by render time. 5) Use the 'Components' tab: Check which props and state are changing. 6) Look for cascading renders: Identify parent components causing child re-renders. 7) Identify optimization targets: Focus on components that render frequently but don't need to. 8) Apply fixes: a) Memoize components with React.memo. b) Use useCallback for function props. c) Use useMemo for computed values and object props. d) Split large components into smaller ones. e) Move state closer to where it's used. f) Consider using shouldComponentUpdate for class components. 9) Measure improvements: Record another session after applying fixes to verify performance gains. 10) Iterate: Continue identifying and fixing issues until performance meets requirements. The Profiler is invaluable for data-driven optimization rather than premature or speculative optimization.",
            difficulty: "hard",
            tags: ["React", "DevTools", "Debugging"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Rendering Optimization Interview Questions"
        questions={[
          {
            question: "Explain React's reconciliation process and how it affects performance.",
            answer: "React's reconciliation process and performance implications: 1) What is reconciliation: The algorithm React uses to determine what parts of the UI need to be updated when state or props change. 2) Virtual DOM: React maintains a lightweight copy of the real DOM in memory. 3) Diffing algorithm: When updates occur, React creates a new virtual DOM and compares it with the previous one. 4) Key steps: a) Different component types are rebuilt entirely. b) Same component types are updated with new props. c) DOM nodes are compared recursively. d) Lists are compared using keys. 5) Performance implications: a) Changing component type (e.g., <div> to <span>) causes full subtree rebuild. b) Conditional rendering with different component types can be expensive. c) Adding/removing elements in the middle of lists without keys is inefficient. d) Deep component trees can slow down reconciliation. 6) Optimization strategies: a) Use stable component types in the same position. b) Use React.memo for pure functional components. c) Use PureComponent for class components. d) Provide stable, unique keys for list items. e) Keep component trees relatively flat when possible. f) Use the shouldComponentUpdate lifecycle method judiciously. Understanding reconciliation helps developers structure components and manage updates in ways that minimize unnecessary work.",
            difficulty: "medium",
            tags: ["React", "Internals", "Performance"]
          },
          {
            question: "What is the difference between useMemo, useCallback, and React.memo? When would you use each?",
            answer: "Differences between useMemo, useCallback, and React.memo: 1) useMemo: a) Memoizes computed values. b) Recalculates only when dependencies change. c) Syntax: `const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);` d) Use when: Computing expensive values, creating objects that should maintain referential equality, or optimizing values passed as props to memoized components. 2) useCallback: a) Memoizes function references. b) Returns the same function reference unless dependencies change. c) Syntax: `const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);` d) Use when: Passing callbacks to optimized child components, defining event handlers that are dependencies of other hooks, or preventing unnecessary renders in child components. 3) React.memo: a) Higher-order component that memoizes component renders. b) Skips rendering when props haven't changed (shallow comparison). c) Syntax: `const MemoizedComponent = React.memo(MyComponent);` d) Use when: Component renders often with the same props, component is pure (output determined solely by props), or preventing re-renders from parent updates. Key differences: useMemo and useCallback are hooks used within components to memoize values and functions, while React.memo is a higher-order component that wraps entire components. useMemo returns any memoized value, useCallback returns a memoized function specifically.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Optimization"]
          },
          {
            question: "How would you optimize a React application that has performance issues when rendering large lists or tables?",
            answer: "Optimizing React applications with large lists/tables: 1) Virtualization/windowing: Implement react-window or react-virtualized to render only visible items. 2) Pagination: Split data into pages and render one page at a time. 3) Infinite scrolling: Load and render more items as the user scrolls. 4) Memoization: Use React.memo for list items to prevent unnecessary re-renders. 5) Stable keys: Use unique, stable keys (not array indices) for list items. 6) Flatten data structure: Normalize complex nested data for more efficient updates. 7) Debounce/throttle: Limit frequency of updates for search/filter operations. 8) Optimize render method: Keep list item components simple and focused. 9) Separate components: Extract static parts from dynamic parts of list items. 10) Batch updates: Group multiple state updates to trigger fewer re-renders. 11) Use web workers: Move heavy computations off the main thread. 12) Optimize CSS: Use efficient CSS selectors and avoid layout thrashing. 13) Measure first: Use React DevTools Profiler to identify actual bottlenecks. 14) Consider server-side rendering or pagination for initial load. 15) Data caching: Cache processed data to avoid recalculations. The most effective approach often combines several of these techniques based on specific requirements and constraints.",
            difficulty: "hard",
            tags: ["React", "Performance", "Large Data"]
          },
          {
            question: "What are some common anti-patterns in React that can lead to performance issues?",
            answer: "React performance anti-patterns: 1) Inline function definitions: Creating new function references on every render. 2) Inline object literals: Creating new object references on every render. 3) Excessive re-renders: Not using memoization techniques like React.memo, useMemo, or useCallback. 4) Prop drilling: Passing props through many levels of components. 5) Large component trees: Creating deeply nested component hierarchies. 6) Monolithic components: Building large components that do too much. 7) Expensive calculations in render: Performing complex calculations during rendering. 8) Improper use of keys: Using array indices as keys or not using keys at all. 9) Frequent state updates: Updating state too frequently or unnecessarily. 10) Context overuse: Putting too much data in context or having too many context providers. 11) Inefficient event handlers: Adding/removing event listeners inefficiently. 12) Synchronous API calls: Blocking rendering with synchronous operations. 13) Rendering hidden components: Fully rendering components that aren't visible. 14) CSS animations in React: Using JavaScript for animations that could be done with CSS. 15) Not code-splitting: Loading the entire application upfront instead of splitting it into chunks. 16) Memory leaks: Not cleaning up subscriptions, timers, or event listeners. Avoiding these anti-patterns and following React best practices can significantly improve application performance.",
            difficulty: "medium",
            tags: ["React", "Anti-patterns", "Best Practices"]
          }
        ]}
      />
    </div>
  );
}
