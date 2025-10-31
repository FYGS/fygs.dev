"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface InteractiveDemoProps {
  initialCode: string;
  renderDemo: (code: string, container: HTMLDivElement) => void;
  height?: string;
}

export function InteractiveDemo({
  initialCode,
  renderDemo,
  height = "300px",
}: InteractiveDemoProps) {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<"editor" | "result">("result");
  const [error, setError] = useState<string | null>(null);
  const demoContainerRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setError(null);
  };

  const handleRunCode = () => {
    try {
      if (demoContainerRef.current) {
        renderDemo(code, demoContainerRef.current);
      }
      setActiveTab("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (demoContainerRef.current) {
      renderDemo(code, demoContainerRef.current);
    }
  }, [code, renderDemo]);

  return (
    <Card className="overflow-hidden border">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "editor" | "result")}
      >
        <div className="bg-muted/30 border-b px-2">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-background"
            >
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="data-[state=active]:bg-background"
            >
              Result
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="m-0">
          <div className="relative" style={{ height }}>
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-hidden bg-background"
              spellCheck="false"
              aria-label="Code editor"
            />
            <div className="absolute bottom-2 right-2">
              <Button size="sm" onClick={handleRunCode} aria-label="Run code">
                Run
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="result" className="m-0">
          <div
            className={cn(
              "p-4",
              error
                ? "bg-red-50 dark:bg-red-900/10"
                : "bg-white dark:bg-background"
            )}
            style={{ height, overflow: "auto" }}
          >
            {error ? (
              <div className="text-red-500 text-sm" role="alert">
                <p className="font-semibold">Error:</p>
                <pre className="mt-1 whitespace-pre-wrap">{error}</pre>
              </div>
            ) : (
              <div
                ref={demoContainerRef}
                role="region"
                aria-label="Demo result"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
