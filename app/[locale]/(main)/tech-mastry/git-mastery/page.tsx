import { GitMasteryHero } from "./_components/hero";
import { GitTopicsList } from "./_components/topics-list";

export default function GitMasteryPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <GitMasteryHero />
      <GitTopicsList />
    </main>
  );
}