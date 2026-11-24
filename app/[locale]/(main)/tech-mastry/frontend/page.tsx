import { FrontendTopics } from "./_components/frontend-topics";
import { FrontendHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend");

export default function FrontendPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <FrontendHero />
      <FrontendTopics />
    </div>
  );
}
