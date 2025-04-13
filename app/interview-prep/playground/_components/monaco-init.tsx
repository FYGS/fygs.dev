"use client";

import { useEffect } from "react";
import { configureMonacoWorkers } from "@/app/_lib/monaco-loader";

// This component configures Monaco workers as early as possible
export function MonacoInit() {
  useEffect(() => {
    // Configure Monaco workers on client-side
    if (typeof window !== "undefined") {
      configureMonacoWorkers();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
