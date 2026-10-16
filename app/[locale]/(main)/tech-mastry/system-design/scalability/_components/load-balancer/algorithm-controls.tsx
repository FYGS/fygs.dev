"use client";

import { Button } from "@/components/ui/button";
import type { Algorithm } from "./types";

interface AlgorithmControlsProps {
  algorithm: Algorithm;
  showExplanation: boolean;
  onChangeAlgorithm: (algorithm: Algorithm) => void;
  onToggleExplanation: () => void;
}

export function AlgorithmControls({
  algorithm,
  showExplanation,
  onChangeAlgorithm,
  onToggleExplanation,
}: AlgorithmControlsProps) {
  return (
        <div className="flex flex-wrap gap-3">
          <Button
            variant={
              algorithm === "round-robin" ? "default" : "outline"
            }
            size="sm"
            onClick={() => onChangeAlgorithm("round-robin")}
            className={
              algorithm === "round-robin"
                ? "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
                : "border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all duration-300"
            }
          >
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
              className="mr-1"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Round Robin
          </Button>
          <Button
            variant={
              algorithm === "least-connections"
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => onChangeAlgorithm("least-connections")}
            className={
              algorithm === "least-connections"
                ? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md shadow-purple-500/20"
                : "border-purple-500/30 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-300"
            }
          >
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
              className="mr-1"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            Least Connections
          </Button>
          <Button
            variant={algorithm === "ip-hash" ? "default" : "outline"}
            size="sm"
            onClick={() => onChangeAlgorithm("ip-hash")}
            className={
              algorithm === "ip-hash"
                ? "bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-md shadow-blue-500/20"
                : "border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300"
            }
          >
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
              className="mr-1"
            >
              <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
              <path d="m18 2 4 4-4 4" />
              <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
              <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
              <path d="m18 14 4 4-4 4" />
            </svg>
            IP Hash
          </Button>

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleExplanation()}
              className="border-gray-700 hover:bg-gray-800 transition-all duration-300"
            >
              {showExplanation ? (
                <>
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
                    className="mr-1"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                  Masquer l&apos;explication
                </>
              ) : (
                <>
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
                    className="mr-1"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Afficher l&apos;explication
                </>
              )}
            </Button>
          </div>
        </div>
  );
}
