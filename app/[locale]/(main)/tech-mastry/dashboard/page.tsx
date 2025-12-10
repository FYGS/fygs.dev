import { Metadata } from "next";
import { ProgressDashboard } from "./_components/progress-dashboard";

export const metadata: Metadata = {
  title: "Learning Progress Dashboard | TechMastry",
  description:
    "Track your progress, identify strengths and weaknesses, and plan your learning journey.",
};

export default function DashboardPage() {
  return (
    <main className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Learning Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your progress, identify strengths and weaknesses, and plan your
          learning journey.
        </p>
      </div>

      <ProgressDashboard />
    </main>
  );
}
