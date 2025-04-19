"use client";

import { GitMerge } from "lucide-react";
import { motion } from "framer-motion";

export function TreesHero() {
  return (
    <section className="text-center space-y-6 mb-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500"
      >
        <GitMerge className="w-8 h-8" />
      </motion.div>
      
      <div className="space-y-4">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold tracking-tight"
        >
          Arbres & Graphes
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Maîtrisez les structures de données hiérarchiques essentielles pour les entretiens techniques et la résolution de problèmes complexes.
        </motion.p>
      </div>
    </section>
  );
}
