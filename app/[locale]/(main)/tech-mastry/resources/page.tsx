import { ResourcesHero } from "./_components/hero";
import { ResourcesList } from "./_components/resources-list";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/resources");

export default function ResourcesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ResourcesHero />
      <ResourcesList />
    </div>
  );
}
