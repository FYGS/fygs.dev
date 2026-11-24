"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BinaryTreeVisualization } from "./binary-tree-visualization";
import { GraphVisualization } from "./graph-visualization";
import { PracticeExercises } from "./practice-exercises";
import { InterviewQuestionsCard } from "./trees-guide/interview-questions-card";
import { ResourcesCard } from "./trees-guide/resources-card";
import { TreeTypeTabs } from "./trees-guide/tree-type-tabs";

export function TreesGuide() {
  const [activeTab, setActiveTab] = useState("binary");

  return (
    <div className="space-y-10">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prose prose-invert max-w-none"
      >
        <h2 className="text-3xl font-bold mb-4">
          Introduction aux Arbres et Graphes
        </h2>
        <p className="text-lg text-muted-foreground">
          Les arbres et les graphes sont des structures de données non linéaires
          fondamentales en informatique, utilisées pour représenter des
          relations hiérarchiques et des connexions entre objets. Ces structures
          sont essentielles pour résoudre de nombreux problèmes complexes et
          sont fréquemment abordées lors des entretiens techniques.
        </p>
      </motion.div>

      {/* Interactive Visualizations */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BinaryTreeVisualization />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GraphVisualization />
        </motion.div>
      </div>

      {/* Tree Types Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TreeTypeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </motion.div>

      {/* Interview Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <InterviewQuestionsCard />
      </motion.div>

      {/* Practice Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <PracticeExercises />
      </motion.div>

      {/* Resources and Further Reading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <ResourcesCard />
      </motion.div>
    </div>
  );
}
