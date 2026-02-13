// P1.3 — Career, P1.2 — Security-DevOps, P1.5 — System Design missing, P1.6 — Backend missing, P1.7 — Preparation missing
const fs = require("fs");
const path = require("path");
const BASE = path.join(
  __dirname,
  "..",
  "app",
  "[locale]",
  "(main)",
  "tech-mastry",
);

function w(rel, content) {
  const fp = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content.trimStart(), "utf8");
  console.log(`  Created: ${rel}`);
}

// =============================================================
//  P1.3 — CAREER
// =============================================================
console.log("\n=== P1.3 CAREER ===");

w(
  "career/_components/hero.tsx",
  `
import { DollarSign, Sparkles } from "lucide-react";

export function CareerHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
        <DollarSign className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Négociation & Carrière</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stratégies de négociation salariale, progression de carrière et conseils
          pour réussir vos entretiens et propulser votre parcours professionnel.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span>Négociation • Progression • Entretiens</span>
      </div>
    </section>
  );
}
`,
);

w(
  "career/_components/career-topics.tsx",
  `
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";

const topics = [
  {
    title: "Négociation Salariale",
    description: "Framework en 5 étapes, scripts de négociation, recherche de marché et mises en situation.",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/tech-mastry/career/salary-negotiation",
    tags: ["Salaire", "Stratégies", "Scripts", "Contre-offre"],
  },
  {
    title: "Progression de Carrière",
    description: "Échelle de carrière, matrice de compétences, IC vs Management et personal branding.",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/tech-mastry/career/progression",
    tags: ["Junior → Senior", "Staff", "IC Track", "Management"],
  },
  {
    title: "Conseils d'Entretien",
    description: "Méthode STAR, présentation technique, questions comportementales et checklist pré-entretien.",
    icon: UserCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/tech-mastry/career/interview-tips",
    tags: ["STAR", "Behavioral", "Présentation", "Recherche"],
  },
];

export function CareerTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group border-border/40 hover:border-primary/30">
              <div className={"inline-flex p-3 rounded-xl " + topic.bgColor}>
                <topic.icon className={"w-6 h-6 " + topic.color} />
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {topic.title}
              </h2>
              <p className="text-muted-foreground text-sm">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "career/page.tsx",
  `
import { Metadata } from "next";
import { CareerHero } from "./_components/hero";
import { CareerTopics } from "./_components/career-topics";

export const metadata: Metadata = {
  title: "Négociation & Carrière | TechMastry",
  description: "Négociation salariale, progression de carrière et conseils pour réussir vos entretiens techniques",
};

export default function CareerPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <CareerHero />
      <CareerTopics />
    </main>
  );
}
`,
);

// Salary Negotiation
w(
  "career/salary-negotiation/_components/negotiation-guide.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const steps = [
  {
    step: 1,
    title: "Recherche de Marché",
    description: "Avant toute négociation, connaissez votre valeur sur le marché.",
    details: [
      "Consultez Glassdoor, Levels.fyi, Blind pour les salaires réels",
      "Filtrez par ville, expérience, taille d'entreprise et secteur",
      "Identifiez la fourchette basse, médiane et haute de votre poste",
      "Prenez en compte le package total : salaire + bonus + equity + avantages",
    ],
    tip: "Ne donnez jamais votre salaire actuel en premier. Demandez toujours la fourchette du poste.",
  },
  {
    step: 2,
    title: "Définir votre Cible",
    description: "Déterminez vos chiffres avant d'entrer en négociation.",
    details: [
      "Minimum acceptable : en dessous de ce chiffre, vous refusez",
      "Cible réaliste : ce que vous visez raisonnablement",
      "Aspiration haute : votre meilleur scénario, ambitieux mais justifiable",
      "Toujours demander 10-20% au-dessus de votre cible réaliste",
    ],
    tip: "Votre première demande ancre la négociation. Visez haut mais justifiable.",
  },
  {
    step: 3,
    title: "Construire votre Argumentaire",
    description: "Préparez des arguments factuels et quantifiables.",
    details: [
      "Listez vos réalisations avec des métriques (revenus générés, performance améliorée)",
      "Démontrez votre impact unique : projets menés, équipes guidées",
      "Présentez vos compétences rares ou en forte demande",
      "Référencez les données de marché que vous avez collectées",
    ],
    tip: "Utilisez le format : 'J\\'ai [action] qui a résulté en [métrique quantifiable].'",
  },
  {
    step: 4,
    title: "La Négociation",
    description: "Le moment de la discussion. Restez professionnel et factuel.",
    details: [
      "Laissez l'employeur faire la première offre si possible",
      "Silence après l'offre — ne réagissez pas immédiatement",
      "Demandez du temps pour réfléchir (24-48h minimum)",
      "Négociez le package complet, pas seulement le salaire de base",
    ],
    tip: "La phrase magique : 'Je suis très enthousiaste pour ce poste. Basé sur mes recherches et mon expérience, je visais plutôt [X]. Est-ce quelque chose que nous pouvons explorer ?'",
  },
  {
    step: 5,
    title: "Contre-offre & Clôture",
    description: "Gérez les contre-offres et finalisez l'accord.",
    details: [
      "Si l'offre est inférieure : négociez les autres composantes (bonus, equity, remote, formation)",
      "Si vous avez plusieurs offres : mentionnez-le professionnellement",
      "Obtenez tout par écrit avant d'accepter",
      "Ne brûlez jamais les ponts — le monde tech est petit",
    ],
    tip: "Même si vous n'obtenez pas le salaire cible, négociez une revue salariale à 6 mois avec des objectifs clairs.",
  },
];

export function NegotiationGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Framework de Négociation en 5 Étapes</h2>

      {/* Step indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeStep === i
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              activeStep === i ? "bg-white/20" : "bg-muted"
            )}>
              {s.step}
            </span>
            {s.title}
          </button>
        ))}
      </div>

      <Card className="p-8 space-y-6 border-border/40">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-500 mb-2">
            Étape {step.step}
          </Badge>
          <h3 className="text-2xl font-bold">{step.title}</h3>
          <p className="text-muted-foreground mt-1">{step.description}</p>
        </div>

        <ul className="space-y-3">
          {step.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{detail}</span>
            </li>
          ))}
        </ul>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Conseil Pro</p>
              <p className="text-sm text-muted-foreground mt-1">{step.tip}</p>
            </div>
          </div>
        </Card>
      </Card>
    </section>
  );
}
`,
);

w(
  "career/salary-negotiation/page.tsx",
  `
import { Metadata } from "next";
import { NegotiationGuide } from "./_components/negotiation-guide";
import { DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Négociation Salariale | TechMastry",
  description: "Framework de négociation en 5 étapes, scripts et stratégies pour maximiser votre package",
};

export default function SalaryNegotiationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Négociation Salariale</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un framework structuré pour négocier avec confiance et obtenir
            le package que vous méritez.
          </p>
        </div>
      </section>
      <NegotiationGuide />
    </main>
  );
}
`,
);

