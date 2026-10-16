import { DataStructuresHero } from "./_components/hero";
import { DataStructuresTopics } from "./_components/topics-list";
import { DataStructuresGuide } from "./_components/data-structures-guide";

export default function DataStructuresPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <DataStructuresHero />
      <DataStructuresTopics />
      <DataStructuresGuide />
    </div>
  );
}
