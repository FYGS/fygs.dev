"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useIntlayer } from "next-intlayer";
import { reportClientError } from "@/lib/report-error";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeUrl?: string;
}

export function ErrorPage({ error, reset, homeUrl = "/" }: ErrorPageProps) {
  const content = useIntlayer("status-error");

  useEffect(() => {
    console.error(error);
    void reportClientError(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-24 h-24 mx-auto bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <AlertCircle className="w-12 h-12 text-red-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {content.heading}
          </h1>
          <p className="text-muted-foreground text-lg">{content.description}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border">
          <h2 className="font-semibold mb-2">{content.errorDetailsTitle}</h2>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
            {error.message || content.unknownError}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              {content.errorIdLabel} {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="default" size="lg" onClick={reset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            {content.retryButton}
          </Button>
          <Link href={homeUrl}>
            <Button variant="secondary" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              {content.homeButton}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