// Career Progression
w(
  "career/progression/_components/career-ladder.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const levels = [
  {
    title: "Junior (L1-L2)",
    years: "0-2 ans",
    color: "bg-green-500",
    textColor: "text-green-500",
    bgLight: "bg-green-500/10",
    scope: "Tâches individuelles",
    skills: [
      "Maîtrise d'un langage et d'un framework",
      "Écriture de code propre avec guidance",
      "Compréhension des bases de données",
      "Tests unitaires basiques",
      "Communication dans l'équipe",
    ],
    expectations: [
      "Livrer des features avec aide du mentor",
      "Poser des questions pertinentes",
      "Apprendre et progresser rapidement",
      "Suivre les conventions de l'équipe",
    ],
  },
  {
    title: "Mid-Level (L3-L4)",
    years: "2-5 ans",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-500/10",
    scope: "Features complètes",
    skills: [
      "Maîtrise de plusieurs technologies",
      "Design de composants et modules",
      "Code reviews constructives",
      "Debugging complexe",
      "Documentation technique",
    ],
    expectations: [
      "Livrer des features de manière autonome",
      "Identifier et résoudre les problèmes techniques",
      "Mentorer les juniors",
      "Contribuer aux décisions techniques",
    ],
  },
  {
    title: "Senior (L5-L6)",
    years: "5-8 ans",
    color: "bg-purple-500",
    textColor: "text-purple-500",
    bgLight: "bg-purple-500/10",
    scope: "Système / Équipe",
    skills: [
      "Architecture de systèmes complexes",
      "Leadership technique sans autorité formelle",
      "Optimisation de performance",
      "Prise de décisions techniques stratégiques",
      "Communication cross-fonctionnelle",
    ],
    expectations: [
      "Définir l'architecture des nouveaux systèmes",
      "Multiplier la productivité de l'équipe",
      "Anticiper les problèmes techniques",
      "Influencer la roadmap technique",
    ],
  },
  {
    title: "Staff (L7)",
    years: "8-12 ans",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    bgLight: "bg-orange-500/10",
    scope: "Multi-équipes / Org",
    skills: [
      "Vision technique long terme",
      "Alignement technique avec le business",
      "Résolution de problèmes ambigus",
      "Gestion de la dette technique",
      "Influence organisationnelle",
    ],
    expectations: [
      "Définir la direction technique de l'organisation",
      "Résoudre les problèmes techniques les plus complexes",
      "Construire des ponts entre les équipes",
      "Établir les standards et les pratiques",
    ],
  },
  {
    title: "Principal (L8+)",
    years: "12+ ans",
    color: "bg-red-500",
    textColor: "text-red-500",
    bgLight: "bg-red-500/10",
    scope: "Entreprise / Industrie",
    skills: [
      "Impact à l'échelle de l'entreprise",
      "Innovation et R&D",
      "Recrutement et attraction de talents",
      "Conférences et publications",
      "Vision technique sur 3-5 ans",
    ],
    expectations: [
      "Définir la stratégie technique de l'entreprise",
      "Créer de nouveaux domaines et opportunités",
      "Représenter l'entreprise dans l'industrie",
      "Former les futurs leaders techniques",
    ],
  },
];

