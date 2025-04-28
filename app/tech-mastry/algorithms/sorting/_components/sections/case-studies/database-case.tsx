"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database, Copy, Check, ExternalLink } from "lucide-react";

export function DatabaseCaseStudy() {
  const [activeTab, setActiveTab] = useState("indexing");
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
          <Database className="w-5 h-5 text-primary" />
          Étude de cas : Bases de données
        </CardTitle>
        <CardDescription>
          Comment les algorithmes de tri sont utilisés dans les systèmes de
          gestion de bases de données
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Introduction */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Les systèmes de gestion de bases de données (SGBD) utilisent
            intensivement les algorithmes de tri pour optimiser les requêtes,
            maintenir les index et effectuer des opérations d&apos;agrégation.
            Cette étude de cas explore comment les algorithmes de tri sont
            implémentés et utilisés dans les SGBD modernes.
          </p>
        </div>

        {/* Sélection des sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="indexing">Indexation</TabsTrigger>
            <TabsTrigger value="query">Requêtes ORDER BY</TabsTrigger>
            <TabsTrigger value="external">Tri externe</TabsTrigger>
          </TabsList>

          {/* Section Indexation */}
          <TabsContent value="indexing" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Indexation et B-trees</h3>
              <p className="text-muted-foreground">
                Les index B-tree sont au cœur des performances des bases de
                données relationnelles. Ils utilisent des algorithmes de tri
                pour maintenir les données dans un ordre qui permet des
                recherches, insertions et suppressions efficaces.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Comment ça fonctionne</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        Les B-trees maintiennent les clés triées dans chaque
                        nœud
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        Lors de l&apos;insertion, les algorithmes de tri par
                        insertion sont souvent utilisés pour maintenir
                        l&apos;ordre
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        Les recherches utilisent des algorithmes de recherche
                        binaire (O(log n))
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        Lors de la création initiale d&apos;un index, des
                        algorithmes comme le tri fusion sont utilisés
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
                            `CREATE INDEX idx_users_lastname ON users(last_name, first_name);

-- Exemple de requête utilisant l'index
SELECT * FROM users 
WHERE last_name = 'Smith'
ORDER BY first_name;`,
                            "index-sql"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "index-sql" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code className="text-xs">
                        {`CREATE INDEX idx_users_lastname ON users(last_name, first_name);

-- Exemple de requête utilisant l'index
SELECT * FROM users 
WHERE last_name = 'Smith'
ORDER BY first_name;`}
                      </code>
                    </pre>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Dans PostgreSQL, la création d&apos;un index utilise un
                    algorithme de tri externe pour trier les données avant de
                    construire l&apos;arbre B-tree.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Implémentation dans PostgreSQL
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  PostgreSQL utilise une variante du tri fusion pour créer des
                  index B-tree. Le code source dans
                  <code className="mx-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                    src/backend/access/nbtree/nbtree.c
                  </code>
                  implémente un algorithme de tri qui peut fonctionner
                  efficacement avec une mémoire limitée en utilisant des
                  fichiers temporaires pour les données intermédiaires.
                </p>
                <div className="mt-2">
                  <a
                    href="https://github.com/postgres/postgres/blob/master/src/backend/access/nbtree/nbtree.c"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir le code source sur GitHub
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Section Requêtes ORDER BY */}
          <TabsContent value="query" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Requêtes avec ORDER BY</h3>
              <p className="text-muted-foreground">
                Les clauses ORDER BY dans SQL nécessitent de trier les résultats
                d&apos;une requête. Les SGBD utilisent différents algorithmes de
                tri en fonction de la taille des données et des ressources
                disponibles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Stratégies de tri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri en mémoire</strong> : Pour les petits
                        ensembles de résultats, utilisation de QuickSort ou
                        TimSort
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri externe</strong> : Pour les grands ensembles
                        de données, utilisation du tri fusion externe
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Utilisation d&apos;index</strong> : Si un index
                        existe sur les colonnes de tri, il peut être utilisé
                        pour éviter le tri
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri parallèle</strong> : Les SGBD modernes
                        peuvent paralléliser le tri pour améliorer les
                        performances
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
                            `-- Requête avec ORDER BY simple
SELECT * FROM products
ORDER BY price DESC, name ASC;

-- Requête avec ORDER BY et LIMIT (optimisée)
SELECT * FROM products
ORDER BY price DESC
LIMIT 10;

-- Analyse du plan d'exécution
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY price DESC;`,
                            "query-sql"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "query-sql" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code className="text-xs">
                        {`-- Requête avec ORDER BY simple
SELECT * FROM products
ORDER BY price DESC, name ASC;

-- Requête avec ORDER BY et LIMIT (optimisée)
SELECT * FROM products
ORDER BY price DESC
LIMIT 10;

-- Analyse du plan d'exécution
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY price DESC;`}
                      </code>
                    </pre>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    La commande EXPLAIN ANALYZE permet de voir quel algorithme
                    de tri est utilisé par le SGBD pour exécuter la requête.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Optimisation des requêtes ORDER BY
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  MySQL utilise une implémentation de QuickSort pour les tris en
                  mémoire et une variante du tri fusion pour les tris externes.
                  Voici un extrait simplifié de l&apos;implémentation du tri
                  dans MySQL :
                </p>
                <div className="relative mt-2">
                  <pre className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-xs overflow-x-auto">
                    <code>
                      {`// Extrait simplifié du code de MySQL pour le tri
bool filesort(THD *thd, QEP_TAB *qep_tab) {
  // Déterminer si le tri peut être fait en mémoire
  if (sortbuffer_size <= max_memory_available) {
    // Tri en mémoire avec QuickSort
    std::sort(sortbuffer, sortbuffer + rowcount, compare_func);
  } else {
    // Tri externe avec Merge Sort
    return external_sort(thd, qep_tab, sortbuffer, sortbuffer_size);
  }
  return false; // Pas d'erreur
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Section Tri externe */}
          <TabsContent value="external" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Tri externe pour les grandes bases de données
              </h3>
              <p className="text-muted-foreground">
                Le tri externe est utilisé lorsque les données à trier sont trop
                volumineuses pour tenir en mémoire. Cette technique est
                essentielle pour les opérations sur de grandes tables dans les
                bases de données.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Fonctionnement du tri externe
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                    <li>
                      <span>
                        Diviser les données en blocs qui tiennent en mémoire
                      </span>
                    </li>
                    <li>
                      <span>
                        Trier chaque bloc en mémoire (souvent avec QuickSort)
                      </span>
                    </li>
                    <li>
                      <span>Écrire chaque bloc trié sur disque</span>
                    </li>
                    <li>
                      <span>
                        Fusionner progressivement les blocs triés (avec une
                        variante du tri fusion)
                      </span>
                    </li>
                    <li>
                      <span>
                        Répéter le processus de fusion jusqu&apos;à obtenir un
                        seul fichier trié
                      </span>
                    </li>
                  </ol>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>Note :</strong> Le tri externe est également
                      utilisé pour les opérations GROUP BY, les jointures et la
                      création d&apos;index sur de grandes tables.
                    </p>
                  </div>
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
                            `// Implémentation simplifiée d'un tri externe en JavaScript
async function externalSort(inputFile, outputFile, memoryLimit) {
  // Étape 1: Diviser et trier les chunks
  const chunks = [];
  let chunk = [];
  let chunkSize = 0;
  
  const inputStream = createReadStream(inputFile);
  for await (const line of inputStream) {
    chunk.push(line);
    chunkSize += line.length;
    
    if (chunkSize >= memoryLimit) {
      // Trier le chunk en mémoire
      chunk.sort();
      
      // Écrire le chunk trié sur disque
      const chunkFile = \`temp_chunk_\${chunks.length}.txt\`;
      await writeToFile(chunkFile, chunk);
      chunks.push(chunkFile);
      
      // Réinitialiser pour le prochain chunk
      chunk = [];
      chunkSize = 0;
    }
  }
  
  // Traiter le dernier chunk s'il existe
  if (chunk.length > 0) {
    chunk.sort();
    const chunkFile = \`temp_chunk_\${chunks.length}.txt\`;
    await writeToFile(chunkFile, chunk);
    chunks.push(chunkFile);
  }
  
  // Étape 2: Fusionner les chunks triés
  await mergeChunks(chunks, outputFile);
  
  // Étape 3: Nettoyer les fichiers temporaires
  for (const chunkFile of chunks) {
    await deleteFile(chunkFile);
  }
}

// Fonction pour fusionner les chunks triés
async function mergeChunks(chunkFiles, outputFile) {
  // Implémentation de la fusion k-way
  // ...
}`,
                            "external-sort"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "external-sort" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Implémentation simplifiée d'un tri externe en JavaScript
async function externalSort(inputFile, outputFile, memoryLimit) {
  // Étape 1: Diviser et trier les chunks
  const chunks = [];
  let chunk = [];
  let chunkSize = 0;
  
  const inputStream = createReadStream(inputFile);
  for await (const line of inputStream) {
    chunk.push(line);
    chunkSize += line.length;
    
    if (chunkSize >= memoryLimit) {
      // Trier le chunk en mémoire
      chunk.sort();
      
      // Écrire le chunk trié sur disque
      const chunkFile = \`temp_chunk_\${chunks.length}.txt\`;
      await writeToFile(chunkFile, chunk);
      chunks.push(chunkFile);
      
      // Réinitialiser pour le prochain chunk
      chunk = [];
      chunkSize = 0;
    }
  }
  
  // Traiter le dernier chunk s'il existe
  if (chunk.length > 0) {
    chunk.sort();
    const chunkFile = \`temp_chunk_\${chunks.length}.txt\`;
    await writeToFile(chunkFile, chunk);
    chunks.push(chunkFile);
  }
  
  // Étape 2: Fusionner les chunks triés
  await mergeChunks(chunks, outputFile);
  
  // Étape 3: Nettoyer les fichiers temporaires
  for (const chunkFile of chunks) {
    await deleteFile(chunkFile);
  }
}

// Fonction pour fusionner les chunks triés
async function mergeChunks(chunkFiles, outputFile) {
  // Implémentation de la fusion k-way
  // ...
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Application dans les SGBD
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Oracle Database utilise un algorithme de tri externe appelé
                  &quot;Sort-Merge&quot; pour les grandes opérations de tri. La
                  base de données ajuste automatiquement les paramètres comme{" "}
                  <code className="mx-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                    SORT_AREA_SIZE
                  </code>{" "}
                  pour optimiser les performances.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  SQL Server utilise également le tri externe pour les grandes
                  opérations, avec des optimisations comme le tri parallèle et
                  l&apos;utilisation intelligente du cache de mémoire tampon.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
