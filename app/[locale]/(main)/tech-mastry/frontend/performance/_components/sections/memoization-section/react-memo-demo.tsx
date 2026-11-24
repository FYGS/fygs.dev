"use client";

import { Button } from "@/components/ui/button";
import { memo, useState } from "react";

// Regular component that will re-render on every parent render
export function RegularComponent({ label }: { label: string }) {
  console.log(`RegularComponent rendered: ${label}`);
  return (
    <div className="p-4 border rounded-md bg-gray-800">
      <p>{label}</p>
    </div>
  );
}

// Memoized component that will only re-render when its props change
export const MemoizedComponent = memo(function MemoizedComponent({
  label,
}: {
  label: string;
}) {
  console.log(`MemoizedComponent rendered: ${label}`);
  return (
    <div className="p-4 border rounded-md bg-gray-800">
      <p>{label}</p>
    </div>
  );
});

// Demo component to show the difference between regular and memoized components
export function ReactMemoDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("Hello World");

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setText(text === "Hello World" ? "Hello React" : "Hello World")
          }
        >
          Toggle Text
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Regular Component</h3>
          <RegularComponent label={text} />
          <p className="text-xs text-muted-foreground">
            Re-renders on every parent render
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Memoized Component</h3>
          <MemoizedComponent label={text} />
          <p className="text-xs text-muted-foreground">
            Only re-renders when props change
          </p>
        </div>
      </div>

      <div className="bg-gray-900 p-2 rounded-md">
        <p className="text-xs">
          Open the console to see render logs. Click &quot;Increment Count&quot; to see
          the difference.
        </p>
      </div>
    </div>
  );
}
