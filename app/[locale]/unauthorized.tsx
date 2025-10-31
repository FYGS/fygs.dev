"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center"
        >
          <Lock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground text-lg">
            Désolé, vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border space-y-4">
          <h2 className="font-semibold">Pour accéder à cette page :</h2>
          <ul className="text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Connectez-vous avec un compte valide
            </li>
            <li className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retournez à la page précédente
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/auth/login">
            <Button variant="default" size="lg" className="gap-2">
              <LogIn className="w-4 h-4" />
              Se connecter
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
