import { DataScienceHero } from "./_components/hero";
import { DataScienceTopics } from "./_components/topics-list";

export default function DataSciencePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <DataScienceHero />
      <DataScienceTopics />
    </div>
  );
}