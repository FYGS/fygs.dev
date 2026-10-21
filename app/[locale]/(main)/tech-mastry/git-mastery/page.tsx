import { GitMasteryHero } from "./_components/hero";
import { GitTopicsList } from "./_components/topics-list";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/git-mastery");

export default function GitMasteryPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <GitMasteryHero />
      <GitTopicsList />
    </div>
  );
}