export function CareerLadder() {
  const [activeLevel, setActiveLevel] = useState(0);
  const level = levels[activeLevel];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Échelle de Carrière</h2>

      {/* Visual Ladder */}
      <div className="flex items-end gap-2 justify-center h-48">
        {levels.map((l, i) => (
          <button
            key={l.title}
            onClick={() => setActiveLevel(i)}
            className={cn(
              "rounded-t-lg transition-all duration-300 w-16 md:w-24 flex items-end justify-center pb-2",
              activeLevel === i ? l.color + " text-white shadow-lg" : "bg-muted/50 hover:bg-muted",
            )}
            style={{ height: \`\${40 + i * 25}%\` }}
          >
            <span className="text-xs font-bold writing-mode-vertical md:writing-mode-horizontal">
              L{i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Level Details */}
      <Card className="p-8 space-y-6 border-border/40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={cn("text-2xl font-bold", level.textColor)}>
              {level.title}
            </h3>
            <p className="text-muted-foreground">{level.years} d&apos;expérience</p>
          </div>
          <Badge className={level.bgLight + " " + level.textColor}>
            Scope : {level.scope}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Compétences attendues</h4>
            <ul className="space-y-2">
              {level.skills.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", level.color)} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Ce qu&apos;on attend de vous</h4>
            <ul className="space-y-2">
              {level.expectations.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">→</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
`,
);

w(
  "career/progression/page.tsx",
  `
import { Metadata } from "next";
import { CareerLadder } from "./_components/career-ladder";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Progression de Carrière | TechMastry",
  description: "Échelle de carrière Junior → Principal, matrice de compétences et IC vs Management track",
};

export default function ProgressionPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Progression de Carrière</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprenez les attentes à chaque niveau et planifiez votre évolution
            de Junior à Principal Engineer.
          </p>
        </div>
      </section>
      <CareerLadder />
    </main>
  );
}
`,
);

// Interview Tips
w(
  "career/interview-tips/_components/interview-guide.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sections = [
  {
    id: "star",
    title: "Méthode STAR",
    content: [
      { label: "S — Situation", desc: "Décrivez le contexte et les circonstances. Soyez précis mais concis.", example: "Dans mon rôle de tech lead chez X, nous avions un système monolithique servant 10M d'utilisateurs avec des temps de réponse dégradés." },
      { label: "T — Task", desc: "Expliquez votre responsabilité spécifique dans cette situation.", example: "J'étais responsable de concevoir et mener la migration vers une architecture microservices." },
      { label: "A — Action", desc: "Détaillez les actions concrètes que VOUS avez prises (pas l'équipe).", example: "J'ai défini l'architecture cible, identifié les bounded contexts, mis en place le strangler fig pattern et formé l'équipe de 8 développeurs." },
      { label: "R — Result", desc: "Quantifiez les résultats obtenus. Utilisez des métriques.", example: "Résultat : temps de réponse réduit de 70%, disponibilité passée de 99.5% à 99.99%, et déploiements de 1/mois à 10/jour." },
    ],
  },
  {
    id: "technical",
    title: "Présentation Technique",
    content: [
      { label: "Structure en 5 min", desc: "Contexte (30s) → Problème (30s) → Solution (2min) → Résultats (1min) → Apprentissages (1min)", example: "" },
      { label: "Montrez votre raisonnement", desc: "Les intervieweurs veulent voir COMMENT vous pensez, pas juste le résultat final.", example: "Expliquez les alternatives considérées et pourquoi vous avez choisi cette approche." },
      { label: "Anticipez les questions", desc: "Préparez des réponses pour : 'Que feriez-vous différemment ?' et 'Comment ça scale ?'", example: "" },
      { label: "Diagrammes", desc: "Dessinez des schémas d'architecture. Un bon diagramme vaut mille mots.", example: "Préparez 2-3 diagrammes de vos projets les plus significatifs." },
    ],
  },
  {
    id: "checklist",
    title: "Checklist Pré-Entretien",
    content: [
      { label: "Recherche entreprise", desc: "Produit, tech stack, culture, actualités récentes, concurrents.", example: "" },
      { label: "Préparez 5 projets STAR", desc: "Leadership, conflit, échec, innovation, collaboration.", example: "" },
      { label: "Questions à poser", desc: "Préparez 3-5 questions pertinentes sur l'équipe, la stack et la culture.", example: "Ex: 'Comment gérez-vous la dette technique ?' ou 'À quoi ressemble une journée type ?'" },
      { label: "Logistique", desc: "Testez votre connexion, caméra, micro. Préparez un environnement calme.", example: "" },
      { label: "Mindset", desc: "C'est une conversation, pas un interrogatoire. Vous évaluez aussi l'entreprise.", example: "" },
    ],
  },
];

export function InterviewGuide() {
  const [activeSection, setActiveSection] = useState("star");
  const section = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <section className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSection === s.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {section.content.map((item) => (
          <Card key={item.label} className="p-6 space-y-3 border-border/40">
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
            {item.example && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm italic text-muted-foreground">{item.example}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "career/interview-tips/page.tsx",
  `
import { Metadata } from "next";
import { InterviewGuide } from "./_components/interview-guide";
import { UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Conseils d'Entretien | TechMastry",
  description: "Méthode STAR, présentation technique et checklist pour réussir vos entretiens",
};

export default function InterviewTipsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Conseils d&apos;Entretien</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Préparez-vous avec la méthode STAR, perfectionnez votre présentation
            technique et suivez la checklist complète.
          </p>
        </div>
      </section>
      <InterviewGuide />
    </main>
  );
}
`,
);

console.log("P1.3 Career: DONE");

// =============================================================
//  P1.2 — SECURITY-DEVOPS
// =============================================================
console.log("\n=== P1.2 SECURITY-DEVOPS ===");

w(
  "security-devops/_components/hero.tsx",
  `
import { Shield, Sparkles } from "lucide-react";

export function SecurityDevopsHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
        <Shield className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Sécurité & DevOps</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sécurité applicative, CI/CD, conteneurisation et pratiques Cloud Native
          pour des systèmes robustes et résilients.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <span>OWASP • CI/CD • Docker & K8s • Cloud Native</span>
      </div>
    </section>
  );
}
`,
);

w(
  "security-devops/_components/security-topics.tsx",
  `
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cloud, Container, GitBranch, ShieldAlert } from "lucide-react";
import Link from "next/link";

const topics = [
  {
    title: "OWASP Top 10",
    description: "Les 10 vulnérabilités web les plus critiques avec code vulnérable vs sécurisé.",
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    href: "/tech-mastry/security-devops/owasp-top-10",
    category: "Sécurité",
    tags: ["XSS", "SQL Injection", "CSRF", "Auth"],
  },
  {
    title: "CI/CD Pipelines",
    description: "Conception et optimisation de pipelines d'intégration et déploiement continus.",
    icon: GitBranch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/tech-mastry/security-devops/cicd",
    category: "DevOps",
    tags: ["GitHub Actions", "Pipelines", "Déploiement", "Tests"],
  },
  {
    title: "Docker & Kubernetes",
    description: "Conteneurisation et orchestration pour des déploiements fiables et scalables.",
    icon: Container,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    href: "/tech-mastry/security-devops/docker-kubernetes",
    category: "DevOps",
    tags: ["Containers", "Pods", "Services", "Helm"],
  },
  {
    title: "Cloud Native",
    description: "Architecture 12-Factor, serverless et bonnes pratiques cloud.",
    icon: Cloud,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/tech-mastry/security-devops/cloud-native",
    category: "Cloud",
    tags: ["12-Factor", "Serverless", "AWS/GCP/Azure", "IaC"],
  },
];

const categoryColors: Record<string, string> = {
  "Sécurité": "bg-red-500/10 text-red-500",
  DevOps: "bg-blue-500/10 text-blue-500",
  Cloud: "bg-purple-500/10 text-purple-500",
};

export function SecurityTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group border-border/40 hover:border-yellow-500/30">
              <div className="flex items-start justify-between">
                <div className={"inline-flex p-3 rounded-xl " + topic.bgColor}>
                  <topic.icon className={"w-6 h-6 " + topic.color} />
                </div>
                <Badge variant="secondary" className={categoryColors[topic.category]}>
                  {topic.category}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {topic.title}
              </h2>
              <p className="text-muted-foreground text-sm">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
`,
);

w(
  "security-devops/page.tsx",
  `
import { Metadata } from "next";
import { SecurityDevopsHero } from "./_components/hero";
import { SecurityTopics } from "./_components/security-topics";

export const metadata: Metadata = {
  title: "Sécurité & DevOps | TechMastry",
  description: "Sécurité applicative, CI/CD, Docker, Kubernetes et Cloud Native pour développeurs",
};

export default function SecurityDevopsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SecurityDevopsHero />
      <SecurityTopics />
    </main>
  );
}
`,
);

// OWASP Top 10
w(
  "security-devops/owasp-top-10/_components/vulnerability-explorer.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const vulnerabilities = [
  {
    id: "A01",
    name: "Broken Access Control",
    risk: "Critique",
    description: "Restrictions mal implémentées sur ce que les utilisateurs authentifiés sont autorisés à faire.",
    vulnerable: \`// ❌ Pas de vérification d'autorisation
app.get("/api/users/:id", async (req, res) => {
  const user = await db.user.findById(req.params.id);
  res.json(user); // N'importe qui peut voir n'importe quel profil
});\`,
    secure: \`// ✅ Vérification d'autorisation
app.get("/api/users/:id", auth, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const user = await db.user.findById(req.params.id);
  res.json(user);
});\`,
  },
  {
    id: "A02",
    name: "Cryptographic Failures",
    risk: "Critique",
    description: "Données sensibles exposées à cause de chiffrement absent ou faible.",
    vulnerable: \`// ❌ Mot de passe stocké en clair
await db.user.create({
  data: { email, password: password } // En clair !
});\`,
    secure: \`// ✅ Hash avec bcrypt
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 12);
await db.user.create({
  data: { email, password: hash }
});\`,
  },
  {
    id: "A03",
    name: "Injection",
    risk: "Critique",
    description: "Données non fiables envoyées à un interpréteur (SQL, NoSQL, OS, LDAP).",
    vulnerable: \`// ❌ SQL Injection
const query = \\\`SELECT * FROM users
  WHERE email = '\\\${email}'
  AND password = '\\\${password}'\\\`;
const user = await db.raw(query);\`,
    secure: \`// ✅ Requêtes paramétrées (Prisma)
const user = await prisma.user.findUnique({
  where: { email }, // Automatiquement échappé
});\`,
  },
  {
    id: "A07",
    name: "XSS (Cross-Site Scripting)",
    risk: "Élevé",
    description: "Injection de scripts malveillants dans des pages web vues par d'autres utilisateurs.",
    vulnerable: \`// ❌ Rendu HTML non échappé
element.innerHTML = userInput;
// Si userInput = "<script>steal(cookies)</script>"
// → Le script s'exécute !\`,
    secure: \`// ✅ React échappe automatiquement
function Comment({ text }: { text: string }) {
  return <p>{text}</p>; // Automatiquement échappé
}
// Pour du HTML intentionnel :
// dangerouslySetInnerHTML={{ __html: sanitize(html) }}\`,
  },
];

const riskColors: Record<string, string> = {
  Critique: "bg-red-500/10 text-red-500 border-red-500/20",
  "Élevé": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Moyen: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export function VulnerabilityExplorer() {
  const [active, setActive] = useState("A01");
  const vuln = vulnerabilities.find((v) => v.id === active) || vulnerabilities[0];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Vulnérabilités Principales</h2>

      <div className="flex flex-wrap gap-2">
        {vulnerabilities.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              active === v.id
                ? "bg-red-500 text-white shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {v.id}: {v.name}
          </button>
        ))}
      </div>

      <Card className="p-8 space-y-6 border-border/40">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{vuln.id}: {vuln.name}</h3>
          <Badge className={riskColors[vuln.risk]}>{vuln.risk}</Badge>
        </div>
        <p className="text-muted-foreground">{vuln.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="destructive" className="text-xs">❌ Vulnérable</Badge>
            <pre className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{vuln.vulnerable}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <Badge className="bg-green-500/10 text-green-500 text-xs">✅ Sécurisé</Badge>
            <pre className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{vuln.secure}</code>
            </pre>
          </div>
        </div>
      </Card>
    </section>
  );
}
`,
);

w(
  "security-devops/owasp-top-10/page.tsx",
  `
import { Metadata } from "next";
import { VulnerabilityExplorer } from "./_components/vulnerability-explorer";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "OWASP Top 10 | TechMastry",
  description: "Les 10 vulnérabilités web les plus critiques avec exemples de code vulnérable et sécurisé",
};

export default function OwaspPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">OWASP Top 10</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les vulnérabilités web les plus critiques. Apprenez à les identifier, les exploiter
            (pour tester) et les corriger dans vos applications.
          </p>
        </div>
      </section>
      <VulnerabilityExplorer />
    </main>
  );
}
`,
);

// CI/CD
w(
  "security-devops/cicd/_components/pipeline-guide.tsx",
  `
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, GitCommit, Package, Play, Shield, TestTube } from "lucide-react";
import { useState } from "react";

const pipelineStages = [
  { id: "commit", label: "Commit", icon: GitCommit, color: "text-blue-500", bgColor: "bg-blue-500" },
  { id: "test", label: "Test", icon: TestTube, color: "text-yellow-500", bgColor: "bg-yellow-500" },
  { id: "security", label: "Security", icon: Shield, color: "text-red-500", bgColor: "bg-red-500" },
  { id: "build", label: "Build", icon: Package, color: "text-purple-500", bgColor: "bg-purple-500" },
  { id: "deploy", label: "Deploy", icon: Play, color: "text-green-500", bgColor: "bg-green-500" },
];

const stageDetails: Record<string, { description: string; tools: string[]; code: string }> = {
  commit: {
    description: "Le développeur push son code. Le pipeline se déclenche automatiquement.",
    tools: ["Git Hooks", "Commitlint", "Husky", "Lint-staged"],
    code: \`# .github/workflows/ci.yml
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint\`,
  },
  test: {
    description: "Tests unitaires, d'intégration et e2e pour valider la qualité du code.",
    tools: ["Vitest", "Playwright", "Jest", "Testing Library"],
    code: \`  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/\`,
  },
  security: {
    description: "Scan des dépendances et du code pour détecter les vulnérabilités.",
    tools: ["Dependabot", "Snyk", "CodeQL", "Trivy"],
    code: \`  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'\`,
  },
  build: {
    description: "Construction de l'image Docker et des artefacts de production.",
    tools: ["Docker", "Buildx", "GHCR", "ECR"],
    code: \`  build:
    needs: security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/org/app:$\\{{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max\`,
  },
  deploy: {
    description: "Déploiement automatique en staging puis production avec stratégie de rollback.",
    tools: ["Vercel", "AWS ECS", "Kubernetes", "ArgoCD"],
    code: \`  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/app \\
            app=ghcr.io/org/app:$\\{{ github.sha }}
      - name: Run smoke tests
        run: pnpm test:smoke --url $STAGING_URL

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Blue/Green Deploy
        run: ./scripts/blue-green-deploy.sh\`,
  },
};

export function PipelineGuide() {
  const [activeStage, setActiveStage] = useState("commit");
  const detail = stageDetails[activeStage];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold">Pipeline CI/CD</h2>

      {/* Visual Pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-4">
        {pipelineStages.map((stage, i) => (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => setActiveStage(stage.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap",
                activeStage === stage.id
                  ? stage.bgColor + " text-white shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <stage.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{stage.label}</span>
            </button>
            {i < pipelineStages.length - 1 && (
              <div className="w-8 h-0.5 bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6 space-y-4 border-border/40">
        <p className="text-muted-foreground">{detail.description}</p>
        <div className="flex flex-wrap gap-2">
          {detail.tools.map((t) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{detail.code}</code>
        </pre>
      </Card>
    </section>
  );
}
`,
);

w(
  "security-devops/cicd/page.tsx",
  `
import { Metadata } from "next";
import { PipelineGuide } from "./_components/pipeline-guide";
import { GitBranch } from "lucide-react";

export const metadata: Metadata = {
  title: "CI/CD Pipelines | TechMastry",
  description: "Conception de pipelines CI/CD avec GitHub Actions, stratégies de déploiement et bonnes pratiques",
};

export default function CICDPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <GitBranch className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">CI/CD Pipelines</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Concevez des pipelines d&apos;intégration et de déploiement continus robustes
            avec GitHub Actions et les meilleures pratiques DevOps.
          </p>
        </div>
      </section>
      <PipelineGuide />
    </main>
  );
}
`,
);

// Docker & Kubernetes
w(
  "security-devops/docker-kubernetes/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "lucide-react";

export const metadata: Metadata = {
  title: "Docker & Kubernetes | TechMastry",
  description: "Conteneurisation avec Docker et orchestration avec Kubernetes",
};

const concepts = [
  {
    title: "Container vs VM",
    desc: "Les conteneurs partagent le noyau OS, sont légers (~MB) et démarrent en secondes. Les VMs virtualisent tout le hardware, sont lourdes (~GB) et démarrent en minutes.",
    color: "border-cyan-500/30",
  },
  {
    title: "Dockerfile Best Practices",
    desc: "Multi-stage builds, .dockerignore, non-root user, layer caching. Chaque instruction crée un layer — minimisez-les.",
    color: "border-blue-500/30",
  },
  {
    title: "Kubernetes Architecture",
    desc: "Control Plane (API Server, Scheduler, Controller Manager, etcd) + Worker Nodes (Kubelet, Kube-Proxy, Container Runtime).",
    color: "border-purple-500/30",
  },
];

const k8sResources = [
  { name: "Pod", desc: "Plus petite unité déployable. Un ou plusieurs conteneurs partageant réseau et stockage." },
  { name: "Deployment", desc: "Gère le cycle de vie des Pods. Rolling updates, rollbacks, scaling." },
  { name: "Service", desc: "Expose les Pods avec un point d'accès réseau stable (ClusterIP, NodePort, LoadBalancer)." },
  { name: "Ingress", desc: "Routage HTTP/HTTPS externe vers les Services internes. TLS termination." },
  { name: "ConfigMap/Secret", desc: "Configuration externalisée et gestion des secrets (chiffrés au repos)." },
  { name: "HPA", desc: "Horizontal Pod Autoscaler. Scale automatique basé sur CPU/mémoire/métriques custom." },
];

export default function DockerKubernetesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <Container className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Docker & Kubernetes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conteneurisation et orchestration : les fondations du déploiement cloud moderne.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Concepts Fondamentaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concepts.map((c) => (
            <Card key={c.title} className={"p-6 space-y-3 border-2 " + c.color}>
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Ressources Kubernetes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {k8sResources.map((r) => (
            <Card key={r.name} className="p-5 space-y-2 border-border/40">
              <h3 className="font-semibold text-primary">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Dockerfile Multi-Stage</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{\`# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]\`}</code>
        </pre>
      </section>
    </main>
  );
}
`,
);

// Cloud Native
w(
  "security-devops/cloud-native/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud Native | TechMastry",
  description: "Architecture 12-Factor, Serverless et bonnes pratiques Cloud Native",
};

const twelveFactor = [
  { num: "I", name: "Codebase", desc: "Un dépôt unique suivi en contrôle de version, plusieurs déploiements." },
  { num: "II", name: "Dependencies", desc: "Déclarez et isolez explicitement les dépendances." },
  { num: "III", name: "Config", desc: "Stockez la configuration dans l'environnement, pas dans le code." },
  { num: "IV", name: "Backing Services", desc: "Traitez les services externes comme des ressources attachées." },
  { num: "V", name: "Build, Release, Run", desc: "Séparez strictement les étapes de build et d'exécution." },
  { num: "VI", name: "Processes", desc: "Exécutez l'app comme un ou plusieurs processus sans état." },
  { num: "VII", name: "Port Binding", desc: "Exportez les services via le port binding." },
  { num: "VIII", name: "Concurrency", desc: "Scalez horizontalement via le modèle de processus." },
  { num: "IX", name: "Disposability", desc: "Maximisez la robustesse avec un démarrage rapide et un arrêt gracieux." },
  { num: "X", name: "Dev/Prod Parity", desc: "Gardez dev, staging et production aussi similaires que possible." },
  { num: "XI", name: "Logs", desc: "Traitez les logs comme des flux d'événements." },
  { num: "XII", name: "Admin Processes", desc: "Exécutez les tâches d'admin comme des processus ponctuels." },
];

export default function CloudNativePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <Cloud className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Cloud Native</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Principes d&apos;architecture pour des applications nativement conçues pour le cloud :
            scalables, résilientes et observables.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Les 12 Facteurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {twelveFactor.map((f) => (
            <Card key={f.num} className="p-5 space-y-2 border-border/40 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 text-sm font-bold">
                  {f.num}
                </span>
                <h3 className="font-semibold">{f.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Serverless : Quand l&apos;utiliser ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-green-500/30 bg-green-500/5">
            <h3 className="font-semibold text-green-500">✅ Bon pour</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• APIs avec trafic variable ou imprévisible</li>
              <li>• Traitements événementiels (uploads, webhooks)</li>
              <li>• Jobs CRON et tâches planifiées</li>
              <li>• Prototypage rapide et MVPs</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3 border-red-500/30 bg-red-500/5">
            <h3 className="font-semibold text-red-500">❌ Éviter pour</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Applications avec latence critique (cold starts)</li>
              <li>• Workloads intensifs en calcul (ML, vidéo)</li>
              <li>• Connexions longues (WebSocket)</li>
              <li>• Applications avec état (stateful)</li>
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
`,
);

console.log("P1.2 Security-DevOps: DONE");

// =============================================================
//  P1.5 — SYSTEM DESIGN MISSING SUB-PAGES
// =============================================================
console.log("\n=== P1.5 SYSTEM DESIGN MISSING ===");

// Case Studies
w(
  "system-design/case-studies/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Études de Cas | System Design",
  description: "Analyses détaillées de systèmes réels : URL Shortener, Chat, Social Network, Video Streaming",
};

const caseStudies = [
  {
    title: "URL Shortener (TinyURL)",
    difficulty: "Medium",
    requirements: ["100M URLs/jour", "Read-heavy (100:1)", "Redirection < 10ms", "7 characters"],
    components: ["API Gateway", "Hash Service", "Key-Value Store (Redis)", "Analytics"],
    keyDecisions: [
      "Base62 encoding vs Hash + collision detection",
      "Read replicas pour le throughput",
      "Cache LRU pour les URLs populaires",
      "TTL pour l'expiration automatique",
    ],
    color: "border-blue-500/30",
  },
  {
    title: "Chat System (WhatsApp)",
    difficulty: "Hard",
    requirements: ["1B users", "Messages en temps réel", "Delivery guarantees", "Group chats"],
    components: ["WebSocket Gateway", "Message Queue (Kafka)", "Cassandra", "Presence Service"],
    keyDecisions: [
      "WebSocket pour bi-directionnel temps réel",
      "Sharding par conversation ID",
      "Eventual consistency acceptable",
      "Message ordering via sequence IDs",
    ],
    color: "border-green-500/30",
  },
  {
    title: "Social Network Feed (Twitter/X)",
    difficulty: "Hard",
    requirements: ["500M tweets/jour", "Timeline personnalisée", "Celebrity problem", "Real-time"],
    components: ["Fan-out Service", "Timeline Cache", "Graph DB (followers)", "Search Index"],
    keyDecisions: [
      "Fan-out on write vs Fan-out on read (hybride)",
      "Celebrities : fan-out on read (trop de followers)",
      "Timeline pré-calculée en cache Redis",
      "Pagination par cursor, pas offset",
    ],
    color: "border-purple-500/30",
  },
  {
    title: "Video Streaming (Netflix/YouTube)",
    difficulty: "Expert",
    requirements: ["1B vidéos/jour", "Adaptive bitrate", "Global CDN", "< 2s start time"],
    components: ["Transcoding Pipeline", "CDN (multi-tier)", "Recommendation Engine", "DRM"],
    keyDecisions: [
      "Transcoding asynchrone multi-résolution (DAG)",
      "CDN edge caching + origin shields",
      "Adaptive Bitrate Streaming (ABR/HLS/DASH)",
      "Pre-fetching des segments suivants",
    ],
    color: "border-red-500/30",
  },
];

const diffColors: Record<string, string> = {
  Medium: "bg-yellow-500/10 text-yellow-500",
  Hard: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export default function CaseStudiesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Études de Cas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyses détaillées de systèmes réels à grande échelle. Comprenez les décisions
            d&apos;architecture derrière les plus grands systèmes du monde.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        {caseStudies.map((cs) => (
          <Card key={cs.title} className={"p-8 space-y-6 border-2 " + cs.color}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">{cs.title}</h2>
              <Badge className={diffColors[cs.difficulty]}>{cs.difficulty}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Requirements</h3>
                <ul className="space-y-1.5">
                  {cs.requirements.map((r) => (
                    <li key={r} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Components</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cs.components.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Key Decisions</h3>
                <ul className="space-y-1.5">
                  {cs.keyDecisions.map((d) => (
                    <li key={d} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
`,
);

// System Design Security
w(
  "system-design/security/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Sécurité | System Design",
  description: "Authentification, chiffrement, OWASP et sécurité dans le system design",
};

const securityLayers = [
  {
    layer: "Network",
    items: ["TLS/HTTPS everywhere", "VPC & Private Subnets", "WAF (Web Application Firewall)", "DDoS protection (CloudFlare, AWS Shield)"],
    color: "text-red-500",
  },
  {
    layer: "Application",
    items: ["Input validation (Zod)", "Output encoding", "CORS configuration", "CSP headers", "Rate limiting"],
    color: "text-orange-500",
  },
  {
    layer: "Authentication",
    items: ["OAuth 2.0 / OIDC", "JWT with rotation", "MFA (TOTP/WebAuthn)", "Session management", "Password hashing (bcrypt/Argon2)"],
    color: "text-yellow-500",
  },
  {
    layer: "Authorization",
    items: ["RBAC (Role-Based)", "ABAC (Attribute-Based)", "Row-level security", "API scopes", "Principle of least privilege"],
    color: "text-green-500",
  },
  {
    layer: "Data",
    items: ["Encryption at rest (AES-256)", "Encryption in transit (TLS 1.3)", "Key management (KMS)", "PII anonymization", "Backup encryption"],
    color: "text-blue-500",
  },
];

export default function SystemDesignSecurityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Sécurité en System Design</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Defense in depth : chaque couche de votre architecture doit intégrer
            la sécurité comme préoccupation fondamentale.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Sécurité en Couches</h2>
        <div className="space-y-4">
          {securityLayers.map((layer) => (
            <Card key={layer.layer} className="p-6 border-border/40">
              <div className="flex items-start gap-4">
                <div className={"font-bold text-lg w-32 shrink-0 " + layer.color}>
                  {layer.layer}
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">JWT vs Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">JWT (Stateless)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Scalable (pas de stockage serveur)</li>
              <li>✅ Microservices-friendly</li>
              <li>⚠️ Impossible à révoquer avant expiration</li>
              <li>⚠️ Payload visible (signer, ne pas chiffrer les secrets)</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Sessions (Stateful)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Révocable immédiatement</li>
              <li>✅ Données sensibles côté serveur</li>
              <li>⚠️ Nécessite stockage centralisé (Redis)</li>
              <li>⚠️ Problème de sticky sessions si mal configuré</li>
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
`,
);

// System Design Monitoring
w(
  "system-design/monitoring/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Monitoring & Fiabilité | System Design",
  description: "Observabilité, alerting, SLO/SLI/SLA et métriques pour des systèmes fiables",
};

const pillars = [
  {
    name: "Logs",
    desc: "Événements textuels structurés pour le debugging et l'audit. Utilisez des formats structurés (JSON) avec corrélation IDs.",
    tools: ["ELK Stack", "Loki + Grafana", "CloudWatch Logs", "Datadog"],
    color: "text-blue-500",
  },
  {
    name: "Metrics",
    desc: "Données numériques agrégées dans le temps : latence, throughput, error rate, saturation (USE/RED methods).",
    tools: ["Prometheus", "Grafana", "Datadog", "CloudWatch Metrics"],
    color: "text-green-500",
  },
  {
    name: "Traces",
    desc: "Suivi d'une requête à travers les services distribués. Identifie les bottlenecks et les dépendances.",
    tools: ["Jaeger", "Zipkin", "OpenTelemetry", "AWS X-Ray"],
    color: "text-purple-500",
  },
];

const slos = [
  { term: "SLI", full: "Service Level Indicator", desc: "Métrique quantitative du niveau de service (ex: latency p99 < 200ms).", color: "text-blue-500" },
  { term: "SLO", full: "Service Level Objective", desc: "Objectif interne de qualité (ex: 99.9% des requêtes < 200ms sur 30 jours).", color: "text-green-500" },
  { term: "SLA", full: "Service Level Agreement", desc: "Engagement contractuel avec le client. SLA < SLO pour avoir une marge.", color: "text-red-500" },
  { term: "Error Budget", full: "Budget d'Erreur", desc: "100% - SLO = budget pour innover. Ex: SLO 99.9% = 43min/mois de downtime autorisé.", color: "text-orange-500" },
];

export default function MonitoringPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Monitoring & Fiabilité</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Observabilité, alerting et SRE : les pratiques pour garantir la fiabilité
            de vos systèmes en production.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Les 3 Piliers de l&apos;Observabilité</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <Card key={p.name} className="p-6 space-y-4 border-border/40">
              <h3 className={"text-xl font-bold " + p.color}>{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tools.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">SLI / SLO / SLA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slos.map((s) => (
            <Card key={s.term} className="p-6 space-y-2 border-border/40">
              <div className="flex items-center gap-3">
                <span className={"text-2xl font-black " + s.color}>{s.term}</span>
                <span className="text-sm text-muted-foreground">{s.full}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
);

console.log("P1.5 System Design missing: DONE");

// =============================================================
//  P1.6 — BACKEND MISSING SUB-PAGES
// =============================================================
console.log("\n=== P1.6 BACKEND MISSING ===");

// API Design
w(
  "backend/api-design/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";

export const metadata: Metadata = {
  title: "API Design | TechMastry",
  description: "REST, GraphQL, gRPC et WebSocket : conception d'APIs modernes et performantes",
};

const apiStyles = [
  {
    name: "REST",
    description: "Architectural style basé sur les ressources HTTP. Le plus répandu pour les APIs publiques.",
    pros: ["Standard universel", "Cacheable", "Facile à comprendre", "Tooling riche"],
    cons: ["Over-fetching / Under-fetching", "Pas de contrat strict natif", "Versioning complexe"],
    useCase: "APIs publiques, CRUD, microservices",
    color: "border-blue-500/30",
  },
  {
    name: "GraphQL",
    description: "Langage de requête pour APIs. Le client demande exactement les données dont il a besoin.",
    pros: ["Pas d'over-fetching", "Un seul endpoint", "Typage fort (schema)", "Introspection"],
    cons: ["Complexité serveur", "Caching plus difficile", "N+1 queries", "Courbe d'apprentissage"],
    useCase: "Apps mobiles, dashboards, données relationnelles complexes",
    color: "border-pink-500/30",
  },
  {
    name: "gRPC",
    description: "RPC framework haute performance avec Protocol Buffers. Communication inter-services.",
    pros: ["Ultra performant (binaire)", "Streaming bi-directionnel", "Code generation", "Contrat strict"],
    cons: ["Pas browser-friendly natif", "Debugging plus difficile", "Moins de tooling"],
    useCase: "Communication inter-microservices, streaming, IoT",
    color: "border-green-500/30",
  },
  {
    name: "WebSocket",
    description: "Protocole full-duplex pour communication en temps réel sur une connexion persistante.",
    pros: ["Temps réel", "Bi-directionnel", "Faible latence", "Événementiel"],
    cons: ["Gestion d'état complexe", "Pas de caching HTTP", "Load balancing complexe"],
    useCase: "Chat, notifications, collaborative editing, gaming",
    color: "border-orange-500/30",
  },
];

const restBestPractices = [
  { rule: "Noms de ressources au pluriel", example: "GET /api/users, POST /api/orders" },
  { rule: "Verbes HTTP sémantiques", example: "GET (lire), POST (créer), PATCH (modifier), DELETE (supprimer)" },
  { rule: "Status codes appropriés", example: "200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)" },
  { rule: "Pagination systématique", example: "GET /api/users?page=1&limit=20&sort=createdAt:desc" },
  { rule: "Versioning", example: "/api/v1/users ou Accept: application/vnd.api.v1+json" },
  { rule: "HATEOAS (liens)", example: "Inclure les liens vers les actions possibles dans la réponse" },
];

export default function ApiDesignPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Server className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">API Design</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comparez REST, GraphQL, gRPC et WebSocket. Choisissez le bon style et
            appliquez les bonnes pratiques pour des APIs robustes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Styles d&apos;API</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiStyles.map((api) => (
            <Card key={api.name} className={"p-6 space-y-4 border-2 " + api.color}>
              <h3 className="text-xl font-bold">{api.name}</h3>
              <p className="text-sm text-muted-foreground">{api.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-500 mb-1">Avantages</p>
                  <ul className="space-y-1">
                    {api.pros.map((p) => (
                      <li key={p} className="text-xs text-muted-foreground">✅ {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-500 mb-1">Inconvénients</p>
                  <ul className="space-y-1">
                    {api.cons.map((c) => (
                      <li key={c} className="text-xs text-muted-foreground">⚠️ {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{api.useCase}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">REST Best Practices</h2>
        <div className="space-y-3">
          {restBestPractices.map((bp) => (
            <Card key={bp.rule} className="p-4 border-border/40">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-medium text-sm w-64 shrink-0">{bp.rule}</span>
                <code className="text-xs bg-muted/50 px-3 py-1.5 rounded-md text-muted-foreground">
                  {bp.example}
                </code>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
);

// Databases
w(
  "backend/databases/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Bases de Données | TechMastry",
  description: "SQL, NoSQL, indexation, transactions et optimisation des requêtes",
};

const dbTypes = [
  {
    type: "Relationnelle (SQL)",
    examples: "PostgreSQL, MySQL, SQLite",
    bestFor: "Données structurées, relations complexes, ACID, reporting",
    features: ["ACID Transactions", "Joins complexes", "Schemas stricts", "Indexation avancée"],
    color: "text-blue-500",
  },
  {
    type: "Document (NoSQL)",
    examples: "MongoDB, Firestore, CouchDB",
    bestFor: "Données semi-structurées, prototypage rapide, schéma flexible",
    features: ["Schema flexible", "Scalabilité horizontale", "Dénormalisé", "JSON natif"],
    color: "text-green-500",
  },
  {
    type: "Key-Value",
    examples: "Redis, DynamoDB, Memcached",
    bestFor: "Cache, sessions, compteurs, rate limiting",
    features: ["Ultra rapide (O(1))", "TTL natif", "Pub/Sub", "Data structures riches"],
    color: "text-red-500",
  },
  {
    type: "Graph",
    examples: "Neo4j, Amazon Neptune, ArangoDB",
    bestFor: "Réseaux sociaux, recommandations, fraud detection",
    features: ["Traversées rapides", "Relations first-class", "Pattern matching", "Cypher/GQL"],
    color: "text-purple-500",
  },
];

const indexTypes = [
  { name: "B-Tree", desc: "Index par défaut. Bon pour les requêtes d'égalité et de range. O(log n)." },
  { name: "Hash", desc: "Recherche exacte en O(1). Pas de range queries. Idéal pour lookups." },
  { name: "GIN", desc: "Generalized Inverted Index. Full-text search, JSON, arrays." },
  { name: "GiST", desc: "Generalized Search Tree. Données géographiques, range types." },
  { name: "Partial", desc: "Index sur un sous-ensemble de lignes (WHERE condition). Réduit la taille." },
  { name: "Composite", desc: "Index multi-colonnes. L'ordre des colonnes est crucial." },
];

export default function DatabasesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Bases de Données</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez le bon type de base de données, optimisez vos requêtes et maîtrisez
            l&apos;indexation pour des applications performantes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Types de Bases de Données</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dbTypes.map((db) => (
            <Card key={db.type} className="p-6 space-y-3 border-border/40">
              <h3 className={"text-lg font-bold " + db.color}>{db.type}</h3>
              <p className="text-xs text-muted-foreground">{db.examples}</p>
              <p className="text-sm text-muted-foreground">{db.bestFor}</p>
              <div className="flex flex-wrap gap-1.5">
                {db.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Stratégies d&apos;Indexation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indexTypes.map((idx) => (
            <Card key={idx.name} className="p-5 space-y-2 border-border/40">
              <h3 className="font-semibold text-primary">{idx.name}</h3>
              <p className="text-sm text-muted-foreground">{idx.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
);

// Backend Security
w(
  "backend/security/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sécurité Backend | TechMastry",
  description: "Auth, JWT, OAuth, rate limiting, input validation et bonnes pratiques de sécurité backend",
};

const authFlows = [
  {
    name: "JWT Authentication",
    steps: ["User envoie credentials", "Server vérifie et génère access + refresh token", "Client stocke les tokens", "Access token dans Authorization header", "Refresh quand expiré"],
    pros: ["Stateless", "Scalable", "Cross-domain"],
    cons: ["Pas révocable natif", "Payload en base64 (lisible)"],
  },
  {
    name: "OAuth 2.0 (Authorization Code)",
    steps: ["Redirect vers provider (Google/GitHub)", "User autorise", "Provider redirect avec auth code", "Server échange code contre tokens", "Server crée session locale"],
    pros: ["Pas de gestion de mots de passe", "SSO", "Scopes granulaires"],
    cons: ["Complexité du flow", "Dépendance au provider"],
  },
  {
    name: "Session-based Auth",
    steps: ["User envoie credentials", "Server crée session (stockée en Redis)", "Session ID dans cookie HttpOnly", "Cookie envoyé automatiquement", "Server vérifie session ID"],
    pros: ["Révocable instantanément", "Données côté serveur", "Simple"],
    cons: ["Sticky sessions", "Stockage centralisé nécessaire"],
  },
];

const securityChecklist = [
  "Input validation avec Zod sur toutes les entrées",
  "Rate limiting (100 req/min par IP pour les APIs publiques)",
  "CORS strict (origines autorisées explicites)",
  "Helmet.js pour les security headers (CSP, HSTS, X-Frame-Options)",
  "Password hashing avec bcrypt (12+ rounds) ou Argon2",
  "HTTPS obligatoire (HSTS preload)",
  "Secrets dans des variables d'environnement (jamais dans le code)",
  "SQL injection impossible avec ORM (Prisma paramétrise automatiquement)",
  "CSRF protection avec double-submit cookie ou SameSite=Strict",
  "Logging des tentatives de connexion échouées",
];

export default function BackendSecurityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Sécurité Backend</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Authentification, autorisation, validation et toutes les bonnes pratiques
            pour sécuriser vos applications backend.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Flows d&apos;Authentification</h2>
        <div className="space-y-6">
          {authFlows.map((flow) => (
            <Card key={flow.name} className="p-6 space-y-4 border-border/40">
              <h3 className="text-xl font-bold">{flow.name}</h3>
              <div className="flex flex-wrap gap-2">
                {flow.steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                    {i < flow.steps.length - 1 && <span className="text-muted-foreground mx-1">→</span>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  {flow.pros.map((p) => (
                    <p key={p} className="text-xs text-muted-foreground">✅ {p}</p>
                  ))}
                </div>
                <div>
                  {flow.cons.map((c) => (
                    <p key={c} className="text-xs text-muted-foreground">⚠️ {c}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Checklist Sécurité</h2>
        <Card className="p-6 border-border/40">
          <div className="space-y-3">
            {securityChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/30 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
`,
);

console.log("P1.6 Backend missing: DONE");

// =============================================================
//  P1.7 — PREPARATION MISSING SUB-PAGES
// =============================================================
console.log("\n=== P1.7 PREPARATION MISSING ===");

w(
  "preparation/mock-interviews/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Mock Interviews | TechMastry",
  description: "Simulations d'entretiens techniques avec timer, questions et feedback structuré",
};

const interviewTypes = [
  {
    type: "Algorithme (45 min)",
    structure: ["Introduction (2 min)", "Clarification du problème (5 min)", "Approche & Pseudocode (10 min)", "Implémentation (20 min)", "Tests & Optimisation (5 min)", "Questions (3 min)"],
    tips: ["Pensez à voix haute", "Commencez par la force brute", "Analysez la complexité", "Testez avec des edge cases"],
    color: "border-blue-500/30",
  },
  {
    type: "System Design (45 min)",
    structure: ["Clarification des requirements (5 min)", "Estimation & contraintes (5 min)", "High-level design (15 min)", "Deep dive composant (15 min)", "Trade-offs & améliorations (5 min)"],
    tips: ["Demandez les NFRs", "Commencez par un diagramme", "Calculez le throughput", "Discutez des trade-offs"],
    color: "border-purple-500/30",
  },
  {
    type: "Behavioral (30 min)",
    structure: ["Tell me about yourself (3 min)", "Question STAR #1 (8 min)", "Question STAR #2 (8 min)", "Question STAR #3 (8 min)", "Vos questions (3 min)"],
    tips: ["Préparez 5 histoires STAR", "Quantifiez les résultats", "Montrez votre croissance", "Soyez authentique"],
    color: "border-green-500/30",
  },
];

export default function MockInterviewsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Mock Interviews</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Structures d&apos;entretien détaillées pour chaque type : algorithme,
            system design et behavioral. Pratiquez avec un timer.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {interviewTypes.map((interview) => (
          <Card key={interview.type} className={"p-8 space-y-6 border-2 " + interview.color}>
            <h2 className="text-2xl font-bold">{interview.type}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Structure</h3>
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
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Conseils</h3>
                <ul className="space-y-2">
                  {interview.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
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
    </main>
  );
}
`,
);

w(
  "preparation/stress-management/page.tsx",
  `
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestion du Stress | TechMastry",
  description: "Techniques de gestion du stress, exercices de respiration et préparation mentale",
};

const techniques = [
  {
    name: "Respiration 4-7-8",
    description: "Technique de relaxation rapide. Inspirez 4s, retenez 7s, expirez 8s. Répétez 3-4 fois.",
    when: "Avant l'entretien ou pendant un moment de panique",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "Visualisation Positive",
    description: "Fermez les yeux et visualisez-vous réussir l'entretien. Imaginez chaque détail : votre posture, votre voix calme, vos réponses fluides.",
    when: "La veille et le matin de l'entretien",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    name: "Recadrage Cognitif",
    description: "Transformez 'Je vais échouer' en 'C\\'est une opportunité d\\'apprentissage'. Le stress est de l'énergie — redirigez-la.",
    when: "Quand les pensées négatives apparaissent",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Grounding (5-4-3-2-1)",
    description: "Identifiez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez.",
    when: "Pendant un moment de stress intense",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    name: "Power Posing",
    description: "Adoptez une posture ouverte et confiante pendant 2 minutes. Augmente la testostérone et réduit le cortisol.",
    when: "5 minutes avant l'entretien (en privé)",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Préparation Physique",
    description: "Exercice physique la veille, bon sommeil (7-8h), repas léger, hydratation. Le corps influence l'esprit.",
    when: "Les 24h avant l'entretien",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const mindsetShifts = [
  { from: "Je dois être parfait", to: "Je dois montrer comment je réfléchis" },
  { from: "Ils vont me piéger", to: "Ils veulent me voir réussir" },
  { from: "Je ne sais pas assez", to: "Personne ne sait tout, et c'est OK" },
  { from: "Si je bloque, c'est fini", to: "Bloquer et raisonner à voix haute est normal et attendu" },
  { from: "C'est un examen", to: "C'est une conversation entre professionnels" },
];

export default function StressManagementPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/10 text-pink-500">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Gestion du Stress</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Techniques éprouvées pour gérer le stress avant et pendant vos entretiens.
            Le stress est naturel — apprenez à le transformer en allié.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techniques.map((t) => (
            <Card key={t.name} className="p-6 space-y-3 border-border/40 hover:shadow-md transition-shadow">
              <h3 className={"font-semibold text-lg " + t.color}>{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <Badge className={t.bgColor + " " + t.color + " text-xs"}>
                {t.when}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Changements de Mindset</h2>
        <div className="space-y-3">
          {mindsetShifts.map((shift) => (
            <Card key={shift.from} className="p-4 border-border/40">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-red-500 line-through flex-1 min-w-[200px]">
                  {shift.from}
                </span>
                <span className="text-primary font-bold">→</span>
                <span className="text-sm text-green-500 font-medium flex-1 min-w-[200px]">
                  {shift.to}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
);

console.log("P1.7 Preparation missing: DONE");
console.log("\n✅ ALL PHASE 1 PAGES CREATED");
