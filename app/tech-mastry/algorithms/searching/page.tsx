import { Metadata } from "next";
import { ModernSearchingGuide } from "./_components/modern-searching-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Recherche | Algorithmes",
  description:
    "Guide complet des algorithmes de recherche avec visualisations interactives, comparaisons et cas d'utilisation",
};

export default function SearchingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ModernSearchingGuide />
    </main>
  );
}
