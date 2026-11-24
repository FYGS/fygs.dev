"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const challenges = [
  {
    id: 1,
    title: "Design a URL Shortener",
    description:
      "Concevoir un service de raccourcissement d'URL comme bit.ly ou TinyURL.",
    difficulty: "Intermédiaire",
    topics: ["Scalability", "Database Design", "Hashing"],
    estimatedTime: "30 min",
    requirements: [
      "Gérer 100M URLs actives",
      "Générer des URLs courtes uniques (7 caractères)",
      "Temps de redirection < 100ms",
      "Haute disponibilité (99.9%)",
    ],
    keyPoints: [
      "Base62 encoding pour les IDs",
      "Cache (Redis) pour les URLs populaires",
      "Base de données NoSQL (Cassandra) pour scalabilité",
      "Load balancer + CDN pour distribution",
      "Rate limiting pour éviter les abus",
    ],
    hints: [
      "Utilisez un compteur distribué pour générer des IDs uniques",
      "Partitionnez la base de données par hash de la clé courte (les lectures se font par clé courte)",
      "Implémentez un TTL pour nettoyer les URLs expirées",
    ],
  },
  {
    id: 2,
    title: "Design Twitter Feed",
    description:
      "Concevoir le fil d'actualité de Twitter avec suivi d'utilisateurs.",
    difficulty: "Difficile",
    topics: ["Feed Generation", "Caching", "Real-time Updates"],
    estimatedTime: "45 min",
    requirements: [
      "Afficher les tweets des utilisateurs suivis",
      "Gérer 100M utilisateurs actifs",
      "Latence < 200ms pour charger le feed",
      "Tweets en temps réel (push notifications)",
    ],
    keyPoints: [
      "Fan-out on write: pré-calculer les feeds",
      "Timeline cache (Redis) pour chaque utilisateur",
      "Pagination avec cursor-based navigation",
      "WebSockets pour les mises à jour temps réel",
      "CDN pour les médias (images, vidéos)",
    ],
    hints: [
      "Utilisez un modèle hybride fan-out pour les célébrités",
      "Stockez les IDs de tweets, pas le contenu complet",
      "Implémentez un système de priorité pour les tweets",
    ],
  },
  {
    id: 3,
    title: "Design Rate Limiter",
    description: "Implémenter un rate limiter pour limiter les requêtes API.",
    difficulty: "Intermédiaire",
    topics: ["Rate Limiting", "Distributed Systems", "Algorithms"],
    estimatedTime: "30 min",
    requirements: [
      "Limiter à N requêtes par minute/heure",
      "Distribué (multi-serveurs)",
      "Faible latence (< 10ms overhead)",
      "Configurable par utilisateur/IP",
    ],
    keyPoints: [
      "Token bucket algorithm",
      "Redis pour le stockage distribué des compteurs",
      "Sliding window log pour précision",
      "Fixed window counter pour performance",
      "Leaky bucket pour lissage du trafic",
    ],
    hints: [
      "Token bucket : bon compromis mémoire/précision, et il autorise les rafales",
      "Avec Redis, rendez INCR + EXPIRE atomiques (script Lua ou transaction) pour éviter une clé sans expiration",
      "Implémentez un fallback local en cas de panne Redis",
    ],
  },
  {
    id: 4,
    title: "Design Netflix Video Streaming",
    description:
      "Concevoir une plateforme de streaming vidéo à l'échelle mondiale.",
    difficulty: "Expert",
    topics: ["Content Delivery", "Encoding", "CDN"],
    estimatedTime: "60 min",
    requirements: [
      "Streaming adaptatif (qualité variable)",
      "Gérer 100M utilisateurs simultanés",
      "Latence de démarrage < 2s",
      "Disponibilité globale",
    ],
    keyPoints: [
      "Adaptive Bitrate Streaming (HLS, DASH)",
      "CDN multi-fournisseurs ou CDN propriétaire (ex : Netflix Open Connect)",
      "Video encoding pipeline (FFmpeg, AWS Elemental)",
      "Distributed storage (S3, GCS)",
      "Edge caching pour contenu populaire",
    ],
    hints: [
      "Pré-encodez en plusieurs résolutions (240p à 4K)",
      "Utilisez le prefetching intelligent basé sur l'historique",
      "Placez les serveurs de cache au plus près des utilisateurs (jusque chez les FAI) pour réduire les coûts de transit",
    ],
  },
  {
    id: 5,
    title: "Design Uber/Lyft Ride Sharing",
    description: "Concevoir un système de covoiturage en temps réel.",
    difficulty: "Expert",
    topics: ["Geospatial", "Real-time Matching", "Routing"],
    estimatedTime: "60 min",
    requirements: [
      "Matching chauffeur-passager en temps réel",
      "Calcul d'ETA et de tarif",
      "Gérer 1M chauffeurs actifs",
      "Tracking en temps réel",
    ],
    keyPoints: [
      "Geospatial indexing (QuadTree, S2)",
      "WebSockets pour les mises à jour position",
      "Algorithmes de routage (Dijkstra, A*, contraction hierarchies)",
      "Kafka pour event streaming",
      "PostgreSQL + PostGIS pour les données spatiales",
    ],
    hints: [
      "Divisez la carte en grilles pour le matching",
      "Utilisez Redis Geo pour les positions en temps réel",
      "Implémentez un algorithme d'allocation optimal (Hungarian)",
    ],
  },
  {
    id: 6,
    title: "Design Distributed Cache",
    description:
      "Concevoir un système de cache distribué comme Memcached/Redis.",
    difficulty: "Expert",
    topics: ["Caching", "Consistency", "Replication"],
    estimatedTime: "45 min",
    requirements: [
      "Get/Set en temps constant O(1)",
      "Distribution sur N serveurs",
      "Gestion de l'éviction (LRU)",
      "Haute disponibilité",
    ],
    keyPoints: [
      "Consistent hashing pour distribution",
      "Replication pour redondance",
      "LRU eviction policy",
      "Gossip protocol pour découverte de nœuds",
      "Read-through / Write-through strategies",
    ],
    hints: [
      "Utilisez un hash ring avec virtual nodes",
      "Implémentez un health check périodique",
      "Ajoutez un layer de serialization efficace (Protocol Buffers)",
    ],
  },
];

