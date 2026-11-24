"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getAlgorithmExplanation } from "./lib";
import type { Algorithm } from "./types";

interface AlgorithmExplanationProps {
  algorithm: Algorithm;
  show: boolean;
}

export function AlgorithmExplanation({
  algorithm,
  show,
}: AlgorithmExplanationProps) {
  return (
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs shadow-inner"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-indigo-500 mb-1">
                    {algorithm === "round-robin"
                      ? "Round Robin"
                      : algorithm === "least-connections"
                      ? "Least Connections"
                      : "IP Hash"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getAlgorithmExplanation(algorithm)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  );
}
