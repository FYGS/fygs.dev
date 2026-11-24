import { SecurityDevopsHero } from "./_components/hero";
import { SecurityTopics } from "./_components/security-topics";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/security-devops");

export default function SecurityDevopsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <SecurityDevopsHero />
      <SecurityTopics />
    </div>
  );
}
