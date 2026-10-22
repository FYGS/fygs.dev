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

export function BundleSizeSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Bundle Size Optimization</CardTitle>
          <CardDescription>
            Techniques for reducing the size of your JavaScript bundles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Bundle size optimization involves reducing the amount of JavaScript that needs to be downloaded, parsed, and executed by the browser, leading to faster load times and better performance.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Tree Shaking</Badge>
            <Badge>Dependency Management</Badge>
            <Badge>Compression</Badge>
            <Badge>Minification</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Tree Shaking and Dead Code Elimination"
        description="Remove unused code from your bundles"
        code={`// Before tree shaking - importing the entire library
import _ from 'lodash';

function Component() {
  // Only using a single function from lodash
  const sorted = _.sortBy(items, 'name');
  return <div>{sorted.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}

// After tree shaking - importing only what you need
import sortBy from 'lodash/sortBy';
// or using ES modules
// import { sortBy } from 'lodash-es';

function OptimizedComponent() {
  // Same functionality, much smaller bundle
  const sorted = sortBy(items, 'name');
  return <div>{sorted.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}

// Example of code that will be eliminated by tree shaking
export function usedFunction() {
  return 'This function is used';
}

export function unusedFunction() {
  return 'This function is never imported, so it will be removed';
}

// In another file
import { usedFunction } from './functions';
// unusedFunction is not imported, so it will be removed from the bundle`}
        explanation={
          <div>
            <p>
              Tree shaking is a term commonly used in the JavaScript context for dead-code elimination. It relies on the static structure of ES module syntax (<code>import</code> and <code>export</code>) to determine which exports are actually used and remove those that aren&apos;t.
            </p>
            
            <p className="mt-3">
              Key concepts of tree shaking:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>ES Modules</strong>: Tree shaking works with ES modules because their structure is static and can be analyzed at build time.
              </li>
              <li>
                <strong>Side-effect free code</strong>: For optimal tree shaking, code should be free of side effects.
              </li>
              <li>
                <strong>Build tool support</strong>: Modern bundlers like Webpack, Rollup, and esbuild support tree shaking.
              </li>
              <li>
                <strong>Package.json configuration</strong>: The <code>sideEffects</code> field can help bundlers identify side-effect free modules.
              </li>
            </ol>
            
            <p className="mt-3">
              In the first example, we import the entire Lodash library even though we only use a single function. This results in a much larger bundle than necessary.
            </p>
            
            <p className="mt-3">
              In the second example, we import only the specific function we need, either by using the path-based import or by using the ES modules version of Lodash. This significantly reduces the bundle size.
            </p>
            
            <p className="mt-3">
              The third example demonstrates how unused exports are eliminated from the bundle. Since <code>unusedFunction</code> is never imported anywhere, it will be removed during the build process.
            </p>
            
            <p className="mt-3">
              Tree shaking is particularly important for large applications that use many third-party libraries. By only including the code that&apos;s actually used, you can significantly reduce your bundle size and improve load times.
            </p>
          </div>
        }
        tips={[
          "Use ES modules syntax (import/export) to enable tree shaking",
          "Prefer importing specific functions instead of entire libraries",
          "Look for ES module versions of popular libraries (e.g., lodash-es instead of lodash)",
          "Use the 'sideEffects' field in package.json to help bundlers identify side-effect free modules"
        ]}
      />
      
      <CodeExample
        title="Dependency Management and Alternatives"
        description="Choose smaller alternatives to heavy dependencies"
        code={`// Heavy dependency example
import moment from 'moment'; // legacy (maintenance mode); weight depends on the locales you bundle

function formatDate(date) {
  return moment(date).format('MMMM Do YYYY');
}

// Lighter alternative
import { format } from 'date-fns'; // tree-shakable: only the functions you import are bundled

function formatDateOptimized(date) {
  return format(date, 'MMMM do yyyy');
}

// Even lighter alternative using built-in APIs
function formatDateNative(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Another example: using a lightweight alternative to a full UI library
// Instead of importing all of Material-UI
import Button from '@mui/material/Button'; // Pulls in core dependencies

// Consider smaller, focused libraries
import Button from 'tiny-ui-lib/Button'; // Hypothetical smaller library

// Or build your own simple components when appropriate
function SimpleButton({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
}`}
        explanation={
          <div>
            <p>
              Managing dependencies is a critical aspect of bundle size optimization. Every library you add to your project increases the amount of code that needs to be downloaded, parsed, and executed.
            </p>
            
            <p className="mt-3">
              Strategies for dependency management:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Evaluate alternatives</strong>: Before adding a dependency, consider if there are lighter alternatives that meet your needs.
              </li>
              <li>
                <strong>Use built-in APIs</strong>: Modern browsers have powerful built-in APIs that can often replace external libraries.
              </li>
              <li>
                <strong>Consider the cost</strong>: Weigh the bundle size cost against the development time saved by using a library.
              </li>
              <li>
                <strong>Audit regularly</strong>: Use tools like <code>npm-check</code> or <code>depcheck</code> to identify unused dependencies.
              </li>
            </ol>
            
            <p className="mt-3">
              In the examples above:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Moment.js is a legacy library: it is in maintenance mode and its maintainers discourage its use in new projects. It is not tree-shakable and its weight depends heavily on the locales you bundle (measure it on bundlephobia.com). date-fns is modular and tree-shakable; the built-in <code>Intl</code> APIs need no dependency at all, and <code>Temporal</code> is the upcoming native date/time API (check browser support before relying on it).</li>
              <li>The native <code>toLocaleDateString</code> method provides good date formatting capabilities with no additional bundle size.</li>
              <li>Large UI libraries can significantly increase bundle size. Consider smaller alternatives or building simple components yourself when appropriate.</li>
            </ul>
            
            <p className="mt-3">
              Remember that the best dependency is often no dependency at all. Before adding a library, ask yourself if the functionality could be implemented with a small amount of custom code or built-in browser APIs.
            </p>
          </div>
        }
        tips={[
          "Regularly audit your dependencies with tools like npm-check or depcheck",
          "Consider the 'cost per use' of each dependency",
          "Look for libraries that support tree shaking and provide ES modules",
          "Use bundlephobia.com to check the size impact of dependencies before adding them"
        ]}
        interviewQuestions={[
          {
            question: "What strategies would you use to reduce the bundle size of a React application?",
            answer: "Strategies to reduce React application bundle size: 1) Code splitting: Use dynamic imports and React.lazy to split code into smaller chunks. 2) Tree shaking: Use ES modules and ensure your bundler is configured for tree shaking. 3) Dependency management: Choose lightweight alternatives and only import what you need. 4) Compression: Enable Gzip or Brotli compression on your server. 5) Minification: Use tools like Terser to minify your JavaScript. 6) Image optimization: Compress images and use modern formats like WebP. 7) Lazy loading: Load non-critical resources only when needed. 8) Remove unused code: Regularly audit and remove unused dependencies and code. 9) Use production builds: Ensure you're using production builds of React and other libraries. 10) Bundle analysis: Use tools like webpack-bundle-analyzer to identify large dependencies. 11) Code optimization: Refactor inefficient code patterns. 12) CSS optimization: Consider CSS-in-JS solutions that support code splitting or use CSS modules. 13) Preload critical resources: Use <link rel=\"preload\"> for critical assets. 14) Consider server-side rendering: Improve perceived performance with SSR.",
            difficulty: "medium",
            tags: ["React", "Performance", "Bundle Size"]
          },
          {
            question: "How would you identify and fix performance bottlenecks related to bundle size in a React application?",
            answer: "To identify and fix bundle size bottlenecks: 1) Measure current performance: Use Lighthouse, WebPageTest, or Chrome DevTools to establish baseline metrics. 2) Analyze bundle composition: Use webpack-bundle-analyzer to visualize bundle content and identify large dependencies. 3) Check for duplicate dependencies: Use tools like duplicate-package-checker-webpack-plugin to find duplicates. 4) Identify unused code: Use Coverage tab in Chrome DevTools to see unused JavaScript. 5) Implement code splitting: Add dynamic imports at logical boundaries (routes, modals, etc.). 6) Optimize dependencies: Replace large libraries with smaller alternatives or native APIs. 7) Configure tree shaking: Ensure your bundler is properly configured for dead code elimination. 8) Set up bundle size monitoring: Use tools like bundlewatch to prevent regressions. 9) Implement lazy loading: Defer non-critical resources until needed. 10) Optimize images and assets: Compress and use appropriate formats. 11) Implement caching strategies: Set up proper cache headers for static assets. 12) Measure impact: After each change, measure performance to confirm improvements. 13) Continuous monitoring: Set up performance monitoring in your CI/CD pipeline. This methodical approach helps identify the most impactful optimizations rather than making random changes.",
            difficulty: "hard",
            tags: ["React", "Performance", "Debugging"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Bundle Size Optimization Interview Questions"
        questions={[
          {
            question: "What is tree shaking and how does it work?",
            answer: "Tree shaking is a dead code elimination technique used by modern JavaScript bundlers to remove unused code from the final bundle. How it works: 1) Static analysis: Bundlers analyze the static import/export statements in ES modules. 2) Dependency graph: The bundler builds a dependency graph of all modules. 3) Used exports identification: It identifies which exports are actually imported and used in the application. 4) Code elimination: Unused exports are removed from the final bundle. 5) Side effects consideration: Code with side effects is preserved even if not directly used. Requirements for effective tree shaking: 1) ES modules syntax (import/export) must be used. 2) The code should be side-effect free, or side effects should be properly marked. 3) The bundler (Webpack, Rollup, etc.) must be configured correctly. 4) The 'sideEffects' field in package.json can help bundlers identify side-effect free modules. Tree shaking is particularly effective for large libraries where you only use a small portion of the functionality, significantly reducing the final bundle size.",
            difficulty: "medium",
            tags: ["JavaScript", "Bundlers", "Optimization"]
          },
          {
            question: "How do you analyze the bundle size of a React application?",
            answer: "To analyze React application bundle size: 1) webpack-bundle-analyzer: Visualizes bundle content as an interactive treemap: `npm install --save-dev webpack-bundle-analyzer` and add to webpack config. 2) source-map-explorer: Analyzes JavaScript bundles using source maps: `npx source-map-explorer build/static/js/*.js`. 3) Lighthouse: Provides overall performance metrics including JavaScript size. 4) Chrome DevTools: Coverage tab shows unused JavaScript. Network tab shows download sizes. 5) Next.js: with Webpack, install @next/bundle-analyzer and run `ANALYZE=true next build --webpack`; since Next.js 16 builds use Turbopack by default, so check the Next.js docs for the Turbopack bundle analyzer (`next analyze`, since 16.1). 6) Vite/Rollup projects: rollup-plugin-visualizer (Create React App is deprecated and should not be used for new projects). 7) Bundlephobia: Check individual package sizes: bundlephobia.com. 8) Import Cost VSCode extension: Shows inline size of imported packages. 9) Performance budget tools: bundlewatch or webpack performance hints. 10) Custom scripts: Create scripts to track bundle size over time. 11) CI/CD integration: Implement size checks in your CI pipeline. These tools help identify large dependencies, duplicate code, and opportunities for code splitting, enabling targeted optimizations.",
            difficulty: "medium",
            tags: ["React", "Tools", "Analysis"]
          },
          {
            question: "What are some common causes of large bundle sizes in React applications and how would you address them?",
            answer: "Common causes of large React bundles and solutions: 1) Large dependencies: Use smaller alternatives (date-fns, Intl or Temporal instead of the legacy moment.js), import only needed parts, or use native APIs. 2) Importing entire libraries: Import specific components/functions instead of entire libraries. 3) Unused code: Regularly audit dependencies with depcheck or npm-check. 4) Duplicate dependencies: Use tools like duplicate-package-checker-webpack-plugin to find and eliminate duplicates. 5) Unoptimized images: Compress images, use WebP format, and implement lazy loading. 6) Development bundles in production: Ensure you're using production builds of React and other libraries. 7) No code splitting: Implement dynamic imports and React.lazy for route-based or component-based splitting. 8) Inefficient code: Refactor complex components and eliminate unnecessary re-renders. 9) Large polyfills: Use targeted polyfills (browserslist + core-js) instead of including all polyfills, and avoid third-party polyfill CDNs such as polyfill.io (compromised in 2024). 10) CSS bloat: Use CSS-in-JS with code splitting or PurgeCSS to eliminate unused styles. 11) Unminified code: Ensure proper minification is configured. 12) No compression: Enable Gzip or Brotli compression on your server. 13) Third-party scripts: Audit and optimize third-party scripts, load non-critical scripts asynchronously.",
            difficulty: "hard",
            tags: ["React", "Performance", "Optimization"]
          }
        ]}
      />
    </div>
  );
}
