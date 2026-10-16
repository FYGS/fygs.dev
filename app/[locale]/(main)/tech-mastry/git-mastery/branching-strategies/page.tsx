"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const strategies = [
  {
    id: "git-flow",
    name: "Git Flow",
    description:
      "Stratégie structurée avec branches dédiées pour features, releases et hotfixes.",
    useCases: [
      "Projets avec releases planifiées",
      "Équipes > 5 développeurs",
      "Applications en production stable",
    ],
    branches: [
      { name: "main", color: "bg-green-500", desc: "Code en production" },
      {
        name: "develop",
        color: "bg-blue-500",
        desc: "Intégration des features",
      },
      {
        name: "feature/*",
        color: "bg-purple-500",
        desc: "Développement de fonctionnalités",
      },
      {
        name: "release/*",
        color: "bg-orange-500",
        desc: "Préparation release",
      },
      { name: "hotfix/*", color: "bg-red-500", desc: "Corrections urgentes" },
    ],
    pros: [
      "Structure claire et prévisible",
      "Séparation nette des environnements",
      "Traçabilité des releases",
    ],
    cons: [
      "Complexe pour les petites équipes",
      "Branches longues = conflits",
      "Lent pour la CI/CD moderne",
    ],
  },
  {
    id: "github-flow",
    name: "GitHub Flow",
    description:
      "Workflow simplifié : une branche main, des feature branches, des pull requests.",
    useCases: [
      "Déploiement continu",
      "Petites à moyennes équipes",
      "Applications SaaS",
    ],
    branches: [
      { name: "main", color: "bg-green-500", desc: "Toujours déployable" },
      {
        name: "feature/*",
        color: "bg-purple-500",
        desc: "Branches de travail",
      },
    ],
    pros: ["Simple et intuitif", "CI/CD natif", "Déploiement rapide"],
    cons: [
      "Pas idéal pour les releases planifiées",
      "Nécessite une bonne CI/CD",
      "Pas de staging branch",
    ],
  },
  {
    id: "trunk-based",
    name: "Trunk-Based Development",
    description:
      "Commits directs sur main/trunk avec feature flags pour le code inachevé.",
    useCases: [
      "Équipes expérimentées",
      "Google, Facebook, Netflix",
      "Haute cadence de déploiement",
    ],
    branches: [
      {
        name: "main (trunk)",
        color: "bg-green-500",
        desc: "Seule branche long-lived",
      },
      { name: "short-lived/*", color: "bg-yellow-500", desc: "Branches < 24h" },
    ],
    pros: [
      "Intégration continue réelle",
      "Zéro merge hell",
      "Cadence maximale",
    ],
    cons: [
      "Nécessite feature flags",
      "Exige une couverture de tests élevée",
      "Courbe d'apprentissage pour les juniors",
    ],
  },
];

function BranchVisualizer({ strategy }: { strategy: (typeof strategies)[0] }) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Branches
      </h4>
      {strategy.branches.map((branch) => (
        <div key={branch.name} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${branch.color} shrink-0`} />
          <code className="text-sm font-mono text-primary">{branch.name}</code>
          <span className="text-xs text-muted-foreground">{branch.desc}</span>
        </div>
      ))}
    </div>
  );
}

function ComparisonTable() {
  const criteria = [
    {
      name: "Complexité",
      gitflow: "Élevée",
      github: "Faible",
      trunk: "Moyenne",
    },
    {
      name: "Cadence de déploiement",
      gitflow: "Planifiée",
      github: "Continue",
      trunk: "Très haute",
    },
    {
      name: "Taille d'équipe",
      gitflow: "Grande",
      github: "Petite-Moyenne",
      trunk: "Toute taille",
    },
    {
      name: "Risque de conflits",
      gitflow: "Élevé",
      github: "Moyen",
      trunk: "Faible",
    },
    {
      name: "Feature flags",
      gitflow: "Optionnel",
      github: "Optionnel",
      trunk: "Requis",
    },
    {
      name: "Code review",
      gitflow: "PR sur develop",
      github: "PR sur main",
      trunk: "Pair programming",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 font-semibold">Critère</th>
            <th className="text-center py-3 px-4 font-semibold text-orange-400">
              Git Flow
            </th>
            <th className="text-center py-3 px-4 font-semibold text-blue-400">
              GitHub Flow
            </th>
            <th className="text-center py-3 px-4 font-semibold text-green-400">
              Trunk-Based
            </th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((row) => (
            <tr key={row.name} className="border-b border-border/20">
              <td className="py-2.5 px-4 text-muted-foreground">{row.name}</td>
              <td className="py-2.5 px-4 text-center">{row.gitflow}</td>
              <td className="py-2.5 px-4 text-center">{row.github}</td>
              <td className="py-2.5 px-4 text-center">{row.trunk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BranchingStrategiesPage() {
  const [selected, setSelected] = useState("git-flow");

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
          <GitBranch className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-500">
            Branching Strategies
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Stratégies de Branching Git
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comparez les stratégies de gestion de branches les plus utilisées et
          choisissez celle qui correspond à votre projet et à votre équipe.
        </p>
      </section>

      <Tabs value={selected} onValueChange={setSelected} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {strategies.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {strategies.map((s) => (
          <TabsContent key={s.id} value={s.id} className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{s.name}</h2>
              <p className="text-muted-foreground">{s.description}</p>
              <BranchVisualizer strategy={s} />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Avantages
                </h3>
                <ul className="space-y-2">
                  {s.pros.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <ArrowRight className="w-3 h-3 text-green-500 mt-1 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />{" "}
                  Inconvénients
                </h3>
                <ul className="space-y-2">
                  {s.cons.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Cas
                d&apos;utilisation idéaux
              </h3>
              <div className="flex flex-wrap gap-2">
                {s.useCases.map((u) => (
                  <Badge key={u} variant="secondary">
                    {u}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Comparatif Détaillé</h2>
        <Card className="p-6">
          <ComparisonTable />
        </Card>
      </section>
    </div>
  );
}
