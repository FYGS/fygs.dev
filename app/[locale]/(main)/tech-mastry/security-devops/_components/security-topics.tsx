import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cloud, Container, GitBranch, ShieldAlert } from "lucide-react";
import Link from "next/link";

const topics = [
  {
    title: "OWASP Top 10",
    description: "Les 10 vulnérabilités web les plus critiques avec code vulnérable vs sécurisé.",
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    href: "/tech-mastry/security-devops/owasp-top-10",
    category: "Sécurité",
    tags: ["XSS", "SQL Injection", "CSRF", "Auth"],
  },
  {
    title: "CI/CD Pipelines",
    description: "Conception et optimisation de pipelines d'intégration et déploiement continus.",
    icon: GitBranch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/tech-mastry/security-devops/cicd",
    category: "DevOps",
    tags: ["GitHub Actions", "Pipelines", "Déploiement", "Tests"],
  },
  {
    title: "Docker & Kubernetes",
    description: "Conteneurisation et orchestration pour des déploiements fiables et scalables.",
    icon: Container,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    href: "/tech-mastry/security-devops/docker-kubernetes",
    category: "DevOps",
    tags: ["Containers", "Pods", "Services", "Helm"],
  },
  {
    title: "Cloud Native",
    description: "Architecture 12-Factor, serverless et bonnes pratiques cloud.",
    icon: Cloud,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/tech-mastry/security-devops/cloud-native",
    category: "Cloud",
    tags: ["12-Factor", "Serverless", "AWS/GCP/Azure", "IaC"],
  },
];

const categoryColors: Record<string, string> = {
  "Sécurité": "bg-red-500/10 text-red-500",
  DevOps: "bg-blue-500/10 text-blue-500",
  Cloud: "bg-purple-500/10 text-purple-500",
};

export function SecurityTopics() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group border-border/40 hover:border-yellow-500/30">
              <div className="flex items-start justify-between">
                <div className={"inline-flex p-3 rounded-xl " + topic.bgColor}>
                  <topic.icon className={"w-6 h-6 " + topic.color} />
                </div>
                <Badge variant="secondary" className={categoryColors[topic.category]}>
                  {topic.category}
                </Badge>
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
