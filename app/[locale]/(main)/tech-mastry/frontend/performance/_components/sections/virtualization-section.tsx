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

export function VirtualizationSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Virtualization</CardTitle>
          <CardDescription>
            Techniques for efficiently rendering large lists and tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Virtualization (or windowing) is a technique that improves performance by only rendering the items that are currently visible to the user, rather than rendering all items at once.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>react-window</Badge>
            <Badge>react-virtualized</Badge>
            <Badge>Windowing</Badge>
            <Badge>DOM Performance</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="List Virtualization with react-window"
        description="Efficiently render large lists by only rendering visible items"
        code={`import { List, useDynamicRowHeight } from 'react-window'; // react-window 2.x

// Without virtualization - renders all items at once
function LargeList({ items }) {
  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      {items.map((item, index) => (
        <div key={item} style={{ height: '50px', padding: '10px' }}>
          Item {index}: {item}
        </div>
      ))}
    </div>
  );
}

// Row component defined OUTSIDE the parent component.
// If it were declared inside VirtualizedList, it would be a new component
// type on every render: React would unmount and remount every visible row
// each time the parent re-renders (lost state, lost focus, wasted work).
// It receives index, style and ariaAttributes from List, plus rowProps.
function Row({ index, style, ariaAttributes, items }) {
  return (
    <div {...ariaAttributes} style={{ ...style, padding: '10px' }}>
      Item {index}: {items[index]}
    </div>
  );
}

// With virtualization - only renders visible rows (plus a small overscan)
function VirtualizedList({ items }) {
  return (
    <List
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={50}
      rowProps={{ items }} // extra props for Row (not index, style or ariaAttributes)
      style={{ height: 400 }}
    />
  );
}

// Usage
function App() {
  // Create an array with 10,000 items
  const items = Array.from({ length: 10000 }, (_, i) => 'Item ' + i);

  return (
    <div>
      <h2>Without Virtualization (Slow)</h2>
      <LargeList items={items} />

      <h2>With Virtualization (Fast)</h2>
      <VirtualizedList items={items} />
    </div>
  );
}

// Variable size rows: rowHeight can be a function (index, rowProps) => number
function VariableSizeListExample({ items }) {
  return (
    <List
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={(index) => (index % 2 === 0 ? 80 : 50)} // even rows are taller
      rowProps={{ items }}
      style={{ height: 400 }}
    />
  );
}

// Unknown heights: useDynamicRowHeight measures rows with a ResizeObserver
// (less efficient than known sizes: prefer fixed or computed heights when possible)
function DynamicListExample({ items }) {
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 50 });

  return (
    <List
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={rowHeight}
      rowProps={{ items }}
      style={{ height: 400 }}
    />
  );
}`}
        explanation={
          <div>
            <p>
              Virtualization (also known as windowing) is a technique that significantly improves performance when rendering large lists or tables by only rendering the items that are currently visible in the viewport.
            </p>
            
            <p className="mt-3">
              Key benefits of virtualization:
            </p>
            
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Reduced DOM nodes</strong>: Only visible items have DOM nodes, dramatically reducing memory usage.
              </li>
              <li>
                <strong>Improved rendering performance</strong>: Fewer elements to render means faster initial and update renders.
              </li>
              <li>
                <strong>Smoother scrolling</strong>: Less work for the browser during scrolling leads to a smoother user experience.
              </li>
              <li>
                <strong>Reduced memory usage</strong>: Fewer DOM nodes means less memory consumption.
              </li>
            </ol>
            
            <p className="mt-3">
              In the first example, <code>LargeList</code> renders all 10,000 items at once, which can cause significant performance issues:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Slow initial render time</li>
              <li>High memory usage</li>
              <li>Potential browser lag or freezing</li>
              <li>Janky scrolling</li>
            </ul>
            
            <p className="mt-3">
              In contrast, <code>VirtualizedList</code> using <code>react-window</code> only renders the items that are currently visible (plus a small buffer). As the user scrolls, items that leave the viewport are removed from the DOM, and new items entering the viewport are added.
            </p>
            
            <p className="mt-3">
              The <code>VariableSizeListExample</code> shows rows of different heights: in react-window 2.x, <code>rowHeight</code> can be a number, a percentage string, a function of the row index, or the result of <code>useDynamicRowHeight</code> when heights are unknown until rendered. Note that <code>Row</code> is declared outside the components that use it: a row component created inside a parent is a new component type at every render, so React would remount all visible rows each time.
            </p>
            
            <p className="mt-3">
              Libraries like <code>react-window</code> (a <code>List</code> and a <code>Grid</code> component since version 2) and <code>react-virtualized</code> provide optimized implementations of virtualization for React applications, with features like:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fixed and variable size lists and grids</li>
              <li>Horizontal and vertical scrolling</li>
              <li>Auto-sizing based on content</li>
              <li>Scroll restoration</li>
              <li>Infinite loading</li>
            </ul>
          </div>
        }
        tips={[
          "Use virtualization for lists with more than a few hundred items",
          "Consider the trade-off between smooth scrolling and initial load time",
          "Measure performance before and after implementing virtualization",
          "Declare the row (or cell) component outside the parent component, and pass data through rowProps, so rows are not remounted at each render",
          "react-window 2.x replaced FixedSizeList and VariableSizeList with List (rowComponent, rowCount, rowHeight, rowProps): check which major version your examples target",
          "For complex use cases, react-virtualized or headless libraries such as TanStack Virtual offer more features than react-window; compare current bundle sizes on bundlephobia.com"
        ]}
      />
      
      <CodeExample
        title="Grid Virtualization and Advanced Techniques"
        description="Virtualize two-dimensional grids and implement advanced features"
        code={`import { Grid, List } from 'react-window'; // react-window 2.x

// Cell component defined OUTSIDE the parent component (no remount on re-render)
function Cell({ columnIndex, rowIndex, style, items, columnCount }) {
  const index = rowIndex * columnCount + columnIndex;

  if (index >= items.length) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '10px', border: '1px solid #ddd' }}>
      Item {index}: {items[index]}
    </div>
  );
}

// Grid virtualization example
function VirtualizedGrid({ items, columnCount }) {
  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <Grid
      cellComponent={Cell}
      cellProps={{ items, columnCount }}
      columnCount={columnCount}
      columnWidth={200}
      rowCount={rowCount}
      rowHeight={100}
      style={{ height: 400, width: 600 }}
    />
  );
}

// Infinite loading example (with onRowsRendered)
function InfiniteRow({ index, style, items }) {
  // The extra last row is the loading indicator
  if (index >= items.length) {
    return <div style={style}>Loading...</div>;
  }

  return (
    <div style={style}>
      Item {index}: {items[index]}
    </div>
  );
}

function InfiniteList({ items, loadMoreItems, hasMoreItems, isLoading }) {
  // One more row than the loaded items while more data is available
  const rowCount = hasMoreItems ? items.length + 1 : items.length;

  return (
    <List
      rowComponent={InfiniteRow}
      rowCount={rowCount}
      rowHeight={50}
      rowProps={{ items }}
      onRowsRendered={({ stopIndex }) => {
        // Load the next page when the last loaded row becomes visible
        if (hasMoreItems && !isLoading && stopIndex >= items.length - 1) {
          loadMoreItems();
        }
      }}
      style={{ height: 400 }}
    />
  );
}

// Auto-sizing: react-window 2.x measures its container (ResizeObserver),
// so the AutoSizer package of v1 is no longer needed.
// Give the list a size through CSS, e.g. a parent with a height.
function AutoSizedList({ items }) {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <List
        rowComponent={Row} // the Row defined above, outside any component
        rowCount={items.length}
        rowHeight={50}
        rowProps={{ items }}
        style={{ height: '100%' }}
      />
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              Beyond simple list virtualization, there are several advanced techniques and use cases for virtualization in React applications.
            </p>
            
            <p className="mt-3">
              <strong>Grid Virtualization</strong>
            </p>
            
            <p>
              The <code>VirtualizedGrid</code> example demonstrates how to virtualize a two-dimensional grid of items. This is useful for:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Data tables with many rows and columns</li>
              <li>Image galleries</li>
              <li>Spreadsheet-like interfaces</li>
              <li>Calendars</li>
            </ul>
            
            <p className="mt-3">
              The key difference from list virtualization is that we need to calculate both row and column indices and handle the case where the last row might not be completely filled.
            </p>
            
            <p className="mt-3">
              <strong>Infinite Loading</strong>
            </p>
            
            <p>
              The <code>InfiniteList</code> example shows how to implement infinite scrolling with virtualization. This is useful for:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Social media feeds</li>
              <li>Search results</li>
              <li>Product listings</li>
              <li>Any data that needs to be loaded incrementally</li>
            </ul>
            
            <p className="mt-3">
              In react-window 2.x, the <code>onRowsRendered</code> callback reports which rows are visible, which is enough to trigger the next page when the user nears the end of the list (guard against concurrent requests with a loading flag). The react-window documentation also has a dedicated infinite loading page.
            </p>
            
            <p className="mt-3">
              <strong>Auto-sizing</strong>
            </p>
            
            <p>
              The <code>AutoSizedList</code> example demonstrates how to make a virtualized list fill its container. This is useful for:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Responsive layouts</li>
              <li>Resizable panels</li>
              <li>Full-screen applications</li>
              <li>Dynamic UIs</li>
            </ul>
            
            <p className="mt-3">
              With react-window 1.x you needed the <code>AutoSizer</code> component from <code>react-virtualized-auto-sizer</code> to measure the container. react-window 2.x measures its own container (with a <code>ResizeObserver</code>), so a CSS height on the list or its parent is enough.
            </p>
            
            <p className="mt-3">
              These advanced techniques can be combined to create highly performant and flexible UIs that can handle large amounts of data while maintaining smooth performance.
            </p>
          </div>
        }
        tips={[
          "Use the React DevTools Profiler to measure the performance impact of virtualization",
          "react-window 2.x needs a ResizeObserver (available in all current browsers) unless you give explicit pixel dimensions",
          "For infinite loading, implement proper loading states and error handling",
          "Test your virtualized components with different screen sizes and device capabilities"
        ]}
        interviewQuestions={[
          {
            question: "When should you use virtualization in a React application?",
            answer: "You should use virtualization in React when: 1) Rendering large lists or tables with hundreds or thousands of items. 2) Users experience performance issues like slow rendering, janky scrolling, or high memory usage. 3) The application needs to display an unknown or potentially large amount of data. 4) You're building infinite scrolling interfaces where new data is continuously loaded. 5) Working with complex item rendering that includes images, rich text, or nested components. 6) Supporting lower-end devices or mobile browsers where DOM performance is critical. 7) Your application's performance metrics show that list rendering is a bottleneck. 8) Users report lag when scrolling through large datasets. 9) You need to maintain smooth 60fps scrolling performance. 10) Memory usage grows significantly with larger datasets. The key indicator is when the number of DOM nodes becomes a performance concern, typically with lists of more than a few hundred items, especially if each item is complex.",
            difficulty: "medium",
            tags: ["React", "Performance", "UX"]
          },
          {
            question: "What are the challenges and limitations of implementing virtualization?",
            answer: "Challenges and limitations of virtualization: 1) Variable height content: Handling items with dynamic heights can be complex and may require additional measurements or estimations. 2) Scroll position restoration: Maintaining scroll position when navigating back to a list can be tricky. 3) Search and find operations: Searching within virtualized content requires special handling since not all items are rendered. 4) Accessibility concerns: Screen readers may have issues with dynamically changing content. 5) SEO implications: Search engines might not see all content if it's loaded dynamically. 6) Complex interactions: Drag and drop, multi-selection, or other interactive features require additional work. 7) Print layouts: Printing virtualized content may not show all items. 8) Animation limitations: Animating items entering or leaving the viewport can be challenging. 9) Initial implementation complexity: Setting up virtualization correctly requires understanding the underlying concepts. 10) Testing challenges: Testing virtualized lists requires simulating scroll events and viewport changes. 11) Integration with other libraries: Some third-party components may not work well with virtualization. 12) Mobile-specific issues: Touch events and momentum scrolling can behave differently with virtualized content.",
            difficulty: "hard",
            tags: ["React", "Limitations", "Implementation"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Virtualization Interview Questions"
        questions={[
          {
            question: "Compare and contrast react-window and react-virtualized. When would you choose one over the other?",
            answer: "Comparing react-window and react-virtualized: 1) Size: react-window is a much smaller library with a narrower API (check current gzip sizes on bundlephobia.com rather than relying on figures from older articles). 2) API: react-window has a simpler, more focused API, while react-virtualized offers more features and flexibility. 3) Components: react-window 2.x provides List and Grid components (v1 named them FixedSizeList, VariableSizeList, FixedSizeGrid and VariableSizeGrid) with a rowComponent/cellComponent API, while react-virtualized includes additional components like Table, Masonry, and Collection. 4) Features: react-virtualized includes built-in support for cell measuring, scrolling indicators, and more. react-window 2.x covers variable and dynamic row heights (useDynamicRowHeight), auto-sizing and scroll-to methods itself. 5) Performance: react-window is designed to do less work than react-virtualized. 6) Origin: react-window was written by the same author as a smaller, more focused alternative to react-virtualized. Also consider headless options such as TanStack Virtual or react-virtuoso. Choose react-window when: You need a lightweight solution, have simpler use cases, or are concerned about bundle size. Choose react-virtualized when: You need advanced features like multi-directional scrolling, auto-sizing, sophisticated tables, or masonry layouts. The decision often comes down to balancing bundle size against feature requirements. For new projects, react-window is generally recommended unless you specifically need features only available in react-virtualized.",
            difficulty: "medium",
            tags: ["React", "Libraries", "Comparison"]
          },
          {
            question: "How would you implement virtualization for a list with items of variable and unknown heights?",
            answer: "Implementing virtualization for variable and unknown heights: 1) Use dynamic measurement: The CellMeasurer component from react-virtualized, or useDynamicRowHeight (react-window 2.x, based on ResizeObserver), or a library that measures dynamically such as TanStack Virtual or react-virtuoso. 2) Two-pass rendering approach: First render to measure, then render again with the measured sizes. 3) Height estimation with correction: Start with estimated heights, then adjust as actual measurements become available. 4) Cache measurements: Store height measurements to avoid re-measuring items. 5) Implementation steps: a) Create a cache to store measured heights: `const cache = new CellMeasurerCache({ defaultHeight: 50, fixedWidth: true });` b) Wrap list items with a measurement component: `<CellMeasurer cache={cache} parent={parent} columnIndex={0} rowIndex={index}>{({ registerChild }) => <div ref={registerChild}>Content</div>}</CellMeasurer>` c) Use the cache for row sizing: `<List deferredMeasurementCache={cache} rowHeight={cache.rowHeight} ... />` 6) Handle resize events: Re-measure when container size changes. 7) Progressive enhancement: Show estimated content initially, then refine as measurements complete. 8) Prefetch and premeasure: Measure items just outside the visible area to reduce visible adjustments. 9) Debounce scroll events: Prevent excessive re-rendering during rapid scrolling. This approach balances performance with accuracy, providing smooth scrolling even with unpredictable content heights.",
            difficulty: "hard",
            tags: ["React", "Implementation", "Advanced"]
          },
          {
            question: "How does virtualization affect accessibility, and what can you do to ensure your virtualized lists are accessible?",
            answer: "Virtualization and accessibility considerations: 1) Screen reader challenges: Screen readers may not detect dynamically rendered content properly. 2) Keyboard navigation: Users may have difficulty navigating through virtualized content with keyboards. 3) Focus management: Focus can be lost when items are unmounted during scrolling. 4) Accessibility solutions: a) Proper ARIA attributes: Add role=\"list\" and role=\"listitem\" to appropriate elements. b) Maintain tabIndex: Ensure proper tab order is maintained even as items are virtualized. c) Implement keyboard navigation: Add custom keyboard handlers for arrow keys to navigate the list. d) Focus restoration: Save and restore focus position when items are unmounted and remounted. e) Announce content changes: Use aria-live regions to announce when new content is loaded. f) Provide total counts: Use aria-setsize and aria-posinset to indicate total items and current position. g) Skip links: Add mechanisms to skip to different sections of large lists. h) Test with screen readers: Regularly test with NVDA, JAWS, and VoiceOver. 5) Technical implementation: a) Use scrollToIndex API to programmatically scroll to focused items. b) Implement useEffect hooks to manage focus when items change. c) Maintain a larger overscan (buffer) for keyboard navigation. d) Consider server-side rendering for initial content. Balancing performance with accessibility requires thoughtful implementation and regular testing with assistive technologies.",
            difficulty: "hard",
            tags: ["Accessibility", "UX", "Best Practices"]
          }
        ]}
      />
    </div>
  );
}
