"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Honour the OS-level "reduce motion" preference for every framer-motion animation:
 * with `reducedMotion="user"` transform and layout animations are disabled while
 * opacity/colour changes (non-vestibular) still play. CSS animations are covered by the
 * prefers-reduced-motion block in app/globals.css.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
