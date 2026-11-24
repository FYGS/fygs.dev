import { ModernSortingGuide } from "./_components/modern-sorting-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/sorting");

export default function SortingPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ModernSortingGuide />
    </div>
  );
}
