import { Metadata } from "next";
import { ComplexityGuide } from "./components/complexity-guide";

export const metadata: Metadata = {
  title: "Complexité Algorithmique | Algorithmes",
  description:
    "Comprendre et analyser la complexité temporelle et spatiale des algorithmes pour les entretiens techniques",
};

export default function ComplexityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ComplexityGuide />
    </main>
  );
}
