"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl mx-auto text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto bg-blue-900/20 rounded-full flex items-center justify-center"
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <WifiOff className="w-12 h-12 text-blue-400" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            className="text-4xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hors ligne
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Vous êtes actuellement hors ligne. Vérifiez votre connexion
            Internet.
          </motion.p>
        </div>

        <motion.div
          className="bg-card rounded-lg p-6 shadow-lg border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-semibold mb-4">Suggestions :</h2>
          <ul className="text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              Vérifiez votre connexion Internet
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayez de charger la page
            </li>
            <li className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Naviguez vers la page d&apos;accueil
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="default"
            size="lg"
            onClick={refreshPage}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
