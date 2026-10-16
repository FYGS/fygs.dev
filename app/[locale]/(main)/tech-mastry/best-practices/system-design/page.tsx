"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Globe, Shield, Zap, Layers, Code2, ArrowRight, Network, HardDrive } from "lucide-react";

/* ─── Interactive System Design Flowchart ─── */
function SystemDesignFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: "1. Clarifier les exigences", icon: "🎯", desc: "Fonctionnels vs non-fonctionnels. Users ? Scale ? Contraintes ?", details: ["Nombre d'utilisateurs (DAU, MAU)", "Type de données (text, media, files)", "Latence acceptable (p99)", "Disponibilité cible (99.9% ?)", "Consistency vs Availability (CAP)"] },
    { title: "2. Estimations", icon: "📊", desc: "Back-of-envelope : QPS, stockage, bande passante.", details: ["QPS = DAU x requêtes/jour / 86400", "Stockage = Users x Data/user x rétention", "Bandwidth = QPS x taille_réponse", "Peak = QPS x 3 (facteur de burst)", "Cache = 20% des données chaudes (80/20)"] },
    { title: "3. API Design", icon: "🔌", desc: "Endpoints REST/GraphQL. Entrées, sorties, erreurs.", details: ["POST /api/v1/resource — création", "GET /api/v1/resource/:id — lecture", "Pagination : cursor-based > offset", "Rate limiting par API key", "Versioning dans l'URL ou header"] },
    { title: "4. Data Model", icon: "💾", desc: "Schema, SQL vs NoSQL, indexation, partitioning.", details: ["SQL : ACID, relations, joins complexes", "NoSQL : Scale horizontal, flexible schema", "Index : B-Tree (range), Hash (point)", "Sharding : hash-based, range-based, geo", "Replication : leader-follower, multi-leader"] },
    { title: "5. High-Level Design", icon: "🏗️", desc: "Composants principaux et flux de données.", details: ["Load Balancer → App Servers → DB", "CDN pour assets statiques", "Cache layer (Redis/Memcached)", "Message Queue pour async", "Search engine (Elasticsearch)"] },
    { title: "6. Deep Dive", icon: "🔍", desc: "Bottlenecks, optimisations, trade-offs.", details: ["Single Point of Failure ?", "Hot spots / hot keys ?", "Read-heavy → Cache + replicas", "Write-heavy → Sharding + queue", "Monitoring, alerting, logging"] },
  ];

  return (
    <Card className="p-6 space-y-6 border-blue-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <ArrowRight className="w-5 h-5 text-blue-500" />
        Framework d&apos;Entretien System Design
      </h3>

      {/* Steps */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <button key={i} onClick={() => setActiveStep(i)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all border shrink-0 ${
              activeStep === i ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/30 hover:border-primary/20"
            }`}>
            <span className="text-xl">{step.icon}</span>
            <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Active Step Detail */}
      <div className="bg-muted/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{steps[activeStep].icon}</span>
          <div>
            <h4 className="font-bold text-lg">{steps[activeStep].title}</h4>
            <p className="text-sm text-muted-foreground">{steps[activeStep].desc}</p>
          </div>
        </div>
        <ul className="space-y-2">
          {steps[activeStep].details.map((detail, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>{detail}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ─── Data ─── */
const concepts = [
  {
    name: "Load Balancing",
    icon: Globe,
    color: "text-blue-500",
    border: "border-blue-500/30",
    desc: "Distribution du trafic entre serveurs. Round-robin, least connections, IP hash.",
    details: ["L4 (TCP) vs L7 (HTTP)", "Health checks", "Sticky sessions", "Algorithmes : Round-robin, Weighted, Least Connections"],
  },
  {
    name: "Caching",
    icon: Zap,
    color: "text-amber-500",
    border: "border-amber-500/30",
    desc: "Stocker les données fréquemment accédées près du client. CDN, Redis, browser cache.",
    details: ["Cache-aside (Lazy loading)", "Write-through / Write-behind", "TTL, LRU, LFU eviction", "Cache stampede prevention"],
  },
  {
    name: "Database Scaling",
    icon: Database,
    color: "text-green-500",
    border: "border-green-500/30",
    desc: "Horizontal (sharding) et vertical scaling. Read replicas, partitioning.",
    details: ["Vertical : bigger machine", "Horizontal : sharding (hash/range)", "Read replicas + Leader-Follower", "Denormalization pour read performance"],
  },
  {
    name: "Message Queues",
    icon: Layers,
    color: "text-purple-500",
    border: "border-purple-500/30",
    desc: "Communication asynchrone entre services. Kafka, RabbitMQ, SQS.",
    details: ["Pub/Sub vs Point-to-Point", "At-least-once vs Exactly-once", "Dead Letter Queue", "Backpressure et rate limiting"],
  },
  {
    name: "Microservices",
    icon: Network,
    color: "text-cyan-500",
    border: "border-cyan-500/30",
    desc: "Décomposition en services indépendants. API Gateway, service discovery.",
    details: ["Bounded contexts (DDD)", "API Gateway pattern", "Service mesh (Istio)", "Saga pattern pour transactions distribuées"],
  },
  {
    name: "Consistency & CAP",
    icon: Shield,
    color: "text-red-500",
    border: "border-red-500/30",
    desc: "CAP theorem : choisir entre Consistency et Availability lors de Partition.",
    details: ["Strong consistency : Linearizable", "Eventual consistency : DNS, caches", "PACELC : extension du CAP", "Consensus : Raft, Paxos"],
  },
  {
    name: "CDN & Edge",
    icon: Globe,
    color: "text-teal-500",
    border: "border-teal-500/30",
    desc: "Contenu distribué géographiquement. Push vs Pull CDN. Edge computing.",
    details: ["Static assets + media delivery", "Edge functions (Vercel, Cloudflare)", "Cache invalidation strategies", "Geo-routing et anycast"],
  },
  {
    name: "Storage",
    icon: HardDrive,
    color: "text-orange-500",
    border: "border-orange-500/30",
    desc: "Blob storage, file systems, object storage. S3, GCS.",
    details: ["Block vs Object vs File storage", "Replication et durability", "Storage classes (hot/warm/cold)", "Pre-signed URLs pour uploads"],
  },
];

const caseStudies = [
  { name: "URL Shortener", complexity: "Medium", concepts: ["Hash generation", "Base62 encoding", "Read-heavy caching", "Analytics"], tip: "Key decision : counter vs hash. 301 vs 302 redirect." },
  { name: "Chat System", complexity: "Hard", concepts: ["WebSocket", "Message queue", "Presence service", "Read receipts"], tip: "Push vs Pull. 1:1 vs Group. Media vs Text." },
  { name: "News Feed", complexity: "Hard", concepts: ["Fan-out (push vs pull)", "Ranking", "Caching", "CDN"], tip: "Fan-out on write (fast read) vs Fan-out on read (fast write)." },
  { name: "Rate Limiter", complexity: "Medium", concepts: ["Token bucket", "Sliding window", "Redis counters", "Distributed sync"], tip: "Fixed window vs Sliding window log vs Token bucket." },
  { name: "Notification System", complexity: "Medium", concepts: ["Multi-channel (push/email/sms)", "Priority queue", "Templates", "Retry"], tip: "Reliability vs speed. Deduplication. User preferences." },
  { name: "Search Autocomplete", complexity: "Medium", concepts: ["Trie", "Elasticsearch", "N-gram index", "Query caching"], tip: "Prefix trie + top-K frequent. Personalization layer." },
];

export default function SystemDesignPage() {
  const [selectedConcept, setSelectedConcept] = useState(concepts[0]);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Server className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          System Design
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conception de systèmes distribués à grande échelle. Du framework d&apos;entretien
          aux concepts fondamentaux et études de cas.
        </p>
      </section>

      {/* Interview Framework */}
      <SystemDesignFlow />

      {/* Core Concepts */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Concepts Fondamentaux</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {concepts.map((c) => (
            <button key={c.name} onClick={() => setSelectedConcept(c)}
              className={`text-left p-4 rounded-xl border transition-all ${selectedConcept.name === c.name ? "border-primary bg-primary/5 ring-1 ring-primary/30" : `border-border/40 hover:${c.border}`}`}>
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <h3 className="font-bold text-sm">{c.name}</h3>
            </button>
          ))}
        </div>

        {/* Selected Concept Detail */}
        <Card className="p-6 border-primary/20 space-y-4">
          <div className="flex items-center gap-3">
            <selectedConcept.icon className={`w-8 h-8 ${selectedConcept.color}`} />
            <div>
              <h3 className="text-xl font-bold">{selectedConcept.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedConcept.desc}</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedConcept.details.map((d, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 bg-muted/20 rounded-lg p-3">
                <span className="text-primary mt-0.5 shrink-0">→</span>{d}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Case Studies */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Études de Cas d&apos;Entretien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseStudies.map((cs) => (
            <Card key={cs.name} className="p-5 border-border/40 hover:border-primary/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{cs.name}</h3>
                <Badge variant="outline" className={`text-[10px] ${cs.complexity === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                  {cs.complexity}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {cs.concepts.map((c) => (
                  <Badge key={c} className="bg-primary/10 text-primary text-[10px]">{c}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">{cs.tip}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Formulas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Formules d&apos;Estimation
        </h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg">
            <code>{`// Back-of-envelope calculations
const DAU = 10_000_000;                    // 10M Daily Active Users
const avgRequestsPerDay = 10;              // requêtes/jour/user
const QPS = (DAU * avgRequestsPerDay) / 86400;  // ~1157 QPS
const peakQPS = QPS * 3;                   // ~3470 QPS (burst factor)

// Storage estimation
const avgDataPerUser = 500;                // 500 bytes/entry
const entriesPerDay = DAU * 2;             // 20M entries/day
const dailyStorage = entriesPerDay * avgDataPerUser; // ~10 GB/day
const yearlyStorage = dailyStorage * 365;  // ~3.6 TB/year

// Cache (80/20 rule)
const cacheSize = dailyStorage * 0.2;      // ~2 GB cache
const cacheHitRate = 0.9;                  // 90% target

// Bandwidth
const avgResponseSize = 1024;              // 1 KB/response
const bandwidth = QPS * avgResponseSize;   // ~1.1 MB/s

// Powers of 2 (Quick Reference)
// 2^10 = 1 KB,  2^20 = 1 MB,  2^30 = 1 GB
// 2^40 = 1 TB,  2^50 = 1 PB

// Time conversions
// 1 day   = 86,400 seconds
// 1 month = 2.5M seconds
// 1 year  = 31.5M seconds`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}