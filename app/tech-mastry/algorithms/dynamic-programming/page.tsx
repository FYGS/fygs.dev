import { Metadata } from "next";
import { DynamicProgrammingGuide } from "../_components/dynamic-programming-guide";

export const metadata: Metadata = {
  title: "Programmation Dynamique | TechMastry",
  description:
    "Guide complet sur la programmation dynamique : concepts, problèmes classiques, visualisations interactives et techniques d'optimisation",
};

export default function DynamicProgrammingPage() {
  return (
    <main className="container py-8 animate-fadeIn space-y-12">
      <DynamicProgrammingGuide />
    </main>
  );
}
