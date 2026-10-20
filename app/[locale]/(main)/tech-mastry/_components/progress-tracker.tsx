"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useProgress } from "../_hooks/use-progress";
import { normalizePath } from "../_utils/progress-model";

const MINUTE_MS = 60_000;
const SECTION = "/tech-mastry/";
// The dashboard shows the progress, it is not something to learn
const NOT_TRACKED = new Set(["/tech-mastry/dashboard"]);

/**
 * Records, for the dashboard, which TechMastery topics the learner opens and for how long.
 * Mounted once in the section layout; renders nothing. Time only counts while the tab is visible.
 */
export function ProgressTracker() {
  const pathname = usePathname();
  const { trackPageVisit, trackTimeSpent } = useProgress();
  const path = normalizePath(pathname ?? "/");
  const tracked = path.startsWith(SECTION) && !NOT_TRACKED.has(path);

  useEffect(() => {
    if (!tracked) return;
    trackPageVisit(path);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") trackTimeSpent(path, 1);
    }, MINUTE_MS);
    return () => clearInterval(timer);
  }, [path, tracked, trackPageVisit, trackTimeSpent]);

  return null;
}
