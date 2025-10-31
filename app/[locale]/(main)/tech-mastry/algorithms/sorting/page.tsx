import { Metadata } from "next";
import { ModernSortingGuide } from "./_components/modern-sorting-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Tri | Algorithmes",
  description:
    "Guide interactif et moderne des algorithmes de tri avec visualisations, comparaisons et exemples pratiques",
};

export default function SortingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ModernSortingGuide />
    </main>
  );
}
