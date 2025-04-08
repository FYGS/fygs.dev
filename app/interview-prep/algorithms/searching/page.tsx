import { Metadata } from "next";
import { SearchingGuide } from "./_components/searching-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Recherche | Algorithmes",
  description:
    "Guide complet des algorithmes de recherche avec implémentations et cas d'utilisation",
};

export default function SearchingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SearchingGuide />
    </main>
  );
}
