import { TypeScriptMasteryHero } from "./_components/hero";
import { TypeScriptTopicsList } from "./_components/topics-list";

export default function TypeScriptMasteryPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <TypeScriptMasteryHero />
      <TypeScriptTopicsList />
    </div>
  );
}