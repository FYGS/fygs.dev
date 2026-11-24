import { Metadata } from "next";
import { ProgressDashboard } from "./_components/progress-dashboard";

export const metadata: Metadata = {
  title: "Tableau de bord de progression | TechMastery",
  description:
    "Suivez votre progression, repérez vos points forts et vos lacunes, et planifiez votre apprentissage.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Suivez votre progression, repérez vos points forts et vos lacunes, et
          planifiez votre apprentissage.
        </p>
      </div>

      <ProgressDashboard />
    </div>
  );
}
