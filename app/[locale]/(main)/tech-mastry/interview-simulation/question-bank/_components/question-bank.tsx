"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface BankQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companies: string[];
  answer: string;
  followUp?: string[];
}

const questions: BankQuestion[] = [
  // Algorithmes
  { id: 1, question: "Expliquez la différence entre BFS et DFS. Quand utiliser l'un plutôt que l'autre ?", category: "Algorithmes", difficulty: "easy", companies: ["Google", "Amazon"], answer: "BFS explore par niveaux (file/queue), DFS explore en profondeur (pile/récursion). BFS pour le plus court chemin (non-pondéré), parcours par niveau. DFS pour la détection de cycles, le tri topologique, les problèmes de connectivité. BFS utilise O(V) mémoire (largeur du graphe), DFS O(V) (profondeur + pile).", followUp: ["Quelle est la complexité de chacun ?", "Comment adapter BFS pour un graphe pondéré ?"] },
  { id: 2, question: "Comment fonctionne une table de hachage ? Que se passe-t-il lors d'une collision ?", category: "Algorithmes", difficulty: "easy", companies: ["Meta", "Microsoft"], answer: "Une table de hachage utilise une fonction de hachage pour mapper les clés à des indices. Collisions gérées par: chaining (linked list par bucket) ou open addressing (probing linéaire/quadratique). Complexité moyenne O(1), pire cas O(n). Le load factor est typiquement maintenu sous ~0.75 (valeur par défaut de Java HashMap) avec un rehashing quand il est dépassé. Le pire cas O(n) apparaît si beaucoup de clés tombent dans le même bucket." },
  { id: 3, question: "Résolvez Two Sum en O(n). Expliquez votre raisonnement.", category: "Algorithmes", difficulty: "easy", companies: ["Google", "Amazon", "Meta"], answer: "Utiliser un HashMap : pour chaque nombre, vérifier si (target - num) existe dans le map. Si oui, retourner les indices. Sinon, ajouter num au map. Un seul passage → O(n) temps, O(n) espace." },
  { id: 4, question: "Implémentez un LRU Cache avec get() et put() en O(1).", category: "Algorithmes", difficulty: "hard", companies: ["Google", "Amazon", "Meta", "Microsoft"], answer: "Combinaison d'un HashMap (O(1) lookup) et d'une Doubly Linked List (O(1) insertion/suppression). Le HashMap mappe les clés aux nœuds de la liste. Les nœuds récemment accédés sont déplacés en tête. Quand la capacité est dépassée, supprimer le dernier nœud (LRU)." },
  { id: 5, question: "Quelle est la différence entre programmation dynamique et algorithme glouton ?", category: "Algorithmes", difficulty: "medium", companies: ["Google", "Microsoft"], answer: "DP : explore tous les sous-problèmes, garantit l'optimal, utilise memoization/tabulation. Glouton : fait le choix localement optimal sans revenir en arrière (optimal seulement si le problème a la propriété du choix glouton, à justifier). DP pour sac à dos 0/1, LCS, edit distance. Glouton pour sac à dos fractionnaire, Huffman, sélection d'activités." },

  // System Design
  { id: 6, question: "Concevez un système de notification en temps réel (comme les notifications push).", category: "System Design", difficulty: "hard", companies: ["Meta", "Apple", "Google"], answer: "WebSocket pour les clients connectés, APNS/FCM pour mobile. Message Queue (Kafka) pour le découplage. Fan-out service pour distribuer aux destinataires. Rate limiting pour éviter le spam. Stockage : notifications récentes en Redis, historique en Cassandra. Priorités : urgente (push immédiat), normale (batch), silencieuse." },
  { id: 7, question: "Comment concevriez-vous un système de rate limiting distribué ?", category: "System Design", difficulty: "hard", companies: ["Stripe", "Cloudflare", "Amazon"], answer: "Algorithmes : Token Bucket (burst-friendly), Sliding Window (précis), Fixed Window (simple). Stockage : Redis (INCR + EXPIRE regroupés dans un script Lua ou une transaction pour être atomiques). Distribué : chaque nœud a un quota local + synchronisation périodique, ou Redis centralisé. Réponse HTTP 429 avec Retry-After, et headers X-RateLimit-Limit / Remaining / Reset (convention courante). Granularité : par user, par IP, par endpoint." },
  { id: 8, question: "Expliquez le théorème CAP avec des exemples concrets.", category: "System Design", difficulty: "medium", companies: ["Amazon", "Google", "Netflix"], answer: "CAP : Consistency, Availability, Partition tolerance — lorsqu'une partition réseau survient (inévitable dans un système distribué), il faut choisir entre cohérence et disponibilité ; sans partition, on peut avoir les deux (voir aussi PACELC : latence vs cohérence). CP : privilégie la cohérence et refuse certaines requêtes plutôt que de servir des données obsolètes (ex. HBase, ZooKeeper, MongoDB dans sa configuration par défaut). AP : reste disponible quitte à diverger temporairement (ex. Cassandra, DynamoDB) ; ces systèmes offrent souvent une cohérence réglable (quorums, lectures fortement cohérentes). « CA » n'a pas de sens pour un système distribué : on ne choisit pas d'ignorer les partitions." },

  // Frontend
  { id: 9, question: "Expliquez le Virtual DOM de React et son algorithme de reconciliation.", category: "Frontend", difficulty: "medium", companies: ["Meta", "Airbnb"], answer: "Le Virtual DOM est une représentation JS légère du DOM réel. Reconciliation : 1) Créer un nouveau VDOM lors d'un changement d'état. 2) Diffing : comparer ancien et nouveau VDOM. 3) Batching : regrouper les changements. 4) Commit : appliquer le minimum de mutations DOM. Heuristiques : types différents = remplacement total, clés pour identifier les éléments dans les listes." },
  { id: 10, question: "Comment optimiser les performances d'une application React ?", category: "Frontend", difficulty: "medium", companies: ["Meta", "Netflix", "Airbnb"], answer: "0) Mesurer d'abord (React DevTools Profiler) : n'optimiser que les goulots réels. 1) React.memo pour éviter les re-renders inutiles. 2) useMemo/useCallback pour mémoriser les valeurs/fonctions. 3) Code splitting avec React.lazy + Suspense. 4) Virtualisation de longues listes (react-window). 5) Debounce des inputs. 6) Optimistic updates. 7) Image optimization (next/image). 8) Bundle analysis (webpack-bundle-analyzer)." },
  { id: 11, question: "Expliquez la différence entre SSR, SSG, ISR et CSR dans Next.js.", category: "Frontend", difficulty: "medium", companies: ["Vercel", "Shopify"], answer: "SSR (getServerSideProps) : rendu à chaque requête, données toujours fraîches. SSG (getStaticProps) : rendu au build, le plus rapide. ISR (revalidate) : SSG avec re-génération périodique. CSR (useEffect) : rendu côté client, SPA classique. En App Router : Server Components (par défaut ; rendus statiquement ou dynamiquement selon l'usage de données dynamiques), fetch avec l'option next: { revalidate } (ou l'export revalidate du segment) pour l'équivalent de l'ISR, 'use client' pour CSR." },

  // Backend
  { id: 12, question: "Comparez REST, GraphQL et gRPC. Quand utiliser chacun ?", category: "Backend", difficulty: "medium", companies: ["Google", "Meta", "Amazon"], answer: "REST : standard, cacheable via HTTP. Idéal pour CRUD simple, APIs publiques. GraphQL : query flexible, pas d'over/under-fetching. Idéal pour mobile (bande passante), dashboard avec données variées. gRPC : binaire (Protobuf), streaming, très performant. Idéal pour communication inter-services, microservices internes. Trade-offs : REST = simplicité, GraphQL = flexibilité client, gRPC = performance." },
  { id: 13, question: "Comment assurer la cohérence des données dans une architecture microservices ?", category: "Backend", difficulty: "hard", companies: ["Amazon", "Netflix", "Uber"], answer: "Patterns : 1) Saga pattern (orchestration ou chorégraphie) pour les transactions distribuées. 2) Event sourcing : stocker les événements plutôt que l'état. 3) CQRS : séparer lecture et écriture. 4) Outbox pattern : publier les événements de manière fiable. 5) Idempotency keys : combinées à une livraison at-least-once, elles donnent un traitement « effectivement exactly-once » (l'exactly-once strict n'existe pas sur un réseau). 6) Eventual consistency : accepter un délai de convergence." },
  { id: 14, question: "Expliquez les stratégies de caching et quand invalider le cache.", category: "Backend", difficulty: "medium", companies: ["Amazon", "Cloudflare"], answer: "Stratégies : Cache-aside (lazy loading), Read-through, Write-through, Write-behind. Invalidation : TTL (expiration temporelle), Event-driven (pub/sub), Versioning. Niveaux : Browser cache, CDN, Application cache (Redis), Database query cache. Problèmes : Cache stampede (locking), Cold start, Stale data. Souvent (loi de Pareto) une petite fraction des données concentre l'essentiel du trafic : à mesurer via le hit ratio." },

  // Comportemental
  { id: 15, question: "Décrivez un projet technique dont vous êtes fier. Quel a été votre impact ?", category: "Comportemental", difficulty: "easy", companies: ["Toutes"], answer: "Utiliser la méthode STAR : Situation (contexte du projet), Task (votre rôle spécifique), Action (ce que vous avez fait techniquement — choix d'architecture, résolution de problèmes), Result (impact mesurable — performance +X%, réduction de bugs de Y%, revenus). Chiffres concrets et leçons apprises.", followUp: ["Que feriez-vous différemment ?", "Comment avez-vous géré les désaccords techniques ?"] },
  { id: 16, question: "Comment gérez-vous un désaccord technique avec un collègue senior ?", category: "Comportemental", difficulty: "medium", companies: ["Google", "Meta", "Amazon"], answer: "1) Écouter activement et comprendre leur perspective. 2) Poser des questions pour clarifier les trade-offs. 3) Proposer un POC ou benchmark pour trancher objectivement. 4) Si pas de consensus : escalader avec les données, pas les émotions. 5) S'aligner sur la décision finale, même si différente de la vôtre. Montrer : respect, data-driven, pragmatisme." },

  // Sécurité
  { id: 17, question: "Quelles sont les vulnérabilités OWASP Top 10 et comment les prévenir ?", category: "Sécurité", difficulty: "medium", companies: ["Toutes"], answer: "Référence : OWASP Top 10 édition 2021 (vérifiez l'édition la plus récente sur owasp.org). 1) Broken Access Control (dont IDOR) → deny by default, vérification d'autorisation côté serveur, RBAC/ABAC. 2) Cryptographic Failures → HTTPS/TLS, chiffrement des données sensibles, hachage des mots de passe (argon2/bcrypt). 3) Injection (SQL/NoSQL, XSS) → requêtes paramétrées, échappement, CSP. 4) Insecure Design → threat modeling dès la conception. 5) Security Misconfiguration → hardening, headers de sécurité. 6) Vulnerable and Outdated Components → audit et mise à jour des dépendances. 7) Identification and Authentication Failures → MFA, gestion de session. 8) Software and Data Integrity Failures → intégrité de la chaîne de build, désérialisation sûre. 9) Security Logging and Monitoring Failures → logs, monitoring, alerting. 10) SSRF → liste blanche des destinations, filtrage réseau. Le CSRF se prévient par tokens anti-CSRF et cookies SameSite." },

  // Base de données
  { id: 18, question: "SQL vs NoSQL : comment choisir ? Donnez des exemples concrets.", category: "Base de données", difficulty: "medium", companies: ["Amazon", "Google", "Netflix"], answer: "SQL (PostgreSQL, MySQL) : schéma strict, ACID, relations complexes, JOIN. Pour : e-commerce (transactions), ERP, systèmes financiers. NoSQL : Redis (cache, sessions), MongoDB (documents flexibles), Cassandra (time-series, haute écriture), Neo4j (graphes sociaux). Choisir selon : structure des données, patterns de requêtes, besoins de scalabilité, cohérence vs disponibilité." },
  { id: 19, question: "Comment optimiser une requête SQL lente ?", category: "Base de données", difficulty: "medium", companies: ["Amazon", "Microsoft"], answer: "1) EXPLAIN ANALYZE pour identifier le plan d'exécution. 2) Ajouter des index sur les colonnes WHERE, JOIN, ORDER BY. 3) Éviter SELECT * — sélectionner uniquement les colonnes nécessaires. 4) Dénormalisation pour les lectures fréquentes. 5) Query caching. 6) Partitionnement pour les tables volumineuses. 7) Éviter les N+1 queries (eager loading). 8) Connection pooling." },

  // DevOps
  { id: 20, question: "Expliquez le concept de CI/CD et les meilleures pratiques.", category: "DevOps", difficulty: "easy", companies: ["Toutes"], answer: "CI : intégration continue — chaque commit déclenche build + tests automatiques. CD : livraison continue (le code validé est toujours déployable, déclenchement manuel) ou déploiement continu (mise en production automatique). Pratiques : trunk-based development, feature flags, blue/green deployments, canary releases, rollback automatique, tests de fumée post-deploy. Outils : GitHub Actions, GitLab CI, Jenkins, ArgoCD." },
];

