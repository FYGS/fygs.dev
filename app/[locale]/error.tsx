"use client";

import { ErrorPage } from "@/app/_components/status-pages/error-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <ErrorPage error={error} reset={reset} />
    </main>
  );
}
