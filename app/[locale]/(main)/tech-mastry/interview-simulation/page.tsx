import { InterviewSimulator } from "./_components";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/interview-simulation");

export default function InterviewSimulationPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <InterviewSimulator />
    </div>
  );
}
