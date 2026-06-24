"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<{ success: boolean; error?: string }>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  save: () => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const initialDataRef = useRef(data);
  const isFirstRender = useRef(true);

  // Keep dataRef in sync
  dataRef.current = data;

  const save = useCallback(async () => {
    if (!enabled) return;

    setStatus("saving");
    try {
      const result = await onSave(dataRef.current);
      if (result.success) {
        setStatus("saved");
        setLastSaved(new Date());
        // Reset to idle after 2s
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [onSave, enabled]);

  useEffect(() => {
    // Skip first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Don't auto-save if data hasn't changed from initial
    if (JSON.stringify(data) === JSON.stringify(initialDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return { status, lastSaved, save };
}
