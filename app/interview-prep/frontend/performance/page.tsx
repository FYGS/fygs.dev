import { Metadata } from "next";
import { PerformanceHero } from "./_components/hero";
import { PerformanceContent } from "./_components/content";

export const metadata: Metadata = {
  title: "Performance & Optimization | Interview Prep",
  description:
    "Techniques d'optimisation des applications React: Memoization, Code Splitting, Bundle Size, et Virtualization",
};

export default function PerformancePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <PerformanceHero />
      <PerformanceContent />
    </main>
  );
}
