import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Difficulty = "Fondamental" | "Intermédiaire" | "Avancé";

type Topic = {
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  href: string;
};

const topics: Topic[] = [
  {
    title: "Complexité Algorithmique",
    description:
      "Comprendre et analyser la complexité temporelle et spatiale des algorithmes.",
    difficulty: "Fondamental",
    topics: ["Notation Big O", "Analyse de cas", "Optimisation"],
    href: "/interview-prep/algorithms/complexity",
  },
  {
    title: "Structures de Données",
    description:
      "Les structures de données essentielles et leurs applications.",
    difficulty: "Intermédiaire",
    topics: ["Arrays", "LinkedList", "HashTable", "Tree", "Graph"],
    href: "/interview-prep/algorithms/data-structures",
  },
  {
    title: "Algorithmes de Tri",
    description: "Implémentation et analyse des algorithmes de tri classiques.",
    difficulty: "Intermédiaire",
    topics: ["QuickSort", "MergeSort", "HeapSort"],
    href: "/interview-prep/algorithms/sorting",
  },
  {
    title: "Recherche & Parcours",
    description:
      "Techniques de recherche et parcours dans différentes structures.",
    difficulty: "Avancé",
    topics: ["BFS", "DFS", "Binary Search", "Dijkstra"],
    href: "/interview-prep/algorithms/search",
  },
  {
    title: "Programmation Dynamique",
    description: "Résolution de problèmes par programmation dynamique.",
    difficulty: "Avancé",
    topics: ["Memoization", "Tabulation", "Sous-problèmes"],
    href: "/interview-prep/algorithms/dynamic-programming",
  },
];

const difficultyColors: Record<Difficulty, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Avancé: "bg-red-500/10 text-red-500",
};

export function TopicsList() {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {topic.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={difficultyColors[topic.difficulty]}
                >
                  {topic.difficulty}
                </Badge>
              </div>

              <p className="text-muted-foreground">{topic.description}</p>

              <div className="flex flex-wrap gap-2">
                {topic.topics.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
