"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Database, Globe, Search } from "lucide-react";
import { useState } from "react";

// Type pour les cas d'utilisation
type UseCaseType = "database" | "web" | "ai" | "os";

export function SearchingRealWorldCases() {
  const [activeCase, setActiveCase] = useState<UseCaseType>("database");

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Applications Réelles</h2>
        <p className="text-muted-foreground">
          Découvrez comment les algorithmes de recherche sont utilisés dans des
          applications du monde réel.
        </p>
      </div>

      {/* Sélection du cas d'utilisation */}
      <Tabs
        value={activeCase}
        onValueChange={(value) => setActiveCase(value as UseCaseType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden md:inline">Bases de données</span>
            <span className="md:hidden">BDD</span>
          </TabsTrigger>
          <TabsTrigger value="web" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline">Applications Web</span>
            <span className="md:hidden">Web</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span className="hidden md:inline">Intelligence Artificielle</span>
            <span className="md:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">
              Systèmes d&apos;exploitation
            </span>
            <span className="md:hidden">OS</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu des cas d'utilisation */}
        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Recherche dans les Bases de Données
              </CardTitle>
              <CardDescription>
                Comment les algorithmes de recherche optimisent les requêtes de
                base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Indexation et Recherche
                  </h3>
                  <p className="text-muted-foreground">
                    Les bases de données utilisent des structures d&apos;index
                    (comme les arbres B et B+) pour accélérer les recherches.
                    Ces structures implémentent des variantes optimisées de la
                    recherche binaire pour trouver rapidement des
                    enregistrements.
                  </p>

                  <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                    <h4 className="text-sm font-medium mb-2">
                      Exemple: Index B-Tree dans MySQL
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      MySQL utilise des arbres B pour indexer les données,
                      permettant des recherches en O(log n). Une requête comme{" "}
                      <code>SELECT * FROM users WHERE id = 42</code> utilise la
                      recherche binaire dans l&apos;arbre d&apos;index pour
                      localiser rapidement l&apos;enregistrement.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Algorithmes Utilisés</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        1
                      </div>
                      <div>
                        <span className="font-medium">Recherche Binaire</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée dans les index d&apos;arbres équilibrés
                          (B-Tree, B+Tree) pour les requêtes de correspondance
                          exacte.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        2
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Hachage
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée dans les index de hachage pour des recherches
                          très rapides en O(1) sur des clés uniques.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        3
                      </div>
                      <div>
                        <span className="font-medium">Recherche par Plage</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Variante de la recherche binaire pour les requêtes de
                          type BETWEEN ou &gt;, &lt;, utilisée dans les index
                          B+Tree.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Étude de cas: PostgreSQL
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  PostgreSQL utilise plusieurs types d&apos;index, chacun
                  optimisé pour différents types de recherche :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>
                    • <strong>B-Tree</strong> : Implémente la recherche binaire
                    pour les opérations =, &lt;, &gt;, BETWEEN
                  </li>
                  <li>
                    • <strong>Hash</strong> : Utilise la recherche par hachage
                    pour les opérations d&apos;égalité (=) uniquement
                  </li>
                  <li>
                    • <strong>GiST</strong> : Pour les données géographiques et
                    textuelles, utilise des algorithmes de recherche spécialisés
                  </li>
                  <li>
                    • <strong>GIN</strong> : Pour les données composées (comme
                    les tableaux), utilise des structures d&apos;index inversé
                  </li>
                </ul>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  Le planificateur de requêtes choisit automatiquement
                  l&apos;algorithme de recherche le plus efficace en fonction de
                  la structure d&apos;index disponible et du type de requête.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Recherche dans les Applications Web
              </CardTitle>
              <CardDescription>
                Comment les moteurs de recherche et les applications web
                utilisent les algorithmes de recherche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Moteurs de Recherche</h3>
                  <p className="text-muted-foreground">
                    Les moteurs de recherche comme Google utilisent des
                    algorithmes de recherche sophistiqués pour indexer et
                    retrouver des milliards de pages web en quelques
                    millisecondes.
                  </p>

                  <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                    <h4 className="text-sm font-medium mb-2">
                      Exemple: PageRank de Google
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Google utilise des index inversés pour rechercher
                      rapidement des mots-clés dans des documents web.
                      L&apos;algorithme PageRank classe ensuite les résultats en
                      fonction de leur pertinence et de leur importance.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Algorithmes Utilisés</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                        1
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Index Inversé
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Permet de trouver rapidement tous les documents
                          contenant un mot-clé spécifique.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                        2
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Similarité
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilise des algorithmes comme TF-IDF et BM25 pour
                          trouver des documents similaires à une requête.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                        3
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche Sémantique
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilise des modèles d&apos;apprentissage profond pour
                          comprendre le sens des requêtes et trouver des
                          résultats pertinents.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-md font-medium text-green-800 dark:text-green-300 mb-2">
                  Étude de cas: Elasticsearch
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Elasticsearch est un moteur de recherche distribué utilisé par
                  de nombreuses applications web pour des recherches rapides et
                  précises :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>
                    • <strong>Index inversé</strong> : Structure de données
                    principale pour une recherche rapide de termes
                  </li>
                  <li>
                    • <strong>Recherche par préfixe</strong> : Utilise des
                    arbres de préfixes (tries) pour la saisie semi-automatique
                  </li>
                  <li>
                    • <strong>Recherche approximative</strong> : Utilise
                    l&apos;algorithme de Levenshtein pour gérer les fautes de
                    frappe
                  </li>
                  <li>
                    • <strong>Recherche géospatiale</strong> : Utilise des
                    structures spéciales pour les recherches basées sur la
                    localisation
                  </li>
                </ul>
                <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                  Des sites comme Wikipedia, GitHub, et Stack Overflow utilisent
                  Elasticsearch pour fournir des résultats de recherche rapides
                  et pertinents à leurs utilisateurs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Recherche en Intelligence Artificielle
              </CardTitle>
              <CardDescription>
                Comment les algorithmes de recherche sont utilisés dans
                l&apos;IA et l&apos;apprentissage automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Recherche dans l&apos;IA
                  </h3>
                  <p className="text-muted-foreground">
                    Les algorithmes de recherche sont au cœur de nombreuses
                    applications d&apos;intelligence artificielle, notamment
                    pour la résolution de problèmes et la prise de décision.
                  </p>

                  <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                    <h4 className="text-sm font-medium mb-2">
                      Exemple: Jeux et Planification
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Les algorithmes comme Minimax et Alpha-Beta sont utilisés
                      dans les jeux d&apos;échecs et de Go pour rechercher les
                      meilleurs coups. Les algorithmes A* et Dijkstra sont
                      utilisés pour la planification de chemins dans les jeux
                      vidéo et la robotique.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Algorithmes Utilisés</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                        1
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche Heuristique (A*)
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilise une fonction d&apos;évaluation pour guider la
                          recherche vers les solutions les plus prometteuses.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                        2
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Renforcement
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Explore l&apos;espace des états en apprenant de ses
                          expériences précédentes (Q-learning, MCTS).
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                        3
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Voisinage
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée dans les algorithmes d&apos;optimisation
                          comme le recuit simulé et la recherche tabou.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-md font-medium text-purple-800 dark:text-purple-300 mb-2">
                  Étude de cas: AlphaGo
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  AlphaGo, développé par DeepMind, a utilisé plusieurs
                  algorithmes de recherche pour battre les champions du monde de
                  Go :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                  <li>
                    • <strong>Monte Carlo Tree Search (MCTS)</strong> : Explore
                    efficacement l&apos;arbre de jeu massif du Go
                  </li>
                  <li>
                    • <strong>Réseaux de Valeur</strong> : Évaluent la qualité
                    des positions pour guider la recherche
                  </li>
                  <li>
                    • <strong>Réseaux de Politique</strong> : Prédisent les
                    coups probables pour réduire l&apos;espace de recherche
                  </li>
                  <li>
                    • <strong>Apprentissage par renforcement</strong> : Améliore
                    continuellement les stratégies de recherche
                  </li>
                </ul>
                <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">
                  Cette combinaison d&apos;algorithmes de recherche et
                  d&apos;apprentissage profond a permis à AlphaGo de naviguer
                  efficacement dans un espace de recherche de 10<sup>170</sup>{" "}
                  positions possibles, démontrant la puissance des algorithmes
                  de recherche avancés.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="os" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Recherche dans les Systèmes d&apos;Exploitation
              </CardTitle>
              <CardDescription>
                Comment les systèmes d&apos;exploitation utilisent les
                algorithmes de recherche pour la gestion des fichiers et des
                processus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Systèmes de Fichiers</h3>
                  <p className="text-muted-foreground">
                    Les systèmes d&apos;exploitation utilisent des algorithmes
                    de recherche pour localiser rapidement des fichiers et gérer
                    l&apos;espace disque.
                  </p>

                  <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                    <h4 className="text-sm font-medium mb-2">
                      Exemple: Recherche de Fichiers
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Les commandes comme <code>find</code> sous Linux ou la
                      recherche Windows utilisent des algorithmes de parcours
                      d&apos;arbre pour localiser des fichiers. Les systèmes de
                      fichiers modernes utilisent des arbres B+ pour indexer les
                      fichiers et accélérer les recherches.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Algorithmes Utilisés</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                        1
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche en Arbre B+
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée dans les systèmes de fichiers comme NTFS,
                          ext4 et HFS+ pour indexer les fichiers.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                        2
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Hachage
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée pour la gestion de la mémoire virtuelle et
                          les tables de processus.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                        3
                      </div>
                      <div>
                        <span className="font-medium">
                          Recherche par Bitmap
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Utilisée pour trouver rapidement des blocs libres sur
                          le disque.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="text-md font-medium text-amber-800 dark:text-amber-300 mb-2">
                  Étude de cas: Linux locate et mlocate
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Les commandes <code>locate</code> et <code>mlocate</code> sous
                  Linux utilisent des bases de données indexées pour accélérer
                  la recherche de fichiers :
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                  <li>
                    • <strong>Indexation périodique</strong> : Crée une base de
                    données de tous les fichiers du système
                  </li>
                  <li>
                    • <strong>Recherche par préfixe</strong> : Utilise des
                    arbres de préfixes pour accélérer les recherches par nom
                  </li>
                  <li>
                    • <strong>Compression</strong> : Utilise des techniques de
                    compression pour réduire la taille de l&apos;index
                  </li>
                  <li>
                    • <strong>Recherche parallèle</strong> : Exploite les
                    processeurs multi-cœurs pour accélérer les recherches
                  </li>
                </ul>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                  Ces outils permettent de trouver des fichiers en quelques
                  millisecondes, contre plusieurs minutes avec une recherche
                  linéaire traditionnelle comme <code>find</code>, démontrant
                  l&apos;importance des algorithmes de recherche optimisés dans
                  les systèmes d&apos;exploitation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
