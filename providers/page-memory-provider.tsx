"use client";

import { usePageMemory } from "@/hooks/use-page-memory";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

interface PageMemoryContextType {
  savePage: (path: string) => void;
  getPageScroll: (path: string) => number;
  getLastVisitedPage: () => string | undefined;
  lastVisitedPages: Array<{
    path: string;
    scroll: number;
    timestamp: number;
  }>;
}

const PageMemoryContext = createContext<PageMemoryContextType | null>(null);

export function PageMemoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageMemory = usePageMemory();
  const isInitialMount = useRef(true);
  const lastPathname = useRef(pathname);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fonction optimisée pour sauvegarder la page
  const debouncedSavePage = useCallback(
    (path: string) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(() => {
        pageMemory.savePage(path);
      }, 100);
    },
    [pageMemory]
  );

  // Gérer les changements de page
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (lastPathname.current !== pathname) {
      debouncedSavePage(lastPathname.current);
      lastPathname.current = pathname;
    }

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [pathname, debouncedSavePage]);

  // Gérer la sauvegarde avant la fermeture
  useEffect(() => {
    const handleBeforeUnload = () => {
      pageMemory.savePage(pathname);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, pageMemory]);

  return (
    <PageMemoryContext.Provider value={pageMemory}>
      {children}
    </PageMemoryContext.Provider>
  );
}

export const usePageMemoryContext = () => {
  const context = useContext(PageMemoryContext);
  if (!context) {
    throw new Error("usePageMemory must be used within PageMemoryProvider");
  }
  return context;
};
