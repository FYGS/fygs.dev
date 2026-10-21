import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/case-studies");

const caseStudies = [
  {
    title: "URL Shortener (TinyURL)",
    difficulty: "Medium",
    requirements: ["100M URLs/jour", "Read-heavy (100:1)", "Redirection < 10ms", "7 characters"],
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
    title: "Chat System (WhatsApp)",
    difficulty: "Hard",
    requirements: ["1B users", "Messages en temps réel", "Delivery guarantees", "Group chats"],
    components: ["WebSocket Gateway", "Message Queue (Kafka)", "Cassandra", "Presence Service"],
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
    requirements: ["500M tweets/jour", "Timeline personnalisée", "Celebrity problem", "Real-time"],
    components: ["Fan-out Service", "Timeline Cache", "Graph DB (followers)", "Search Index"],
    keyDecisions: [
      "Fan-out on write vs Fan-out on read (hybride)",
      "Celebrities : fan-out on read (trop de followers)",
      "Timeline pré-calculée en cache Redis",
      "Pagination par cursor, pas offset",
    ],
    color: "border-purple-500/30",
  },
  {
    title: "Video Streaming (Netflix/YouTube)",
    difficulty: "Expert",
    requirements: ["1B vidéos/jour", "Adaptive bitrate", "Global CDN", "< 2s start time"],
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
              <Badge className={diffColors[cs.difficulty]}>{cs.difficulty}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Requirements</h3>
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
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Components</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cs.components.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Key Decisions</h3>
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
