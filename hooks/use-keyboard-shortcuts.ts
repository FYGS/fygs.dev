"use client";

import { useCallback, useEffect } from "react";

interface ShortcutMap {
  key: string;
  command?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer les raccourcis si l'utilisateur tape dans un champ de texte
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      shortcuts.forEach(({ key, command, shift, action }) => {
        const commandPressed = command ? event.metaKey || event.ctrlKey : true;
        const shiftPressed = shift ? event.shiftKey : true;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          commandPressed &&
          shiftPressed
        ) {
          event.preventDefault();
          action();
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}
