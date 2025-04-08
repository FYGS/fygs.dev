import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const challenges = [
  {
    title: "String Manipulation",
    description: "Série de défis sur la manipulation de chaînes de caractères.",
    difficulty: "Facile",
    topics: ["Palindrome", "Anagrammes", "Substring"],
    estimatedTime: "30 min",
    href: "/interview-prep/coding-challenges/strings",
  },
  {
    title: "Array Operations",
    description: "Défis sur les opérations de tableaux et les algorithmes de tri.",
    difficulty: "Intermédiaire",
    topics: ["Two Pointers", "Sliding Window", "Sorting"],
    estimatedTime: "45 min",
    href: "/interview-prep/coding-challenges/arrays",
  },
  {
    title: "Tree Traversal",
    description: "Problèmes de parcours et manipulation d'arbres binaires.",
    difficulty: "Difficile",
    topics: ["DFS", "BFS", "Binary Trees"],
    estimatedTime: "60 min",
    href: "/interview-prep/coding-challenges/trees",
  },
  {
    title: "Dynamic Programming",
    description: "Défis classiques de programmation dynamique.",
    difficulty: "Expert",
    topics: ["Memoization", "Tabulation", "Optimization"],
    estimatedTime: "90 min",
    href: "/interview-prep/coding-challenges/dp",
  },
  {
    title: "Graph Problems",
    description: "Problèmes sur les graphes et les algorithmes de parcours.",
    difficulty: "Difficile",
    topics: ["Shortest Path", "Cycle Detection", "MST"],
    estimatedTime: "75 min",
    href: "/interview-prep/coding-challenges/graphs",
  },
  {
    title: "System Design",
    description: "Mini-défis de conception de systèmes distribués.",
    difficulty: "Expert",
    topics: ["Scalability", "Load Balancing", "Caching"],
    estimatedTime: "120 min",
    href: "/interview-prep/coding-challenges/system-design",
  },
];

const difficultyColors = {
  Facile: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Difficile: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function ChallengesList() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Link key={challenge.title} href={challenge.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {challenge.title}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {challenge.estimatedTime}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                {challenge.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {challenge.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
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