export function SystemDesignChallenge() {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [userSolution, setUserSolution] = useState("");
  const [activeTab, setActiveTab] = useState("requirements");

  const resetChallenge = () => {
    setUserSolution("");
    setActiveTab("requirements");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenges List */}
      <Card className="p-6 lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mini System Design</h2>
          <Badge variant="outline">{challenges.length} défis</Badge>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge) => (
            <Button
              key={challenge.id}
              variant={
                selectedChallenge.id === challenge.id ? "default" : "ghost"
              }
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => {
                setSelectedChallenge(challenge);
                resetChallenge();
              }}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs text-muted-foreground">
                    #{challenge.id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {challenge.estimatedTime}
                  </Badge>
                </div>
                <span className="font-medium text-sm">{challenge.title}</span>
                <Badge
                  variant="secondary"
                  className={
                    challenge.difficulty === "Expert"
                      ? "bg-purple-500/10 text-purple-500 text-xs"
                      : challenge.difficulty === "Difficile"
                      ? "bg-red-500/10 text-red-500 text-xs"
                      : "bg-yellow-500/10 text-yellow-500 text-xs"
                  }
                >
                  {challenge.difficulty}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Challenge Details */}
      <Card className="p-6 lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{selectedChallenge.title}</h1>
            <Badge variant="outline">{selectedChallenge.estimatedTime}</Badge>
          </div>
          <p className="text-muted-foreground">
            {selectedChallenge.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedChallenge.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="keypoints">Key Points</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Exigences Fonctionnelles:</h3>
              <ul className="space-y-2">
                {selectedChallenge.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Votre Solution:</h3>
              <Textarea
                placeholder="Décrivez votre architecture (composants, flux de données, technologies...)"
                className="min-h-[200px] font-mono text-sm"
                value={userSolution}
                onChange={(e) => setUserSolution(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="keypoints" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Composants Clés:</h3>
              <ul className="space-y-2">
                {selectedChallenge.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm pt-0.5">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Voir les indices
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Indices de Design</DialogTitle>
                </DialogHeader>
                <ul className="space-y-2 mt-4">
                  {selectedChallenge.hints.map((hint, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">💡</span>
                      <span className="text-sm">{hint}</span>
                    </li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="solution" className="space-y-4 mt-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Architecture Suggérée</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-primary">
                    Composants:
                  </span>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    {selectedChallenge.keyPoints
                      .slice(0, 3)
                      .map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-primary">
                    Flux de Données:
                  </span>
                  <p className="mt-2 text-muted-foreground">
                    Client → Load Balancer → App Servers → Cache Layer →
                    Database
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-primary">
                    Technologies:
                  </span>
                  <p className="mt-2 text-muted-foreground">
                    {selectedChallenge.topics.join(", ")}
                  </p>
                </div>
              </div>
            </Card>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Note:</strong> Il n&apos;y a pas de solution unique
                en System Design. L&apos;important est de justifier vos choix et
                d&apos;identifier les compromis (trade-offs).
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetChallenge}>
            Réinitialiser
          </Button>
          <Button variant="ghost" asChild>
            <a
              href={`https://github.com/donnemartin/system-design-primer#${selectedChallenge.title
                .toLowerCase()
                .replace(/ /g, "-")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              📚 Ressources Externes
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
