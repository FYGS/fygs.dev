"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  usePanelRef,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { usePlaygroundShortcuts } from "../_hooks/use-playground-shortcuts";
import { usePlaygroundStore } from "../_stores/playground-store";
import { PgCodeEditor } from "./pg-code-editor";
import { PgCommandPalette } from "./pg-command-palette";
import { PgConsole } from "./pg-console";
import { PgFileTree } from "./pg-file-tree";
import { PgPreview } from "./pg-preview";
import { PgSettingsDialog } from "./pg-settings-dialog";
import { PgStatusBar } from "./pg-status-bar";
import { PgTabBar } from "./pg-tab-bar";
import { PgTemplateDialog } from "./pg-template-dialog";
import { PgToolbar } from "./pg-toolbar";

// Markdown + syntax highlighting are only needed once the assistant is opened
const PgAiPanel = dynamic(() => import("./pg-ai-panel").then((m) => m.PgAiPanel), {
  ssr: false,
});

// ── Mobile Breakpoint Guard ──────────────────────────────────────────────────

function MobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="dark flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 bg-[#1e1e1e] px-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20">
          <svg
            className="h-8 w-8 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Desktop Experience Required
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The Playground is optimized for desktop and large screens. Please
            switch to a device with a screen width of at least 1024px for the
            best experience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Main Layout ──────────────────────────────────────────────────────────────

