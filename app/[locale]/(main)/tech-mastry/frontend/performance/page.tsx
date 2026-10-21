import { PerformanceContent } from "./_components/content";
import { PerformanceHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/performance");

export default function PerformancePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <PerformanceHero />
      <PerformanceContent />
    </div>
  );
}
