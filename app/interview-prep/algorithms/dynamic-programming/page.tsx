import { Metadata } from "next";
import { DynamicProgrammingGuide } from "../components/dynamic-programming-guide";

export const metadata: Metadata = {
  title: "Programmation Dynamique | Interview Prep",
  description:
    "Guide complet sur la programmation dynamique : concepts, problèmes classiques et techniques d'optimisation",
};

export default function DynamicProgrammingPage() {
  return (
    <main className="container py-8 animate-fadeIn">
      <DynamicProgrammingGuide />
    </main>
  );
}
