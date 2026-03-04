import { TypeScriptMasteryHero } from "./_components/hero";
import { TypeScriptTopicsList } from "./_components/topics-list";

export default function TypeScriptMasteryPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <TypeScriptMasteryHero />
      <TypeScriptTopicsList />
    </main>
  );
}