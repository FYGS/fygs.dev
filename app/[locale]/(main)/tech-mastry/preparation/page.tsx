import type { Metadata } from "next";
import { PreparationGuide } from "./_components/preparation-guide";
import { PreparationTimeline } from "./_components/preparation-timeline";
import { InterviewChecklist } from "./_components/interview-checklist";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, CheckSquare, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide de Préparation | Tech-Mastry",
  description:
    "Guide complet pour se préparer efficacement aux entretiens techniques : timeline, checklist, mock interviews et gestion du stress.",
};

export default function PreparationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20 mb-2">
          <Target className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold">Guide de Préparation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Apprenez à vous préparer efficacement pour réussir vos entretiens
          techniques. Plan structuré, timeline et checklists pour maximiser vos
          chances.
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary">Plan structuré</Badge>
          <Badge variant="outline">Timeline interactive</Badge>
          <Badge>Checklist complète</Badge>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/tech-mastry/preparation/mock-interviews"
          className="group rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:border-primary/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Mock Interviews
            </h3>
            <Badge variant="default" className="ml-auto">
              Recommandé
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Simulations d&apos;entretiens structurées avec feedback détaillé par
            type (algorithme, system design, behavioral).
          </p>
        </Link>
        <Link
          href="/tech-mastry/preparation/stress-management"
          className="group rounded-xl border bg-card p-5 hover:shadow-lg transition-all hover:border-primary/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Gestion du Stress
            </h3>
            <Badge variant="outline" className="ml-auto">
              Bien-être
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Techniques de relaxation, exercices de respiration et mindset shifts
            pour rester serein le jour J.
          </p>
        </Link>
      </div>

      {/* Preparation Guide */}
      <PreparationGuide />

      {/* Interactive Timeline */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Timeline Interactive</h2>
        </div>
        <PreparationTimeline />
      </section>

      {/* Interview Checklist */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Checklist d&apos;Entretien</h2>
        </div>
        <InterviewChecklist />
      </section>
    </main>
  );
}
