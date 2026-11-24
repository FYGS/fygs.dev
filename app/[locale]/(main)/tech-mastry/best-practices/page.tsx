import { BestPracticesHero } from "./_components/hero";
import { PracticesList } from "./_components/practices-list";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices");

export default function BestPracticesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <BestPracticesHero />
      <PracticesList />
    </div>
  );
}
