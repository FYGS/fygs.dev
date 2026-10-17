"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Check, Info, ArrowUpDown, Clock, HardDrive } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { sortingAlgorithms } from "./sorting-algorithms-overview/data";

export function SortingAlgorithmsOverview() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(
    sortingAlgorithms[0].id
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Trouver l'algorithme sélectionné
  const algorithm =
    sortingAlgorithms.find((algo) => algo.id === selectedAlgorithm) ||
    sortingAlgorithms[0];

  // Fonction pour copier le code
  const copyCode = () => {
    navigator.clipboard.writeText(algorithm.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Animation pour les transitions
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sélection d'algorithme */}
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-primary" />
                Algorithmes de Tri
              </CardTitle>
              <CardDescription>
                Sélectionnez un algorithme pour voir ses détails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortingAlgorithms.map((algo) => (
                  <Button
                    key={algo.id}
                    variant={
                      selectedAlgorithm === algo.id ? "default" : "outline"
                    }
                    className={cn(
                      "w-full justify-start text-left font-normal mb-1 relative overflow-hidden group",
                      selectedAlgorithm === algo.id && `bg-${algo.color}-500`
                    )}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                  >
                    <div className="flex items-center gap-3 z-10">
                      <div
                        className={`w-2 h-2 rounded-full bg-${algo.color}-500`}
                      />
                      <span>{algo.name}</span>
                    </div>
                    {selectedAlgorithm === algo.id && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                        <Badge
                          variant="outline"
                          className="bg-white/20 text-white"
                        >
                          {algo.complexity.time.average}
                        </Badge>
                      </div>
                    )}
                    {selectedAlgorithm === algo.id && (
                      <motion.div
                        className={`absolute inset-0 bg-${algo.color}-500`}
                        layoutId="activeBackground"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Carte d'information */}
          <Card className="bg-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-4 h-4" />
                Quand l&apos;utiliser ?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                <strong className="font-medium">Petits tableaux :</strong> Tri
                par insertion
              </p>
              <p>
                <strong className="font-medium">Grands tableaux :</strong> Tri
                rapide, Tri fusion
              </p>
              <p>
                <strong className="font-medium">Stabilité requise :</strong> Tri
                fusion, Tri à bulles
              </p>
              <p>
                <strong className="font-medium">Mémoire limitée :</strong> Tri
                par tas, Tri rapide
              </p>
              <p>
                <strong className="font-medium">Tableau presque trié :</strong>{" "}
                Tri par insertion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Détails de l'algorithme */}
        <div className="md:w-2/3">
          <motion.div
            key={algorithm.id}
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <Card
              className="border-t-4"
              style={{ borderTopColor: `var(--${algorithm.color}-500)` }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{algorithm.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {algorithm.nameEn}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={algorithm.stable ? "default" : "destructive"}
                    className="ml-auto"
                  >
                    {algorithm.stable ? "Stable" : "Instable"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                <div className="text-muted-foreground">
                  {algorithm.description}
                </div>

                {/* Complexité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Complexité Temporelle
                    </h3>
                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Meilleur cas:
                        </span>
                        <code className="font-mono text-sm bg-muted-foreground/20 px-1 rounded">
                          {algorithm.complexity.time.best}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Cas moyen:
                        </span>
                        <code className="font-mono text-sm bg-primary/20 px-1 rounded">
                          {algorithm.complexity.time.average}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Pire cas:
                        </span>
                        <code className="font-mono text-sm bg-destructive/20 px-1 rounded">
                          {algorithm.complexity.time.worst}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      Complexité Spatiale
                    </h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Mémoire auxiliaire:
                        </span>
                        <code className="font-mono text-sm bg-muted-foreground/20 px-1 rounded">
                          {algorithm.complexity.space}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avantages et Inconvénients */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-green-400">
                      Avantages
                    </h3>
                    <ul className="space-y-2">
                      {algorithm.pros.map((pro, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                          <span className="text-muted-foreground">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-red-400">
                      Inconvénients
                    </h3>
                    <ul className="space-y-2">
                      {algorithm.cons.map((con, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                          <span className="text-muted-foreground">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Code d'implémentation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      Implémentation (JavaScript)
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      className="h-8 gap-1"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-xs">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs">Copier</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <pre tabIndex={0} className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-80">
                      <code>{algorithm.code}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
