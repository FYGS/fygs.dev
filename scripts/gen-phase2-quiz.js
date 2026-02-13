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
// P2.5 — QA Interactive Quiz Component
// ============================================================
console.log("\n=== P2.5 QA INTERACTIVE QUIZ ===");

// Reusable Quiz Component
w(
  "_components/quiz.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Brain,
  Target,
  Clock,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  onComplete?: (score: number, total: number) => void;
  showCategories?: boolean;
}

export function Quiz({ questions, title = "Quiz", onComplete, showCategories = true }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category === selectedCategory)
    : questions;

  const categories = [...new Set(questions.map((q) => q.category))];

  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, startTime]);

  const handleAnswer = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    const correct = index === filteredQuestions[currentIndex].correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, index]);
  }, [isAnswered, currentIndex, filteredQuestions]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setIsComplete(true);
      onComplete?.(score + (selectedAnswer === filteredQuestions[currentIndex].correctIndex ? 0 : 0), filteredQuestions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentIndex, filteredQuestions, score, selectedAnswer, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? \`\${m}m \${s}s\` : \`\${s}s\`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-500";
    if (pct >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case "easy": return "Facile";
      case "medium": return "Moyen";
      case "hard": return "Difficile";
      default: return d;
    }
  };

  if (isComplete) {
    const pct = Math.round((score / filteredQuestions.length) * 100);
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5">
          <Trophy className={cn("w-10 h-10", getScoreColor(pct))} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Quiz Terminé !</h3>
          <p className={cn("text-4xl font-bold", getScoreColor(pct))}>
            {score} / {filteredQuestions.length}
          </p>
          <p className="text-muted-foreground">
            {pct >= 80
              ? "Excellent ! Vous maîtrisez bien ce sujet."
              : pct >= 60
              ? "Bon résultat ! Quelques points à revoir."
              : "Continuez à pratiquer pour améliorer votre score."}
          </p>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {formatTime(timeElapsed)}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" /> {pct}% correct
          </span>
        </div>

        {/* Review */}
        <div className="text-left space-y-3 mt-6">
          <h4 className="font-semibold text-sm">Revue des réponses</h4>
          {filteredQuestions.map((q, i) => (
            <div key={q.id} className={cn(
              "p-3 rounded-lg border text-sm",
              answers[i] === q.correctIndex ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
            )}>
              <div className="flex items-start gap-2">
                {answers[i] === q.correctIndex
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{q.question}</p>
                  {answers[i] !== q.correctIndex && (
                    <p className="text-muted-foreground mt-1">
                      Bonne réponse: {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </Button>
      </Card>
    );
  }

  const currentQuestion = filteredQuestions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedCategory(null); handleReset(); }}
          >
            Toutes ({questions.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedCategory(cat); handleReset(); }}
            >
              {cat} ({questions.filter((q) => q.category === cat).length})
            </Button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Brain className="w-4 h-4" />
          Question {currentIndex + 1} / {filteredQuestions.length}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          Score: {score}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(timeElapsed)}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: \`\${((currentIndex + 1) / filteredQuestions.length) * 100}%\` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </Badge>
            <Badge variant="outline">{currentQuestion.category}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                isAnswered
                  ? i === currentQuestion.correctIndex
                    ? "border-green-500 bg-green-500/10"
                    : i === selectedAnswer
                    ? "border-red-500 bg-red-500/10"
                    : "border-border opacity-50"
                  : "border-border hover:border-primary/50 hover:bg-accent cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border shrink-0",
                  isAnswered && i === currentQuestion.correctIndex
                    ? "border-green-500 text-green-500 bg-green-500/10"
                    : isAnswered && i === selectedAnswer
                    ? "border-red-500 text-red-500 bg-red-500/10"
                    : "border-muted-foreground/30"
                )}>
                  {isAnswered && i === currentQuestion.correctIndex
                    ? <CheckCircle2 className="w-4 h-4" />
                    : isAnswered && i === selectedAnswer
                    ? <XCircle className="w-4 h-4" />
                    : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className={cn(
            "p-4 rounded-lg border",
            selectedAnswer === currentQuestion.correctIndex
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          )}>
            <p className="text-sm font-medium mb-1">
              {selectedAnswer === currentQuestion.correctIndex ? "Correct !" : "Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <div className="flex justify-end">
            <Button onClick={handleNext} className="gap-2">
              {currentIndex + 1 >= filteredQuestions.length ? "Voir les résultats" : "Suivant"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
`,
);

