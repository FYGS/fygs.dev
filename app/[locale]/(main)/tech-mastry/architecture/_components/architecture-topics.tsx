import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

interface Topic {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
}

const topics: Topic[] = [
  {
    title: "Clean Architecture",
    description:
      "Architecture en couches avec séparation claire des responsabilités et règle de dépendance.",
    category: "Avancé",
    topics: ["Couches", "Dépendances", "Use Cases", "Ports & Adapters"],
    href: "/tech-mastry/architecture/clean-architecture",
  },
  {
    title: "Design Patterns",
    description:
      "Catalogue complet des patterns de conception : Creational, Structural et Behavioral.",
    category: "Intermédiaire",
    topics: ["Singleton", "Factory", "Observer", "Strategy", "Decorator"],
    href: "/tech-mastry/architecture/design-patterns",
  },
  {
    title: "Principes SOLID",
    description:
      "Les 5 principes fondamentaux de la programmation orientée objet pour un code maintenable.",
    category: "Fondamental",
    topics: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    href: "/tech-mastry/architecture/solid",
  },
  {
    title: "Domain-Driven Design",
    description:
      "Conception pilotée par le domaine métier : Bounded Contexts, Aggregates et modélisation.",
    category: "Expert",
    topics: ["Bounded Context", "Aggregate", "Entity", "Value Object"],
    href: "/tech-mastry/architecture/ddd",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  "Intermédiaire": "bg-yellow-500/10 text-yellow-500",
  "Avancé": "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function ArchitectureTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 space-y-4 group border-border/40 hover:border-indigo-500/30">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold group-hover:text-indigo-500 transition-colors">
                  {topic.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={categoryColors[topic.category]}
                >
                  {topic.category}
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
