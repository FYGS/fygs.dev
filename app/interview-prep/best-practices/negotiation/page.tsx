import { Metadata } from "next";
import { PracticeHeader } from "../components/practice-header";
import { NegotiationGuide } from "./components/negotiation-guide";

export const metadata: Metadata = {
  title: "Négociation | Best Practices",
  description: "Apprenez à négocier efficacement votre salaire et vos avantages lors d'un entretien",
};

const practiceData = {
  title: "Négociation",
  category: "Carrière",
  topics: ["Salaire", "Avantages", "Contre-offres"],
  description: "Maîtrisez l'art de la négociation pour obtenir le package qui correspond à votre valeur.",
};

export default function NegotiationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <PracticeHeader {...practiceData} />
      <NegotiationGuide />
    </main>
  );
}
