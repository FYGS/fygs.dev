"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { KeyboardShortcutsGuide } from "@/components/keyboard-shortcuts-guide";

interface ShortcutsGuideContextType {
  open: boolean;
  openGuide: () => void;
  closeGuide: () => void;
}

const ShortcutsGuideContext = createContext<ShortcutsGuideContextType | undefined>(
  undefined
);

export function ShortcutsGuideProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press ? to open guide (? = Shift + /)
      if ((e.shiftKey || e.ctrlKey) && e.key === "?") {
        e.preventDefault();
        setOpen(true);
      }
      // Press Escape to close guide
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ShortcutsGuideContext.Provider
      value={{
        open,
        openGuide: () => setOpen(true),
        closeGuide: () => setOpen(false),
      }}
    >
      {children}
      <KeyboardShortcutsGuide open={open} onOpenChange={setOpen} />
    </ShortcutsGuideContext.Provider>
  );
}

export function useShortcutsGuide() {
  const context = useContext(ShortcutsGuideContext);
  if (!context) {
    throw new Error("useShortcutsGuide must be used within ShortcutsGuideProvider");
  }
  return context;
}
