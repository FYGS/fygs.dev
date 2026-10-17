import { Metadata } from "next";
import { PerformanceContent } from "./_components/content";
import { PerformanceHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "Performance & Optimization | TechMastry",
  description:
    "Techniques d'optimisation des applications React: Memoization, Code Splitting, Bundle Size, et Virtualization",
};

export default function PerformancePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <PerformanceHero />
      <PerformanceContent />
    </div>
  );
}
