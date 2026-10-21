import { BackendTopics } from "./_components/backend-topics";
import { BackendHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/backend");

export default function BackendPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <BackendHero />
      <BackendTopics />
    </div>
  );
}
