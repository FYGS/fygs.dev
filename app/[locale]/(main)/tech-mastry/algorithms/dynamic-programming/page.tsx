import { DynamicProgrammingGuide } from "../_components/dynamic-programming-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/dynamic-programming");

export default function DynamicProgrammingPage() {
  return (
    <div className="container py-8 animate-fadeIn space-y-12 relative overflow-hidden">
      {/* Grille futuriste */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-size-[20px_20px] opacity-50 transform perspective-1000 rotate-x-5"></div>
      {/* Dégradés d'arrière-plan */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-purple-500/5 -z-10"></div>
      <DynamicProgrammingGuide />
    </div>
  );
}
