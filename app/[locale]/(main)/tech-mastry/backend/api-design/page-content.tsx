"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  ArrowRight,
  CheckCircle2,
  Send,
  Globe,
  Zap,
  Radio,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";

const apiStyles = [
  {
    name: "REST",
    description:
      "Architectural style basé sur les ressources HTTP. Le plus répandu pour les APIs publiques.",
    pros: [
      "Standard universel",
      "Cacheable",
      "Facile à comprendre",
      "Tooling riche",
    ],
    cons: [
      "Over-fetching / Under-fetching",
      "Pas de contrat strict natif",
      "Versioning complexe",
    ],
    useCase: "APIs publiques, CRUD, microservices",
    icon: Globe,
    color: "border-blue-500/30",
    gradient: "from-blue-500/10 to-blue-500/5",
    request: `GET /api/users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOi...`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "123",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}`,
  },
  {
    name: "GraphQL",
    description:
      "Langage de requête pour APIs. Le client demande exactement les données dont il a besoin.",
    pros: [
      "Pas d'over-fetching",
      "Un seul endpoint",
      "Typage fort (schema)",
      "Introspection",
    ],
    cons: [
      "Complexité serveur",
      "Caching plus difficile",
      "N+1 queries",
      "Courbe d'apprentissage",
    ],
    useCase: "Apps mobiles, dashboards, données relationnelles complexes",
    icon: Zap,
    color: "border-pink-500/30",
    gradient: "from-pink-500/10 to-pink-500/5",
    request: `POST /graphql HTTP/1.1
Content-Type: application/json

{
  "query": "{ user(id: \\"123\\") { name email posts { title } } }"
}`,
    response: `{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "posts": [
        { "title": "GraphQL Guide" },
        { "title": "API Best Practices" }
      ]
    }
  }
}`,
  },
  {
    name: "gRPC",
    description:
      "RPC framework haute performance avec Protocol Buffers. Communication inter-services.",
    pros: [
      "Ultra performant (binaire)",
      "Streaming bi-directionnel",
      "Code generation",
      "Contrat strict",
    ],
    cons: [
      "Pas browser-friendly natif",
      "Debugging plus difficile",
      "Moins de tooling",
    ],
    useCase: "Communication inter-microservices, streaming, IoT",
    icon: Send,
    color: "border-green-500/30",
    gradient: "from-green-500/10 to-green-500/5",
    request: `// Protocol Buffer definition
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}
message GetUserRequest { string id = 1; }`,
    response: `// Binary response (decoded)
User {
  id: "123"
  name: "Alice"
  email: "alice@example.com"
  role: ADMIN
  // Généralement plus compact que l'équivalent JSON
}`,
  },
  {
    name: "WebSocket",
    description:
      "Protocole full-duplex pour communication en temps réel sur une connexion persistante.",
    pros: ["Temps réel", "Bi-directionnel", "Faible latence", "Événementiel"],
    cons: [
      "Gestion d'état complexe",
      "Pas de caching HTTP",
      "Load balancing complexe",
    ],
    useCase: "Chat, notifications, collaborative editing, gaming",
    icon: Radio,
    color: "border-orange-500/30",
    gradient: "from-orange-500/10 to-orange-500/5",
    request: `// Client → Server
