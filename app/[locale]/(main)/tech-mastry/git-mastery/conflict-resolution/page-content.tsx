"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Shield } from "lucide-react";

interface ConflictScenario {
  title: string;
  before: string;
  yours: string;
  theirs: string;
  resolved: string;
  explanation: string;
}

const scenarios: ConflictScenario[] = [
  {
    title: "Modification simultanée",
    before: "const API_URL = \"http://localhost:3000\";",
    yours: "const API_URL = process.env.API_URL;",
    theirs: "const API_URL = \"https://api.production.com\";",
    resolved: "const API_URL = process.env.API_URL ?? \"https://api.production.com\";",
    explanation: "Les deux changements sont valides. La résolution combine les approches : variable d'environnement avec fallback.",
  },
  {
    title: "Import ajouté au même endroit",
    before: "import { useState } from \"react\";",
    yours: "import { useState, useEffect } from \"react\";",
    theirs: "import { useState, useCallback } from \"react\";",
    resolved: "import { useState, useEffect, useCallback } from \"react\";",
    explanation: "Quand deux branches ajoutent des imports, combinez-les tous. C'est le cas le plus fréquent et le plus simple.",
  },
  {
    title: "Refactoring vs modification",
    before: "function getUser(id) {\n  return db.query(\"SELECT * FROM users WHERE id = ?\", [id]);\n}",
    yours: "async function getUser(id: string) {\n  return prisma.user.findUnique({ where: { id } });\n}",
    theirs: "function getUser(id) {\n  return db.query(\"SELECT * FROM users WHERE id = ? AND active = 1\", [id]);\n}",
    resolved: "async function getUser(id: string) {\n  return prisma.user.findUnique({ where: { id, active: true } });\n}",
    explanation: "Votre refactoring (Prisma) est plus moderne, mais le filtre 'active' de l'autre branche est important. Intégrez les deux.",
  },
];

const preventionTips = [
  {
    icon: Shield,
    title: "Branches courtes",
    desc: "Fusionnez fréquemment. Les branches de plus de 2-3 jours génèrent nettement plus de conflits.",
  },
  {
    icon: ArrowRight,
    title: "Rebase régulier",
    desc: "Exécutez git rebase main quotidiennement sur votre feature branch pour rester synchronisé.",
  },
  {
    icon: CheckCircle,
    title: "Fichiers partagés",
    desc: "Coordonnez-vous quand plusieurs personnes modifient le même fichier. Utilisez CODEOWNERS.",
  },
  {
    icon: Lightbulb,
    title: "git rerere",
    desc: "Activez git config rerere.enabled true — Git mémorise vos résolutions et les réapplique automatiquement.",
  },
];

const tools = [
  { name: "VS Code", desc: "Inline merge editor intégré, visualisation 3-way", recommended: true },
  { name: "IntelliJ / WebStorm", desc: "Merge tool avancé avec historique de résolutions", recommended: true },
  { name: "git mergetool", desc: "Interface CLI pour parcourir les conflits un par un", recommended: false },
  { name: "kdiff3 / meld", desc: "Outils visuels standalone pour les diffs complexes", recommended: false },
  { name: "GitHub UI", desc: "Résolution directe pour les conflits simples dans les PR", recommended: false },
];

function ConflictSimulator({ scenario }: { scenario: ConflictScenario }) {
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Avant", content: scenario.before, color: "text-muted-foreground" },
    { label: "Votre version", content: scenario.yours, color: "text-green-500" },
    { label: "Leur version", content: scenario.theirs, color: "text-blue-500" },
    { label: "Résolution", content: scenario.resolved, color: "text-primary" },
  ];

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">{scenario.title}</h3>
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${step === i ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className={`rounded-lg bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap ${steps[step].color}`}>
        {steps[step].content}
      </div>
      {step === 3 && (
        <p className="text-sm text-muted-foreground bg-green-500/5 p-3 rounded-lg border border-green-500/20">
          <Lightbulb className="w-4 h-4 text-green-500 inline mr-1" />
          {scenario.explanation}
        </p>
      )}
    </Card>
  );
}

export default function ConflictResolutionPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-500">Résolution de Conflits</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Maîtriser les Conflits Git
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Les conflits de merge ne sont pas un échec — c&apos;est une réalité du travail collaboratif.
          Apprenez à les résoudre efficacement et à les prévenir.
        </p>
      </section>

      {/* Conflict Simulator */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Simulateur de Conflits</h2>
        {scenarios.map((s) => (
          <ConflictSimulator key={s.title} scenario={s} />
        ))}
      </section>

      {/* Prevention */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Prévention des Conflits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {preventionTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Card key={tip.title} className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{tip.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Outils de Résolution</h2>
        <Card className="p-6">
          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="font-semibold text-sm min-w-[140px]">{tool.name}</span>
                <span className="text-xs text-muted-foreground flex-1">{tool.desc}</span>
                {tool.recommended && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">Recommandé</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}