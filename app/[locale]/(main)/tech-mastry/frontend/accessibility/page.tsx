import { AccessibilityContent } from "./_components/content";
import { AccessibilityHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/accessibility");

export default function AccessibilityPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <AccessibilityHero />
      <AccessibilityContent />
    </div>
  );
}
