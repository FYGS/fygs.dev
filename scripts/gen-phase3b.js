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
  const p = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("  Created:", rel);
}

// ============================================================
// P3.3 — SYSTEM DESIGN WHITEBOARD
// ============================================================
console.log("\n=== P3.3 SYSTEM DESIGN WHITEBOARD ===");

w(
  "system-design/whiteboard/page.tsx",
  `import type { Metadata } from "next";
import { WhiteboardExercises } from "./_components/whiteboard-exercises";

export const metadata: Metadata = {
  title: "Whiteboard Interactif | Tech-Mastry",
  description: "Exercices de design système sur whiteboard : URL shortener, chat system, e-commerce et plus.",
};

export default function WhiteboardPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 mb-2">
          <span className="text-3xl">🏗️</span>
        </div>
        <h1 className="text-4xl font-bold">Whiteboard Interactif</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pratiquez les exercices de system design comme en entretien.
          Suivez la méthodologie structurée étape par étape.
        </p>
      </div>
      <WhiteboardExercises />
    </main>
  );
}
`,
);

w(
  "system-design/whiteboard/_components/whiteboard-exercises.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Clock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface DesignStep {
  title: string;
  description: string;
  duration: string;
  questions: string[];
  tips: string[];
  solution?: string;
}

interface DesignExercise {
  title: string;
  difficulty: "medium" | "hard" | "expert";
  duration: string;
  companies: string[];
  description: string;
  requirements: { functional: string[]; nonFunctional: string[] };
  steps: DesignStep[];
}

