"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Server } from "lucide-react";
import { useState } from "react";

export function ServerCaseStudy() {
  const [activeTab, setActiveTab] = useState("api");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fonction pour copier le code
  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Étude de cas : Serveurs Web
        </CardTitle>
        <CardDescription>
          Comment les algorithmes de tri sont utilisés dans les serveurs web et
          les applications backend
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Introduction */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Les serveurs web et les applications backend utilisent des
            algorithmes de tri pour optimiser le traitement des requêtes, la
            gestion des données et les performances globales. Cette étude de cas
            explore comment ces algorithmes sont implémentés dans différents
            contextes d&apos;applications web.
          </p>
        </div>

        {/* Sélection des sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="api">API REST</TabsTrigger>
            <TabsTrigger value="logs">Analyse de logs</TabsTrigger>
            <TabsTrigger value="cache">Gestion du cache</TabsTrigger>
          </TabsList>

          {/* Section API REST */}
          <TabsContent value="api" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tri dans les API REST</h3>
              <p className="text-muted-foreground">
                Les API REST utilisent souvent des algorithmes de tri pour
                organiser les résultats des requêtes. Ces tris peuvent être
                appliqués côté serveur pour optimiser les performances et
                réduire la charge sur le client.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Cas d&apos;utilisation
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Pagination</strong> : Tri des résultats avant
                        d&apos;appliquer la pagination
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Filtrage</strong> : Tri des données filtrées
                        pour une présentation cohérente
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Recherche</strong> : Tri des résultats de
                        recherche par pertinence
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Agrégation</strong> : Tri des données agrégées
                        pour l&apos;analyse
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Exemple d&apos;implémentation
                  </h4>
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(
                            `// Exemple d'API Express.js avec tri côté serveur
app.get('/api/products', (req, res) => {
  // Récupérer les paramètres de tri de la requête
  const { sort, order = 'asc' } = req.query;

  // Récupérer les produits depuis la base de données
  let products = [...allProducts];

  // Appliquer le tri si demandé
  if (sort) {
    products.sort((a, b) => {
      // Déterminer la direction du tri
      const direction = order.toLowerCase() === 'desc' ? -1 : 1;

      // Tri selon différents champs
      switch(sort) {
        case 'price':
          return direction * (a.price - b.price);
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'popularity':
          return direction * (b.views - a.views); // Tri par popularité (vues)
        default:
          return 0;
      }
    });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Résultats paginés
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Renvoyer les résultats
  res.json({
    total: products.length,
    page,
    limit,
    data: paginatedProducts
  });
});`,
                            "api-sort"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "api-sort" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Exemple d'API Express.js avec tri côté serveur
app.get('/api/products', (req, res) => {
  // Récupérer les paramètres de tri de la requête
  const { sort, order = 'asc' } = req.query;

  // Récupérer les produits depuis la base de données
  let products = [...allProducts];

  // Appliquer le tri si demandé
  if (sort) {
    products.sort((a, b) => {
      // Déterminer la direction du tri
      const direction = order.toLowerCase() === 'desc' ? -1 : 1;

      // Tri selon différents champs
      switch(sort) {
        case 'price':
          return direction * (a.price - b.price);
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'popularity':
          return direction * (b.views - a.views); // Tri par popularité (vues)
        default:
          return 0;
      }
    });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Résultats paginés
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Renvoyer les résultats
  res.json({
    total: products.length,
    page,
    limit,
    data: paginatedProducts
  });
});`}
                      </code>
                    </pre>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Cet exemple montre comment implémenter un tri dynamique dans
                    une API REST avec Express.js, permettant aux clients de
                    spécifier le champ de tri et l&apos;ordre.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Bonnes pratiques pour le tri dans les API
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Pour les grandes collections de données, il est recommandé
                  d&apos;utiliser des index de base de données pour optimiser
                  les opérations de tri. Par exemple, avec MongoDB :
                </p>
                <div className="relative mt-2">
                  <pre className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-xs overflow-x-auto">
                    <code>
                      {`// Créer un index pour optimiser le tri
db.products.createIndex({ price: 1 }); // Index ascendant sur le prix

// Requête utilisant l'index pour le tri
db.products.find().sort({ price: 1 }).limit(10);`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Section Analyse de logs */}
          <TabsContent value="logs" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Analyse et tri des logs serveur
              </h3>
              <p className="text-muted-foreground">
                L&apos;analyse des logs serveur nécessite souvent de trier de
                grandes quantités de données pour identifier des tendances, des
                erreurs ou des comportements anormaux. Les algorithmes de tri
                sont essentiels pour ces opérations d&apos;analyse.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Applications</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri chronologique</strong> : Organisation des
                        logs par horodatage
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par sévérité</strong> : Priorisation des
                        erreurs critiques
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par fréquence</strong> : Identification des
                        erreurs les plus courantes
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par source</strong> : Regroupement des logs
                        par composant ou service
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Exemple d&apos;implémentation
                  </h4>
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(
                            `// Analyse de logs avec tri et agrégation en JavaScript
function analyzeServerLogs(logs) {
  // Étape 1: Parser les logs
  const parsedLogs = logs.map(log => {
    const [timestamp, level, service, message] = log.split(' - ');
    return {
      timestamp: new Date(timestamp),
      level,
      service,
      message
    };
  });

  // Étape 2: Trier les logs par horodatage
  const sortedByTime = [...parsedLogs].sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Étape 3: Trier et compter les erreurs par fréquence
  const errorLogs = parsedLogs.filter(log => log.level === 'ERROR');
  const errorCounts = {};

  errorLogs.forEach(log => {
    // Extraire le code d'erreur du message (exemple: "Error 404: Not Found")
    const errorMatch = log.message.match(/Error (\d+)/);
    if (errorMatch) {
      const errorCode = errorMatch[1];
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    }
  });

  // Convertir en tableau et trier par fréquence décroissante
  const sortedErrors = Object.entries(errorCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // Étape 4: Trier les services par nombre d'erreurs
  const serviceErrors = {};
  errorLogs.forEach(log => {
    serviceErrors[log.service] = (serviceErrors[log.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceErrors)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  return {
    chronological: sortedByTime,
    topErrors: sortedErrors,
    servicesByErrorCount: sortedServices
  };
}`,
                            "logs-sort"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "logs-sort" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Analyse de logs avec tri et agrégation en JavaScript
function analyzeServerLogs(logs) {
  // Étape 1: Parser les logs
  const parsedLogs = logs.map(log => {
    const [timestamp, level, service, message] = log.split(' - ');
    return {
      timestamp: new Date(timestamp),
      level,
      service,
      message
    };
  });

  // Étape 2: Trier les logs par horodatage
  const sortedByTime = [...parsedLogs].sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Étape 3: Trier et compter les erreurs par fréquence
  const errorLogs = parsedLogs.filter(log => log.level === 'ERROR');
  const errorCounts = {};

  errorLogs.forEach(log => {
    // Extraire le code d'erreur du message (exemple: "Error 404: Not Found")
    const errorMatch = log.message.match(/Error (\d+)/);
    if (errorMatch) {
      const errorCode = errorMatch[1];
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    }
  });

  // Convertir en tableau et trier par fréquence décroissante
  const sortedErrors = Object.entries(errorCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // Étape 4: Trier les services par nombre d'erreurs
  const serviceErrors = {};
  errorLogs.forEach(log => {
    serviceErrors[log.service] = (serviceErrors[log.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceErrors)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  return {
    chronological: sortedByTime,
    topErrors: sortedErrors,
    servicesByErrorCount: sortedServices
  };
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Outils d&apos;analyse de logs
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Des outils comme <strong>Elasticsearch</strong> et{" "}
                  <strong>Logstash</strong> utilisent des algorithmes de tri
                  optimisés pour traiter des volumes massifs de logs.
                  Elasticsearch implémente des structures de données
                  spécialisées comme les index inversés et les B-trees pour
                  permettre des tris et des recherches rapides sur des
                  téraoctets de données de logs.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  Pour les analyses en temps réel, ces outils utilisent souvent
                  des algorithmes de tri parallèles et distribués pour répartir
                  la charge de travail sur plusieurs nœuds.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Section Gestion du cache */}
          <TabsContent value="cache" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Algorithmes de tri dans la gestion du cache
              </h3>
              <p className="text-muted-foreground">
                Les serveurs web utilisent des stratégies de cache pour
                améliorer les performances. Les algorithmes de tri jouent un
                rôle crucial dans la gestion efficace du cache, notamment pour
                déterminer quels éléments conserver ou supprimer.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Stratégies de remplacement
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>LRU (Least Recently Used)</strong> : Tri par
                        date d&apos;accès
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>LFU (Least Frequently Used)</strong> : Tri par
                        fréquence d&apos;utilisation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>FIFO (First In, First Out)</strong> : Tri par
                        ordre d&apos;insertion
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Priorité</strong> : Tri basé sur
                        l&apos;importance des ressources
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Exemple d&apos;implémentation
                  </h4>
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(
                            `// Implémentation d'un cache LRU (Least Recently Used) en JavaScript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // Utilisation de Map pour préserver l'ordre d'insertion
  }

  // Récupérer une valeur du cache
  get(key) {
    if (!this.cache.has(key)) return -1;

    // Déplacer l'élément à la fin (le plus récemment utilisé)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  // Ajouter ou mettre à jour une valeur dans le cache
  put(key, value) {
    // Si la clé existe déjà, la supprimer d'abord
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Si le cache est plein, supprimer l'élément le moins récemment utilisé
    else if (this.cache.size >= this.capacity) {
      // Supprimer le premier élément (le moins récemment utilisé)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    // Ajouter le nouvel élément à la fin
    this.cache.set(key, value);
  }
}

// Exemple d'utilisation
const cache = new LRUCache(3);
cache.put('route1', { data: 'Page d\'accueil' });
cache.put('route2', { data: 'Page de produits' });
cache.put('route3', { data: 'Page de contact' });

// Accéder à route2 (le déplace à la fin)
cache.get('route2');

// Ajouter une nouvelle route (supprime route1 car c'est le moins récemment utilisé)
cache.put('route4', { data: 'Page de blog' });`,
                            "cache-lru"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "cache-lru" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Implémentation d'un cache LRU (Least Recently Used) en JavaScript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // Utilisation de Map pour préserver l'ordre d'insertion
  }

  // Récupérer une valeur du cache
  get(key) {
    if (!this.cache.has(key)) return -1;

    // Déplacer l'élément à la fin (le plus récemment utilisé)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  // Ajouter ou mettre à jour une valeur dans le cache
  put(key, value) {
    // Si la clé existe déjà, la supprimer d'abord
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Si le cache est plein, supprimer l'élément le moins récemment utilisé
    else if (this.cache.size >= this.capacity) {
      // Supprimer le premier élément (le moins récemment utilisé)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    // Ajouter le nouvel élément à la fin
    this.cache.set(key, value);
  }
}

// Exemple d'utilisation
const cache = new LRUCache(3);
cache.put('route1', { data: 'Page d\'accueil' });
cache.put('route2', { data: 'Page de produits' });
cache.put('route3', { data: 'Page de contact' });

// Accéder à route2 (le déplace à la fin)
cache.get('route2');

// Ajouter une nouvelle route (supprime route1 car c'est le moins récemment utilisé)
cache.put('route4', { data: 'Page de blog' });`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Applications dans les CDN et serveurs de cache
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Les CDN (Content Delivery Networks) comme{" "}
                  <strong>Cloudflare</strong> et <strong>Akamai</strong>{" "}
                  utilisent des algorithmes de tri sophistiqués pour gérer leur
                  cache. Ces algorithmes prennent en compte non seulement la
                  fréquence d&apos;accès, mais aussi d&apos;autres facteurs
                  comme la taille des fichiers, le coût de génération et la
                  localisation géographique.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  <strong>Redis</strong>, un serveur de cache populaire,
                  implémente plusieurs politiques de remplacement basées sur des
                  algorithmes de tri, notamment LRU (Least Recently Used) et LFU
                  (Least Frequently Used), avec des optimisations pour minimiser
                  l&apos;impact sur les performances.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
