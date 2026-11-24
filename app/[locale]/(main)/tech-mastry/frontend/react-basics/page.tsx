import { ReactBasicsContent } from "./_components/content";
import { ReactBasicsHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/react-basics");

export default function ReactBasicsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ReactBasicsHero />
      <ReactBasicsContent />
    </div>
  );
}
