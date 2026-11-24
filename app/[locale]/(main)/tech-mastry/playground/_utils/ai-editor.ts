import type { IRange } from "monaco-editor";
import { globalEditorRef } from "../_components/pg-code-editor";
import { usePlaygroundStore } from "../_stores/playground-store";

/**
 * Bridge between the AI panel and the Monaco editor. Edits go through
 * `executeEdits` between two undo stops, so one Ctrl+Z reverts a whole AI
 * change; the editor's change listener then syncs the store as for typing.
 */

export interface EditorSelectionInfo {
  text: string;
  startLine: number;
  endLine: number;
}

export function getEditorSelection(): EditorSelectionInfo | null {
  const editor = globalEditorRef.current;
  const model = editor?.getModel();
  const selection = editor?.getSelection();
  if (!editor || !model || !selection || selection.isEmpty()) return null;
  const text = model.getValueInRange(selection);
  if (!text.trim()) return null;
  return { text, startLine: selection.startLineNumber, endLine: selection.endLineNumber };
}

export type ApplyResult = "inserted" | "replaced-selection" | "replaced-file" | null;

function applyEdit(
  build: (editor: NonNullable<typeof globalEditorRef.current>) => {
    range: IRange;
    result: Exclude<ApplyResult, null>;
  },
  text: string,
): ApplyResult {
  const editor = globalEditorRef.current;
  if (!editor || !editor.getModel()) return null;
  const { range, result } = build(editor);
  editor.pushUndoStop();
  editor.executeEdits("ai-assistant", [{ range, text, forceMoveMarkers: true }]);
  editor.pushUndoStop();
  editor.focus();
  return result;
}

/** Insert `code` at the cursor (after the selection, if there is one). */
export function insertAtCursor(code: string): ApplyResult {
  return applyEdit((editor) => {
    const selection = editor.getSelection();
    const position = selection ? selection.getEndPosition() : (editor.getPosition() ?? { lineNumber: 1, column: 1 });
    return {
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      result: "inserted",
    };
  }, code);
}

/** Replace the selection, or the whole file when nothing is selected. */
export function replaceSelectionOrFile(code: string): ApplyResult {
  const editor = globalEditorRef.current;
  if (!editor || !editor.getModel()) {
    // Editor not mounted: still allow the change through the store
    const state = usePlaygroundStore.getState();
    const file = state.getActiveFile();
    if (!file) return null;
    state.updateFileContent(file.id, code);
    return "replaced-file";
  }
  const selection = editor.getSelection();
  const range = selection && !selection.isEmpty() ? selection : editor.getModel()?.getFullModelRange();
  if (!range) return null;
  const hasSelection = range === selection;
  return applyEdit(
    () => ({ range, result: hasSelection ? "replaced-selection" : "replaced-file" }),
    code,
  );
}

export function focusEditor() {
  globalEditorRef.current?.focus();
}
