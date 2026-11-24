import { TreesGuide } from "./_components/trees-guide";
import { TreesHero } from "./_components/trees-hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/data-structures/trees");

export default function TreesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <TreesHero />
      <TreesGuide />
    </div>
  );
}
