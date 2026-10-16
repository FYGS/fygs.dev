import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Mock Interviews | TechMastry",
  description:
    "Simulations d'entretiens techniques avec timer, questions et feedback structuré",
};

const interviewTypes = [
  {
    type: "Algorithme (45 min)",
    structure: [
      "Introduction (2 min)",
      "Clarification du problème (5 min)",
      "Approche & Pseudocode (10 min)",
      "Implémentation (20 min)",
      "Tests & Optimisation (5 min)",
      "Questions (3 min)",
    ],
    tips: [
      "Pensez à voix haute",
      "Commencez par la force brute",
      "Analysez la complexité",
      "Testez avec des edge cases",
    ],
    color: "border-blue-500/30",
  },
  {
    type: "System Design (45 min)",
    structure: [
      "Clarification des requirements (5 min)",
      "Estimation & contraintes (5 min)",
      "High-level design (15 min)",
      "Deep dive composant (15 min)",
      "Trade-offs & améliorations (5 min)",
    ],
    tips: [
      "Demandez les NFRs",
      "Commencez par un diagramme",
      "Calculez le throughput",
      "Discutez des trade-offs",
    ],
    color: "border-purple-500/30",
  },
  {
    type: "Behavioral (30 min)",
    structure: [
      "Tell me about yourself (3 min)",
      "Question STAR #1 (8 min)",
      "Question STAR #2 (8 min)",
      "Question STAR #3 (8 min)",
      "Vos questions (3 min)",
    ],
    tips: [
      "Préparez 5 histoires STAR",
      "Quantifiez les résultats",
      "Montrez votre croissance",
      "Soyez authentique",
    ],
    color: "border-green-500/30",
  },
];

export default function MockInterviewsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Mock Interviews</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Structures d&apos;entretien détaillées pour chaque type :
            algorithme, system design et behavioral. Pratiquez avec un timer.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {interviewTypes.map((interview) => (
          <Card
            key={interview.type}
            className={"p-8 space-y-6 border-2 " + interview.color}
          >
            <h2 className="text-2xl font-bold">{interview.type}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Structure
                </h3>
                <ol className="space-y-2">
                  {interview.structure.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Conseils
                </h3>
                <ul className="space-y-2">
                  {interview.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
