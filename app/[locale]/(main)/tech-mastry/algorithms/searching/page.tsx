import { ModernSearchingGuide } from "./_components/modern-searching-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/searching");

export default function SearchingPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ModernSearchingGuide />
    </div>
  );
}
