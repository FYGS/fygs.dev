"use client";

import { useCallback, useEffect } from "react";

interface ShortcutMap {
  key: string;
  command?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/** Whether the keystroke is meant for a field, an editor or a widget that takes typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true;
  }
  return target.closest('[contenteditable=""], [contenteditable="true"], [role="textbox"], [role="combobox"], [role="searchbox"]') !== null;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Typing in a field or in the rich-text editor must never navigate away
      if (isTypingTarget(event.target) || event.isComposing) return;

      shortcuts.forEach(({ key, command, shift, action }) => {
        const commandPressed = event.metaKey || event.ctrlKey;
        // A plain letter shortcut is a plain letter: Ctrl+R (reload), Alt+... are the browser's own
        if (command ? !commandPressed : commandPressed || event.altKey) return;
        const shiftPressed = shift ? event.shiftKey : true;

        if (event.key.toLowerCase() === key.toLowerCase() && shiftPressed) {
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
