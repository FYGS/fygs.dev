import { Metadata } from "next";
import { PracticeHeader } from "../components/practice-header";
import { ProblemSolvingGuide } from "./components/problem-solving-guide";

export const metadata: Metadata = {
  title: "Problem Solving | Best Practices",
  description: "Apprenez une approche structurée pour résoudre des problèmes techniques en entretien",
};

const practiceData = {
  title: "Problem Solving",
  category: "Technique",
  topics: ["STAR Method", "Edge Cases", "Optimisation"],
  description: "Maîtrisez une approche systématique pour résoudre efficacement les problèmes techniques.",
};

export default function ProblemSolvingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <PracticeHeader {...practiceData} />
      <ProblemSolvingGuide />
    </main>
  );
}
