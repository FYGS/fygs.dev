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

export function CodeSplittingSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Code Splitting</CardTitle>
          <CardDescription>
            Techniques for splitting your code into smaller chunks to improve load time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Code splitting is a technique that allows you to split your JavaScript bundle into smaller chunks that can be loaded on demand, reducing the initial load time of your application.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Dynamic Import</Badge>
            <Badge>React.lazy</Badge>
            <Badge>Suspense</Badge>
            <Badge>Route-based Splitting</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Dynamic Import"
        description="Load modules on demand using dynamic imports"
        code={`// Without code splitting - everything is loaded upfront
import { heavyFunction } from './heavyModule';

function App() {
  const handleClick = () => {
    // heavyFunction is already loaded, even if the user never clicks the button
    const result = heavyFunction();
    console.log(result);
  };
  
  return (
    <button onClick={handleClick}>
      Perform Heavy Calculation
    </button>
  );
}

// With code splitting - load the module only when needed
function AppWithCodeSplitting() {
  const handleClick = async () => {
    // The module is loaded only when the user clicks the button
    const heavyModule = await import('./heavyModule');
    const result = heavyModule.heavyFunction();
    console.log(result);
  };
  
  return (
    <button onClick={handleClick}>
      Perform Heavy Calculation
    </button>
  );
}`}
        explanation={
          <div>
            <p>
              Dynamic imports are a native JavaScript feature that allows you to import modules dynamically at runtime, rather than statically at compile time. This is the foundation of code splitting in modern JavaScript applications.
            </p>
            
            <p className="mt-3">
              Key benefits of dynamic imports:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Reduced initial bundle size</strong>: Only load what&apos;s necessary for the initial render.
              </li>
              <li>
                <strong>Faster startup time</strong>: Smaller initial bundles lead to faster page loads.
              </li>
              <li>
                <strong>On-demand loading</strong>: Load features only when they&apos;re actually needed.
              </li>
              <li>
                <strong>Better caching</strong>: Smaller, more focused bundles can be cached more effectively.
              </li>
            </ol>
            
            <p className="mt-3">
              In the example above, the first approach imports the <code>heavyFunction</code> statically, meaning it&apos;s included in the main bundle and loaded when the application starts, even if the user never clicks the button.
            </p>
            
            <p className="mt-3">
              The second approach uses dynamic imports to load the <code>heavyModule</code> only when the user clicks the button. This reduces the initial bundle size and improves the application&apos;s startup time.
            </p>
            
            <p className="mt-3">
              Dynamic imports return a Promise that resolves to the module object, giving you access to all of its exports. This asynchronous nature means you&apos;ll need to handle the loading state appropriately in your UI.
            </p>
          </div>
        }
        tips={[
          "Use dynamic imports for large libraries that aren't needed immediately",
          "Consider adding loading indicators when dynamically importing modules",
          "Combine with React.lazy for component-level code splitting",
          "Use tools like webpack-bundle-analyzer to identify large dependencies that could benefit from code splitting"
        ]}
      />
      
      <CodeExample
        title="React.lazy and Suspense"
        description="Component-level code splitting in React"
        code={`import React, { Suspense, lazy } from 'react';

// Without code splitting - all components are loaded upfront
import HeavyComponent from './HeavyComponent';

function App() {
  const [showHeavy, setShowHeavy] = React.useState(false);
  
  return (
    <div>
      <button onClick={() => setShowHeavy(!showHeavy)}>
        {showHeavy ? 'Hide' : 'Show'} Heavy Component
      </button>
      
      {showHeavy && <HeavyComponent />}
    </div>
  );
}

// With code splitting using React.lazy
// The component is only loaded when it needs to be rendered
const LazyHeavyComponent = lazy(() => import('./HeavyComponent'));

function AppWithCodeSplitting() {
  const [showHeavy, setShowHeavy] = React.useState(false);
  
  return (
    <div>
      <button onClick={() => setShowHeavy(!showHeavy)}>
        {showHeavy ? 'Hide' : 'Show'} Heavy Component
      </button>
      
      {showHeavy && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyHeavyComponent />
        </Suspense>
      )}
    </div>
  );
}

// Route-based code splitting in React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Dashboard = lazy(() => import('./Dashboard'));

function AppWithRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}`}
        explanation={
          <div>
            <p>
              <code>React.lazy</code> is a function that lets you render a dynamic import as a regular component. It makes component-level code splitting straightforward in React applications.
            </p>
            
            <p className="mt-3">
              <code>Suspense</code> is a React component that lets you specify a loading state while waiting for components to load. It works hand-in-hand with <code>React.lazy</code> to provide a smooth user experience during code splitting.
            </p>
            
            <p className="mt-3">
              Key points about React.lazy and Suspense:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Component-level splitting</strong>: Load components only when they&apos;re needed.
              </li>
              <li>
                <strong>Declarative loading states</strong>: <code>Suspense</code> provides a clean way to show loading states.
              </li>
              <li>
                <strong>Nested Suspense</strong>: You can nest <code>Suspense</code> components to create more granular loading boundaries.
              </li>
              <li>
                <strong>Route-based splitting</strong>: Commonly used with routers to load page components on demand.
              </li>
            </ol>
            
            <p className="mt-3">
              In the first example, <code>HeavyComponent</code> is imported statically and included in the main bundle, even if it&apos;s never shown.
            </p>
            
            <p className="mt-3">
              In the second example, <code>LazyHeavyComponent</code> is loaded dynamically only when <code>showHeavy</code> is true. The <code>Suspense</code> component shows a loading indicator while the component is being loaded.
            </p>
            
            <p className="mt-3">
              The third example demonstrates route-based code splitting, where each page component is loaded only when the user navigates to its route. This is one of the most effective ways to implement code splitting in larger applications.
            </p>
          </div>
        }
        tips={[
          "Use React.lazy for components that aren't needed for the initial render",
          "Implement meaningful loading states with Suspense fallbacks",
          "Consider using skeleton screens instead of simple loading spinners",
          "Apply code splitting at the route level for the most significant benefits"
        ]}
        interviewQuestions={[
          {
            question: "What are the benefits of code splitting in React applications?",
            answer: "Benefits of code splitting in React applications: 1) Reduced initial load time: Users download only what's necessary for the current view. 2) Improved performance: Smaller bundles parse and execute faster. 3) Better resource utilization: Reduces memory usage by loading code only when needed. 4) Improved caching: Smaller, more focused bundles can be cached more effectively. 5) Better user experience: Faster initial load times lead to better user engagement. 6) Reduced bandwidth usage: Particularly important for users on limited data plans or slow connections. 7) Progressive loading: Users can start interacting with the app before all code is loaded. 8) Optimized resource prioritization: Critical resources can be loaded first. 9) Better error isolation: Issues in one chunk don't necessarily affect others. 10) Improved development experience: Changes to one part of the application don't require rebuilding everything.",
            difficulty: "medium",
            tags: ["React", "Performance", "Code Splitting"]
          },
          {
            question: "What's the difference between React.lazy and a regular dynamic import?",
            answer: "Differences between React.lazy and regular dynamic imports: 1) Purpose: React.lazy is specifically designed for component imports, while dynamic imports work with any module. 2) Return value: React.lazy returns a React component, while dynamic imports return a Promise that resolves to the module. 3) Usage in JSX: React.lazy components can be used directly in JSX (with Suspense), while dynamic imports require manual handling of the Promise. 4) Error boundaries: React.lazy works with React error boundaries for error handling, while dynamic imports require manual try/catch. 5) Suspense integration: React.lazy is designed to work with Suspense for loading states, while dynamic imports require manual loading state management. 6) Timing: React.lazy components load when rendered, while dynamic imports load when the import() function is called. 7) Server-side rendering: since React 18, React.lazy works with Suspense on the server (streaming SSR), whereas older setups needed a library such as Loadable Components. In essence, React.lazy is a specialized wrapper around dynamic imports specifically for React components, providing better integration with React's features.",
            difficulty: "hard",
            tags: ["React", "Code Splitting", "Comparison"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Code Splitting Interview Questions"
        questions={[
          {
            question: "How would you implement code splitting in a React application?",
            answer: "To implement code splitting in a React application: 1) Component-level splitting: Use React.lazy and Suspense: `const LazyComponent = React.lazy(() => import('./LazyComponent')); function App() { return ( <Suspense fallback={<Loading />}> {shouldShow && <LazyComponent />} </Suspense> ); }` 2) Route-based splitting: Split at the route level for page components: `const Home = lazy(() => import('./Home')); const About = lazy(() => import('./About')); function App() { return ( <Suspense fallback={<Loading />}> <Routes> <Route path=\"/\" element={<Home />} /> <Route path=\"/about\" element={<About />} /> </Routes> </Suspense> ); }` 3) Library splitting: Load heavy libraries on demand: `const handleClick = async () => { const { default: moment } = await import('moment'); console.log(moment().format('MMMM Do YYYY')); };` 4) Named exports: For specific exports from a module: `const loadChart = async () => { const { Chart } = await import('chart.js'); return new Chart(ctx, config); };` 5) Prefetching: Load code before it's needed: `const prefetchAbout = () => { import('./About'); };` 6) Webpack magic comments: Control chunk names and loading priorities: `import(/* webpackChunkName: \"about\" */ './About')`. These techniques can be combined based on your application's specific needs.",
            difficulty: "medium",
            tags: ["React", "Code Splitting", "Implementation"]
          },
          {
            question: "What are some common pitfalls when implementing code splitting?",
            answer: "Common pitfalls when implementing code splitting: 1) Over-splitting: Creating too many small chunks can increase HTTP requests and actually harm performance. 2) Under-splitting: Not splitting large bundles enough, missing optimization opportunities. 3) Missing loading states: Not providing adequate feedback during chunk loading, leading to poor UX. 4) Not handling errors: Failing to catch and handle loading failures gracefully. 5) Forgetting preloading: Not preloading critical chunks that will likely be needed soon. 6) Inconsistent server-side rendering: Not accounting for code splitting in SSR setups. 7) Bundle size monitoring: Not tracking bundle sizes over time to catch regressions. 8) Ineffective splitting boundaries: Splitting at the wrong level of the component tree. 9) Forgetting about third-party dependencies: Not splitting large libraries that are used infrequently. 10) Cache invalidation issues: Not properly handling versioning of dynamic chunks. 11) Network conditions: Not testing under various network conditions to ensure good performance. 12) Mobile considerations: Not accounting for the performance impact on lower-powered devices.",
            difficulty: "hard",
            tags: ["React", "Performance", "Anti-patterns"]
          },
          {
            question: "How does code splitting work with server-side rendering (SSR)?",
            answer: "Code splitting with server-side rendering (SSR) requires special handling: 1) Challenge: before React 18, React.lazy was not supported with server rendering (renderToString is synchronous and does not support Suspense). Since React 18, Suspense with streaming SSR (renderToPipeableStream) supports React.lazy; the main remaining challenge is knowing which chunks to ship with the HTML. 2) Solutions for Next.js: Next.js handles this automatically with its built-in dynamic import function: `import dynamic from 'next/dynamic'; const DynamicComponent = dynamic(() => import('./Component'));` 3) Solutions for custom SSR: For custom SSR setups, you need different components for client and server: `const Component = isServer ? require('./Component').default : React.lazy(() => import('./Component'));` 4) Loadable Components: A library specifically designed for SSR code splitting: `import loadable from '@loadable/component'; const LoadableComponent = loadable(() => import('./Component'));` 5) Chunk mapping: The server needs to know which chunks were rendered to include them in the initial HTML. 6) Hydration considerations: Ensure the client-side code matches the server-rendered HTML during hydration. 7) Data requirements: Components might need data before they can render on the server. 8) Performance implications: Balance between initial HTML size and subsequent JavaScript downloads. The key is ensuring that the server can synchronously render the initial HTML while still enabling code splitting for client-side navigation.",
            difficulty: "hard",
            tags: ["React", "SSR", "Advanced"]
          }
        ]}
      />
    </div>
  );
}
