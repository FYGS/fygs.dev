import { CareerHero } from "./_components/hero";
import { CareerTopics } from "./_components/career-topics";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/career");

export default function CareerPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <CareerHero />
      <CareerTopics />
    </div>
  );
}
