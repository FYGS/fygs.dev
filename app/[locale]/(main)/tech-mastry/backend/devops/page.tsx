import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DevOps & Infrastructure | TechMastry",
  description: "Docker, CI/CD, monitoring et infrastructure cloud pour le backend",
};

const devopsTopics = [
  {
    title: "Conteneurisation",
    desc: "Docker pour l'isolation et la reproductibilité des environnements.",
    link: "/tech-mastry/security-devops/docker-kubernetes",
    tags: ["Docker", "Multi-stage", "Docker Compose"],
  },
  {
    title: "CI/CD",
    desc: "Pipelines d'intégration et de déploiement continus.",
    link: "/tech-mastry/security-devops/cicd",
    tags: ["GitHub Actions", "Tests", "Deploy"],
  },
  {
    title: "Monitoring",
    desc: "Observabilité et fiabilité des systèmes en production.",
    link: "/tech-mastry/system-design/monitoring",
    tags: ["Logs", "Metrics", "Traces", "SLO"],
  },
  {
    title: "Cloud Native",
    desc: "Architecture 12-Factor et principes cloud native.",
    link: "/tech-mastry/security-devops/cloud-native",
    tags: ["12-Factor", "Serverless", "IaC"],
  },
];

const infraChecklist = [
  "Environnements séparés : dev / staging / production",
  "Infrastructure as Code (Terraform, Pulumi, CDK)",
  "Secrets management (Vault, AWS Secrets Manager)",
  "Logging centralisé (ELK, Loki)",
  "Alerting configuré (PagerDuty, OpsGenie)",
  "Backup automatisé et testé",
  "Disaster Recovery Plan documenté",
  "Auto-scaling configuré avec métriques",
  "Health checks et readiness probes",
  "SSL/TLS automatisé (Let's Encrypt, cert-manager)",
];

export default function BackendDevopsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Terminal className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">DevOps & Infrastructure</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les pratiques DevOps essentielles pour déployer et opérer
            vos applications backend en production.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Sujets Clés</h2>
        <p className="text-muted-foreground">Ces sujets sont couverts en détail dans les sections dédiées :</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devopsTopics.map((t) => (
            <Link key={t.title} href={t.link}>
              <Card className="p-6 space-y-3 h-full border-border/40 hover:border-primary/30 hover:shadow-lg transition-all group">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Checklist Production-Ready</h2>
        <Card className="p-6 border-border/40">
          <div className="space-y-3">
            {infraChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/30 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
