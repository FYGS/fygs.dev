"use client";

import { useEffect, useState } from "react";

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let interval: NodeJS.Timeout;

    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const newProgress = (scrollTop / documentHeight) * 100;

      setProgress(Math.min(100, Math.max(0, newProgress)));
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));

      if (newProgress >= 90 && !isComplete) {
        setIsComplete(true);
        // Vous pouvez ajouter ici une logique pour enregistrer la lecture complète
      }
    };

    window.addEventListener("scroll", updateProgress);
    interval = setInterval(updateProgress, 1000);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      clearInterval(interval);
    };
  }, [isComplete]);

  return { progress, timeSpent, isComplete };
}
