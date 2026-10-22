"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Database, Globe } from "lucide-react";
import { useState } from "react";

// Type pour les études de cas
type CaseStudyType = "database" | "web" | "ai";

export function DetailedCaseStudies() {
  const [activeCase, setActiveCase] = useState<CaseStudyType>("database");

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Études de Cas Détaillées</h2>
        <p className="text-muted-foreground">
          Explorez des études de cas détaillées sur l&apos;utilisation des
          algorithmes de recherche dans différents domaines.
        </p>
      </div>

      {/* Sélection de l'étude de cas */}
      <Tabs
        value={activeCase}
        onValueChange={(value) => setActiveCase(value as CaseStudyType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Recherche dans les Bases de Données
          </TabsTrigger>
          <TabsTrigger value="web" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Moteurs de Recherche Web
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Recherche en IA
          </TabsTrigger>
        </TabsList>

        {/* Contenu des études de cas */}
        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Étude de Cas: Optimisation des Requêtes SQL
              </CardTitle>
              <CardDescription>
                Comment les bases de données relationnelles utilisent les index
                et les algorithmes de recherche pour optimiser les requêtes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3>Contexte</h3>
                <p>
                  Les bases de données relationnelles comme PostgreSQL, MySQL et
                  Oracle doivent traiter des millions de requêtes par jour,
                  souvent sur des tables contenant des millions
                  d&apos;enregistrements. Sans algorithmes de recherche
                  efficaces, ces requêtes prendraient un temps considérable à
                  s&apos;exécuter.
                </p>

                <h3>Problématique</h3>
                <p>
                  Comment optimiser les requêtes SQL pour qu&apos;elles
                  s&apos;exécutent en millisecondes plutôt qu&apos;en secondes
                  ou minutes, même sur de très grandes tables?
                </p>

                <h3>Solution: Indexation et Algorithmes de Recherche</h3>
                <p>
                  Les bases de données utilisent principalement deux types
                  d&apos;index:
                </p>
                <ul>
                  <li>
                    <strong>Index B-Tree</strong>: Structure d&apos;arbre
                    équilibrée qui permet des recherches, insertions et
                    suppressions en O(log n). Idéal pour les requêtes
                    d&apos;égalité (WHERE id = 5) et de plage (WHERE age BETWEEN
                    20 AND 30).
                  </li>
                  <li>
                    <strong>Index de Hachage</strong>: Utilise des fonctions de
                    hachage pour stocker et récupérer des données en O(1) en
                    moyenne. Idéal pour les requêtes d&apos;égalité uniquement.
                  </li>
                </ul>

                <h3>Exemple Concret: Requête avec et sans Index</h3>
                <p>
                  Considérons une table <code>users</code> avec 1 million
                  d&apos;enregistrements:
                </p>
                <pre className="bg-muted p-3 rounded-md text-xs">
                  {`-- Sans index sur la colonne email
SELECT * FROM users WHERE email = 'user@example.com';
-- Temps d'exécution: élevé, proportionnel à n (parcours séquentiel de la table)

-- Après création d'un index
CREATE INDEX idx_users_email ON users(email);

-- Même requête avec index
SELECT * FROM users WHERE email = 'user@example.com';
-- Temps d'exécution: très faible, en O(log n) (descente dans l'index B-Tree)`}
                </pre>

                <h3>Fonctionnement Interne</h3>
                <p>
                  Lorsqu&apos;une requête est exécutée, le planificateur de
                  requêtes détermine s&apos;il doit utiliser un index:
                </p>
                <ol>
                  <li>
                    Analyse la requête et identifie les prédicats (conditions
                    WHERE)
                  </li>
                  <li>
                    Vérifie si des index sont disponibles pour ces colonnes
                  </li>
                  <li>
                    Estime le coût d&apos;utilisation de chaque index vs. un
                    parcours séquentiel
                  </li>
                  <li>Choisit le plan d&apos;exécution le moins coûteux</li>
                </ol>

                <h3>Résultats et Impact</h3>
                <p>
                  L&apos;utilisation d&apos;index et d&apos;algorithmes de
                  recherche efficaces peut améliorer les performances des
                  requêtes de plusieurs ordres de grandeur:
                </p>
                <ul>
                  <li>Requêtes d&apos;égalité: de O(n) à O(log n) ou O(1)</li>
                  <li>
                    Requêtes de plage: de O(n) à O(log n + k) où k est le nombre
                    de résultats
                  </li>
                  <li>Jointures: de O(n²) à O(n log n) ou mieux</li>
                </ul>

                <h3>Leçons Apprises</h3>
                <p>
                  Cette étude de cas démontre l&apos;importance cruciale des
                  algorithmes de recherche dans les performances des bases de
                  données:
                </p>
                <ul>
                  <li>
                    Les index sont essentiels pour les requêtes sur de grandes
                    tables
                  </li>
                  <li>
                    Différents types de requêtes bénéficient de différents types
                    d&apos;index
                  </li>
                  <li>
                    Le choix de l&apos;algorithme de recherche doit être adapté
                    au modèle d&apos;accès aux données
                  </li>
                  <li>
                    Une bonne conception de schéma et d&apos;index peut
                    améliorer les performances de plusieurs ordres de grandeur
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Étude de Cas: Google Search
              </CardTitle>
              <CardDescription>
                Comment Google utilise des algorithmes de recherche avancés pour
                indexer et rechercher des milliards de pages web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3>Contexte</h3>
                <p>
                  Google doit indexer et rechercher des centaines de milliards
                  de pages web, tout en fournissant des résultats pertinents en
                  moins d&apos;une seconde. C&apos;est l&apos;un des plus grands
                  défis de recherche au monde.
                </p>

                <h3>Problématique</h3>
                <p>
                  Comment rechercher efficacement dans un index de plusieurs
                  pétaoctets contenant des centaines de milliards de documents,
                  tout en garantissant la pertinence des résultats?
                </p>

                <h3>Solution: Architecture de Recherche Multi-niveaux</h3>
                <p>
                  Google utilise une combinaison sophistiquée d&apos;algorithmes
                  de recherche:
                </p>
                <ul>
                  <li>
                    <strong>Index Inversé</strong>: Structure fondamentale qui
                    associe chaque mot à la liste des documents qui le
                    contiennent. Permet de trouver rapidement tous les documents
                    contenant un mot spécifique.
                  </li>
                  <li>
                    <strong>Index Distribué</strong>: L&apos;index est
                    partitionné sur des milliers de serveurs, permettant des
                    recherches parallèles.
                  </li>
                  <li>
                    <strong>Recherche à Deux Niveaux</strong>: Un premier niveau
                    rapide identifie un sous-ensemble de documents
                    potentiellement pertinents, puis un second niveau plus
                    sophistiqué les classe par pertinence.
                  </li>
                </ul>

                <h3>Algorithmes de Recherche Clés</h3>
                <ol>
                  <li>
                    <strong>Recherche par Mots-clés</strong>: Utilise des index
                    inversés pour trouver rapidement les documents contenant les
                    termes de recherche.
                  </li>
                  <li>
                    <strong>PageRank</strong>: Algorithme qui classe les pages
                    web en fonction de leur importance, basée sur la structure
                    des liens du web.
                  </li>
                  <li>
                    <strong>Recherche Sémantique</strong>: Utilise des modèles
                    d&apos;apprentissage profond (comme BERT) pour comprendre le
                    sens des requêtes.
                  </li>
                  <li>
                    <strong>Recherche Personnalisée</strong>: Adapte les
                    résultats en fonction de l&apos;historique et du contexte de
                    l&apos;utilisateur.
                  </li>
                </ol>

                <h3>Optimisations Techniques</h3>
                <p>
                  Google a développé de nombreuses optimisations pour accélérer
                  la recherche:
                </p>
                <ul>
                  <li>
                    <strong>Compression d&apos;Index</strong>: Techniques
                    spéciales pour réduire la taille des index tout en
                    maintenant des performances élevées.
                  </li>
                  <li>
                    <strong>Mise en Cache</strong>: Les résultats des requêtes
                    fréquentes sont mis en cache pour une réponse instantanée.
                  </li>
                  <li>
                    <strong>Recherche Anticipée</strong>: Commence à traiter la
                    requête avant même que l&apos;utilisateur ait fini de taper.
                  </li>
                  <li>
                    <strong>Sharding</strong>: Division de l&apos;index en
                    fragments plus petits distribués sur des milliers de
                    machines.
                  </li>
                </ul>

                <h3>Résultats et Impact</h3>
                <p>Cette architecture permet à Google de:</p>
                <ul>
                  <li>
                    Traiter plusieurs milliards de recherches par jour (de
                    l&apos;ordre de 100 000 par seconde)
                  </li>
                  <li>
                    Fournir des résultats en une fraction de seconde
                  </li>
                  <li>
                    Maintenir un index de centaines de milliards de pages web
                  </li>
                  <li>
                    Adapter dynamiquement les résultats en fonction de la
                    pertinence et du contexte
                  </li>
                </ul>

                <h3>Leçons Apprises</h3>
                <p>
                  L&apos;étude de cas de Google Search illustre plusieurs
                  principes importants:
                </p>
                <ul>
                  <li>
                    L&apos;importance de combiner plusieurs algorithmes de
                    recherche pour des problèmes complexes
                  </li>
                  <li>
                    La nécessité d&apos;une architecture distribuée pour les
                    recherches à grande échelle
                  </li>
                  <li>
                    L&apos;équilibre entre vitesse et pertinence dans les
                    algorithmes de recherche
                  </li>
                  <li>
                    L&apos;évolution des algorithmes de recherche syntaxique
                    vers la recherche sémantique
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Étude de Cas: AlphaGo et la Recherche en IA
              </CardTitle>
              <CardDescription>
                Comment DeepMind a utilisé des algorithmes de recherche avancés
                pour créer un système capable de battre les champions du monde
                de Go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3>Contexte</h3>
                <p>
                  Le jeu de Go était considéré comme un défi majeur pour
                  l&apos;IA en raison de son espace de recherche immense
                  (environ 10<sup>170</sup> positions possibles, bien plus que
                  le nombre d&apos;atomes dans l&apos;univers observable).
                </p>

                <h3>Problématique</h3>
                <p>
                  Comment explorer efficacement un espace de recherche aussi
                  vaste pour trouver les meilleurs coups, alors qu&apos;une
                  recherche exhaustive est impossible?
                </p>

                <h3>
                  Solution: Recherche Monte Carlo avec Réseaux de Neurones
                </h3>
                <p>
                  AlphaGo combine plusieurs algorithmes de recherche
                  sophistiqués:
                </p>
                <ul>
                  <li>
                    <strong>Monte Carlo Tree Search (MCTS)</strong>: Algorithme
                    qui explore sélectivement les branches les plus prometteuses
                    de l&apos;arbre de jeu en effectuant des simulations
                    aléatoires.
                  </li>
                  <li>
                    <strong>Réseaux de Politique</strong>: Réseaux de neurones
                    qui prédisent les coups probables à partir d&apos;une
                    position donnée, réduisant drastiquement l&apos;espace de
                    recherche.
                  </li>
                  <li>
                    <strong>Réseaux de Valeur</strong>: Réseaux de neurones qui
                    évaluent la qualité d&apos;une position, guidant la
                    recherche vers les positions favorables.
                  </li>
                </ul>

                <h3>Fonctionnement de l&apos;Algorithme MCTS</h3>
                <ol>
                  <li>
                    <strong>Sélection</strong>: Parcourir l&apos;arbre de jeu
                    existant en choisissant les nœuds les plus prometteurs selon
                    une formule d&apos;équilibre entre exploration et
                    exploitation.
                  </li>
                  <li>
                    <strong>Expansion</strong>: Ajouter un nouveau nœud à
                    l&apos;arbre, représentant un coup possible.
                  </li>
                  <li>
                    <strong>Simulation</strong>: Jouer une partie aléatoire à
                    partir du nouveau nœud jusqu&apos;à la fin de la partie.
                  </li>
                  <li>
                    <strong>Rétropropagation</strong>: Mettre à jour les
                    statistiques de tous les nœuds visités en fonction du
                    résultat de la simulation.
                  </li>
                </ol>

                <h3>Innovations Clés d&apos;AlphaGo</h3>
                <ul>
                  <li>
                    <strong>Recherche Guidée par l&apos;Apprentissage</strong>:
                    Utilisation de réseaux de neurones pour guider la recherche
                    MCTS, réduisant considérablement l&apos;espace de recherche.
                  </li>
                  <li>
                    <strong>Apprentissage par Auto-jeu</strong>: AlphaGo
                    s&apos;améliore en jouant contre lui-même, générant des
                    données d&apos;entraînement pour affiner ses réseaux de
                    neurones.
                  </li>
                  <li>
                    <strong>Élagage de l&apos;Arbre</strong>: Techniques
                    sophistiquées pour concentrer la recherche sur les branches
                    les plus prometteuses.
                  </li>
                </ul>

                <h3>Résultats et Impact</h3>
                <p>Cette approche a permis des avancées remarquables:</p>
                <ul>
                  <li>
                    AlphaGo a battu le champion du monde Lee Sedol 4-1 en 2016
                  </li>
                  <li>
                    AlphaGo Zero, une version améliorée, a surpassé AlphaGo en
                    apprenant uniquement par auto-jeu, sans données humaines
                  </li>
                  <li>
                    Les techniques développées ont été appliquées à
                    d&apos;autres domaines comme la découverte de médicaments et
                    la prédiction de la structure des protéines
                  </li>
                </ul>

                <h3>Leçons Apprises</h3>
                <p>
                  Cette étude de cas illustre plusieurs principes fondamentaux:
                </p>
                <ul>
                  <li>
                    L&apos;importance de combiner recherche heuristique et
                    apprentissage pour les espaces de recherche massifs
                  </li>
                  <li>
                    La puissance de la recherche guidée par des modèles appris
                  </li>
                  <li>
                    L&apos;efficacité des approches qui équilibrent exploration
                    et exploitation
                  </li>
                  <li>
                    La possibilité de résoudre des problèmes considérés comme
                    intractables en réduisant intelligemment l&apos;espace de
                    recherche
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
