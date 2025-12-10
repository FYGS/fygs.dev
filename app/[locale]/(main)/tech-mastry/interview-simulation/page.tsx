import { Metadata } from "next";
import { InterviewSimulator } from "./_components";

export const metadata: Metadata = {
  title: "Interview Simulator | TechMastery",
  description:
    "Practice technical, behavioral, and system design interviews with realistic simulations and personalized feedback",
};

export default function InterviewSimulationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <InterviewSimulator />
    </main>
  );
}
