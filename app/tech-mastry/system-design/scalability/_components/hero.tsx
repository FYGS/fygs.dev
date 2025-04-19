"use client";

import { ArrowUpRight, BarChart4 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function ScalabilityHero() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500"
        >
          <BarChart4 className="w-8 h-8" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Scalabilité & Performance
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Techniques et principes pour concevoir des systèmes hautement évolutifs et performants à grande échelle
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Load Balancing
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Caching
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Database Sharding
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            CDN
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Horizontal Scaling
          </Badge>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Visualisations Interactives</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Explorez des visualisations interactives pour comprendre les concepts clés de scalabilité et de performance.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Principes Fondamentaux</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Découvrez les principes fondamentaux qui sous-tendent la conception de systèmes évolutifs.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Techniques Avancées</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Apprenez des techniques avancées pour optimiser les performances et gérer la charge à grande échelle.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
