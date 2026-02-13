import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Bases de Données | TechMastry",
  description: "SQL, NoSQL, indexation, transactions et optimisation des requêtes",
};

const dbTypes = [
  {
    type: "Relationnelle (SQL)",
    examples: "PostgreSQL, MySQL, SQLite",
    bestFor: "Données structurées, relations complexes, ACID, reporting",
    features: ["ACID Transactions", "Joins complexes", "Schemas stricts", "Indexation avancée"],
    color: "text-blue-500",
  },
  {
    type: "Document (NoSQL)",
    examples: "MongoDB, Firestore, CouchDB",
    bestFor: "Données semi-structurées, prototypage rapide, schéma flexible",
    features: ["Schema flexible", "Scalabilité horizontale", "Dénormalisé", "JSON natif"],
    color: "text-green-500",
  },
  {
    type: "Key-Value",
    examples: "Redis, DynamoDB, Memcached",
    bestFor: "Cache, sessions, compteurs, rate limiting",
    features: ["Ultra rapide (O(1))", "TTL natif", "Pub/Sub", "Data structures riches"],
    color: "text-red-500",
  },
  {
    type: "Graph",
    examples: "Neo4j, Amazon Neptune, ArangoDB",
    bestFor: "Réseaux sociaux, recommandations, fraud detection",
    features: ["Traversées rapides", "Relations first-class", "Pattern matching", "Cypher/GQL"],
    color: "text-purple-500",
  },
];

const indexTypes = [
  { name: "B-Tree", desc: "Index par défaut. Bon pour les requêtes d'égalité et de range. O(log n)." },
  { name: "Hash", desc: "Recherche exacte en O(1). Pas de range queries. Idéal pour lookups." },
  { name: "GIN", desc: "Generalized Inverted Index. Full-text search, JSON, arrays." },
  { name: "GiST", desc: "Generalized Search Tree. Données géographiques, range types." },
  { name: "Partial", desc: "Index sur un sous-ensemble de lignes (WHERE condition). Réduit la taille." },
  { name: "Composite", desc: "Index multi-colonnes. L'ordre des colonnes est crucial." },
];

export default function DatabasesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Bases de Données</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez le bon type de base de données, optimisez vos requêtes et maîtrisez
            l&apos;indexation pour des applications performantes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Types de Bases de Données</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dbTypes.map((db) => (
            <Card key={db.type} className="p-6 space-y-3 border-border/40">
              <h3 className={"text-lg font-bold " + db.color}>{db.type}</h3>
              <p className="text-xs text-muted-foreground">{db.examples}</p>
              <p className="text-sm text-muted-foreground">{db.bestFor}</p>
              <div className="flex flex-wrap gap-1.5">
                {db.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Stratégies d&apos;Indexation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indexTypes.map((idx) => (
            <Card key={idx.name} className="p-5 space-y-2 border-border/40">
              <h3 className="font-semibold text-primary">{idx.name}</h3>
              <p className="text-sm text-muted-foreground">{idx.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
