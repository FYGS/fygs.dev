"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-error";

/**
 * Last resort: an error in the root layout itself, above every other boundary. It replaces the whole document,
 * so it brings its own <html> and <body>, and cannot rely on the app's providers or translations.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reportClientError(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <main id="main-content" style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Une erreur est survenue</h1>
          <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>
            Le site a rencontré un problème inattendu. Vous pouvez réessayer ou revenir à l&apos;accueil.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", border: 0, background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Réessayer
            </button>
            {/* a plain link on purpose: the router may be what failed, and this page has no Next.js context */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", border: "1px solid #475569", color: "#f8fafc", textDecoration: "none" }}>
              Accueil
            </a>
          </div>
          {error.digest && <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>Référence : {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
