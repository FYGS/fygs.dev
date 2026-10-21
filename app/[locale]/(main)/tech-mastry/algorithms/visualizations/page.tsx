import { SortingVisualizations } from "../sorting/_components/sorting-visualizations";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/visualizations");

export default function AlgorithmVisualizationsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Algorithm Visualizations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive visualizations to help you understand how different algorithms work under the hood.
          See each step of the process in real-time with customizable parameters.
        </p>
      </div>
      
      <SortingVisualizations />
    </div>
  );
}