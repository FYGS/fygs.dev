"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Copy, Download, Share2, Terminal } from "lucide-react";
import { useState } from "react";

export interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  theme?: "dark" | "light"; // Add theme prop
  highlightLines?: number[];
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightLines = [],
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: filename || `Code snippet - ${language}`,
        text: code,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-mono">
            {filename || language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="Copy code"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="Download code"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="Share code"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="p-4 overflow-x-auto font-mono text-sm">
          {code.split("\n").map((line, i) => (
            <div
              key={i}
              className={cn(
                "px-4 -mx-4",
                highlightLines.includes(i + 1) && "line-highlight"
              )}
            >
              <span className="line-number">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </pre>

        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