const exercises: DesignExercise[] = [
  {
    title: "URL Shortener (comme bit.ly)",
    difficulty: "medium",
    duration: "35 min",
    companies: ["Google", "Amazon", "Meta"],
    description: "Concevoir un service de raccourcissement d'URL supportant des milliards d'URLs.",
    requirements: {
      functional: [
        "Raccourcir une URL longue → URL courte",
        "Rediriger URL courte → URL longue",
        "URLs uniques et non-prédictibles",
        "Expiration configurable (optionnel)",
        "Analytics : nombre de clics, géolocalisation",
      ],
      nonFunctional: [
        "Haute disponibilité (99.9%)",
        "Faible latence de redirection (< 100ms)",
        "100M URLs créées/jour, 10:1 ratio lecture/écriture",
      ],
    },
    steps: [
      {
        title: "1. Clarifier les exigences",
        description: "Poser les questions pour délimiter le périmètre.",
        duration: "5 min",
        questions: [
          "Quel est le volume ? (URLs/jour, lectures/écritures)",
          "Faut-il des URLs custom ?",
          "Combien de temps garder les URLs ?",
          "Faut-il des analytics ?",
        ],
        tips: ["Toujours demander les chiffres", "Ne pas supposer, demander"],
      },
      {
        title: "2. Calculs de capacité",
        description: "Estimer le stockage, la bande passante et le QPS.",
        duration: "5 min",
        questions: [
          "100M URLs/jour → ~1200/sec écriture, ~12000/sec lecture",
          "Stockage : 100M × 365 × 5 ans × 500 bytes ≈ 90 TB",
          "Cache : 20% des URLs = 80% du trafic → ~20GB en mémoire",
        ],
        tips: ["Round les chiffres pour simplifier", "Montrer votre raisonnement"],
        solution: \`QPS écriture : 100M / (24 × 3600) ≈ 1200/s
QPS lecture : 1200 × 10 = 12000/s
Stockage 5 ans : 100M × 365 × 5 × 500B = 91.25 TB
Cache (règle 80/20) : 12000/s × 86400 × 0.2 × 500B ≈ 20 GB\`,
      },
      {
        title: "3. API Design",
        description: "Définir les endpoints REST.",
        duration: "3 min",
        questions: [
          "POST /api/v1/urls { longUrl, customAlias?, expiresAt? } → { shortUrl }",
          "GET /{shortCode} → 301/302 Redirect",
          "GET /api/v1/urls/{shortCode}/stats → { clicks, created, ... }",
        ],
        tips: ["Mentionner la versioning de l'API", "301 (permanent) vs 302 (temporaire) — discuter les trade-offs"],
      },
      {
        title: "4. Architecture haut niveau",
        description: "Dessiner les composants principaux et les flux.",
        duration: "10 min",
        questions: [
          "Load Balancer → API Servers (stateless)",
          "Base de données pour le mapping URL",
          "Cache layer (Redis) pour les redirections rapides",
          "Génération d'ID unique (base62 encoding)",
        ],
        tips: [
          "Commencer par le flow principal avant les détails",
          "Séparer lecture et écriture si pertinent",
        ],
        solution: \`Client → Load Balancer → API Server → Cache (Redis)
                                    ↓                 ↓
                              Write Path         Read Path
                                    ↓                 ↓
                              ID Generator       Redis lookup
                                    ↓           (miss → DB)
                              Database              ↓
                              (NoSQL)           302 Redirect\`,
      },
      {
        title: "5. Deep dive",
        description: "Approfondir les composants critiques.",
        duration: "10 min",
        questions: [
          "Génération d'ID : Counter distribué vs MD5/SHA256 6 premiers chars vs Snowflake ID ?",
          "Base de données : NoSQL (DynamoDB/Cassandra) pour le throughput",
          "Cache : Redis avec TTL, write-through vs write-behind",
          "Sharding : par hash du shortCode, consistent hashing",
        ],
        tips: [
          "Comparer les trade-offs de chaque approche",
          "L'intervieweur peut demander d'approfondir un composant",
        ],
      },
      {
        title: "6. Scalabilité & Résilience",
        description: "Comment scaler et gérer les pannes.",
        duration: "5 min",
        questions: [
          "Database sharding et replication",
          "CDN pour les redirections géo-distribuées",
          "Rate limiting pour prévenir l'abus",
          "Monitoring et alerting",
        ],
        tips: ["Terminer avec les améliorations possibles", "Mentionner les SLOs"],
      },
    ],
  },
  {
    title: "Chat System (comme WhatsApp)",
    difficulty: "hard",
    duration: "45 min",
    companies: ["Meta", "Microsoft", "Slack"],
    description: "Concevoir un système de messagerie en temps réel supportant des millions d'utilisateurs simultanés.",
    requirements: {
      functional: [
        "Messages 1-to-1 et de groupe (jusqu'à 500 membres)",
        "Indicateurs de livraison (envoyé, reçu, lu)",
        "Partage de médias (images, vidéos, fichiers)",
        "Présence en ligne (online/offline/typing)",
        "Historique de messages persistant",
      ],
      nonFunctional: [
        "Livraison en temps réel (< 200ms)",
        "Haute disponibilité (99.99%)",
        "Cohérence éventuelle acceptable pour le statut",
        "500M utilisateurs actifs, 50M messages/heure",
      ],
    },
    steps: [
      {
        title: "1. Protocole de communication",
        description: "Choisir entre polling, long-polling, SSE et WebSocket.",
        duration: "5 min",
        questions: [
          "WebSocket pour la bidirectionnalité temps réel",
          "Fallback HTTP long-polling pour compatibilité",
          "MQTT pour contraintes réseau mobile",
        ],
        tips: ["WebSocket = choix évident mais mentionner les alternatives"],
      },
      {
        title: "2. Architecture de base",
        description: "Composants principaux du système.",
        duration: "10 min",
        questions: [
          "Chat Server (WebSocket Gateway) → gère les connexions",
          "Message Queue (Kafka) pour la distribution asynchrone",
          "Session Service → mapping user ↔ serveur",
          "Database → stockage des messages (Cassandra idéal)",
        ],
        tips: ["Séparer le online (WebSocket) du offline (push notifications)"],
        solution: \`User A → WS Gateway A → Message Queue (Kafka)
                                          ↓
                   User B ← WS Gateway B ← Consumer
                                          ↓
                                     Cassandra (persistence)
                                          ↓
                                  Push Notification (si offline)\`,
      },
      {
        title: "3. Messages de groupe",
        description: "Comment distribuer aux N membres efficacement.",
        duration: "8 min",
        questions: [
          "Fan-out on write : message copié pour chaque membre (simple, coûteux)",
          "Fan-out on read : message stocké 1 fois, lu par chaque membre (économe, latent)",
          "Hybride : fan-out on write pour petits groupes, on read pour grands",
        ],
        tips: ["Trade-off : écriture lente vs lecture lente"],
      },
      {
        title: "4. Livraison garantie",
        description: "Assurer que chaque message est délivré.",
        duration: "7 min",
        questions: [
          "Sequence IDs par conversation pour l'ordre",
          "ACK client → serveur pour confirmer la réception",
          "Retry avec idempotency (message ID unique)",
          "Stockage offline → sync au reconnect",
        ],
        tips: ["At-least-once delivery + idempotency = exactly-once semantics"],
      },
      {
        title: "5. Scalabilité",
        description: "Comment supporter des millions d'utilisateurs.",
        duration: "10 min",
        questions: [
          "Consistent hashing pour distribuer les connexions WebSocket",
          "Cassandra : partitionnement par (conversation_id, message_timestamp)",
          "Redis : cache des derniers messages + session mapping",
          "CDN pour les médias (S3 + CloudFront)",
        ],
        tips: ["1 serveur WebSocket ≈ 50K connexions → calcul du nombre de serveurs"],
      },
    ],
  },
];

const methodology = [
  { step: "Clarifier", pct: "15%", color: "bg-blue-500" },
  { step: "Estimer", pct: "10%", color: "bg-green-500" },
  { step: "API", pct: "10%", color: "bg-yellow-500" },
  { step: "High-Level", pct: "25%", color: "bg-orange-500" },
  { step: "Deep Dive", pct: "25%", color: "bg-red-500" },
  { step: "Scale", pct: "15%", color: "bg-purple-500" },
];

export function WhiteboardExercises() {
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState<Set<string>>(new Set());

  const toggleStep = (stepKey: string) => {
    const next = new Set(completedSteps);
    if (next.has(stepKey)) next.delete(stepKey);
    else next.add(stepKey);
    setCompletedSteps(next);
  };

  const toggleSolution = (stepKey: string) => {
    const next = new Set(showSolution);
    if (next.has(stepKey)) next.delete(stepKey);
    else next.add(stepKey);
    setShowSolution(next);
  };

  if (activeExercise !== null) {
    const ex = exercises[activeExercise];
    const totalSteps = ex.steps.length;
    const doneSteps = ex.steps.filter((_, i) => completedSteps.has(\`\${activeExercise}-\${i}\`)).length;
    const progress = (doneSteps / totalSteps) * 100;

    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => { setActiveExercise(null); setCompletedSteps(new Set()); setShowSolution(new Set()); }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux exercices
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold">{ex.title}</h2>
            <Badge className={
              ex.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-500" :
              ex.difficulty === "hard" ? "bg-red-500/10 text-red-500" :
              "bg-purple-500/10 text-purple-500"
            }>
              {ex.difficulty === "medium" ? "Moyen" : ex.difficulty === "hard" ? "Difficile" : "Expert"}
            </Badge>
            <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{ex.duration}</Badge>
          </div>
          <p className="text-muted-foreground">{ex.description}</p>
          <div className="flex gap-2 flex-wrap">
            {ex.companies.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium">{doneSteps}/{totalSteps}</span>
        </div>

        {/* Requirements */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Exigences</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-green-500 mb-2">Fonctionnelles</h4>
              <ul className="space-y-1">
                {ex.requirements.functional.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-500 mb-2">Non-fonctionnelles</h4>
              <ul className="space-y-1">
                {ex.requirements.nonFunctional.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {ex.steps.map((step, i) => {
            const key = \`\${activeExercise}-\${i}\`;
            const isDone = completedSteps.has(key);
            const isSolutionVisible = showSolution.has(key);

            return (
              <Card key={i} className={cn("p-6 transition-all", isDone && "border-green-500/50 bg-green-500/5")}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleStep(key)} className="shrink-0">
                          <CheckCircle2 className={cn("w-5 h-5 transition-colors", isDone ? "text-green-500" : "text-muted-foreground/30")} />
                        </button>
                        <h3 className="font-semibold">{step.title}</h3>
                        <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{step.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8 mt-1">{step.description}</p>
                    </div>
                  </div>

                  <div className="ml-8 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Points à couvrir</h4>
                      <ul className="space-y-1">
                        {step.questions.map((q, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-1 shrink-0 text-primary" />
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {step.tips.length > 0 && (
                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <h4 className="text-sm font-medium text-yellow-600 mb-1">Conseils</h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, j) => (
                            <li key={j} className="text-xs text-muted-foreground">\u2022 {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.solution && (
                      <div>
                        <button
                          onClick={() => toggleSolution(key)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {isSolutionVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isSolutionVisible ? "Masquer" : "Voir"} la solution
                        </button>
                        {isSolutionVisible && (
                          <pre className="mt-2 bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                            <code>{step.solution}</code>
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Methodology */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Méthodologie en 6 étapes</h2>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {methodology.map((m) => (
            <div
              key={m.step}
              className={cn("flex items-center justify-center text-white text-xs font-medium", m.color)}
              style={{ width: m.pct }}
              title={\`\${m.step}: \${m.pct}\`}
            >
              {m.step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Début (0 min)</span>
          <span>Fin (45 min)</span>
        </div>
      </Card>

      {/* Exercise Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {exercises.map((ex, i) => (
          <Card
            key={ex.title}
            className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
            onClick={() => setActiveExercise(i)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{ex.title}</h3>
                <Badge className={
                  ex.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                  ex.difficulty === "hard" ? "bg-red-500/10 text-red-500" :
                  "bg-purple-500/10 text-purple-500"
                }>
                  {ex.difficulty === "medium" ? "Moyen" : ex.difficulty === "hard" ? "Difficile" : "Expert"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{ex.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.duration}</span>
                <span>{ex.steps.length} étapes</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {ex.companies.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
`,
);

console.log("P3.3 System Design Whiteboard: DONE");

// ============================================================
// P3.4 — INTERVIEW SIMULATION ENHANCEMENTS (question bank)
// ============================================================
console.log("\n=== P3.4 INTERVIEW SIMULATION QUESTION BANK ===");

w(
  "interview-simulation/question-bank/page.tsx",
  `import type { Metadata } from "next";
import { QuestionBank } from "./_components/question-bank";

export const metadata: Metadata = {
  title: "Banque de Questions | Tech-Mastry",
  description: "Banque exhaustive de questions d'entretien technique classées par catégorie, difficulté et entreprise.",
};

export default function QuestionBankPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500/20 to-amber-500/20 mb-2">
          <span className="text-3xl">📚</span>
        </div>
        <h1 className="text-4xl font-bold">Banque de Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plus de 50 questions d&apos;entretien technique réelles, classées par catégorie,
          difficulté et entreprise cible, avec solutions détaillées.
        </p>
      </div>
      <QuestionBank />
    </main>
  );
}
`,
);

w(
  "interview-simulation/question-bank/_components/question-bank.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface BankQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companies: string[];
  answer: string;
  followUp?: string[];
}

const questions: BankQuestion[] = [
  // Algorithmes
  { id: 1, question: "Expliquez la différence entre BFS et DFS. Quand utiliser l'un plutôt que l'autre ?", category: "Algorithmes", difficulty: "easy", companies: ["Google", "Amazon"], answer: "BFS explore par niveaux (file/queue), DFS explore en profondeur (pile/récursion). BFS pour le plus court chemin (non-pondéré), parcours par niveau. DFS pour la détection de cycles, le tri topologique, les problèmes de connectivité. BFS utilise O(V) mémoire (largeur du graphe), DFS O(V) (profondeur + pile).", followUp: ["Quelle est la complexité de chacun ?", "Comment adapter BFS pour un graphe pondéré ?"] },
  { id: 2, question: "Comment fonctionne une table de hachage ? Que se passe-t-il lors d'une collision ?", category: "Algorithmes", difficulty: "easy", companies: ["Meta", "Microsoft"], answer: "Une table de hachage utilise une fonction de hachage pour mapper les clés à des indices. Collisions gérées par: chaining (linked list par bucket) ou open addressing (probing linéaire/quadratique). Complexité moyenne O(1), pire cas O(n). Load factor idéal < 0.75, rehashing quand dépassé." },
  { id: 3, question: "Résolvez Two Sum en O(n). Expliquez votre raisonnement.", category: "Algorithmes", difficulty: "easy", companies: ["Google", "Amazon", "Meta"], answer: "Utiliser un HashMap : pour chaque nombre, vérifier si (target - num) existe dans le map. Si oui, retourner les indices. Sinon, ajouter num au map. Un seul passage → O(n) temps, O(n) espace." },
  { id: 4, question: "Implémentez un LRU Cache avec get() et put() en O(1).", category: "Algorithmes", difficulty: "hard", companies: ["Google", "Amazon", "Meta", "Microsoft"], answer: "Combinaison d'un HashMap (O(1) lookup) et d'une Doubly Linked List (O(1) insertion/suppression). Le HashMap mappe les clés aux nœuds de la liste. Les nœuds récemment accédés sont déplacés en tête. Quand la capacité est dépassée, supprimer le dernier nœud (LRU)." },
  { id: 5, question: "Quelle est la différence entre programmation dynamique et algorithme glouton ?", category: "Algorithmes", difficulty: "medium", companies: ["Google", "Microsoft"], answer: "DP : explore tous les sous-problèmes, garantit l'optimal, utilise memoization/tabulation. Glouton : fait le choix localement optimal, ne revient jamais en arrière. DP pour sac à dos 0/1, LCS, edit distance. Glouton pour sac à dos fractionnaire, Huffman, sélection d'activités." },

  // System Design
  { id: 6, question: "Concevez un système de notification en temps réel (comme les notifications push).", category: "System Design", difficulty: "hard", companies: ["Meta", "Apple", "Google"], answer: "WebSocket pour les clients connectés, APNS/FCM pour mobile. Message Queue (Kafka) pour le découplage. Fan-out service pour distribuer aux destinataires. Rate limiting pour éviter le spam. Stockage : notifications récentes en Redis, historique en Cassandra. Priorités : urgente (push immédiat), normale (batch), silencieuse." },
  { id: 7, question: "Comment concevriez-vous un système de rate limiting distribué ?", category: "System Design", difficulty: "hard", companies: ["Stripe", "Cloudflare", "Amazon"], answer: "Algorithmes : Token Bucket (burst-friendly), Sliding Window (précis), Fixed Window (simple). Stockage : Redis (INCR + EXPIRE atomiques). Distribué : chaque nœud a un quota local + synchronisation périodique, ou Redis centralisé. Headers : X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. Granularité : par user, par IP, par endpoint." },
  { id: 8, question: "Expliquez le théorème CAP avec des exemples concrets.", category: "System Design", difficulty: "medium", companies: ["Amazon", "Google", "Netflix"], answer: "CAP : Consistency, Availability, Partition tolerance — on ne peut garantir que 2/3 lors d'une partition réseau. CP (Consistency + Partition) : MongoDB, HBase — refuse les écritures plutôt que de servir des données stales. AP (Availability + Partition) : Cassandra, DynamoDB — accepte les écritures même si les données peuvent diverger temporairement. CA n'existe pas en pratique (les partitions sont inévitables)." },

  // Frontend
  { id: 9, question: "Expliquez le Virtual DOM de React et son algorithme de reconciliation.", category: "Frontend", difficulty: "medium", companies: ["Meta", "Airbnb"], answer: "Le Virtual DOM est une représentation JS légère du DOM réel. Reconciliation : 1) Créer un nouveau VDOM lors d'un changement d'état. 2) Diffing : comparer ancien et nouveau VDOM. 3) Batching : regrouper les changements. 4) Commit : appliquer le minimum de mutations DOM. Heuristiques : types différents = remplacement total, clés pour identifier les éléments dans les listes." },
  { id: 10, question: "Comment optimiser les performances d'une application React ?", category: "Frontend", difficulty: "medium", companies: ["Meta", "Netflix", "Airbnb"], answer: "1) React.memo pour éviter les re-renders inutiles. 2) useMemo/useCallback pour mémoriser les valeurs/fonctions. 3) Code splitting avec React.lazy + Suspense. 4) Virtualisation de longues listes (react-window). 5) Debounce des inputs. 6) Optimistic updates. 7) Image optimization (next/image). 8) Bundle analysis (webpack-bundle-analyzer)." },
  { id: 11, question: "Expliquez la différence entre SSR, SSG, ISR et CSR dans Next.js.", category: "Frontend", difficulty: "medium", companies: ["Vercel", "Shopify"], answer: "SSR (getServerSideProps) : rendu à chaque requête, données toujours fraîches. SSG (getStaticProps) : rendu au build, le plus rapide. ISR (revalidate) : SSG avec re-génération périodique. CSR (useEffect) : rendu côté client, SPA classique. En App Router : Server Components (par défaut = SSR/SSG automatique), fetch avec next.revalidate pour ISR, 'use client' pour CSR." },

  // Backend
  { id: 12, question: "Comparez REST, GraphQL et gRPC. Quand utiliser chacun ?", category: "Backend", difficulty: "medium", companies: ["Google", "Meta", "Amazon"], answer: "REST : standard, cacheable, HATEOAS. Idéal pour CRUD simple, APIs publiques. GraphQL : query flexible, pas d'over/under-fetching. Idéal pour mobile (bande passante), dashboard avec données variées. gRPC : binaire (Protobuf), streaming, très performant. Idéal pour communication inter-services, microservices internes. Trade-offs : REST = simplicité, GraphQL = flexibilité client, gRPC = performance." },
  { id: 13, question: "Comment assurer la cohérence des données dans une architecture microservices ?", category: "Backend", difficulty: "hard", companies: ["Amazon", "Netflix", "Uber"], answer: "Patterns : 1) Saga pattern (orchestration ou chorégraphie) pour les transactions distribuées. 2) Event sourcing : stocker les événements plutôt que l'état. 3) CQRS : séparer lecture et écriture. 4) Outbox pattern : publier les événements de manière fiable. 5) Idempotency keys : garanti exactly-once processing. 6) Eventual consistency : accepter un délai de convergence." },
  { id: 14, question: "Expliquez les stratégies de caching et quand invaliditer le cache.", category: "Backend", difficulty: "medium", companies: ["Amazon", "Cloudflare"], answer: "Stratégies : Cache-aside (lazy loading), Read-through, Write-through, Write-behind. Invalidation : TTL (expiration temporelle), Event-driven (pub/sub), Versioning. Niveaux : Browser cache, CDN, Application cache (Redis), Database query cache. Problèmes : Cache stampede (locking), Cold start, Stale data. Règle 80/20 : 20% des données = 80% du trafic." },

  // Comportemental
  { id: 15, question: "Décrivez un projet technique dont vous êtes fier. Quel a été votre impact ?", category: "Comportemental", difficulty: "easy", companies: ["Toutes"], answer: "Utiliser la méthode STAR : Situation (contexte du projet), Task (votre rôle spécifique), Action (ce que vous avez fait techniquement — choix d'architecture, résolution de problèmes), Result (impact mesurable — performance +X%, réduction de bugs de Y%, revenus). Chiffres concrets et leçons apprises.", followUp: ["Que feriez-vous différemment ?", "Comment avez-vous géré les désaccords techniques ?"] },
  { id: 16, question: "Comment gérez-vous un désaccord technique avec un collègue senior ?", category: "Comportemental", difficulty: "medium", companies: ["Google", "Meta", "Amazon"], answer: "1) Écouter activement et comprendre leur perspective. 2) Poser des questions pour clarifier les trade-offs. 3) Proposer un POC ou benchmark pour trancher objectivement. 4) Si pas de consensus : escalader avec les données, pas les émotions. 5) S'aligner sur la décision finale, même si différente de la vôtre. Montrer : respect, data-driven, pragmatisme." },

  // Sécurité
  { id: 17, question: "Quelles sont les vulnérabilités OWASP Top 10 et comment les prévenir ?", category: "Sécurité", difficulty: "medium", companies: ["Toutes"], answer: "1) Injection (SQL/NoSQL) → requêtes paramétrées. 2) Broken Auth → MFA, session management. 3) XSS → échappement, CSP headers. 4) IDOR → vérification d'autorisation. 5) Security Misconfiguration → hardening, headers. 6) Sensitive Data Exposure → chiffrement, HTTPS. 7) Missing Access Control → RBAC/ABAC. 8) CSRF → tokens anti-CSRF, SameSite cookies. 9) Components with Vulnerabilities → audit, mise à jour. 10) Insufficient Logging → monitoring, alerting." },

  // Base de données
  { id: 18, question: "SQL vs NoSQL : comment choisir ? Donnez des exemples concrets.", category: "Base de données", difficulty: "medium", companies: ["Amazon", "Google", "Netflix"], answer: "SQL (PostgreSQL, MySQL) : schéma strict, ACID, relations complexes, JOIN. Pour : e-commerce (transactions), ERP, systèmes financiers. NoSQL : Redis (cache, sessions), MongoDB (documents flexibles), Cassandra (time-series, haute écriture), Neo4j (graphes sociaux). Choisir selon : structure des données, patterns de requêtes, besoins de scalabilité, cohérence vs disponibilité." },
  { id: 19, question: "Comment optimiser une requête SQL lente ?", category: "Base de données", difficulty: "medium", companies: ["Amazon", "Microsoft"], answer: "1) EXPLAIN ANALYZE pour identifier le plan d'exécution. 2) Ajouter des index sur les colonnes WHERE, JOIN, ORDER BY. 3) Éviter SELECT * — sélectionner uniquement les colonnes nécessaires. 4) Dénormalisation pour les lectures fréquentes. 5) Query caching. 6) Partitionnement pour les tables volumineuses. 7) Éviter les N+1 queries (eager loading). 8) Connection pooling." },

  // DevOps
  { id: 20, question: "Expliquez le concept de CI/CD et les meilleures pratiques.", category: "DevOps", difficulty: "easy", companies: ["Toutes"], answer: "CI : intégration continue — chaque commit déclenche build + tests automatiques. CD : déploiement continu — le code validé est déployé automatiquement. Pratiques : trunk-based development, feature flags, blue/green deployments, canary releases, rollback automatique, tests de fumée post-deploy. Outils : GitHub Actions, GitLab CI, Jenkins, ArgoCD." },
];

const categories = [...new Set(questions.map(q => q.category))];
const difficulties = ["easy", "medium", "hard"] as const;

export function QuestionBank() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase()) && !q.answer.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory && q.category !== selectedCategory) return false;
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const diffColor = (d: string) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const diffLabel = (d: string) => {
    switch (d) {
      case "easy": return "Facile";
      case "medium": return "Moyen";
      case "hard": return "Difficile";
      default: return d;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                    selectedCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  selectedDifficulty === d ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                )}
              >
                {diffLabel(d)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</p>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map(q => (
          <Card key={q.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              className="w-full p-4 text-left flex items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={diffColor(q.difficulty)}>{diffLabel(q.difficulty)}</Badge>
                  <Badge variant="outline">{q.category}</Badge>
                  {q.companies.slice(0, 3).map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <p className="font-medium text-sm">{q.question}</p>
              </div>
              {expandedId === q.id ? <ChevronUp className="w-4 h-4 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 shrink-0 mt-1" />}
            </button>
            {expandedId === q.id && (
              <div className="px-4 pb-4 space-y-3 border-t pt-3">
                <div>
                  <h4 className="text-sm font-semibold text-green-500 mb-1">Réponse attendue</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{q.answer}</p>
                </div>
                {q.followUp && q.followUp.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500 mb-1">Questions de suivi</h4>
                    <ul className="space-y-1">
                      {q.followUp.map((fu, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          {fu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
`,
);

console.log("P3.4 Interview Question Bank: DONE");

// ============================================================
// P3.6 — CHALLENGES ENHANCEMENT (Progressive hints, solutions)
// ============================================================
console.log("\n=== P3.6 CHALLENGES ENHANCEMENT ===");

w(
  "challenges/solutions/page.tsx",
  `import type { Metadata } from "next";
import { ChallengeSolutions } from "./_components/challenge-solutions";

export const metadata: Metadata = {
  title: "Solutions Expliquées | Tech-Mastry",
  description: "Solutions détaillées et expliquées pas à pas des défis de code avec indices progressifs.",
};

export default function SolutionsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-red-500/20 to-orange-500/20 mb-2">
          <span className="text-3xl">🧩</span>
        </div>
        <h1 className="text-4xl font-bold">Solutions Expliquées</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Chaque défi est décomposé étape par étape avec des indices progressifs
          et des solutions optimales expliquées en détail.
        </p>
      </div>
      <ChallengeSolutions />
    </main>
  );
}
`,
);

w(
  "challenges/solutions/_components/challenge-solutions.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Eye, EyeOff, Lightbulb, Zap } from "lucide-react";
import { useState } from "react";

interface Challenge {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  bruteForce: { code: string; complexity: string; explanation: string };
  optimal: { code: string; complexity: string; explanation: string };
  keyInsight: string;
}

const challenges: Challenge[] = [
  {
    title: "Two Sum",
    difficulty: "easy",
    category: "Hash Map",
    description: "Étant donné un tableau d'entiers et un entier cible, retournez les indices des deux nombres dont la somme est égale à la cible.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1, 2]" },
    ],
    hints: [
      "Pensez à une structure de données qui permet un lookup en O(1).",
      "Pour chaque nombre, de quel complément avez-vous besoin ?",
      "Utilisez un HashMap pour stocker les nombres déjà vus et leur index.",
    ],
    bruteForce: {
      code: \`function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}\`,
      complexity: "O(n²) temps, O(1) espace",
      explanation: "Vérifier chaque paire possible. Simple mais lent pour de grands tableaux.",
    },
    optimal: {
      code: \`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}\`,
      complexity: "O(n) temps, O(n) espace",
      explanation: "Pour chaque nombre, on calcule le complément nécessaire (target - num). Si ce complément existe déjà dans notre HashMap, on a trouvé la paire. Sinon, on stocke le nombre courant. Un seul passage suffit.",
    },
    keyInsight: "Le pattern 'Complement Search' avec HashMap est applicable à de nombreux problèmes : 3Sum, 4Sum, subarray sum, etc.",
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack",
    description: "Déterminer si une chaîne contenant uniquement '(', ')', '{', '}', '[', ']' est valide (chaque ouverture est fermée dans l'ordre correct).",
    examples: [
      { input: 's = "([])"', output: "true" },
      { input: 's = "([)]"', output: "false", explanation: "Les parenthèses ne sont pas fermées dans le bon ordre." },
    ],
    hints: [
      "Quelle structure de données suit le principe LIFO ?",
      "Empilez chaque caractère ouvrant et dépiler pour chaque fermant.",
      "À la fin, la pile doit être vide.",
    ],
    bruteForce: {
      code: \`function isValid(s) {
  // Remplacer les paires jusqu'à stabilisation
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s.replace('()', '').replace('[]', '').replace('{}', '');
  }
  return s.length === 0;
}\`,
      complexity: "O(n²) temps, O(n) espace",
      explanation: "Remplacer itérativement les paires adjacentes. Chaque passe est O(n), et on peut avoir n/2 passes.",
    },
    optimal: {
      code: \`function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of s) {
    if ('([{'.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}\`,
      complexity: "O(n) temps, O(n) espace",
      explanation: "Empiler chaque ouverture. Pour chaque fermeture, vérifier que le sommet de la pile correspond. L'ordre LIFO de la pile garantit le bon appariement.",
    },
    keyInsight: "La pile est la structure idéale pour les problèmes d'appariement imbriqué : parenthèses, tags HTML, évaluation d'expressions.",
  },
  {
    title: "Maximum Subarray (Kadane)",
    difficulty: "medium",
    category: "Dynamic Programming",
    description: "Trouver le sous-tableau contigu de somme maximale dans un tableau d'entiers.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Le sous-tableau [4,-1,2,1] a la somme maximale 6." },
    ],
    hints: [
      "À chaque position, deux choix : étendre le sous-tableau courant ou commencer un nouveau.",
      "Maintenez la somme courante et la somme maximale.",
      "Quand la somme courante devient négative, il vaut mieux repartir à zéro.",
    ],
    bruteForce: {
      code: \`function maxSubArray(nums) {
  let maxSum = -Infinity;
  
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      maxSum = Math.max(maxSum, sum);
    }
  }
  
  return maxSum;
}\`,
      complexity: "O(n²) temps, O(1) espace",
      explanation: "Vérifier toutes les sous-tableaux possibles. On peut faire mieux avec l'algorithme de Kadane.",
    },
    optimal: {
      code: \`function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Étendre ou recommencer ?
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}\`,
      complexity: "O(n) temps, O(1) espace",
      explanation: "L'algorithme de Kadane : à chaque étape, on décide si c'est mieux d'étendre le sous-tableau courant (currentSum + nums[i]) ou de recommencer (nums[i]). On garde le maximum global.",
    },
    keyInsight: "Kadane = DP 1D optimisé. Le sous-problème : 'meilleur sous-tableau se terminant ici'. Applicable à : maximum product subarray, maximum circular subarray.",
  },
  {
    title: "Merge Intervals",
    difficulty: "medium",
    category: "Intervals",
    description: "Fusionner les intervalles qui se chevauchent dans un tableau d'intervalles.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] et [2,6] se chevauchent → [1,6]" },
    ],
    hints: [
      "Commencez par trier les intervalles par leur début.",
      "Deux intervalles se chevauchent si le début du second ≤ la fin du premier.",
      "Fusionnez en prenant le max des fins.",
    ],
    bruteForce: {
      code: \`// Pas vraiment de brute force utile ici
// L'approche triée est standard\`,
      complexity: "—",
      explanation: "L'approche triée est déjà la solution standard.",
    },
    optimal: {
      code: \`function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // Trier par début
  intervals.sort((a, b) => a[0] - b[0]);
  
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      // Chevauchement → fusionner
      last[1] = Math.max(last[1], current[1]);
    } else {
      // Pas de chevauchement → ajouter
      result.push(current);
    }
  }
  
  return result;
}\`,
      complexity: "O(n log n) temps, O(n) espace",
      explanation: "Trier par début, puis parcourir en fusionnant les intervalles qui se chevauchent. Le tri est le bottleneck.",
    },
    keyInsight: "Les problèmes d'intervalles commencent presque toujours par un tri. Variantes : insert interval, meeting rooms, minimum platforms.",
  },
];

export function ChallengeSolutions() {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showBrute, setShowBrute] = useState(false);
  const [showOptimal, setShowOptimal] = useState(false);

  const diffColor = (d: string) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const diffLabel = (d: string) => {
    switch (d) { case "easy": return "Facile"; case "medium": return "Moyen"; case "hard": return "Difficile"; default: return d; }
  };

  if (activeChallenge !== null) {
    const ch = challenges[activeChallenge];
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => { setActiveChallenge(null); setRevealedHints(0); setShowBrute(false); setShowOptimal(false); }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{ch.title}</h2>
            <Badge className={diffColor(ch.difficulty)}>{diffLabel(ch.difficulty)}</Badge>
            <Badge variant="outline">{ch.category}</Badge>
          </div>
          <p className="text-muted-foreground">{ch.description}</p>
        </div>

        {/* Examples */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Exemples</h3>
          <div className="space-y-3">
            {ch.examples.map((ex, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div><strong>Input:</strong> <code>{ex.input}</code></div>
                <div><strong>Output:</strong> <code>{ex.output}</code></div>
                {ex.explanation && <div className="text-muted-foreground">{ex.explanation}</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* Progressive Hints */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Indices progressifs ({revealedHints}/{ch.hints.length})
          </h3>
          <div className="space-y-2">
            {ch.hints.map((hint, i) => (
              <div key={i} className={cn("p-3 rounded-lg text-sm transition-all", i < revealedHints ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-muted/20 border border-dashed border-muted-foreground/20")}>
                {i < revealedHints ? (
                  <span className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {hint}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50 italic">Indice {i + 1} masqué</span>
                )}
              </div>
            ))}
          </div>
          {revealedHints < ch.hints.length && (
            <Button variant="outline" className="mt-3" onClick={() => setRevealedHints(r => r + 1)}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Révéler l&apos;indice {revealedHints + 1}
            </Button>
          )}
        </Card>

        {/* Brute Force */}
        <Card className="p-6">
          <button onClick={() => setShowBrute(!showBrute)} className="flex items-center gap-2 font-semibold w-full">
            {showBrute ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Solution Brute Force
            <Badge variant="outline" className="ml-auto">{ch.bruteForce.complexity}</Badge>
          </button>
          {showBrute && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{ch.bruteForce.explanation}</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{ch.bruteForce.code}</code>
              </pre>
            </div>
          )}
        </Card>

        {/* Optimal Solution */}
        <Card className="p-6 border-primary/30">
          <button onClick={() => setShowOptimal(!showOptimal)} className="flex items-center gap-2 font-semibold w-full">
            {showOptimal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <Zap className="w-4 h-4 text-primary" />
            Solution Optimale
            <Badge className="ml-auto bg-primary/10 text-primary">{ch.optimal.complexity}</Badge>
          </button>
          {showOptimal && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{ch.optimal.explanation}</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{ch.optimal.code}</code>
              </pre>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-semibold text-primary mb-1">Insight clé</h4>
                <p className="text-sm text-muted-foreground">{ch.keyInsight}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges.map((ch, i) => (
        <Card
          key={ch.title}
          className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          onClick={() => setActiveChallenge(i)}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{ch.title}</h3>
              <Badge className={diffColor(ch.difficulty)}>{diffLabel(ch.difficulty)}</Badge>
              <Badge variant="outline">{ch.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ch.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{ch.hints.length} indices</span>
              <span>{ch.examples.length} exemple{ch.examples.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
`,
);

console.log("P3.6 Challenge Solutions: DONE");

console.log("\\n\u2705 ALL REMAINING PHASE 3 CONTENT CREATED");
console.log("  - P3.3: System Design Whiteboard (URL shortener + Chat system)");
console.log("  - P3.4: Interview Question Bank (20 curated questions)");
console.log(
  "  - P3.6: Challenge Solutions (4 problems with progressive hints)",
);
