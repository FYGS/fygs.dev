import { Metadata } from "next";
import { SortingGuide } from "./_components/sorting-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Tri | Algorithmes",
  description:
    "Guide complet des algorithmes de tri avec analyses de complexité et implémentations",
};

export default function SortingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SortingGuide />
    </main>
  );
}