// New QA page with Quiz integration
w(
  "qa/page.tsx",
  `import type { Metadata } from "next";
import { QAGuide } from "./_components/qa-guide";
import { QAQuiz } from "./_components/qa-quiz";
import { HelpCircle, Brain, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Questions & Réponses | Tech-Mastry",
  description:
    "Quiz interactif et guide complet des questions courantes lors des entretiens techniques. Testez vos connaissances avec scoring en temps réel.",
};

export default function QAPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/20 mb-2">
          <HelpCircle className="w-8 h-8 text-violet-500" />
        </div>
        <h1 className="text-4xl font-bold">Questions & Réponses</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Testez vos connaissances avec notre quiz interactif ou parcourez
          les questions les plus fréquentes des entretiens techniques.
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary">Quiz interactif</Badge>
          <Badge variant="outline">Scoring en temps réel</Badge>
          <Badge>Explications détaillées</Badge>
        </div>
      </div>

      {/* Tabs: Quiz / Reference */}
      <Tabs defaultValue="quiz" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="quiz" className="gap-2">
            <Brain className="w-4 h-4" />
            Quiz Interactif
          </TabsTrigger>
          <TabsTrigger value="reference" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Référence Q&A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz">
          <QAQuiz />
        </TabsContent>

        <TabsContent value="reference">
          <QAGuide />
        </TabsContent>
      </Tabs>
    </main>
  );
}
`,
);

