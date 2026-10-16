"use client";

import { monacoConfig } from "@/app/_config/editor-config";
import {
  createEditorInstance,
  disposeEditor,
  initializeMonaco,
} from "@/app/_lib/editor-utils";
import type * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { usePlaygroundStore } from "../_stores/playground-store";

// Global editor reference for formatting and other external access
export const globalEditorRef: {
  current: monaco.editor.IStandaloneCodeEditor | null;
} = {
  current: null,
};

export function PgCodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const isUpdatingRef = useRef(false);
  const [ready, setReady] = useState(false);

  const activeFile = usePlaygroundStore((s) => s.getActiveFile());
  const updateFileContent = usePlaygroundStore((s) => s.updateFileContent);
  const theme = usePlaygroundStore((s) => s.theme);
  const settings = usePlaygroundStore((s) => s.settings);
  const executeCode = usePlaygroundStore((s) => s.executeCode);
  const formatCode = usePlaygroundStore((s) => s.formatCode);

  // Initialize Monaco Editor once
  useEffect(() => {
    let disposed = false;

    const setup = async () => {
      if (!containerRef.current) return;

      try {
        const mon = await initializeMonaco();
        if (!mon || disposed) return;
        monacoRef.current = mon;

        const instance = createEditorInstance(containerRef.current, {
          ...monacoConfig,
          value: activeFile?.content ?? "",
          language: activeFile?.language ?? "typescript",
          theme,
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          minimap: { enabled: settings.minimap },
          wordWrap: settings.wordWrap,
          lineNumbers: settings.lineNumbers,
          bracketPairColorization: {
            enabled: settings.bracketPairColorization,
          },
          cursorBlinking: settings.cursorBlinking,
          cursorStyle: settings.cursorStyle,
          renderWhitespace: settings.renderWhitespace,
          smoothScrolling: settings.smoothScrolling,
          stickyScroll: { enabled: settings.stickyScroll },
          padding: { top: 12, bottom: 12 },
          scrollBeyondLastLine: false,
          suggest: {
            ...monacoConfig.suggest,
            preview: true,
          },
        });

        editorRef.current = instance;
        globalEditorRef.current = instance;

        // Listen for content changes
        instance.onDidChangeModelContent(() => {
          if (isUpdatingRef.current) return;
          const value = instance.getValue();
          const fileId = usePlaygroundStore.getState().activeFileId;
          if (fileId) {
            updateFileContent(fileId, value);
          }
        });

        // Add keyboard shortcuts
        instance.addCommand(mon.KeyMod.CtrlCmd | mon.KeyCode.Enter, () => {
          executeCode();
        });

        instance.addCommand(
          mon.KeyMod.CtrlCmd | mon.KeyMod.Shift | mon.KeyCode.KeyF,
          () => {
            formatCode();
          },
        );

        instance.addCommand(mon.KeyMod.CtrlCmd | mon.KeyCode.KeyS, () => {
          // Prevent browser save, trigger snapshot
          usePlaygroundStore.getState().createSnapshot("Manual save");
        });

        // Ctrl/Cmd+I: Monaco would use it to expand the line selection
        instance.addCommand(mon.KeyMod.CtrlCmd | mon.KeyCode.KeyI, () => {
          window.dispatchEvent(new Event("pg-open-ai-assistant"));
        });

        setReady(true);
      } catch (error) {
        console.error("Failed to initialize Monaco:", error);
      }
    };

    setup();

    return () => {
      disposed = true;
      if (editorRef.current) {
        disposeEditor(editorRef.current);
        editorRef.current = null;
        globalEditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content when active file changes
  useEffect(() => {
    if (!editorRef.current || !ready || !activeFile) return;

    isUpdatingRef.current = true;

    const currentValue = editorRef.current.getValue();
    if (currentValue !== activeFile.content) {
      editorRef.current.setValue(activeFile.content);
    }

    // Update language
    if (monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, activeFile.language);
      }
    }

    // Restore focus
    editorRef.current.focus();

    isUpdatingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id, activeFile?.content, activeFile?.language, ready]);

  // Sync theme
  useEffect(() => {
    if (!ready || !monacoRef.current) return;
    monacoRef.current.editor.setTheme(theme);
  }, [theme, ready]);

  // Sync settings
  useEffect(() => {
    if (!editorRef.current || !ready) return;
    editorRef.current.updateOptions({
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      minimap: { enabled: settings.minimap },
      wordWrap: settings.wordWrap,
      lineNumbers: settings.lineNumbers,
      bracketPairColorization: { enabled: settings.bracketPairColorization },
      cursorBlinking: settings.cursorBlinking,
      cursorStyle: settings.cursorStyle,
      renderWhitespace: settings.renderWhitespace,
      smoothScrolling: settings.smoothScrolling,
      stickyScroll: { enabled: settings.stickyScroll },
    });
  }, [settings, ready]);

  return (
    <div className="relative h-full w-full bg-[#1e1e1e]">
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="Code editor"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading editor...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
