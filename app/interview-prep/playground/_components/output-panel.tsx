"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Layout,
  Terminal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../_hooks/use-language";
import { useEditorStore } from "../_stores/editor-store";
import { HtmlPreview } from "./html-preview";

export function OutputPanel() {
  const outputRef = useRef<HTMLPreElement>(null);
  const { output, logs, errors, status, clearOutput } = useEditorStore();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("output");
  const [isHtmlOutput, setIsHtmlOutput] = useState<boolean>(false);

  // Copy output to clipboard
  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Output copied to clipboard",
        description: "The output has been copied to your clipboard",
        duration: 3000,
      });
    }
  };

  // Clear output
  const handleClearOutput = () => {
    clearOutput();
    toast({
      title: "Output cleared",
      description: "The output has been cleared",
      duration: 3000,
    });
  };

  // Check if output is HTML (data URL or HTML content)
  useEffect(() => {
    const isHtml =
      output.startsWith("data:text/html") ||
      output.includes("<!DOCTYPE html>") ||
      output.includes("<html");
    setIsHtmlOutput(isHtml);

    // Auto-switch to output tab when HTML is detected
    if (isHtml) {
      setActiveTab("output");
      console.log("HTML output detected, switching to output tab");
    }

    // Debug output content
    if (isHtml) {
      console.log("HTML output detected, length:", output.length);
    }
  }, [output]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, logs, errors]);

  // Auto-switch to problems tab when errors occur
  useEffect(() => {
    if (errors.length > 0 && status === "error") {
      setActiveTab("problems");
    }
  }, [errors, status]);

  return (
    <div className="output-panel full-height-container">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="tabs-with-content h-full flex flex-col full-height-container"
      >
        <div className="flex items-center justify-between px-2 py-1 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <TabsList className="bg-transparent h-8">
            <TabsTrigger
              value="output"
              className="text-xs h-7 px-2 data-[state=active]:bg-muted/50"
            >
              {isHtmlOutput ? (
                <Layout className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Terminal className="w-3.5 h-3.5 mr-1" />
              )}
              <span>Output</span>
              {output && !isHtmlOutput && (
                <span className="ml-1.5 text-[10px] text-muted-foreground">
                  {output.split("\n").length} lines
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="problems"
              className="text-xs h-7 px-2 data-[state=active]:bg-muted/50"
            >
              <AlertCircle
                className={cn(
                  "w-3.5 h-3.5 mr-1",
                  errors.length && "text-destructive"
                )}
              />
              <span>Problems</span>
              {errors.length > 0 && (
                <span className="ml-1.5 px-1 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">
                  {errors.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1">
            {activeTab === "output" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyToClipboard}
                  title="Copy output"
                  disabled={!output}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClearOutput}
                  title="Clear output"
                  disabled={!output}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="output-content full-height-content">
          <TabsContent
            value="output"
            className="tab-content-container p-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col h-full full-height-content"
          >
            {isHtmlOutput ? (
              <div
                className="flex-1 h-full full-height-content"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <HtmlPreview dataUrl={output} />
              </div>
            ) : (
              <ScrollArea
                className="h-full w-full scrollable-area"
                scrollHideDelay={0}
              >
                <pre
                  ref={outputRef}
                  className={cn(
                    "output-display",
                    "transition-colors min-h-full",
                    status === "error" && "text-destructive/90",
                    status === "success" && "text-green-500/90"
                  )}
                >
                  {/* Show either output or placeholder text, but not both */}
                  {output || logs.length > 0 ? (
                    <>
                      {/* Show program output if available */}
                      {output && (
                        <div className="mb-4">
                          <div className="text-xs text-muted-foreground mb-1 pb-1 border-b border-border/30">
                            Program Output
                          </div>
                          <div className="overflow-x-auto max-w-full">
                            {output.includes("<!DOCTYPE html>") ? (
                              <div className="text-green-500 font-semibold">
                                HTML output generated successfully. View the
                                preview in the browser.
                              </div>
                            ) : (
                              output
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show console logs if available */}
                      {logs.length > 0 && (
                        <div className="console-output">
                          <div className="text-xs text-blue-400 mb-1 pb-1 border-b border-border/30">
                            Console Output
                          </div>
                          {logs.map((log, index) => {
                            // Check if log is a JSON string and try to parse it
                            let formattedLog = log;
                            try {
                              if (log.startsWith("{") || log.startsWith("[")) {
                                const parsed = JSON.parse(log);
                                formattedLog = JSON.stringify(parsed, null, 2);
                              }
                            } catch {
                              // If parsing fails, use the original log
                              formattedLog = log;
                            }

                            return (
                              <div key={index} className="py-1 overflow-x-auto">
                                <span className="text-xs text-muted-foreground mr-2">
                                  [{index + 1}]
                                </span>
                                <span
                                  className={cn(
                                    "break-words",
                                    formattedLog.includes("✅") &&
                                      "text-green-500 font-semibold",
                                    formattedLog.includes("❌") &&
                                      "text-red-500 font-semibold",
                                    formattedLog.includes("✓") &&
                                      "text-blue-500",
                                    formattedLog.includes("Starting") &&
                                      "text-yellow-500 font-semibold",
                                    formattedLog.includes("Executing") &&
                                      "text-yellow-500"
                                  )}
                                >
                                  {formattedLog}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Show placeholder text if no output or logs */
                    <div className="text-muted-foreground italic">
                      No output yet. Run your code to see results.
                      {language === "html" || language === "css" ? (
                        <div className="mt-2">
                          HTML and CSS will be rendered in a preview.
                        </div>
                      ) : null}
                    </div>
                  )}
                </pre>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent
            value="problems"
            className="tab-content-container p-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col full-height-content"
          >
            <ScrollArea className="w-full scrollable-area" scrollHideDelay={0}>
              <div className="p-4 space-y-3">
                {errors.length > 0 ? (
                  errors.map((error, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 text-sm text-destructive"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-wrap break-words overflow-x-auto">
                        {error}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No problems found</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
