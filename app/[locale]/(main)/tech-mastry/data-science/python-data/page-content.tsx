"use client";

import { FlaskConical } from "lucide-react";
import { ChartDemo } from "./_components/chart-demo";
import { CleaningPipelineSection } from "./_components/cleaning-pipeline-section";
import { DataFrameVisualizer } from "./_components/dataframe-visualizer";
import { EssentialLibsSection } from "./_components/essential-libs-section";
import { NumpyVisualizer } from "./_components/numpy-visualizer";
import { PandasOpsSection } from "./_components/pandas-ops-section";

/* ─────────── Main Page ─────────── */
export default function PythonDataPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <FlaskConical className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
          Python pour la Data Science
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez l&#39;écosystème Python de la manipulation de données à la
          visualisation. NumPy, Pandas, Matplotlib, Seaborn — les outils
          indispensables du data scientist.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <DataFrameVisualizer />
        <div className="grid md:grid-cols-2 gap-6">
          <NumpyVisualizer />
          <ChartDemo />
        </div>
      </section>

      {/* Essential Libraries */}
      <EssentialLibsSection />

      {/* Pandas Operations Reference */}
      <PandasOpsSection />

      {/* Data Cleaning Pipeline */}
      <CleaningPipelineSection />
    </div>
  );
}
