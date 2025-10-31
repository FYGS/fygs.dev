import { BarChart3, Brain, GraduationCap, Trophy } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Progress Dashboard | TechMastry",
  description:
    "Track your progress, identify strengths and weaknesses, and plan your learning journey.",
};

export default function DashboardPage() {
  return (
    <main className="container py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Learning Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your progress, identify strengths and weaknesses, and plan your
          learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg border bg-card shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Skills</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            View and track your skill development across different areas.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Achievements</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock badges and certificates as you complete challenges.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Learning Paths</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow structured learning paths tailored to your goals.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Analytics</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Get insights into your learning patterns and progress.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-lg border bg-card shadow-xs">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground">
          We&apos;re working on a comprehensive dashboard with detailed
          analytics, skill radar charts, achievement tracking, and personalized
          learning recommendations. Stay tuned for updates!
        </p>
      </div>
    </main>
  );
}
