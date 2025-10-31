"use client";

import { EditorError } from "./_components/editor-error";

export default function PlaygroundError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <EditorError error={error} reset={reset} />;
}
