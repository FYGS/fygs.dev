import { StateManagementContent } from "./_components/content";
import { StateManagementHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/state-management");

export default function StateManagementPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <StateManagementHero />
      <StateManagementContent />
    </div>
  );
}