// QA Quiz Component with rich questions
w(
  "qa/_components/qa-quiz.tsx",
  `"use client";

import { Quiz, type QuizQuestion } from "../../_components/quiz";

const quizQuestions: QuizQuestion[] = [
  // Algorithmes & Structures de Données
  {
    id: "algo-1",
    question: "Quelle est la complexité temporelle moyenne du QuickSort ?",
    options: ["O(n)", "O(n log n)", "O(n\u00B2)", "O(log n)"],
    correctIndex: 1,
    explanation: "QuickSort a une complexité moyenne de O(n log n) grâce à la division du tableau en deux sous-parties à chaque étape. Le pire cas est O(n\u00B2) quand le pivot est toujours le plus petit ou le plus grand élément.",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-2",
    question: "Quelle structure de données utilise le principe LIFO (Last In, First Out) ?",
    options: ["File (Queue)", "Pile (Stack)", "Liste chaînée", "Arbre binaire"],
    correctIndex: 1,
    explanation: "La pile (stack) suit le principe LIFO : le dernier élément ajouté est le premier retiré. Elle est utilisée pour la gestion des appels de fonction, l'évaluation d'expressions, et le parcours en profondeur (DFS).",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-3",
    question: "Quel algorithme est optimal pour trouver le plus court chemin dans un graphe pondéré sans poids négatifs ?",
    options: ["BFS", "DFS", "Dijkstra", "Bellman-Ford"],
    correctIndex: 2,
    explanation: "L'algorithme de Dijkstra est optimal pour les graphes avec des poids positifs (complexité O((V+E) log V) avec un min-heap). Bellman-Ford gère les poids négatifs mais est plus lent O(VE). BFS est pour les graphes non pondérés.",
    difficulty: "medium",
    category: "Algorithmes",
  },
  {
    id: "algo-4",
    question: "Quelle est la complexité de recherche dans un arbre binaire de recherche équilibré ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctIndex: 1,
    explanation: "Dans un BST équilibré (comme AVL ou Red-Black), la hauteur est O(log n), donc la recherche est aussi O(log n). Un BST non équilibré peut dégénérer en O(n) dans le pire cas.",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-5",
    question: "Quelle technique de programmation dynamique résout le problème du sac à dos (Knapsack) ?",
    options: ["Greedy", "Diviser pour régner", "Tabulation bottom-up", "Recherche exhaustive"],
    correctIndex: 2,
    explanation: "Le problème du sac à dos 0/1 se résout par programmation dynamique avec tabulation bottom-up, construisant une table dp[i][w] où i est l'item considéré et w la capacité restante. La complexité est O(nW) où n est le nombre d'items et W la capacité.",
    difficulty: "hard",
    category: "Algorithmes",
  },

  // Conception Système
  {
    id: "sys-1",
    question: "Quel pattern architectural permet de séparer les opérations de lecture et d'écriture ?",
    options: ["MVC", "CQRS", "Microservices", "Monolithe"],
    correctIndex: 1,
    explanation: "CQRS (Command Query Responsibility Segregation) sépare les modèles de lecture et d'écriture, permettant d'optimiser chaque côté indépendamment. C'est souvent combiné avec Event Sourcing pour un historique complet des changements.",
    difficulty: "medium",
    category: "System Design",
  },
  {
    id: "sys-2",
    question: "Quel théorème stipule qu'un système distribué ne peut garantir que 2 des 3 propriétés : Cohérence, Disponibilité, Tolérance aux partitions ?",
    options: ["ACID", "BASE", "CAP", "SOLID"],
    correctIndex: 2,
    explanation: "Le théorème CAP (Brewer, 2000) affirme qu'en cas de partition réseau, il faut choisir entre cohérence (C) et disponibilité (A). Les systèmes CP (ex: HBase) sacrifient la disponibilité, les systèmes AP (ex: Cassandra) sacrifient la cohérence stricte.",
    difficulty: "medium",
    category: "System Design",
  },
  {
    id: "sys-3",
    question: "Quelle stratégie de cache est la plus adaptée quand les lectures sont beaucoup plus fréquentes que les écritures ?",
    options: ["Write-Through", "Write-Behind", "Cache-Aside (Lazy Loading)", "Write-Around"],
    correctIndex: 2,
    explanation: "Cache-Aside est idéal pour les workloads read-heavy : on charge les données dans le cache uniquement à la demande (cache miss). Write-Through écrit simultanément dans le cache et la DB, ce qui est meilleur quand les données lues sont souvent les mêmes que celles récemment écrites.",
    difficulty: "hard",
    category: "System Design",
  },
  {
    id: "sys-4",
    question: "Quel outil est le plus adapté pour du rate limiting distribué ?",
    options: ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch"],
    correctIndex: 1,
    explanation: "Redis est idéal pour le rate limiting grâce à ses opérations atomiques, son TTL natif et sa latence ultra-faible (sous la milliseconde). Les algorithmes classiques sont Token Bucket, Sliding Window et Fixed Window.",
    difficulty: "medium",
    category: "System Design",
  },

  // Base de Données
  {
    id: "db-1",
    question: "Que signifie l'isolation dans le contexte ACID des bases de données ?",
    options: [
      "Les données sont sauvegardées sur disque",
      "Les transactions concurrentes n'interfèrent pas entre elles",
      "Une transaction est tout ou rien",
      "La base reste dans un état cohérent",
    ],
    correctIndex: 1,
    explanation: "L'Isolation garantit que les transactions concurrentes s'exécutent comme si elles étaient séquentielles. Les niveaux d'isolation (Read Uncommitted, Read Committed, Repeatable Read, Serializable) offrent différents compromis entre performance et cohérence.",
    difficulty: "easy",
    category: "Base de Données",
  },
  {
    id: "db-2",
    question: "Quel type d'index est le plus performant pour des requêtes de plage (range queries) ?",
    options: ["Hash Index", "B-Tree Index", "Bitmap Index", "Full-Text Index"],
    correctIndex: 1,
    explanation: "Les B-Tree maintiennent les données triées et permettent des recherches par plage efficaces O(log n + k). Les Hash Index sont O(1) pour l'égalité mais ne supportent pas les comparaisons d'ordre (<, >, BETWEEN).",
    difficulty: "medium",
    category: "Base de Données",
  },
  {
    id: "db-3",
    question: "Quelle forme normale élimine les dépendances transitives ?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctIndex: 2,
    explanation: "La 3NF élimine les dépendances transitives : chaque attribut non-clé dépend directement de la clé primaire, pas d'un autre attribut non-clé. Exemple : une table Commande(id, client_id, ville_client) viole la 3NF car ville_client dépend de client_id.",
    difficulty: "medium",
    category: "Base de Données",
  },

  // Sécurité
  {
    id: "sec-1",
    question: "Quelle attaque consiste à injecter du code malveillant qui s'exécute dans le navigateur d'un autre utilisateur ?",
    options: ["SQL Injection", "CSRF", "XSS", "Man-in-the-Middle"],
    correctIndex: 2,
    explanation: "Le Cross-Site Scripting (XSS) injecte du JavaScript malveillant qui s'exécute dans le navigateur de la victime. Prévention : échapper les sorties (output encoding), Content-Security-Policy, validation des entrées, et utiliser des frameworks comme React qui échappent par défaut.",
    difficulty: "easy",
    category: "Sécurité",
  },
  {
    id: "sec-2",
    question: "Quel mécanisme empêche les requêtes cross-origin non autorisées dans un navigateur ?",
    options: ["CSP", "CORS", "HSTS", "X-Frame-Options"],
    correctIndex: 1,
    explanation: "CORS (Cross-Origin Resource Sharing) permet au serveur de spécifier quelles origines peuvent accéder à ses ressources via les headers Access-Control-Allow-Origin. Les requêtes preflight (OPTIONS) vérifient les permissions avant la requête réelle.",
    difficulty: "easy",
    category: "Sécurité",
  },
  {
    id: "sec-3",
    question: "Quel est l'avantage principal de JWT par rapport aux sessions côté serveur ?",
    options: [
      "Plus sécurisé",
      "Révocation instantanée",
      "Stateless — pas besoin de stockage serveur",
      "Taille plus petite",
    ],
    correctIndex: 2,
    explanation: "JWT est stateless : le serveur n'a pas besoin de stocker les sessions. Chaque token contient les informations nécessaires et est vérifiable via signature. L'inconvénient est l'impossibilité de révoquer un token avant son expiration sans stratégie complémentaire (blacklist, rotation).",
    difficulty: "medium",
    category: "Sécurité",
  },

  // DevOps
  {
    id: "devops-1",
    question: "Quelle stratégie de déploiement permet de tester une nouvelle version sur un petit pourcentage d'utilisateurs ?",
    options: ["Blue/Green", "Rolling Update", "Canary", "Recreate"],
    correctIndex: 2,
    explanation: "Le déploiement Canary envoie progressivement le trafic vers la nouvelle version (ex: 5% → 25% → 50% → 100%) en surveillant les métriques. Si des problèmes sont détectés, le rollback est rapide. Blue/Green bascule tout le trafic d'un coup.",
    difficulty: "medium",
    category: "DevOps",
  },
  {
    id: "devops-2",
    question: "Quel outil est le standard de facto pour l'orchestration de conteneurs en production ?",
    options: ["Docker Compose", "Kubernetes", "Docker Swarm", "Vagrant"],
    correctIndex: 1,
    explanation: "Kubernetes (K8s) est le standard pour l'orchestration de conteneurs : auto-scaling, self-healing, rolling updates, service discovery, et load balancing. Docker Compose est pour le développement local, Docker Swarm est plus simple mais moins adopté.",
    difficulty: "easy",
    category: "DevOps",
  },

  // Frontend
  {
    id: "front-1",
    question: "Quel hook React est utilisé pour optimiser les calculs coûteux en évitant les recalculs inutiles ?",
    options: ["useEffect", "useMemo", "useRef", "useReducer"],
    correctIndex: 1,
    explanation: "useMemo mémorise le résultat d'un calcul et ne le recalcule que si les dépendances changent. useCallback fait la même chose pour les fonctions. useEffect est pour les effets de bord, useRef pour les références mutables.",
    difficulty: "easy",
    category: "Frontend",
  },
  {
    id: "front-2",
    question: "Quelle est la différence principale entre SSR et SSG dans Next.js ?",
    options: [
      "SSR est plus rapide",
      "SSG génère les pages au build, SSR à chaque requête",
      "SSG ne supporte pas TypeScript",
      "SSR ne peut pas utiliser de base de données",
    ],
    correctIndex: 1,
    explanation: "SSG (Static Site Generation) pré-génère les pages HTML au moment du build, idéal pour le contenu statique. SSR (Server-Side Rendering) génère la page à chaque requête, nécessaire pour du contenu dynamique. Next.js 13+ avec App Router utilise les React Server Components par défaut.",
    difficulty: "medium",
    category: "Frontend",
  },
  {
    id: "front-3",
    question: "Quel pattern React permet de partager de la logique entre composants sans héritage ?",
    options: ["HOC (Higher-Order Component)", "Render Props", "Custom Hooks", "Toutes ces réponses"],
    correctIndex: 3,
    explanation: "Les trois patterns permettent la réutilisation de logique : HOC wrappent un composant, Render Props passent la logique via une prop fonction, et les Custom Hooks (recommandés depuis React 16.8) extraient la logique d'état dans des fonctions réutilisables.",
    difficulty: "medium",
    category: "Frontend",
  },
];

export function QAQuiz() {
  return (
    <div className="max-w-3xl mx-auto">
      <Quiz
        questions={quizQuestions}
        title="Quiz Technique — Entretiens"
        showCategories={true}
      />
    </div>
  );
}
`,
);

