"use client";

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
        "Haute disponibilité (99,9 % : ~8,8 h d'indisponibilité/an, un lien cassé est visible mais non vital)",
        "Faible latence de redirection (< 100 ms : la redirection s'ajoute au chargement de la page cible, elle doit rester imperceptible)",
        "Hypothèse : 100M URLs créées/jour, ratio lecture/écriture de 10:1 (souvent bien supérieur en réalité)",
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
          "Cache : 20% des URLs = 80% du trafic → ~100GB en mémoire",
        ],
        tips: ["Round les chiffres pour simplifier", "Montrer votre raisonnement"],
        solution: `QPS écriture : 100M / (24 × 3600) ≈ 1200/s
QPS lecture : 1200 × 10 = 12000/s
Stockage 5 ans : 100M × 365 × 5 × 500B = 91.25 TB
Cache (règle 80/20) : 12000/s × 86400 × 0.2 × 500B ≈ 100 GB (répartis sur quelques nœuds Redis)`,
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
        duration: "7 min",
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
        solution: `Client → Load Balancer → API Server → Cache (Redis)
                                    ↓                 ↓
                              Write Path         Read Path
                                    ↓                 ↓
                              ID Generator       Redis lookup
                                    ↓           (miss → DB)
                              Database              ↓
                              (NoSQL)           302 Redirect`,
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
        "Livraison en temps réel (< 200 ms : seuil en dessous duquel la conversation paraît instantanée)",
        "Haute disponibilité (99,99 % : ~53 min d'indisponibilité/an, un chat est un service de communication critique)",
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
          "Database → stockage des messages (base wide-column type Cassandra, par exemple)",
        ],
        tips: ["Séparer le online (WebSocket) du offline (push notifications)"],
        solution: `User A → WS Gateway A → Message Queue (Kafka)
                                          ↓
                   User B ← WS Gateway B ← Consumer
                                          ↓
                                     Cassandra (persistence)
                                          ↓
                                  Push Notification (si offline)`,
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
        tips: ["At-least-once delivery + consommateur idempotent = effet « exactly-once » (le vrai exactly-once de bout en bout n'existe pas)"],
      },
      {
        title: "5. Scalabilité",
        description: "Comment supporter des millions d'utilisateurs.",
        duration: "15 min",
        questions: [
          "Consistent hashing pour distribuer les connexions WebSocket",
          "Exemple avec Cassandra : partition key = conversation_id (+ bucket temporel), clustering key = message_id/timestamp",
          "Redis : cache des derniers messages + session mapping",
          "CDN pour les médias (S3 + CloudFront)",
        ],
        tips: ["1 serveur WebSocket ≈ 50K connexions (hypothèse prudente) → calcul du nombre de serveurs"],
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
    const doneSteps = ex.steps.filter((_, i) => completedSteps.has(`${activeExercise}-${i}`)).length;
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
            const key = `${activeExercise}-${i}`;
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
                            <li key={j} className="text-xs text-muted-foreground">• {tip}</li>
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
                          <pre className="mt-2 bg-muted p-3 rounded-lg text-xs overflow-x-auto" tabIndex={0}>
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
              title={`${m.step}: ${m.pct}`}
            >
              {m.step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Début (0 min)</span>
          <span>Fin (35 à 45 min selon l&apos;exercice)</span>
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
