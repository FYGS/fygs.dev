import { ComponentPatternsContent } from "./_components/content";
import { ComponentPatternsHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/component-patterns");

export default function ComponentPatternsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ComponentPatternsHero />
      <ComponentPatternsContent />
    </div>
  );
}
