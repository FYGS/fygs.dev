import { AlgorithmsHero } from "./_components/hero";
import { TopicsList } from "./_components/topics-list";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms");

export default function AlgorithmsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <AlgorithmsHero />
      <TopicsList />
    </div>
  );
}
