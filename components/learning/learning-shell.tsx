"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LearningProvider, useLearning } from "./learning-context";
import { LearningSidebar } from "./learning-sidebar";
import { LearningTopBar } from "./learning-top-bar";
import type { ComponentProps } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function Frame({ children }: { children: React.ReactNode }) {
  const { progress, mode } = useLearning();
  // Until hydration the page is laid out by CSS alone (docked on large screens, closed on small ones)
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const sidebarOpen = isDesktop ? !desktopCollapsed : mobileOpen;
  const toggle = useCallback(() => {
    if (isDesktop) setDesktopCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  }, [isDesktop]);
  const closeOnSmallScreen = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <LearningTopBar sidebarOpen={sidebarOpen} onToggleSidebar={toggle} />

      {mobileOpen && !isDesktop && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeOnSmallScreen} aria-hidden />
      )}

      <LearningSidebar
        hidden={isDesktop ? desktopCollapsed : !mobileOpen}
        collapsedOnDesktop={desktopCollapsed}
        onNavigate={closeOnSmallScreen}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "px-4 pb-24 pt-4 outline-hidden transition-[margin] duration-300 ease-in-out md:px-8 md:pb-12 md:pt-6",
          !desktopCollapsed && "md:ml-80",
        )}
      >
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {mode !== "preview" && (
        <div className="safe-area-pb fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 md:hidden">
          <div className="flex items-center gap-3">
            <Progress value={progress.percent} aria-label="Progression dans la formation" className="h-2 flex-1" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">{progress.percent}%</span>
          </div>
        </div>
      )}
    </>
  );
}

export function LearningShell({
  children,
  ...provider
}: Omit<ComponentProps<typeof LearningProvider>, "children"> & { children: React.ReactNode }) {
  return (
    <LearningProvider {...provider}>
      <Frame>{children}</Frame>
    </LearningProvider>
  );
}
