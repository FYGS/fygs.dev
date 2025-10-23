"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  BarChart3,
  BookOpen,
  Brain,
  Code2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

// Importation des composants de section
import { SortingAlgorithmsOverview } from "./sections/sorting-algorithms-overview";
import { SortingComparison } from "./sections/sorting-comparison";
import { SortingQuizzes } from "./sections/sorting-quizzes";
import { SortingRealWorldCases } from "./sections/sorting-real-world-cases";
import { SortingVisualization } from "./sections/sorting-visualization";
import { SortingExercises } from "./sections/sorting-exercises";

// Types d'onglets disponibles
type TabType =
  | "overview"
  | "visualization"
  | "comparison"
  | "real-world"
  | "quizzes"
  | "exercises";

export function ModernSortingGuide() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Animation pour les transitions entre onglets
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* En-tête animé */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/20 via-primary/10 to-background p-8 shadow-lg border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/20 p-3 rounded-lg">
              <ArrowUpDown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Algorithmes de Tri
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Concepts fondamentaux
              </span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl">
            Les algorithmes de tri sont des méthodes pour réorganiser une
            collection d&apos;éléments dans un ordre spécifique. Explorez leurs
            caractéristiques, visualisez leur fonctionnement et comprenez quand
            utiliser chaque algorithme.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveTab("visualization")}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Explorer les visualisations
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("comparison")}
              className="gap-2"
            >
              <Code2 className="w-4 h-4" />
              Comparer les performances
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Navigation par onglets */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="space-y-8"
      >
        <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md py-2 border-b">
          <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-6 h-12">
            <TabsTrigger
              value="overview"
              className={cn(
                "gap-2",
                activeTab === "overview" && "text-primary"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d&apos;ensemble</span>
              <span className="sm:hidden">Vue</span>
            </TabsTrigger>
            <TabsTrigger
              value="visualization"
              className={cn(
                "gap-2",
                activeTab === "visualization" && "text-primary"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visualisation</span>
              <span className="sm:hidden">Visu</span>
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className={cn(
                "gap-2",
                activeTab === "comparison" && "text-primary"
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Comparaison</span>
              <span className="sm:hidden">Comp</span>
            </TabsTrigger>
            <TabsTrigger
              value="real-world"
              className={cn(
                "gap-2",
                activeTab === "real-world" && "text-primary"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Cas concrets</span>
              <span className="sm:hidden">Cas</span>
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className={cn("gap-2", activeTab === "quizzes" && "text-primary")}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              <span className="sm:hidden">Quiz</span>
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className={cn(
                "gap-2",
                activeTab === "exercises" && "text-primary"
              )}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Exercices</span>
              <span className="sm:hidden">Code</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabVariants}
        >
          <TabsContent value="overview" className="space-y-8 mt-0">
            <SortingAlgorithmsOverview />
          </TabsContent>

          <TabsContent value="visualization" className="space-y-8 mt-0">
            <SortingVisualization />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8 mt-0">
            <SortingComparison />
          </TabsContent>

          <TabsContent value="real-world" className="space-y-8 mt-0">
            <SortingRealWorldCases />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-8 mt-0">
            <SortingQuizzes />
          </TabsContent>

          <TabsContent value="exercises" className="space-y-8 mt-0">
            <SortingExercises />
          </TabsContent>
        </motion.div>
      </Tabs>

      {/* Carte d'information flottante */}
      <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
              <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Le saviez-vous ?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Les navigateurs web modernes utilisent des algorithmes de tri
                hybrides comme <strong>Timsort</strong> (combinaison de Merge
                Sort et Insertion Sort) pour leur méthode{" "}
                <code>Array.sort()</code>, offrant d&apos;excellentes
                performances dans presque tous les cas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