ws.send(JSON.stringify({
  type: "message",
  room: "general",
  content: "Hello everyone!",
  timestamp: Date.now()
}));`,
    response: `// Server → All Clients (broadcast)
{
  "type": "message",
  "from": "Alice",
  "room": "general",
  "content": "Hello everyone!",
  "timestamp": 1700000000000
}`,
  },
];

function ApiStyleExplorer() {
  const [selected, setSelected] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const api = apiStyles[selected];
  const Icon = api.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Styles d&apos;API &mdash; Explorer Interactif
      </h2>
      <div className="flex gap-2 flex-wrap">
        {apiStyles.map((a, i) => {
          const I = a.icon;
          return (
            <button
              key={a.name}
              onClick={() => {
                setSelected(i);
                setShowResponse(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${selected === i ? `bg-gradient-to-r ${a.gradient} border-primary/30 text-primary` : "border-border/40 text-muted-foreground hover:border-border"}`}
            >
              <I className="w-4 h-4" /> {a.name}
            </button>
          );
        })}
      </div>

      <Card className={`p-6 space-y-4 border-2 ${api.color}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${api.gradient}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{api.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {api.description}
            </p>
            <Badge variant="outline" className="text-xs mt-2">
              {api.useCase}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-green-500">Avantages</p>
            {api.pros.map((p) => (
              <div
                key={p}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-red-400">Inconvénients</p>
            {api.cons.map((c) => (
              <div
                key={c}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <ArrowRight className="w-3 h-3 text-red-400 shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">
              REQUEST
            </Badge>
            <div className="flex-1 h-px bg-border/30" />
            <button
              onClick={() => setShowResponse(!showResponse)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {showResponse ? "Masquer" : "Voir"} la réponse{" "}
              <ArrowDown
                className={`w-3 h-3 transition-transform ${showResponse ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
            <code>{api.request}</code>
          </pre>
          {showResponse && (
            <>
              <Badge className="bg-green-500/10 text-green-400 text-[10px]">
                RESPONSE
              </Badge>
              <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-green-500/10" tabIndex={0}>
                <code>{api.response}</code>
              </pre>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function HttpMethodVisualizer() {
  const [activeMethod, setActiveMethod] = useState("GET");
  const methods = [
    {
      method: "GET",
      color: "bg-green-500",
      desc: "Récupérer une ressource",
      idempotent: true,
      safe: true,
      body: false,
      example: "GET /api/users/123",
    },
    {
      method: "POST",
      color: "bg-blue-500",
      desc: "Créer une ressource",
      idempotent: false,
      safe: false,
      body: true,
      example:
        'POST /api/users\n{ "name": "Alice", "email": "alice@test.com" }',
    },
    {
      method: "PUT",
      color: "bg-orange-500",
      desc: "Remplacer entièrement une ressource",
      idempotent: true,
      safe: false,
      body: true,
      example:
        'PUT /api/users/123\n{ "name": "Alice", "email": "new@test.com", "role": "admin" }',
    },
    {
      method: "PATCH",
      color: "bg-yellow-500",
      desc: "Modifier partiellement une ressource",
      idempotent: false,
      safe: false,
      body: true,
      example: 'PATCH /api/users/123\n{ "email": "new@test.com" }',
    },
    {
      method: "DELETE",
      color: "bg-red-500",
      desc: "Supprimer une ressource",
      idempotent: true,
      safe: false,
      body: false,
      example: "DELETE /api/users/123",
    },
  ];
  const current = methods.find((m) => m.method === activeMethod)!;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">HTTP Methods</h2>
      <div className="flex gap-2 flex-wrap">
        {methods.map((m) => (
          <button
            key={m.method}
            onClick={() => setActiveMethod(m.method)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${activeMethod === m.method ? `${m.color} text-white border-transparent` : "border-border/40 text-muted-foreground"}`}
          >
            {m.method}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          <p className="text-[10px] text-muted-foreground">Idempotent</p>
          <p
            className={`font-bold text-sm ${current.idempotent ? "text-green-500" : "text-red-400"}`}
          >
            {current.idempotent ? "Oui" : "Non"}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          <p className="text-[10px] text-muted-foreground">Safe</p>
          <p
            className={`font-bold text-sm ${current.safe ? "text-green-500" : "text-red-400"}`}
          >
            {current.safe ? "Oui" : "Non"}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          <p className="text-[10px] text-muted-foreground">Request Body</p>
          <p
            className={`font-bold text-sm ${current.body ? "text-blue-400" : "text-muted-foreground"}`}
          >
            {current.body ? "Oui" : "Non"}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{current.desc}</p>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
        <code>{current.example}</code>
      </pre>
    </div>
  );
}

function StatusCodeGuide() {
  const [activeGroup, setActiveGroup] = useState("2xx");
  const groups: Record<
    string,
    {
      label: string;
      color: string;
      codes: { code: number; name: string; desc: string }[];
    }
  > = {
    "2xx": {
      label: "Success",
      color: "text-green-500",
      codes: [
        { code: 200, name: "OK", desc: "Requête réussie" },
        { code: 201, name: "Created", desc: "Ressource créée avec succès" },
        { code: 204, name: "No Content", desc: "Succès sans contenu (DELETE)" },
      ],
    },
    "3xx": {
      label: "Redirect",
      color: "text-blue-400",
      codes: [
        {
          code: 301,
          name: "Moved Permanently",
          desc: "URL changée définitivement",
        },
        {
          code: 304,
          name: "Not Modified",
          desc: "Cache valide, pas de re-téléchargement",
        },
      ],
    },
    "4xx": {
      label: "Client Error",
      color: "text-yellow-500",
      codes: [
        { code: 400, name: "Bad Request", desc: "Données invalides envoyées" },
        { code: 401, name: "Unauthorized", desc: "Non authentifié" },
        { code: 403, name: "Forbidden", desc: "Authentifié mais pas autorisé" },
        { code: 404, name: "Not Found", desc: "Ressource introuvable" },
        { code: 409, name: "Conflict", desc: "Conflit (doublon, version)" },
        { code: 429, name: "Too Many Requests", desc: "Rate limit dépassé" },
      ],
    },
    "5xx": {
      label: "Server Error",
      color: "text-red-500",
      codes: [
        {
          code: 500,
          name: "Internal Server Error",
          desc: "Erreur serveur inattendue",
        },
        {
          code: 502,
          name: "Bad Gateway",
          desc: "Réponse invalide du serveur upstream",
        },
        {
          code: 503,
          name: "Service Unavailable",
          desc: "Service temporairement indisponible",
        },
      ],
    },
  };
  const current = groups[activeGroup];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">HTTP Status Codes</h2>
      <div className="flex gap-2">
        {Object.entries(groups).map(([key, g]) => (
          <button
            key={key}
            onClick={() => setActiveGroup(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeGroup === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            <span className={g.color}>{key}</span> {g.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {current.codes.map((c) => (
          <div
            key={c.code}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/10 transition-colors"
          >
            <span
              className={`font-mono font-bold text-lg ${current.color} w-12`}
            >
              {c.code}
            </span>
            <span className="font-semibold text-sm w-48 shrink-0">
              {c.name}
            </span>
            <span className="text-xs text-muted-foreground">{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApiDesignPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Server className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">API Design</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comparez REST, GraphQL, gRPC et WebSocket. Explorez les
            requêtes/réponses, les méthodes HTTP et les status codes en
            interactif.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <ApiStyleExplorer />
      </Card>
      <Card className="p-8 border-border/40">
        <HttpMethodVisualizer />
      </Card>
      <Card className="p-8 border-border/40">
        <StatusCodeGuide />
      </Card>
    </div>
  );
}
