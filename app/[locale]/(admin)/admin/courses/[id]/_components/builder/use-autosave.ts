"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSaveReporter } from "./save-status";

type SaveResult = { success: true } | { success: false; error: string };

interface Options<T extends object> {
  /** Unique name of the editor in the save summary. */
  name: string;
  save: (patch: Partial<T>) => Promise<SaveResult>;
  delay?: number;
}

/**
 * Debounced saving of partial updates. Edits made while a save is running are kept and sent right after;
 * a failed save keeps its changes and offers `retry`. Pending changes are flushed when the editor unmounts
 * and the browser warns on unload while any remain.
 */
export function useAutosave<T extends object>({ name, save, delay = 900 }: Options<T>) {
  const report = useSaveReporter(name);
  const pending = useRef<Partial<T>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const saveRef = useRef(save);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveRef.current = save;
  });

  /** Resolves true when nothing is left to save, false when a save failed (the changes are kept). */
  const run = useCallback(async (): Promise<boolean> => {
    // a save in flight finishes first; what was typed meanwhile is then sent by this call
    while (running.current) await new Promise((resolve) => setTimeout(resolve, 25));
    running.current = true;
    try {
      while (Object.keys(pending.current).length > 0) {
        const batch = pending.current;
        pending.current = {};
        report("saving");
        let result: SaveResult;
        try {
          result = await saveRef.current(batch);
        } catch {
          result = { success: false, error: "Connexion perdue. Vos modifications sont conservées." };
        }
        if (!result.success) {
          // keep the failed changes underneath anything typed since
          pending.current = { ...batch, ...pending.current };
          setError(result.error);
          report("error", result.error);
          return false;
        }
        setError(null);
      }
      report("saved");
      return true;
    } finally {
      running.current = false;
    }
  }, [report]);

  const flush = useCallback((): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    return run();
  }, [run]);

  const queue = useCallback(
    (patch: Partial<T>) => {
      pending.current = { ...pending.current, ...patch };
      report("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), delay);
    },
    [delay, flush, report],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (Object.keys(pending.current).length > 0) void run();
    },
    [run],
  );

  return { queue, flush, retry: flush, error };
}
