import { PracticeHeader } from "../_components/practice-header";
import { ProblemSolvingGuide } from "./_components/problem-solving-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices/problem-solving");

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
