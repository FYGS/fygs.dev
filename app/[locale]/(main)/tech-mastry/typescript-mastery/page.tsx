import { TypeScriptMasteryHero } from "./_components/hero";
import { TypeScriptTopicsList } from "./_components/topics-list";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/typescript-mastery");

export default function TypeScriptMasteryPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <TypeScriptMasteryHero />
      <TypeScriptTopicsList />
    </div>
  );
}