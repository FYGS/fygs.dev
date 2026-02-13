import { Metadata } from "next";
import { ArchitectureHero } from "./_components/hero";
import { ArchitectureTopics } from "./_components/architecture-topics";

export const metadata: Metadata = {
  title: "Architecture & Design Patterns | TechMastry",
  description:
    "Clean Architecture, SOLID, DDD et patterns de conception modernes pour les entretiens techniques",
};

export default function ArchitecturePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ArchitectureHero />
      <ArchitectureTopics />
    </main>
  );
}
