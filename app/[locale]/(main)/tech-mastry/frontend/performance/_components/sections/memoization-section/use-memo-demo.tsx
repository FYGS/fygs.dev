"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

// Demo component for useMemo
export function UseMemoDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Expensive calculation without memoization
  const calculateWithoutMemo = () => {
    console.log("Calculating without memo...");
    let sum = 0;
    for (let i = 1; i <= 1000; i++) {
      sum += i;
    }
    return sum;
  };

  // Expensive calculation with memoization
  const calculateWithMemo = useMemo(() => {
    console.log("Calculating with memo...");
    let sum = 0;
    for (let i = 1; i <= 1000; i++) {
      sum += i;
    }
    return sum;
  }, []); // Empty dependency array means this only runs once

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </Button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          className="px-3 py-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md space-y-2">
          <h3 className="text-sm font-medium">Without useMemo</h3>
          <p>Result: {calculateWithoutMemo()}</p>
          <p className="text-xs text-muted-foreground">
            Recalculates on every render
          </p>
        </div>

        <div className="p-4 border rounded-md space-y-2">
          <h3 className="text-sm font-medium">With useMemo</h3>
          <p>Result: {calculateWithMemo}</p>
          <p className="text-xs text-muted-foreground">
            Calculates only once (empty dependency array)
          </p>
        </div>
      </div>

      <div className="bg-gray-900 p-2 rounded-md">
        <p className="text-xs">
          Open the console to see calculation logs. Interact with the buttons
          and input to see the difference.
        </p>
      </div>
    </div>
  );
}
