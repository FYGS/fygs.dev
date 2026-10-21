"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Search,
  CheckCircle2,
  Layers,
  Zap,
  Code2,
} from "lucide-react";
import { useState } from "react";

function DbTypeExplorer() {
  const [selected, setSelected] = useState(0);
  const dbs = [
    {
      type: "Relationnelle (SQL)",
      examples: ["PostgreSQL", "MySQL", "SQLite"],
      bestFor: "Données structurées, relations complexes, ACID, reporting",
      features: [
        "ACID Transactions",
        "Joins complexes",
        "Schemas stricts",
        "Indexation avancée",
      ],
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-500/5",
      icon: Database,
      schema: `-- Schema relationnel
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
);

-- Query avec JOIN
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING SUM(o.total) > 100
ORDER BY total_spent DESC;`,
    },
    {
      type: "Document (NoSQL)",
      examples: ["MongoDB", "Firestore", "CouchDB"],
      bestFor: "Données semi-structurées, prototypage rapide, schéma flexible",
      features: [
        "Schema flexible",
        "Scalabilité horizontale",
        "Dénormalisé",
        "JSON natif",
      ],
      color: "text-green-500",
      gradient: "from-green-500/10 to-green-500/5",
      icon: Layers,
      schema: `// Document MongoDB
db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  profile: {
    avatar: "https://...",
    bio: "Developer",
    skills: ["TypeScript", "React", "Node.js"]
  },
  orders: [
    { total: 49.99, status: "completed", items: ["Widget A"] },
    { total: 129.99, status: "pending", items: ["Gadget B", "Widget C"] }
  ]
});

// Aggregation pipeline
db.users.aggregate([
  { $unwind: "$orders" },
  { $group: { _id: "$name", totalSpent: { $sum: "$orders.total" } } },
  { $sort: { totalSpent: -1 } }
]);`,
    },
    {
      type: "Key-Value",
      examples: ["Redis", "DynamoDB", "Memcached"],
      bestFor: "Cache, sessions, compteurs, rate limiting",
      features: [
        "Ultra rapide (O(1))",
        "TTL natif",
        "Pub/Sub",
        "Data structures riches",
      ],
      color: "text-red-500",
      gradient: "from-red-500/10 to-red-500/5",
      icon: Zap,
      schema: `// Redis commands
SET user:123 '{"name":"Alice","role":"admin"}' EX 3600
GET user:123

// Compteur atomique (rate limiting)
INCR api:requests:192.168.1.1
EXPIRE api:requests:192.168.1.1 60

// Sorted Set (leaderboard)
ZADD leaderboard 1500 "alice"
ZADD leaderboard 2300 "bob"
ZREVRANGE leaderboard 0 9 WITHSCORES

// Pub/Sub
PUBLISH notifications '{"type":"order","userId":"123"}'
SUBSCRIBE notifications`,
    },
    {
      type: "Graph",
      examples: ["Neo4j", "Amazon Neptune", "ArangoDB"],
      bestFor: "Réseaux sociaux, recommandations, fraud detection",
      features: [
        "Traversées rapides",
        "Relations first-class",
        "Pattern matching",
        "Cypher/GQL",
      ],
      color: "text-purple-500",
      gradient: "from-purple-500/10 to-purple-500/5",
      icon: Code2,
      schema: `// Cypher (Neo4j)
// Créer des noeuds et relations
CREATE (alice:User {name: "Alice"})
CREATE (bob:User {name: "Bob"})
CREATE (post:Post {title: "GraphDB Guide"})
CREATE (alice)-[:FOLLOWS]->(bob)
CREATE (alice)-[:WROTE]->(post)
CREATE (bob)-[:LIKED]->(post)

// Recommandation: amis d'amis
MATCH (user:User {name: "Alice"})-[:FOLLOWS]->()-[:FOLLOWS]->(suggested)
WHERE NOT (user)-[:FOLLOWS]->(suggested) AND user <> suggested
RETURN DISTINCT suggested.name, COUNT(*) as mutual
ORDER BY mutual DESC LIMIT 5;`,
    },
  ];
  const current = dbs[selected];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Types de Bases de Données</h2>
      <div className="flex gap-2 flex-wrap">
        {dbs.map((db, i) => {
          const I = db.icon;
          return (
            <button
              key={db.type}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${selected === i ? `bg-gradient-to-r ${db.gradient} border-primary/30 ${db.color}` : "border-border/40 text-muted-foreground"}`}
            >
              <I className="w-4 h-4" /> {db.type.split(" ")[0]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 border-border/40">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${current.color}`} />
            <h3 className={`text-xl font-bold ${current.color}`}>
              {current.type}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {current.examples.map((e) => (
              <Badge key={e} variant="outline" className="text-xs">
                {e}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{current.bestFor}</p>
          <div className="space-y-1.5">
            {current.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary text-[10px]">
            CODE EXAMPLE
          </Badge>
          <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20 h-[300px] overflow-y-auto" tabIndex={0}>
            <code>{current.schema}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function IndexVisualizer() {
  const [activeIndex, setActiveIndex] = useState("btree");
  const indexes: Record<
    string,
    {
      name: string;
      desc: string;
      complexity: string;
      bestFor: string;
      visual: string;
      example: string;
    }
  > = {
    btree: {
      name: "B-Tree",
      desc: "Index par défaut. Structure arborescente équilibrée. Bon pour les requêtes d'égalité et de range.",
      complexity: "O(log n)",
      bestFor: "WHERE =, <, >, BETWEEN, ORDER BY",
      visual:
        "       [50]\n      /    \\\n   [25]    [75]\n   /  \\   /  \\\n [10] [30] [60] [90]",
      example: `CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- Utilise l'index automatiquement
SELECT * FROM users WHERE email = 'alice@test.com';
SELECT * FROM orders WHERE created_at > '2024-01-01' ORDER BY created_at;`,
    },
    hash: {
      name: "Hash",
      desc: "Table de hachage. Recherche exacte ultra-rapide en O(1). Ne supporte pas les range queries.",
      complexity: "O(1)",
      bestFor: "WHERE = (égalité exacte uniquement)",
      visual:
        "  key → hash() → bucket\n  'alice' → 0x3F → [row_ptr]\n  'bob'   → 0xA2 → [row_ptr]\n  'carol' → 0x17 → [row_ptr]",
      example: `CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- Très rapide pour les lookups exacts
SELECT * FROM users WHERE email = 'alice@test.com';

-- ⚠️ Ne fonctionne PAS pour :
-- SELECT * FROM users WHERE email LIKE 'a%';
-- SELECT * FROM users WHERE email > 'a';`,
    },
    gin: {
      name: "GIN",
      desc: "Generalized Inverted Index. Indexe chaque élément d'un type composite (array, JSON, full-text).",
      complexity: "O(log n) lookup",
      bestFor: "Full-text search, JSON, Arrays, @>, &&",
      visual:
        "  'type' → [doc1, doc3, doc5]\n  'script' → [doc1, doc2]\n  'react' → [doc2, doc4]\n  'node' → [doc3, doc5]",
      example: `-- Full-text search
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('french', title || ' ' || content));
SELECT * FROM posts WHERE to_tsvector('french', title || ' ' || content) @@ to_tsquery('react & typescript');

-- JSON indexation
CREATE INDEX idx_data_tags ON products USING GIN (tags);
SELECT * FROM products WHERE tags @> '["bestseller", "new"]';`,
    },
    composite: {
      name: "Composite",
      desc: "Index multi-colonnes. L'ordre des colonnes est crucial (leftmost prefix rule).",
      complexity: "O(log n)",
      bestFor: "Queries filtrant sur plusieurs colonnes",
      visual:
        "  INDEX (status, created_at, user_id)\n  ✅ WHERE status = 'active'\n  ✅ WHERE status = 'active' AND created_at > '2024'\n  ✅ WHERE status = 'active' AND created_at > '2024' AND user_id = 1\n  ❌ WHERE created_at > '2024' (skip status)",
      example: `-- L'ordre compte !
CREATE INDEX idx_orders_composite ON orders(status, created_at DESC, user_id);

-- ✅ Utilise l'index (leftmost prefix)
SELECT * FROM orders WHERE status = 'pending';
SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';

-- ❌ N'utilise PAS l'index (skip la première colonne)
SELECT * FROM orders WHERE created_at > '2024-01-01';`,
    },
  };
  const current = indexes[activeIndex];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Search className="w-6 h-6 text-cyan-400" /> Stratégies
        d&apos;Indexation
      </h2>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(indexes).map(([key, idx]) => (
          <button
            key={key}
            onClick={() => setActiveIndex(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeIndex === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {idx.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">Complexité</p>
          <p className="font-bold text-primary">{current.complexity}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center col-span-2">
          <p className="text-[10px] text-muted-foreground">Meilleur pour</p>
          <p className="font-mono text-xs text-primary">{current.bestFor}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{current.desc}</p>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-cyan-500/10" tabIndex={0}>
        <code>{current.visual}</code>
      </pre>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
        <code>{current.example}</code>
      </pre>
    </div>
  );
}

function QueryOptimizer() {
  const [activeQuery, setActiveQuery] = useState(0);
  const queries = [
    {
      label: "N+1 Problem",
      bad: `// ❌ N+1 queries (1 + N requêtes)
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id }
  });
  // 1 query pour users + N queries pour orders
}`,
      good: `// ✅ Single query with include
const users = await prisma.user.findMany({
  include: { orders: true }
});
// 1 seule query avec JOIN automatique`,
      impact: "100 users = 101 queries → 1 query",
    },
    {
      label: "Select *",
      bad: `// ❌ Select tout
const users = await prisma.user.findMany();
// Retourne TOUTES les colonnes (password, metadata...)`,
      good: `// ✅ Select spécifique
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});
// Retourne uniquement les champs nécessaires`,
      impact: "Réduit la bande passante de ~60%",
    },
    {
      label: "Pagination",
      bad: `// ❌ Offset pagination (lent sur grosses tables)
SELECT * FROM posts
ORDER BY created_at DESC
OFFSET 10000 LIMIT 20;
// Scanne 10020 rows pour en retourner 20`,
      good: `// ✅ Cursor-based pagination (constant time)
SELECT * FROM posts
WHERE created_at < $last_cursor
ORDER BY created_at DESC
LIMIT 20;
// Utilise l'index directement, O(1)`,
      impact: "Page 500: 15s → 2ms",
    },
  ];
  const current = queries[activeQuery];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Optimisation des Requêtes</h2>
      <div className="flex gap-2 flex-wrap">
        {queries.map((q, i) => (
          <button
            key={q.label}
            onClick={() => setActiveQuery(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeQuery === i ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Badge className="bg-red-500/10 text-red-400 text-[10px]">
            AVANT (Mauvaise pratique)
          </Badge>
          <pre className="bg-red-500/5 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-red-500/10" tabIndex={0}>
            <code>{current.bad}</code>
          </pre>
        </div>
        <div className="space-y-2">
          <Badge className="bg-green-500/10 text-green-400 text-[10px]">
            APRÈS (Bonne pratique)
          </Badge>
          <pre className="bg-green-500/5 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-green-500/10" tabIndex={0}>
            <code>{current.good}</code>
          </pre>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Zap className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium">Impact: {current.impact}</span>
      </div>
    </div>
  );
}

export default function DatabasesPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Bases de Données
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SQL vs NoSQL, stratégies d&apos;indexation et optimisation des
            requêtes &mdash; explorez chaque concept avec des exemples
            interactifs.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <DbTypeExplorer />
      </Card>
      <Card className="p-8 border-border/40">
        <IndexVisualizer />
      </Card>
      <Card className="p-8 border-border/40">
        <QueryOptimizer />
      </Card>
    </div>
  );
}
