"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
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
          className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Oups ! Quelque chose s&apos;est mal passé
          </h1>
          <p className="text-muted-foreground text-lg">
            Une erreur inattendue s&apos;est produite. Nos équipes ont été
            notifiées.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border">
          <h2 className="font-semibold mb-2">Détails de l&apos;erreur :</h2>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
            {error.message || "Une erreur inconnue s'est produite"}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              ID de l&apos;erreur: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="default" size="lg" onClick={reset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Réessayer
          </Button>
          <Link href="/tech-mastry">
            <Button variant="secondary" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
