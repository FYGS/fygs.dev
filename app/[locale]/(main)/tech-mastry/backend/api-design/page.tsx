import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";

export const metadata: Metadata = {
  title: "API Design | TechMastry",
  description: "REST, GraphQL, gRPC et WebSocket : conception d'APIs modernes et performantes",
};

const apiStyles = [
  {
    name: "REST",
    description: "Architectural style basé sur les ressources HTTP. Le plus répandu pour les APIs publiques.",
    pros: ["Standard universel", "Cacheable", "Facile à comprendre", "Tooling riche"],
    cons: ["Over-fetching / Under-fetching", "Pas de contrat strict natif", "Versioning complexe"],
    useCase: "APIs publiques, CRUD, microservices",
    color: "border-blue-500/30",
  },
  {
    name: "GraphQL",
    description: "Langage de requête pour APIs. Le client demande exactement les données dont il a besoin.",
    pros: ["Pas d'over-fetching", "Un seul endpoint", "Typage fort (schema)", "Introspection"],
    cons: ["Complexité serveur", "Caching plus difficile", "N+1 queries", "Courbe d'apprentissage"],
    useCase: "Apps mobiles, dashboards, données relationnelles complexes",
    color: "border-pink-500/30",
  },
  {
    name: "gRPC",
    description: "RPC framework haute performance avec Protocol Buffers. Communication inter-services.",
    pros: ["Ultra performant (binaire)", "Streaming bi-directionnel", "Code generation", "Contrat strict"],
    cons: ["Pas browser-friendly natif", "Debugging plus difficile", "Moins de tooling"],
    useCase: "Communication inter-microservices, streaming, IoT",
    color: "border-green-500/30",
  },
  {
    name: "WebSocket",
    description: "Protocole full-duplex pour communication en temps réel sur une connexion persistante.",
    pros: ["Temps réel", "Bi-directionnel", "Faible latence", "Événementiel"],
    cons: ["Gestion d'état complexe", "Pas de caching HTTP", "Load balancing complexe"],
    useCase: "Chat, notifications, collaborative editing, gaming",
    color: "border-orange-500/30",
  },
];

const restBestPractices = [
  { rule: "Noms de ressources au pluriel", example: "GET /api/users, POST /api/orders" },
  { rule: "Verbes HTTP sémantiques", example: "GET (lire), POST (créer), PATCH (modifier), DELETE (supprimer)" },
  { rule: "Status codes appropriés", example: "200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)" },
  { rule: "Pagination systématique", example: "GET /api/users?page=1&limit=20&sort=createdAt:desc" },
  { rule: "Versioning", example: "/api/v1/users ou Accept: application/vnd.api.v1+json" },
  { rule: "HATEOAS (liens)", example: "Inclure les liens vers les actions possibles dans la réponse" },
];

export default function ApiDesignPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Server className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">API Design</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comparez REST, GraphQL, gRPC et WebSocket. Choisissez le bon style et
            appliquez les bonnes pratiques pour des APIs robustes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Styles d&apos;API</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiStyles.map((api) => (
            <Card key={api.name} className={"p-6 space-y-4 border-2 " + api.color}>
              <h3 className="text-xl font-bold">{api.name}</h3>
              <p className="text-sm text-muted-foreground">{api.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-500 mb-1">Avantages</p>
                  <ul className="space-y-1">
                    {api.pros.map((p) => (
                      <li key={p} className="text-xs text-muted-foreground">✅ {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-500 mb-1">Inconvénients</p>
                  <ul className="space-y-1">
                    {api.cons.map((c) => (
                      <li key={c} className="text-xs text-muted-foreground">⚠️ {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{api.useCase}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">REST Best Practices</h2>
        <div className="space-y-3">
          {restBestPractices.map((bp) => (
            <Card key={bp.rule} className="p-4 border-border/40">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-medium text-sm w-64 shrink-0">{bp.rule}</span>
                <code className="text-xs bg-muted/50 px-3 py-1.5 rounded-md text-muted-foreground">
                  {bp.example}
                </code>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
