"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface Entry {
  state: SaveState;
  message?: string;
}

interface SaveStatusContextValue {
  report: (key: string, state: SaveState, message?: string) => void;
  entries: Record<string, Entry>;
}

const SaveStatusContext = createContext<SaveStatusContextValue | null>(null);

/**
 * Every editor of the builder (course info, the open lesson, a quiz...) reports its save state here.
 * The header shows one summary, and the browser warns before leaving while anything is unsaved.
 */
export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  const report = useCallback((key: string, state: SaveState, message?: string) => {
    setEntries((prev) => {
      const current = prev[key];
      if (current?.state === state && current.message === message) return prev;
      if (state === "idle") {
        if (!current) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { state, message } };
    });
  }, []);

  const unsaved = Object.values(entries).some((e) => e.state === "dirty" || e.state === "saving" || e.state === "error");
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const value = useMemo(() => ({ report, entries }), [report, entries]);
  return <SaveStatusContext.Provider value={value}>{children}</SaveStatusContext.Provider>;
}

function useSaveStatus() {
  const ctx = useContext(SaveStatusContext);
  if (!ctx) throw new Error("SaveStatusProvider is missing");
  return ctx;
}

/** A stable `report` function bound to one editor; its entry disappears when the editor unmounts. */
export function useSaveReporter(key: string) {
  const { report } = useSaveStatus();
  const keyRef = useRef(key);
  useEffect(() => {
    const k = keyRef.current;
    return () => report(k, "idle");
  }, [report]);
  return useCallback((state: SaveState, message?: string) => report(keyRef.current, state, message), [report]);
}

/** The one-line summary shown in the builder header. */
export function SaveIndicator({ className }: { className?: string }) {
  const { entries } = useSaveStatus();
  const list = Object.values(entries);
  const error = list.find((e) => e.state === "error");
  const saving = list.some((e) => e.state === "saving");
  const dirty = list.some((e) => e.state === "dirty");
  const saved = list.some((e) => e.state === "saved");

  let content: ReactNode = null;
  if (error) {
    content = (
      <>
        <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden />
        <span className="text-destructive">{error.message ?? "Échec de la sauvegarde"}</span>
      </>
    );
  } else if (saving || dirty) {
    content = (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        <span>{saving ? "Enregistrement…" : "Modifications en attente…"}</span>
      </>
    );
  } else if (saved) {
    content = (
      <>
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
        <span>Enregistré</span>
      </>
    );
  }

  return (
    <div role="status" aria-live="polite" className={cn("flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground", className)}>
      {content}
    </div>
  );
}
