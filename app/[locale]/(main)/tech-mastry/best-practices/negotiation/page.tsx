import { PracticeHeader } from "../_components/practice-header";
import { NegotiationGuide } from "./_components/negotiation-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices/negotiation");

const practiceData = {
  title: "Négociation",
  category: "Carrière" as const,
  topics: ["Salaire", "Avantages", "Contre-offres"],
  description:
    "Maîtrisez l'art de la négociation pour obtenir le package qui correspond à votre valeur.",
};

export default function NegotiationPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <PracticeHeader {...practiceData} />
      <NegotiationGuide />
    </div>
  );
}
