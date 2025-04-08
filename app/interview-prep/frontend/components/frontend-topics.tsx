import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    title: "React Fondamentaux",
    description: "Les concepts essentiels de React et son écosystème.",
    category: "Fondamental",
    topics: ["Hooks", "Components", "Props & State", "Context"],
    href: "/interview-prep/frontend/react-basics",
  },
  {
    title: "Performance & Optimisation",
    description: "Techniques d'optimisation des applications React.",
    category: "Avancé",
    topics: ["Memoization", "Code Splitting", "Bundle Size", "Virtualization"],
    href: "/interview-prep/frontend/performance",
  },
  {
    title: "State Management",
    description: "Gestion avancée de l'état dans les applications React.",
    category: "Intermédiaire",
    topics: ["Redux", "Zustand", "React Query", "Context API"],
    href: "/interview-prep/frontend/state",
  },
  {
    title: "Testing & Qualité",
    description: "Stratégies de test et assurance qualité.",
    category: "Intermédiaire",
    topics: ["Jest", "React Testing Library", "E2E Tests", "CI/CD"],
    href: "/interview-prep/frontend/testing",
  },
  {
    title: "Architecture & Patterns",
    description: "Patterns de conception et architecture frontend.",
    category: "Avancé",
    topics: ["Component Patterns", "Clean Architecture", "DDD", "SOLID"],
    href: "/interview-prep/frontend/architecture",
  },
  {
    title: "Accessibilité & UX",
    description: "Création d'interfaces accessibles et conviviales.",
    category: "Expert",
    topics: ["ARIA", "Keyboard Nav", "Color Contrast", "Screen Readers"],
    href: "/interview-prep/frontend/accessibility",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Avancé: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function FrontendTopics() {
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
