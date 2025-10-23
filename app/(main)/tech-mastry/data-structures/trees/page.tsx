import { Metadata } from "next";
import { TreesGuide } from "./_components/trees-guide";
import { TreesHero } from "./_components/trees-hero";

export const metadata: Metadata = {
  title: "Arbres & Graphes | Structures de Données",
  description:
    "Structures de données hiérarchiques pour les entretiens techniques",
};

export default function TreesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <TreesHero />
      <TreesGuide />
    </main>
  );
}
