import { ArchitectureHero } from "./_components/hero";
import { ArchitectureTopics } from "./_components/architecture-topics";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/architecture");

export default function ArchitecturePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ArchitectureHero />
      <ArchitectureTopics />
    </div>
  );
}
