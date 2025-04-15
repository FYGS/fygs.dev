import { useEffect } from "react";

interface HotkeyConfig {
  key: string;
  handler: (e: KeyboardEvent) => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * @param hotkeys Array of hotkey configurations
 */
export function useHotkeys(hotkeys: HotkeyConfig[]): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if target is an input, textarea, or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Allow the "/" key to work even in inputs (except when typing)
        if (e.key !== "/" || e.target.value !== "") {
          return;
        }
      }
      
      for (const hotkey of hotkeys) {
        // Skip if hotkey is disabled
        if (hotkey.enabled === false) {
          continue;
        }
        
        // Check if the key matches
        if (
          e.key === hotkey.key &&
          (hotkey.ctrlKey === undefined || e.ctrlKey === hotkey.ctrlKey) &&
          (hotkey.altKey === undefined || e.altKey === hotkey.altKey) &&
          (hotkey.shiftKey === undefined || e.shiftKey === hotkey.shiftKey) &&
          (hotkey.metaKey === undefined || e.metaKey === hotkey.metaKey)
        ) {
          hotkey.handler(e);
          return;
        }
      }
    };
    
    // Add event listener
    window.addEventListener("keydown", handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hotkeys]);
}
