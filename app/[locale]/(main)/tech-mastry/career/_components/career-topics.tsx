import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";

const topics = [
  {
    title: "Négociation Salariale",
    description: "Framework en 5 étapes, scripts de négociation, recherche de marché et mises en situation.",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/tech-mastry/career/salary-negotiation",
    tags: ["Salaire", "Stratégies", "Scripts", "Contre-offre"],
  },
  {
    title: "Progression de Carrière",
    description: "Échelle de carrière, matrice de compétences, IC vs Management et personal branding.",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/tech-mastry/career/progression",
    tags: ["Junior → Senior", "Staff", "IC Track", "Management"],
  },
  {
    title: "Conseils d'Entretien",
    description: "Méthode STAR, présentation technique, questions comportementales et checklist pré-entretien.",
    icon: UserCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/tech-mastry/career/interview-tips",
    tags: ["STAR", "Behavioral", "Présentation", "Recherche"],
  },
];

export function CareerTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group border-border/40 hover:border-primary/30">
              <div className={"inline-flex p-3 rounded-xl " + topic.bgColor}>
                <topic.icon className={"w-6 h-6 " + topic.color} />
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {topic.title}
              </h2>
              <p className="text-muted-foreground text-sm">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
