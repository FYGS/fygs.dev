import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

type Topic = {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
};

const topics: Topic[] = [
  {
    title: "API Design & REST",
    description: "Conception d'APIs RESTful et bonnes pratiques.",
    category: "Fondamental",
    topics: ["REST", "GraphQL", "OpenAPI", "Versioning"],
    href: "/tech-mastry/backend/api-design",
  },
  {
    title: "Bases de Données",
    description: "Conception, optimisation et gestion des bases de données.",
    category: "Avancé",
    topics: ["SQL", "NoSQL", "Indexation", "Transactions"],
    href: "/tech-mastry/backend/databases",
  },
  {
    title: "Sécurité Backend",
    description: "Sécurisation des applications et protection des données.",
    category: "Intermédiaire",
    topics: ["Auth", "OWASP", "Encryption", "Security Headers"],
    href: "/tech-mastry/backend/security",
  },
  {
    title: "Architecture & Patterns",
    description: "Patterns de conception et architecture backend.",
    category: "Intermédiaire",
    topics: ["Clean Architecture", "MVC", "Repository", "CQRS"],
    href: "/tech-mastry/backend/architecture",
  },
  {
    title: "Performance & Scaling",
    description: "Optimisation et mise à l'échelle des applications backend.",
    category: "Avancé",
    topics: ["Caching", "Load Balancing", "Queues", "Profiling"],
    href: "/tech-mastry/backend/performance",
  },
  {
    title: "DevOps & Infrastructure",
    description: "Déploiement et gestion de l'infrastructure backend.",
    category: "Expert",
    topics: ["Docker", "CI/CD", "Monitoring", "Cloud"],
    href: "/tech-mastry/backend/devops",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Avancé: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function BackendTopics() {
  return (
    <section className="space-y-8">
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
