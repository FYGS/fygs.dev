import { DesignTopics } from "./_components/design-topics";
import { SystemDesignHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design");

export default function SystemDesignPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <SystemDesignHero />
      <DesignTopics />
    </div>
  );
}
