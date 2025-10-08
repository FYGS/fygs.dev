import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useEditorStore } from "../_stores/editor-store";

export const SHORTCUTS = {
  RUN: { key: "Enter", mod: true, description: "Run code" },
  SAVE: { key: "s", mod: true, description: "Save snapshot" },
  SHARE: { key: "s", mod: true, shift: true, description: "Share code" },
  FORMAT: { key: "f", mod: true, description: "Format code" },
  CLEAR: { key: "k", mod: true, description: "Clear output" },
} as const;

export function useShortcuts() {
  const { executeCode, createSnapshot, clearOutput, formatCode } =
    useEditorStore();

  const handleShortcut = useCallback(
    (shortcut: keyof typeof SHORTCUTS, action: () => void) => {
      toast(SHORTCUTS[shortcut].description, {
        duration: 1000,
        action: {
          label: "Run",
          onClick: () => {
            action();
          },
        },
      });
    },
    [] // Remove toast from dependencies
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (!mod) return;

      e.preventDefault();

      switch (true) {
        case e.key === SHORTCUTS.RUN.key:
          handleShortcut("RUN", executeCode);
          break;
        case e.key === SHORTCUTS.SAVE.key && !e.shiftKey:
          handleShortcut("SAVE", createSnapshot);
          break;
        case e.key === SHORTCUTS.FORMAT.key:
          handleShortcut("FORMAT", formatCode);
          break;
        case e.key === SHORTCUTS.CLEAR.key:
          handleShortcut("CLEAR", clearOutput);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [executeCode, createSnapshot, clearOutput, formatCode, handleShortcut]);
}
