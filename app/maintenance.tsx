"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wrench, Clock, Bell } from "lucide-react";

export default function Maintenance() {
  const estimatedTime = "30 minutes"; // À ajuster selon vos besoins

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <motion.div
          initial={{ rotate: -45 }}
          animate={{ rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10
          }}
          className="w-24 h-24 mx-auto bg-blue-900/20 rounded-full flex items-center justify-center"
        >
          <Wrench className="w-12 h-12 text-blue-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Site en maintenance
          </h1>
          <p className="text-muted-foreground text-lg">
            Nous effectuons actuellement des améliorations pour vous offrir une meilleure expérience.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border space-y-4">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <Clock className="w-5 h-5" />
            <p>
              Temps estimé : <span className="font-semibold">{estimatedTime}</span>
            </p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold mb-3">Ce que nous améliorons :</h2>
            <ul className="text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <div className="mt-1">•</div>
                Performance et vitesse du site
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1">•</div>
                Nouvelles fonctionnalités
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1">•</div>
                Sécurité et stabilité
              </li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-muted p-4 rounded-lg"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <Bell className="w-4 h-4" />
            <p>
              Nous vous notifierons dès que le site sera de nouveau disponible.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Actualiser la page
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
