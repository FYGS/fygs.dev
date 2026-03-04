import { AlgorithmsHero } from "./_components/hero";
import { TopicsList } from "./_components/topics-list";

export default function AlgorithmsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <AlgorithmsHero />
      <TopicsList />
    </main>
  );
}
