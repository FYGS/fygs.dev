"use client";

import { Network, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function DistributedHero() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500"
        >
          <Network className="w-8 h-8" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Architecture Distribuée
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Principes et patterns pour concevoir des systèmes distribués robustes, évolutifs et résilients
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Microservices
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Event-Driven
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Service Mesh
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            API Gateway
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Resilience
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
            Explorez des visualisations interactives pour comprendre les architectures distribuées et leurs interactions.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Patterns & Anti-patterns</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Découvrez les patterns de conception et les anti-patterns courants dans les systèmes distribués.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Études de Cas</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Analysez des études de cas réelles pour comprendre comment les grandes entreprises conçoivent leurs systèmes distribués.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
