import { ComplexityGuide } from "./_components/complexity-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/complexity");

export default function ComplexityPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ComplexityGuide />
    </div>
  );
}
