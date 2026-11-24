import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/case-studies");

const caseStudies = [
  {
    title: "URL Shortener (TinyURL)",
    difficulty: "Medium",
    note: "Chiffres = hypothèses d'exercice (identiques à l'exercice de tableau blanc) : 100 M d'URLs créées par jour, ratio lecture/écriture de 10:1 (souvent bien supérieur en réalité).",
    requirements: ["100M URLs/jour (hypothèse)", "Read-heavy (hypothèse : 10:1)", "Redirection < 10 ms", "7 caractères"],
    components: ["API Gateway", "Hash Service", "Key-Value Store (Redis)", "Analytics"],
    keyDecisions: [
      "Base62 encoding vs Hash + collision detection",
      "Read replicas pour le throughput",
      "Cache LRU pour les URLs populaires",
      "TTL pour l'expiration automatique",
    ],
    color: "border-blue-500/30",
  },
  {
    title: "Chat System (conception générique)",
    difficulty: "Hard",
    note: "Conception générique de type messagerie, pas l'architecture réelle de WhatsApp. Ce qui est public : WhatsApp a longtemps reposé sur Erlang sous FreeBSD (serveur dérivé d'ejabberd/XMPP) avec Mnesia, puis a migré vers l'infrastructure de Meta. Cassandra et Kafka ci-dessous sont des choix d'exercice.",
    requirements: ["1 Md d'utilisateurs (hypothèse)", "Messages en temps réel", "Garanties de livraison", "Conversations de groupe"],
    components: ["WebSocket Gateway", "Message Queue (ex. Kafka)", "Stockage wide-column (ex. Cassandra)", "Presence Service"],
    keyDecisions: [
      "WebSocket pour bi-directionnel temps réel",
      "Sharding par conversation ID",
      "Eventual consistency acceptable",
      "Message ordering via sequence IDs",
    ],
    color: "border-green-500/30",
  },
  {
    title: "Social Network Feed (Twitter/X)",
    difficulty: "Hard",
    note: "Le volume de tweets est une hypothèse d'ordre de grandeur pour l'exercice, pas un chiffre officiel à jour.",
    requirements: ["~500 M de tweets/jour (hypothèse)", "Timeline personnalisée", "Problème des célébrités", "Temps réel"],
    components: ["Fan-out Service", "Timeline Cache", "Graph DB (followers)", "Search Index"],
    keyDecisions: [
      "Fan-out à l'écriture vs à la lecture (hybride)",
      "Célébrités : fan-out à la lecture (trop d'abonnés)",
      "Timeline pré-calculée dans un cache (ex. Redis)",
      "Pagination par cursor, pas offset",
    ],
    color: "border-purple-500/30",
  },
  {
    title: "Video Streaming (Netflix/YouTube)",
    difficulty: "Expert",
    requirements: ["Millions de flux simultanés", "Débit adaptatif", "CDN mondial", "Démarrage < 2 s"],
    components: ["Transcoding Pipeline", "CDN (multi-tier)", "Recommendation Engine", "DRM"],
    keyDecisions: [
      "Transcoding asynchrone multi-résolution (DAG)",
      "CDN edge caching + origin shields",
      "Adaptive Bitrate Streaming (ABR/HLS/DASH)",
      "Pre-fetching des segments suivants",
    ],
    color: "border-red-500/30",
  },
];

const diffColors: Record<string, string> = {
  Medium: "bg-yellow-500/10 text-yellow-500",
  Hard: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

const diffLabels: Record<string, string> = {
  Medium: "Moyen",
  Hard: "Difficile",
  Expert: "Expert",
};

export default function CaseStudiesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Études de Cas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyses détaillées de systèmes réels à grande échelle. Comprenez les décisions
            d&apos;architecture derrière les plus grands systèmes du monde.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        {caseStudies.map((cs) => (
          <Card key={cs.title} className={"p-8 space-y-6 border-2 " + cs.color}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">{cs.title}</h2>
              <Badge className={diffColors[cs.difficulty]}>{diffLabels[cs.difficulty]}</Badge>
            </div>
            {cs.note && <p className="text-sm text-muted-foreground italic">{cs.note}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Exigences</h3>
                <ul className="space-y-1.5">
                  {cs.requirements.map((r) => (
                    <li key={r} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Composants</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cs.components.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Décisions clés</h3>
                <ul className="space-y-1.5">
                  {cs.keyDecisions.map((d) => (
                    <li key={d} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">→</span>
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
