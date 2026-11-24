import { ArchitectureDiagrammingTool } from "../_components";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/architecture");

export default function ArchitecturePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ArchitectureDiagrammingTool />
    </div>
  );
}
