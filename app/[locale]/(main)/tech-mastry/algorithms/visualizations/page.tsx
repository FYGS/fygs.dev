import { Metadata } from "next";
import { SortingVisualizations } from "../sorting/_components/sorting-visualizations";

export const metadata: Metadata = {
  title: "Algorithm Visualizations | TechMastery",
  description: "Interactive visualizations to help you understand how different algorithms work",
};

export default function AlgorithmVisualizationsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Algorithm Visualizations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive visualizations to help you understand how different algorithms work under the hood.
          See each step of the process in real-time with customizable parameters.
        </p>
      </div>
      
      <SortingVisualizations />
    </main>
  );
}