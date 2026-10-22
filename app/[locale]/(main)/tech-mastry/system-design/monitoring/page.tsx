import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/monitoring");

const pillars = [
  {
    name: "Logs",
    desc: "Événements textuels structurés pour le debugging et l'audit. Utilisez des formats structurés (JSON) avec corrélation IDs.",
    tools: ["ELK Stack", "Loki + Grafana", "CloudWatch Logs", "Datadog"],
    color: "text-blue-500",
  },
  {
    name: "Metrics",
    desc: "Données numériques agrégées dans le temps : latence, throughput, error rate, saturation (USE/RED methods).",
    tools: ["Prometheus", "Grafana", "Datadog", "CloudWatch Metrics"],
    color: "text-green-500",
  },
  {
    name: "Traces",
    desc: "Suivi d'une requête à travers les services distribués. Identifie les bottlenecks et les dépendances.",
    tools: ["Jaeger", "Zipkin", "OpenTelemetry", "AWS X-Ray"],
    color: "text-purple-500",
  },
];

const slos = [
  { term: "SLI", full: "Service Level Indicator", desc: "Mesure quantitative du niveau de service, sans seuil (ex: la latence p99, ou la proportion de requêtes réussies en moins de 200 ms).", color: "text-blue-500" },
  { term: "SLO", full: "Service Level Objective", desc: "Objectif interne fixé sur un SLI (ex: latence p99 < 200 ms, ou 99,9 % des requêtes < 200 ms sur 30 jours).", color: "text-green-500" },
  { term: "SLA", full: "Service Level Agreement", desc: "Engagement contractuel avec le client, avec pénalités. Le SLA est plus souple que le SLO interne (ex: SLO 99,95 %, SLA 99,9 %) pour garder une marge avant de payer.", color: "text-red-500" },
  { term: "Error Budget", full: "Budget d'Erreur", desc: "100 % - SLO = budget d'erreur pour innover. Ex: SLO 99,9 % sur 30 jours = environ 43 min d'indisponibilité tolérée.", color: "text-orange-500" },
];

export default function MonitoringPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Monitoring & Fiabilité</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Observabilité, alerting et SRE : les pratiques pour garantir la fiabilité
            de vos systèmes en production.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Les 3 Piliers de l&apos;Observabilité</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <Card key={p.name} className="p-6 space-y-4 border-border/40">
              <h3 className={"text-xl font-bold " + p.color}>{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tools.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">SLI / SLO / SLA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slos.map((s) => (
            <Card key={s.term} className="p-6 space-y-2 border-border/40">
              <div className="flex items-center gap-3">
                <span className={"text-2xl font-black " + s.color}>{s.term}</span>
                <span className="text-sm text-muted-foreground">{s.full}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
