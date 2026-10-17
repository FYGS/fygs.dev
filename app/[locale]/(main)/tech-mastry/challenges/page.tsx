import { Metadata } from "next";
import { AdvancedCodingChallenges } from "../challenges/_components";

export const metadata: Metadata = {
  title: "Advanced Coding Challenges | TechMastery",
  description:
    "Practice coding challenges with real-time feedback, performance metrics, and comprehensive test suites",
};

export default function ChallengesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <AdvancedCodingChallenges />
    </div>
  );
}
