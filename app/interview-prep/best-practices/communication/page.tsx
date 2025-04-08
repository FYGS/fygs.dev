import { Metadata } from "next";
import { PracticeHeader } from "../components/practice-header";
import { CommunicationGuide } from "./components/communication-guide";

export const metadata: Metadata = {
  title: "Communication Efficace | Best Practices",
  description: "Apprenez à communiquer efficacement lors d'un entretien technique",
};

const practiceData = {
  title: "Communication Efficace",
  category: "Soft Skills",
  topics: ["Clarification", "Pensée à voix haute", "Questions pertinentes"],
  description: "Maîtrisez l'art de la communication technique pour impressionner vos intervieweurs.",
};

export default function CommunicationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <PracticeHeader {...practiceData} />
      <CommunicationGuide />
    </main>
  );
}
