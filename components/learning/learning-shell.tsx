"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { itemHref, neighbours } from "@/lib/learning/outline";
import { cn } from "@/lib/utils";
import { LearningProvider, useLearning } from "./learning-context";
import { LearningSidebar } from "./learning-sidebar";
import { LearningTopBar } from "./learning-top-bar";
import { useCurrentItem } from "./use-current-item";
import type { ComponentProps } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Small screens: previous, progress, next, always at hand under the thumb. */
function MobileBar() {
  const { outline, courseSlug, openableIds, progress, mode } = useLearning();
  const current = useCurrentItem();
  const { previous, next } = current ? neighbours(outline, current.id) : { previous: null, next: null };
  const href = (item: NonNullable<typeof previous>) => (openableIds.has(item.id) ? itemHref(courseSlug, item) : `/formations/${courseSlug}`);

  return (
    <nav
      aria-label="Étape précédente ou suivante"
      className="safe-area-pb fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t bg-background px-3 py-2 md:hidden"
    >
      <Button variant="ghost" size="icon" asChild={!!previous} disabled={!previous} className="h-10 w-10 shrink-0">
        {previous ? (
          <Link href={href(previous)} aria-label={`Précédent : ${previous.title}`}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden>
            <ChevronLeft className="h-5 w-5 opacity-40" />
          </span>
        )}
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {mode !== "preview" ? (
          <>
            <Progress value={progress.percent} aria-label="Progression dans la formation" className="h-2 flex-1" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">{progress.percent} %</span>
          </>
        ) : (
          <span className="flex-1 text-center text-xs text-muted-foreground">Aperçu gratuit</span>
        )}
      </div>
      <Button variant="ghost" size="icon" asChild={!!next} disabled={!next} className="h-10 w-10 shrink-0">
        {next ? (
          <Link href={href(next)} aria-label={`Suivant : ${next.title}`}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden>
            <ChevronRight className="h-5 w-5 opacity-40" />
          </span>
        )}
      </Button>
    </nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  // Until hydration the page is laid out by CSS alone (docked on large screens, closed on small ones)
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const firstRender = useRef(true);

  const sidebarOpen = isDesktop ? !desktopCollapsed : mobileOpen;
  const toggle = useCallback(() => {
    if (isDesktop) setDesktopCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  }, [isDesktop]);
  const closeOnSmallScreen = useCallback(() => setMobileOpen(false), []);

  // After moving to another step, focus goes to its title: a screen reader announces it, Tab starts there
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = mainRef.current?.querySelector<HTMLElement>("h1");
    if (heading) {
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: false });
    } else {
      mainRef.current?.focus();
    }
  }, [pathname]);

  // The plan on a small screen is a dialog: focus moves into it, stays in it, Escape closes it and returns focus
  useEffect(() => {
    if (!mobileOpen || isDesktop) return;
    const panel = document.getElementById("learning-sidebar");
    const items = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const current = panel?.querySelector<HTMLElement>('[aria-current="page"]');
    (current ?? items()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, isDesktop]);

  return (
    <>
      <LearningTopBar sidebarOpen={sidebarOpen} onToggleSidebar={toggle} toggleRef={toggleRef} />

      {mobileOpen && !isDesktop && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeOnSmallScreen} aria-hidden />
      )}

      <LearningSidebar
        hidden={isDesktop ? desktopCollapsed : !mobileOpen}
        collapsedOnDesktop={desktopCollapsed}
        modal={mobileOpen && !isDesktop}
        onNavigate={closeOnSmallScreen}
      />

      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className={cn(
          "px-4 pb-24 pt-4 outline-hidden transition-[margin] duration-300 ease-in-out md:px-8 md:pb-12 md:pt-6",
          !desktopCollapsed && "md:ml-80",
        )}
      >
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      <MobileBar />
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
