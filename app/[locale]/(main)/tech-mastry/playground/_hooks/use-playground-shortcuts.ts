"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { usePlaygroundStore } from "../_stores/playground-store";

/**
 * Global keyboard shortcuts for the playground.
 * Must be used inside a component mounted on the playground page.
 */
export function usePlaygroundShortcuts() {
  const executeCode = usePlaygroundStore((s) => s.executeCode);
  const clearConsole = usePlaygroundStore((s) => s.clearConsole);
  const formatCode = usePlaygroundStore((s) => s.formatCode);
  const createSnapshot = usePlaygroundStore((s) => s.createSnapshot);
  const toggleFileExplorer = usePlaygroundStore((s) => s.toggleFileExplorer);
  const toggleConsole = usePlaygroundStore((s) => s.toggleConsole);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Enter → Run
      if (ctrl && e.key === "Enter") {
        e.preventDefault();
        clearConsole();
        executeCode();
        return;
      }

      // Ctrl+S → Save snapshot
      if (ctrl && e.key === "s") {
        e.preventDefault();
        createSnapshot("Ctrl+S");
        toast.success("Snapshot saved");
        return;
      }

      // Ctrl+Shift+F → Format
      if (ctrl && e.shiftKey && e.key === "F") {
        e.preventDefault();
        formatCode();
        return;
      }

      // Ctrl+B → Toggle sidebar
      if (ctrl && e.key === "b") {
        e.preventDefault();
        toggleFileExplorer();
        return;
      }

      // Ctrl+J → Toggle bottom panel (console)
      if (ctrl && e.key === "j") {
        e.preventDefault();
        toggleConsole();
        return;
      }

      // Ctrl/Cmd+I → AI assistant (open it, or focus its input when open)
      if (ctrl && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        window.dispatchEvent(new Event("pg-open-ai-assistant"));
        return;
      }

      // Ctrl+K → Command palette (handled in pg-command-palette)
      // Escape → handled by dialogs
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    executeCode,
    clearConsole,
    formatCode,
    createSnapshot,
    toggleFileExplorer,
    toggleConsole,
  ]);
}
