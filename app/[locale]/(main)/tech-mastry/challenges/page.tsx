import { AdvancedCodingChallenges } from "../challenges/_components";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/challenges");

export default function ChallengesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <AdvancedCodingChallenges />
    </div>
  );
}
