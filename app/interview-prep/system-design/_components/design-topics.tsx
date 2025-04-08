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
    title: "Scalabilité & Performance",
    description:
      "Techniques pour concevoir des systèmes hautement évolutifs et performants.",
    category: "Fondamental",
    topics: ["Load Balancing", "Caching", "Database Sharding", "CDN"],
    href: "/interview-prep/system-design/scalability",
  },
  {
    title: "Architecture Distribuée",
    description: "Conception de systèmes distribués robustes et fiables.",
    category: "Avancé",
    topics: ["Microservices", "Event-Driven", "Message Queues", "Service Mesh"],
    href: "/interview-prep/system-design/distributed",
  },
  {
    title: "Stockage & Bases de Données",
    description: "Choix et conception des systèmes de stockage de données.",
    category: "Intermédiaire",
    topics: ["SQL vs NoSQL", "ACID", "Réplication", "Partitionnement"],
    href: "/interview-prep/system-design/storage",
  },
  {
    title: "Sécurité & Authentification",
    description: "Sécurisation des systèmes et gestion des identités.",
    category: "Intermédiaire",
    topics: ["OAuth", "JWT", "SSL/TLS", "Rate Limiting"],
    href: "/interview-prep/system-design/security",
  },
  {
    title: "Monitoring & Fiabilité",
    description: "Surveillance, débogage et maintenance des systèmes.",
    category: "Avancé",
    topics: ["Logging", "Metrics", "Alerting", "SLO/SLA"],
    href: "/interview-prep/system-design/monitoring",
  },
  {
    title: "Études de Cas",
    description: "Analyses détaillées de systèmes réels à grande échelle.",
    category: "Expert",
    topics: [
      "URL Shortener",
      "Chat System",
      "Social Network",
      "Video Streaming",
    ],
    href: "/interview-prep/system-design/case-studies",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Avancé: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function DesignTopics() {
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
