"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  BarChart,
  BookOpen,
  Brain,
  Code2,
  Layers,
  Lightbulb,
  Search,
} from "lucide-react";
import { useState } from "react";

// Import des sections
import { AdditionalAlgorithms } from "./sections/additional-algorithms";
import { DetailedCaseStudies } from "./sections/case-studies";
import { SearchingAlgorithmsOverview } from "./sections/searching-algorithms-overview";
import { SearchingQuizzes } from "./sections/searching-quizzes";
import { SearchingRealWorldCases } from "./sections/searching-real-world-cases";
import { SearchingVisualization } from "./sections/searching-visualization";
import dynamic from "next/dynamic";

// Heavy dependencies (d3, monaco, three) are only fetched when their tab is opened.
const SearchingComparison = dynamic(
  () => import("./sections/searching-comparison").then((m) => m.SearchingComparison),
  { ssr: false },
);
const SearchingExercisesImproved = dynamic(
  () => import("./sections/searching-exercises-improved").then((m) => m.SearchingExercisesImproved),
  { ssr: false },
);
const Visualization3D = dynamic(
  () => import("./sections/3d-visualization").then((m) => m.Visualization3D),
  { ssr: false },
);

// Types pour les onglets
type TabValue =
  | "overview"
  | "visualization"
  | "comparison"
  | "exercises"
  | "quizzes"
  | "real-world"
  | "case-studies"
  | "advanced"
  | "3d-visualization";

export function ModernSearchingGuide() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // Animation pour les transitions entre onglets
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-4">
        <motion.h1
          className="text-4xl font-bold flex items-center gap-3 text-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Search className="w-10 h-10 text-primary" />
          Algorithmes de Recherche
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Explorez les différentes méthodes pour rechercher efficacement des
          données, avec des visualisations interactives, des comparaisons
          détaillées et des cas d&apos;utilisation réels.
        </motion.p>
      </div>

      {/* Navigation par onglets */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-9 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Vue d&apos;ensemble</span>
            <span className="md:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger
            value="visualization"
            className="flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Visualisation</span>
            <span className="md:hidden">Visu</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span className="hidden md:inline">Comparaison</span>
            <span className="md:hidden">Comp</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Exercices</span>
            <span className="md:hidden">Exo</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden md:inline">Quiz</span>
            <span className="md:hidden">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="real-world" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden md:inline">Applications</span>
            <span className="md:hidden">Apps</span>
          </TabsTrigger>
          <TabsTrigger value="case-studies" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Études de cas</span>
            <span className="md:hidden">Études</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Algorithmes avancés</span>
            <span className="md:hidden">Avancés</span>
          </TabsTrigger>
          <TabsTrigger
            value="3d-visualization"
            className="flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Visualisation 3D</span>
            <span className="md:hidden">3D</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
          className="mt-6"
        >
          <TabsContent value="overview" className="mt-0">
            <SearchingAlgorithmsOverview />
          </TabsContent>

          <TabsContent value="visualization" className="mt-0">
            <SearchingVisualization />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            <SearchingComparison />
          </TabsContent>

          <TabsContent value="exercises" className="mt-0">
            <SearchingExercisesImproved />
          </TabsContent>

          <TabsContent value="quizzes" className="mt-0">
            <SearchingQuizzes />
          </TabsContent>

          <TabsContent value="real-world" className="mt-0">
            <SearchingRealWorldCases />
          </TabsContent>

          <TabsContent value="case-studies" className="mt-0">
            <DetailedCaseStudies />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <AdditionalAlgorithms />
          </TabsContent>

          <TabsContent value="3d-visualization" className="mt-0">
            <Visualization3D />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
