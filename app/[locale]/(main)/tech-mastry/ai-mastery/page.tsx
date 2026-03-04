import { AIMasteryHero } from "./_components/hero";
import { AIMasteryTopics } from "./_components/topics-list";

export default function AIMasteryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <AIMasteryHero />
      <AIMasteryTopics />
    </div>
  );
}