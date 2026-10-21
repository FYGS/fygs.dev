import { DataStructuresGuide } from "../_components/data-structures-guide";
import { DataStructuresVisualizations } from "./_components/data-structures-visualizations";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/data-structures");

export default function DataStructuresPage() {
  return (
    <div className="container py-8 space-y-12">
      <DataStructuresGuide />
      <DataStructuresVisualizations />
    </div>
  );
}