const categories = [...new Set(questions.map(q => q.category))];
const difficulties = ["easy", "medium", "hard"] as const;

export function QuestionBank() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase()) && !q.answer.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory && q.category !== selectedCategory) return false;
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const diffColor = (d: string) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const diffLabel = (d: string) => {
    switch (d) {
      case "easy": return "Facile";
      case "medium": return "Moyen";
      case "hard": return "Difficile";
      default: return d;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                    selectedCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  selectedDifficulty === d ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                )}
              >
                {diffLabel(d)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</p>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map(q => (
          <Card key={q.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              className="w-full p-4 text-left flex items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={diffColor(q.difficulty)}>{diffLabel(q.difficulty)}</Badge>
                  <Badge variant="outline">{q.category}</Badge>
                  {q.companies.slice(0, 3).map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <p className="font-medium text-sm">{q.question}</p>
              </div>
              {expandedId === q.id ? <ChevronUp className="w-4 h-4 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 shrink-0 mt-1" />}
            </button>
            {expandedId === q.id && (
              <div className="px-4 pb-4 space-y-3 border-t pt-3">
                <div>
                  <h4 className="text-sm font-semibold text-green-500 mb-1">Réponse attendue</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{q.answer}</p>
                </div>
                {q.followUp && q.followUp.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500 mb-1">Questions de suivi</h4>
                    <ul className="space-y-1">
                      {q.followUp.map((fu, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          {fu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
