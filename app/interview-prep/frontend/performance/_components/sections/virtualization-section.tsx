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
        code={`import React from 'react';
import { FixedSizeList } from 'react-window';

// Without virtualization - renders all items at once
function LargeList({ items }) {
  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      {items.map((item, index) => (
        <div key={index} style={{ height: '50px', padding: '10px' }}>
          Item {index}: {item}
        </div>
      ))}
    </div>
  );
}

// With virtualization - only renders visible items
function VirtualizedList({ items }) {
  // Row renderer function - will be called only for visible items
  const Row = ({ index, style }) => (
    <div style={{ ...style, padding: '10px' }}>
      Item {index}: {items[index]}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}

// Usage
function App() {
  // Create an array with 10,000 items
  const items = Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`);
  
  return (
    <div>
      <h2>Without Virtualization (Slow)</h2>
      <LargeList items={items} />
      
      <h2>With Virtualization (Fast)</h2>
      <VirtualizedList items={items} />
    </div>
  );
}

// Variable size list example
import { VariableSizeList } from 'react-window';

function VariableSizeListExample({ items }) {
  // Function to determine the size of each item
  const getItemSize = index => {
    // Example: even items are taller
    return index % 2 === 0 ? 80 : 50;
  };
  
  const Row = ({ index, style }) => (
    <div style={{ ...style, padding: '10px' }}>
      Item {index}: {items[index]}
    </div>
  );
  
  return (
    <VariableSizeList
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {Row}
    </VariableSizeList>
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
              The <code>VariableSizeList</code> example demonstrates how to handle items of different heights, which is common in real-world applications. The <code>getItemSize</code> function determines the height of each item based on its index.
            </p>
            
            <p className="mt-3">
              Libraries like <code>react-window</code> and <code>react-virtualized</code> provide optimized implementations of virtualization for React applications, with features like:
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
          "For complex use cases, react-virtualized offers more features than react-window but has a larger bundle size"
        ]}
      />
      
      <CodeExample
        title="Grid Virtualization and Advanced Techniques"
        description="Virtualize two-dimensional grids and implement advanced features"
        code={`import React from 'react';
import { FixedSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

// Grid virtualization example
function VirtualizedGrid({ items, columnCount }) {
  const rowCount = Math.ceil(items.length / columnCount);
  
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= items.length) {
      return <div style={style} />;
    }
    
    return (
      <div style={{ ...style, padding: '10px', border: '1px solid #ddd' }}>
        Item {index}: {items[index]}
      </div>
    );
  };
  
  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={200}
      height={400}
      rowCount={rowCount}
      rowHeight={100}
      width={600}
    >
      {Cell}
    </FixedSizeGrid>
  );
}

// Infinite loading example
function InfiniteList({ items, loadMoreItems, hasMoreItems }) {
  // Total item count is current items plus one more for loading
  const itemCount = hasMoreItems ? items.length + 1 : items.length;
  
  // Are items loaded? If not, we'll show a loading indicator
  const isItemLoaded = index => !hasMoreItems || index < items.length;
  
  // Render an item or a loading indicator
  const Item = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return <div style={style}>Loading...</div>;
    }
    
    return (
      <div style={style}>
        Item {index}: {items[index]}
      </div>
    );
  };
  
  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={400}
          width="100%"
          itemCount={itemCount}
          itemSize={50}
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {Item}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}

// Auto-sizing example
function AutoSizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      Item {index}: {items[index]}
    </div>
  );
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={50}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
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
              The <code>InfiniteLoader</code> component from <code>react-window-infinite-loader</code> helps manage the loading state and trigger loading more items when the user scrolls near the end of the list.
            </p>
            
            <p className="mt-3">
              <strong>Auto-sizing</strong>
            </p>
            
            <p>
              The <code>AutoSizedList</code> example demonstrates how to make a virtualized list automatically adjust to its container&apos;s size. This is useful for:
            </p>
            
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Responsive layouts</li>
              <li>Resizable panels</li>
              <li>Full-screen applications</li>
              <li>Dynamic UIs</li>
            </ul>
            
            <p className="mt-3">
              The <code>AutoSizer</code> component from <code>react-virtualized-auto-sizer</code> measures its container and passes the dimensions to the virtualized list, allowing it to fill the available space.
            </p>
            
            <p className="mt-3">
              These advanced techniques can be combined to create highly performant and flexible UIs that can handle large amounts of data while maintaining smooth performance.
            </p>
          </div>
        }
        tips={[
          "Use the React DevTools Profiler to measure the performance impact of virtualization",
          "Consider using a debounce function for window resize events when using AutoSizer",
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
            answer: "Comparing react-window and react-virtualized: 1) Size: react-window is much smaller (~5KB vs ~30KB minified). 2) API: react-window has a simpler, more focused API, while react-virtualized offers more features and flexibility. 3) Components: react-window provides basic List and Grid components, while react-virtualized includes additional components like Table, Masonry, and Collection. 4) Features: react-virtualized includes built-in support for variable sizing, scrolling indicators, cell measuring, and more. react-window requires additional packages for some of these features. 5) Performance: react-window may have slightly better performance due to its simplified implementation. 6) Maintenance: react-window is newer and designed as a more modern replacement. Choose react-window when: You need a lightweight solution, have simpler use cases, or are concerned about bundle size. Choose react-virtualized when: You need advanced features like multi-directional scrolling, auto-sizing, sophisticated tables, or masonry layouts. The decision often comes down to balancing bundle size against feature requirements. For new projects, react-window is generally recommended unless you specifically need features only available in react-virtualized.",
            difficulty: "medium",
            tags: ["React", "Libraries", "Comparison"]
          },
          {
            question: "How would you implement virtualization for a list with items of variable and unknown heights?",
            answer: "Implementing virtualization for variable and unknown heights: 1) Use dynamic measurement: The CellMeasurer component from react-virtualized or the similar approach with react-window-dynamic. 2) Two-pass rendering approach: First render to measure, then render again with the measured sizes. 3) Height estimation with correction: Start with estimated heights, then adjust as actual measurements become available. 4) Cache measurements: Store height measurements to avoid re-measuring items. 5) Implementation steps: a) Create a cache to store measured heights: `const cache = new CellMeasurerCache({ defaultHeight: 50, fixedWidth: true });` b) Wrap list items with a measurement component: `<CellMeasurer cache={cache} index={index}>{(measure) => { return <div onLoad={measure}>Content</div>; }}</CellMeasurer>` c) Use the cache for item sizing: `<List itemSize={index => cache.getHeight(index)} />` 6) Handle resize events: Re-measure when container size changes. 7) Progressive enhancement: Show estimated content initially, then refine as measurements complete. 8) Prefetch and premeasure: Measure items just outside the visible area to reduce visible adjustments. 9) Debounce scroll events: Prevent excessive re-rendering during rapid scrolling. This approach balances performance with accuracy, providing smooth scrolling even with unpredictable content heights.",
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
