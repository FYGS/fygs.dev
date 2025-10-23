"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  // Animation variants pour les éléments
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Animation pour le grand 404
  const numberVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl mx-auto text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Nombre 404 animé */}
        <motion.div
          className="text-9xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/50"
          variants={numberVariants}
        >
          404
        </motion.div>

        {/* Message principal */}
        <motion.h1
          className="text-4xl font-bold tracking-tight"
          variants={itemVariants}
        >
          Oups ! Page introuvable
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-muted-foreground text-lg"
          variants={itemVariants}
        >
          Il semble que vous ayez pris un mauvais tournant. La page que vous
          recherchez n&apos;existe pas ou a été déplacée.
        </motion.p>

        {/* Suggestions */}
        <motion.div
          className="bg-card rounded-lg p-6 shadow-lg border"
          variants={itemVariants}
        >
          <h2 className="font-semibold mb-4">Suggestions utiles :</h2>
          <ul className="text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Vérifiez l&apos;URL pour les fautes de frappe
            </li>
            <li className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retournez à la page précédente
            </li>
            <li className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Naviguez vers la page d&apos;accueil
            </li>
          </ul>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          variants={itemVariants}
        >
          <Button
            variant="default"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Link href="/admin">
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
