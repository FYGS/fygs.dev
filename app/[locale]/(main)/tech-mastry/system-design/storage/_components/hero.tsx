"use client";

import { Database } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function StorageHero() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500"
        >
          <Database className="w-8 h-8" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Stockage & Bases de Données
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Comprendre les différents types de bases de données, leurs propriétés et comment les utiliser efficacement dans vos architectures.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            SQL vs NoSQL
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Sharding
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Réplication
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ACID
          </Badge>
          <Badge variant="secondary" className="text-xs">
            CAP Theorem
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Performance
          </Badge>
        </div>
      </div>
    </section>
  );
}
