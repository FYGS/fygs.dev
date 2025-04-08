"use client";

import { Suspense } from "react";
import { LoaderContent } from "./auto-loader/loader-content";

export function AutoLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  );
}