console.log("P2.5 QA Quiz: DONE (3 files: quiz.tsx, qa/page.tsx, qa-quiz.tsx)");

// ============================================================
// P2.3 — Dashboard localStorage Hook
// ============================================================
console.log("\n=== P2.3 DASHBOARD LOCALSTORAGE ===");

w(
  "_hooks/use-progress.ts",
  `"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserProgress {
  challengesCompleted: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  visitedPages: string[];
  streakDates: string[];
  timeSpent: Record<string, number>;
  lastVisit: string;
  totalTimeMinutes: number;
}

const STORAGE_KEY = "tech-mastry-progress";

const defaultProgress: UserProgress = {
  challengesCompleted: [],
  quizScores: {},
  visitedPages: [],
  streakDates: [],
  timeSpent: {},
  lastVisit: new Date().toISOString(),
  totalTimeMinutes: 0,
};

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(stored) };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadProgress();
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    if (!loaded.streakDates.includes(today)) {
      loaded.streakDates = [...loaded.streakDates, today];
    }
    loaded.lastVisit = new Date().toISOString();
    setProgress(loaded);
    saveProgress(loaded);
    setIsLoaded(true);
  }, []);

  const trackPageVisit = useCallback((path: string) => {
    setProgress((prev) => {
      if (prev.visitedPages.includes(path)) return prev;
      const updated = {
        ...prev,
        visitedPages: [...prev.visitedPages, path],
        lastVisit: new Date().toISOString(),
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackQuizScore = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizId]: { score, total, date: new Date().toISOString() },
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackChallengeComplete = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.challengesCompleted.includes(challengeId)) return prev;
      const updated = {
        ...prev,
        challengesCompleted: [...prev.challengesCompleted, challengeId],
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackTimeSpent = useCallback((path: string, minutes: number) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [path]: (prev.timeSpent[path] || 0) + minutes,
        },
        totalTimeMinutes: prev.totalTimeMinutes + minutes,
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const getStreakDays = useCallback((): number => {
    const dates = [...progress.streakDates].sort().reverse();
    if (dates.length === 0) return 0;
    let streak = 1;
    const today = new Date();
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const prev = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    // Check if streak includes today
    const lastDate = new Date(dates[0]);
    const diffFromToday = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffFromToday > 1) return 0; // Streak broken
    return streak;
  }, [progress.streakDates]);

  const getSkillLevels = useCallback(() => {
    const categoryScores: Record<string, { total: number; correct: number }> = {};
    Object.entries(progress.quizScores).forEach(([, data]) => {
      // Infer category from quiz ID or use default
      const category = "general";
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, correct: 0 };
      }
      categoryScores[category].total += data.total;
      categoryScores[category].correct += data.score;
    });
    return categoryScores;
  }, [progress.quizScores]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    saveProgress(defaultProgress);
  }, []);

  return {
    progress,
    isLoaded,
    trackPageVisit,
    trackQuizScore,
    trackChallengeComplete,
    trackTimeSpent,
    getStreakDays,
    getSkillLevels,
    resetProgress,
  };
}
`,
);

console.log("P2.3 Dashboard localStorage: DONE (useProgress hook)");

console.log("\n✅ ALL PHASE 2 QUIZ & DASHBOARD CONTENT CREATED");
