"use client";

import { motion } from "framer-motion";
import { Copy, Expand, ExternalLink, Minimize } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import type { CodeBlockProps } from "./code-block";
import { CodeBlock } from "./code-block";

export type EnhancedCodeViewerProps = CodeBlockProps; // Reuse CodeBlock props

export function EnhancedCodeViewer({
  code,
  language,
  filename,
  theme = "dark",
  highlightLines = [],
}: EnhancedCodeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <motion.div
        layout
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            onClick={() => setIsExpanded(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
        <CodeBlock
          code={code}
          language={language}
          filename={filename}
          theme={theme}
          highlightLines={highlightLines}
        />
      </motion.div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[90vw] h-[80vh] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Code Viewer</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                >
                  <Minimize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeBlock
                code={code}
                language={language}
                filename={filename}
                theme={theme}
                highlightLines={highlightLines}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
