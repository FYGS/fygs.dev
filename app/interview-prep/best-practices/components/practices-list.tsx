import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const practices = [
  {
    title: "Communication",
    description: "Comment communiquer efficacement pendant un entretien technique.",
    category: "Soft Skills",
    topics: ["Clarification", "Pensée à voix haute", "Questions pertinentes"],
    href: "/interview-prep/best-practices/communication",
  },
  {
    title: "Problem Solving",
    description: "Approche structurée pour résoudre des problèmes techniques.",
    category: "Technique",
    topics: ["STAR Method", "Edge Cases", "Optimisation"],
    href: "/interview-prep/best-practices/problem-solving",
  },
  {
    title: "Code Quality",
    description: "Bonnes pratiques pour écrire du code propre et maintenable.",
    category: "Technique",
    topics: ["Clean Code", "Tests", "Documentation"],
    href: "/interview-prep/best-practices/code-quality",
  },
  {
    title: "Préparation",
    description: "Comment se préparer efficacement pour un entretien technique.",
    category: "Organisation",
    topics: ["Planning", "Mock Interviews", "Resources"],
    href: "/interview-prep/best-practices/preparation",
  },
  {
    title: "Questions & Réponses",
    description: "Questions courantes et stratégies de réponse.",
    category: "Soft Skills",
    topics: ["Behavioral", "Technical", "Culture Fit"],
    href: "/interview-prep/best-practices/qa",
  },
  {
    title: "Négociation",
    description: "Techniques de négociation pour le salaire et les avantages.",
    category: "Carrière",
    topics: ["Salaire", "Avantages", "Contre-offres"],
    href: "/interview-prep/best-practices/negotiation",
  },
];

const categoryColors = {
  "Soft Skills": "bg-blue-500/10 text-blue-500",
  "Technique": "bg-green-500/10 text-green-500",
  "Organisation": "bg-yellow-500/10 text-yellow-500",
  "Carrière": "bg-purple-500/10 text-purple-500",
};

export function PracticesList() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practices.map((practice) => (
          <Link key={practice.title} href={practice.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {practice.title}
                </h2>
                <Badge variant="secondary" className={categoryColors[practice.category]}>
                  {practice.category}
                </Badge>
              </div>
              
              <p className="text-muted-foreground">
                {practice.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {practice.topics.map((topic) => (
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
