import { Metadata } from "next";
import { AlgorithmsHero } from "./components/hero";
import { TopicsList } from "./components/topics-list";

export const metadata: Metadata = {
  title: "Algorithmes & Structures de Données | Interview Prep",
  description: "Préparation aux questions d'algorithmes et structures de données pour les entretiens techniques",
};

export default function AlgorithmsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <AlgorithmsHero />
      <TopicsList />
    </main>
  );
}
