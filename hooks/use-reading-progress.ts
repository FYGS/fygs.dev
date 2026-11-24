"use client";

import { useCallback, useEffect, useState } from "react";

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(() => Date.now());

  const updateProgress = useCallback(() => {
    const element = document.documentElement;
    const totalHeight = element.scrollHeight - element.clientHeight;
    const currentProgress = (element.scrollTop / totalHeight) * 100;

    setProgress(Math.min(currentProgress, 100));
    setTimeSpent(Math.floor((Date.now() - startTime) / 1000));

    if (currentProgress >= 90 && !isComplete) {
      setIsComplete(true);
    }
  }, [startTime, isComplete]);

  useEffect(() => {
    window.addEventListener("scroll", updateProgress);
    const timer = setInterval(updateProgress, 1000);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      clearInterval(timer);
    };
  }, [updateProgress]);

  return { progress, timeSpent, isComplete };
}
