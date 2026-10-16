import { Metadata } from "next";
import { PracticeHeader } from "../_components/practice-header";
import { ProblemSolvingGuide } from "./_components/problem-solving-guide";

export const metadata: Metadata = {
  title: "Problem Solving | Best Practices",
  description:
    "Apprenez une approche structurée pour résoudre des problèmes techniques en entretien",
};

const practiceData = {
  title: "Problem Solving",
  category: "Technique" as const,
  topics: ["STAR Method", "Edge Cases", "Optimisation"],
  description:
    "Maîtrisez une approche systématique pour résoudre efficacement les problèmes techniques.",
};

export default function ProblemSolvingPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <PracticeHeader {...practiceData} />
      <ProblemSolvingGuide />
    </div>
  );
}
