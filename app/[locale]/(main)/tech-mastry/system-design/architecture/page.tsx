import { Metadata } from "next";
import { ArchitectureDiagrammingTool } from "../_components";

export const metadata: Metadata = {
  title: "System Design Studio | TechMastery",
  description:
    "Design and visualize system architectures with our interactive diagramming tools",
};

export default function ArchitecturePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ArchitectureDiagrammingTool />
    </div>
  );
}
