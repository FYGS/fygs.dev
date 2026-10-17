"use client";

import { useCallback, useEffect, useState } from "react";

export function useNavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isNavigating) {
      queueMicrotask(() => setProgress(0));
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
    } else {
      queueMicrotask(() => setProgress(100));
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, [isNavigating]);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  return {
    progress,
    isNavigating,
    startNavigation,
    endNavigation,
  };
}
