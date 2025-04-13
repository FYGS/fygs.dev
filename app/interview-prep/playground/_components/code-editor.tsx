"use client";

import { monacoConfig } from "@/app/_config/editor-config";
import {
  createEditorInstance,
  disposeEditor,
  initializeMonaco,
} from "@/app/_lib/editor-utils";
import type * as monaco from "monaco-editor";
// Don't import directly to avoid SSR issues
// import { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../_hooks/use-language";
import { useTheme } from "../_hooks/use-theme";
import { useEditorStore } from "../_stores/editor-store";

function CodeEditorComponent() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const { code, setCode } = useEditorStore();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [editorReady, setEditorReady] = useState(false);
  const [monacoInstance, setMonacoInstance] = useState<typeof monaco | null>(
    null
  );

  // Initialize Monaco Editor
  useEffect(() => {
    let isMounted = true;

    const setupEditor = async () => {
      if (!editorRef.current) return;

      // Clean up any existing editor instance
      if (editorInstanceRef.current) {
        disposeEditor(editorInstanceRef.current);
        editorInstanceRef.current = null;
      }

      // Clean up any existing resize observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      try {
        const monaco = await initializeMonaco();
        if (!monaco || !isMounted) return;

        setMonacoInstance(monaco);

        // Create a unique ID for the editor container
        const uniqueId = `monaco-editor-${Date.now()}`;
        editorRef.current.id = uniqueId;

        // Create the editor instance
        editorInstanceRef.current = createEditorInstance(editorRef.current, {
          ...monacoConfig,
          value: code,
          language,
          theme,
        });

        // Set up content change listener
        editorInstanceRef.current.onDidChangeModelContent(() => {
          if (editorInstanceRef.current) {
            setCode(editorInstanceRef.current.getValue() || "");
          }
        });

        // Set up resize observer
        resizeObserverRef.current = new ResizeObserver(() => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.layout();
          }
        });

        if (editorRef.current) {
          resizeObserverRef.current.observe(editorRef.current);
        }

        setEditorReady(true);
      } catch (error) {
        console.error("Error initializing Monaco Editor:", error);
      }
    };

    setupEditor();

    return () => {
      isMounted = false;

      // Clean up resize observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Clean up editor instance
      if (editorInstanceRef.current) {
        disposeEditor(editorInstanceRef.current);
        editorInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to initialize only once

  // Update editor content when code changes
  useEffect(() => {
    if (editorInstanceRef.current && editorReady) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== code) {
        editorInstanceRef.current.setValue(code);
      }
    }
  }, [code, editorReady]);

  // Update editor language when language changes
  useEffect(() => {
    if (editorInstanceRef.current && editorReady && monacoInstance) {
      const model = editorInstanceRef.current.getModel();
      if (model && monacoInstance.editor) {
        monacoInstance.editor.setModelLanguage(model, language);
      }
    }
  }, [language, editorReady, monacoInstance]);

  // Update editor theme when theme changes
  useEffect(() => {
    if (editorReady && monacoInstance && monacoInstance.editor) {
      monacoInstance.editor.setTheme(theme);
    }
  }, [theme, editorReady, monacoInstance]);

  return (
    <div className="editor-container full-height-container">
      <div
        ref={editorRef}
        className="editor-monaco flex-1"
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          backgroundColor: "transparent",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

// Export the component for dynamic import
export { CodeEditorComponent as CodeEditor };