export function PgLayout() {
  // Register global shortcuts
  usePlaygroundShortcuts();

  const layout = usePlaygroundStore((s) => s.layout);
  const setLayout = usePlaygroundStore((s) => s.setLayout);
  const importFromUrl = usePlaygroundStore((s) => s.importFromUrl);
  const bootWebContainer = usePlaygroundStore((s) => s.bootWebContainer);
  const aiPanelOpen = usePlaygroundStore((s) => s.aiPanelOpen);

  // Panel refs for programmatic collapse / expand
  const fileExplorerRef = usePanelRef();
  const consoleRef = usePanelRef();
  const previewRef = usePanelRef();

  // Sync store → panel refs whenever layout toggles change
  const syncPanel = useCallback(
    (
      ref: React.RefObject<PanelImperativeHandle | null>,
      shouldShow: boolean,
    ) => {
      const panel = ref.current;
      if (!panel) return;
      if (shouldShow && panel.isCollapsed()) panel.expand();
      if (!shouldShow && !panel.isCollapsed()) panel.collapse();
    },
    [],
  );

  useEffect(() => {
    syncPanel(fileExplorerRef, layout.showFileExplorer);
  }, [layout.showFileExplorer, syncPanel, fileExplorerRef]);

  useEffect(() => {
    syncPanel(consoleRef, layout.showConsole);
  }, [layout.showConsole, syncPanel, consoleRef]);

  useEffect(() => {
    syncPanel(previewRef, layout.showPreview);
  }, [layout.showPreview, syncPanel, previewRef]);

  // Command palette, toolbar and Ctrl+I: open the AI assistant, or focus it when already open
  useEffect(() => {
    const onOpen = () => {
      const state = usePlaygroundStore.getState();
      if (state.aiPanelOpen) window.dispatchEvent(new Event("pg-focus-ai-assistant"));
      else state.setAiPanelOpen(true);
    };
    window.addEventListener("pg-open-ai-assistant", onOpen);
    return () => window.removeEventListener("pg-open-ai-assistant", onOpen);
  }, []);

  // On mount: restore the saved playground, then apply a ?code= link on top of it.
  // The store skips hydration at import so that the first client render matches the
  // server's; restoring after mount keeps the user's files, tabs and settings.
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(usePlaygroundStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("code");
      if (encoded) {
        importFromUrl(encoded);
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [importFromUrl]);

  // Auto-boot WebContainer on mount (lazy, non-blocking)
  useEffect(() => {
    // Delay boot slightly to let the UI render first
    const timer = setTimeout(() => {
      bootWebContainer();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep store in sync when user drags a panel to collapsed / expanded size
  const handleFileExplorerResize = useCallback(
    (size: { asPercentage: number }) => {
      const storeVal = usePlaygroundStore.getState().layout.showFileExplorer;
      const isCollapsed = size.asPercentage <= 0;
      if (isCollapsed && storeVal) setLayout({ showFileExplorer: false });
      if (!isCollapsed && !storeVal) setLayout({ showFileExplorer: true });
    },
    [setLayout],
  );

  const handleConsoleResize = useCallback(
    (size: { asPercentage: number }) => {
      const storeVal = usePlaygroundStore.getState().layout.showConsole;
      const isCollapsed = size.asPercentage <= 0;
      if (isCollapsed && storeVal) setLayout({ showConsole: false });
      if (!isCollapsed && !storeVal) setLayout({ showConsole: true });
    },
    [setLayout],
  );

  const handlePreviewResize = useCallback(
    (size: { asPercentage: number }) => {
      const storeVal = usePlaygroundStore.getState().layout.showPreview;
      const isCollapsed = size.asPercentage <= 0;
      if (isCollapsed && storeVal) setLayout({ showPreview: false });
      if (!isCollapsed && !storeVal) setLayout({ showPreview: true });
    },
    [setLayout],
  );

  return (
    <MobileGuard>
      <TooltipProvider delayDuration={200}>
        <div className="dark flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#1e1e1e] text-white">
          <h1 className="sr-only">Playground</h1>
          {/* Top Toolbar */}
          <PgToolbar />

          {/* Main Area */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="h-full min-w-0 flex-1">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* ─── File Explorer Sidebar ─── */}
              <ResizablePanel
                id="file-explorer"
                panelRef={fileExplorerRef}
                defaultSize="15%"
                minSize="10%"
                maxSize="30%"
                collapsible
                collapsedSize="0%"
                onResize={handleFileExplorerResize}
                className="bg-[#252526]"
              >
                <PgFileTree />
              </ResizablePanel>

              <ResizableHandle
                withHandle
                className="w-[3px] bg-[#333] hover:bg-blue-500/60 active:bg-blue-500 transition-colors data-[separator=active]:bg-blue-500"
              />

              {/* ─── Editor + Console (vertical split) ─── */}
              <ResizablePanel id="editor-area" defaultSize="50%" minSize="25%">
                <ResizablePanelGroup direction="vertical" className="h-full">
                  {/* Editor Panel (tabs + code) */}
                  <ResizablePanel id="editor" defaultSize="65%" minSize="20%">
                    <div className="flex h-full flex-col overflow-hidden">
                      <PgTabBar />
                      <div className="flex-1 overflow-hidden">
                        <Suspense
                          fallback={
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              Loading editor...
                            </div>
                          }
                        >
                          <PgCodeEditor />
                        </Suspense>
                      </div>
                    </div>
                  </ResizablePanel>

                  {/* ─── Console / Output Panel ─── */}
                  <ResizableHandle
                    withHandle
                    className="h-[3px] bg-[#333] hover:bg-blue-500/60 active:bg-blue-500 transition-colors data-[separator=active]:bg-blue-500"
                  />

                  <ResizablePanel
                    id="console"
                    panelRef={consoleRef}
                    defaultSize="35%"
                    minSize="10%"
                    maxSize="80%"
                    collapsible
                    collapsedSize="0%"
                    onResize={handleConsoleResize}
                  >
                    <PgConsole />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              {/* ─── Preview Panel ─── */}
              <ResizableHandle
                withHandle
                className="w-[3px] bg-[#333] hover:bg-blue-500/60 active:bg-blue-500 transition-colors data-[separator=active]:bg-blue-500"
              />

              <ResizablePanel
                id="preview"
                panelRef={previewRef}
                defaultSize="35%"
                minSize="15%"
                maxSize="60%"
                collapsible
                collapsedSize="0%"
                onResize={handlePreviewResize}
              >
                <PgPreview />
              </ResizablePanel>
            </ResizablePanelGroup>
            </div>

            {/* AI assistant: docked on the right (bottom sheet on narrow screens) */}
            {aiPanelOpen && <PgAiPanel />}
          </div>

          {/* Status Bar */}
          <PgStatusBar />

          {/* Floating Dialogs / Overlays */}
          <PgTemplateDialog />
          <PgSettingsDialog />
          <PgCommandPalette />
        </div>
      </TooltipProvider>
    </MobileGuard>
  );
}
