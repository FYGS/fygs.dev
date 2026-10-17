"use client";

import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

// Demo component for useCallback
export function UseCallbackDemo() {
  const [count, setCount] = useState(0);

  // Function without useCallback - new reference on every render
  const handleClickWithoutCallback = () => {
    console.log("Button clicked without callback");
    alert("Button clicked! Count: " + count);
  };

  // Function with useCallback - same reference unless dependencies change
  const handleClickWithCallback = useCallback(() => {
    console.log("Button clicked with callback");
    alert("Button clicked! Count: " + count);
  }, [count]); // Only changes when count changes

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md space-y-2">
          <h3 className="text-sm font-medium">Without useCallback</h3>
          <Button onClick={handleClickWithoutCallback}>Click Me</Button>
          <p className="text-xs text-muted-foreground">
            New function reference on every render
          </p>
        </div>

        <div className="p-4 border rounded-md space-y-2">
          <h3 className="text-sm font-medium">With useCallback</h3>
          <Button onClick={handleClickWithCallback}>Click Me</Button>
          <p className="text-xs text-muted-foreground">
            Stable function reference (until count changes)
          </p>
        </div>
      </div>

      <div className="bg-gray-900 p-2 rounded-md">
        <p className="text-xs">
          Open the console to see logs. The real benefit is when passing these
          functions as props to memoized child components.
        </p>
      </div>
    </div>
  );
}
