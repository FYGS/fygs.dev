"use client";

import { toast } from "sonner";
import { Check, Copy, Download, Share2, Terminal } from "lucide-react";
import { useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

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
  theme = "dark",
  highlightLines = [],
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast("Code copied!", {
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
      toast.error("Failed to share code. Please try again.");
    }
  };

  // Get the appropriate style based on theme
  const syntaxStyle = theme === "dark" ? vscDarkPlus : vs;

  // Language mapping for better compatibility
  const getLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      py: "python",
      rb: "ruby",
      sh: "bash",
      yml: "yaml",
    };
    return languageMap[lang] || lang;
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground font-medium">
              {filename || `${language} code`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            aria-label="Copy code"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            aria-label="Download code"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            aria-label="Share code"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-h-[600px] overflow-auto code-block-scroll rounded-b-lg">
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={syntaxStyle}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "2.5rem",
            paddingRight: "0.75rem",
            color: theme === "dark" ? "#6B7280" : "#9CA3AF",
            backgroundColor: "transparent",
            borderRight: `1px solid ${
              theme === "dark" ? "#374151" : "#E5E7EB"
            }`,
            marginRight: "0.75rem",
            textAlign: "right",
            userSelect: "none",
          }}
          customStyle={
            {
              margin: 0,
              padding: "1rem",
              background: theme === "dark" ? "#1e1e1e" : "#ffffff",
              fontSize: "0.875rem",
              lineHeight: "1.5",
              borderRadius: 0,
              width: "100%",
              minWidth: "100%",
              // Force scrollbar styles
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(100, 116, 139, 0.7) rgba(30, 30, 30, 0.8)",
            } as React.CSSProperties
          }
          codeTagProps={{
            style: {
              fontFamily:
                "'Fira Code', 'Cascadia Code', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            },
          }}
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: {
              backgroundColor: highlightLines.includes(lineNumber)
                ? theme === "dark"
                  ? "rgba(59, 130, 246, 0.15)"
                  : "rgba(59, 130, 246, 0.1)"
                : "transparent",
              display: "block",
              width: "100%",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              borderLeft: highlightLines.includes(lineNumber)
                ? `3px solid ${theme === "dark" ? "#3B82F6" : "#2563EB"}`
                : "3px solid transparent",
            },
          })}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
