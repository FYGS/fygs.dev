"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Globe,
  Lightbulb,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { DetailedCaseStudies } from "./case-studies/index";

// Types pour les cas d'utilisation
type CaseStudyType = "database" | "web" | "system" | "mobile";

// Données des cas d'utilisation
const caseStudies = [
  {
    id: "database",
    title: "Bases de données",
    icon: <Database className="w-5 h-5" />,
    description:
      "Comment les algorithmes de tri sont utilisés dans les systèmes de gestion de bases de données",
    examples: [
      {
        title: "Indexation et requêtes SQL",
        description:
          "Les bases de données utilisent des algorithmes de tri pour optimiser les requêtes SQL avec des clauses ORDER BY et pour maintenir les index B-tree.",
        algorithm: "Merge Sort, Quick Sort",
        code: `-- Exemple de requête SQL utilisant un tri
SELECT * FROM users
ORDER BY last_name, first_name;

-- Cette requête utilise un index trié pour accélérer la recherche
CREATE INDEX idx_users_name ON users(last_name, first_name);`,
      },
      {
        title: "Agrégation de données",
        description:
          "Lors de l'agrégation de données (GROUP BY), les SGBD trient souvent les données pour regrouper les valeurs similaires.",
        algorithm: "External Merge Sort",
        code: `-- Exemple d'agrégation nécessitant un tri
SELECT department, AVG(salary)
FROM employees
GROUP BY department
ORDER BY AVG(salary) DESC;`,
      },
    ],
  },
  {
    id: "web",
    title: "Applications Web",
    icon: <Globe className="w-5 h-5" />,
    description:
      "Utilisation des algorithmes de tri dans le développement web et les navigateurs",
    examples: [
      {
        title: "Tri côté client avec JavaScript",
        description:
          "Les moteurs JavaScript implémentent des algorithmes de tri optimisés pour la méthode Array.sort() (V8 utilise Timsort, et le tri est stable depuis ES2019).",
        algorithm: "Timsort dans V8 (hybride de Merge Sort et Insertion Sort)",
        code: `// Tri d'un tableau d'objets par propriété
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 22 }
];

// Tri par âge croissant
users.sort((a, b) => a.age - b.age);

// Tri par nom
users.sort((a, b) => a.name.localeCompare(b.name));`,
      },
      {
        title: "Pagination et filtrage",
        description:
          "Les applications web utilisent le tri pour implémenter la pagination et le filtrage des résultats.",
        algorithm: "Quick Sort, Merge Sort",
        code: `// Exemple de tri côté serveur avec Node.js
app.get('/api/products', (req, res) => {
  const { sort, order, page, limit } = req.query;

  // Tri des produits
  let sortedProducts = [...products];
  if (sort && order) {
    sortedProducts.sort((a, b) => {
      return order === 'asc'
        ? a[sort].localeCompare(b[sort])
        : b[sort].localeCompare(a[sort]);
    });
  }

  // Pagination
  // (req.query fournit des chaînes : conversion en nombres)
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + limitNum);

  res.json(paginatedProducts);
});`,
      },
    ],
  },
  {
    id: "system",
    title: "Systèmes d'exploitation",
    icon: <Cpu className="w-5 h-5" />,
    description:
      "Comment les algorithmes de tri sont utilisés dans les systèmes d'exploitation",
    examples: [
      {
        title: "Gestion des fichiers",
        description:
          "Les systèmes d'exploitation utilisent des algorithmes de tri pour organiser les fichiers dans l'explorateur de fichiers.",
        algorithm: "Quick Sort, Radix Sort",
        code: `// Pseudo-code pour trier des fichiers par date de modification
function sortFilesByDate(files) {
  return files.sort((a, b) => a.modificationDate - b.modificationDate);
}

// Tri par nom de fichier (ordre alphabétique selon la locale)
function sortFilesByName(files) {
  return files.sort((a, b) => a.name.localeCompare(b.name));
}`,
      },
      {
        title: "Ordonnancement des processus",
        description:
          "Les algorithmes d'ordonnancement des processus utilisent souvent le tri pour déterminer quel processus exécuter ensuite.",
        algorithm: "Tas binaire (file de priorité)",
        code: `// Pseudo-code pour un ordonnanceur de processus
class ProcessScheduler {
  constructor() {
    this.processQueue = new PriorityQueue();
  }

  addProcess(process) {
    // Ajoute un processus à la file de priorité
    this.processQueue.enqueue(process, process.priority);
  }

  getNextProcess() {
    // Récupère le processus de plus haute priorité
    return this.processQueue.dequeue();
  }
}`,
      },
    ],
  },
  {
    id: "mobile",
    title: "Applications Mobiles",
    icon: <Smartphone className="w-5 h-5" />,
    description:
      "Utilisation des algorithmes de tri dans le développement d'applications mobiles",
    examples: [
      {
        title: "Listes de contacts",
        description:
          "Les applications de contacts utilisent des algorithmes de tri pour organiser les contacts par nom, par fréquence d'utilisation, etc.",
        algorithm: "Insertion Sort, Quick Sort",
        code: `// Exemple Swift pour trier des contacts
let contacts = [/* liste de contacts */]

// Tri par nom
contacts.sort { $0.lastName < $1.lastName }

// Tri par fréquence d'utilisation
contacts.sort { $0.frequency > $1.frequency }`,
      },
      {
        title: "Optimisation des performances",
        description:
          "Sur les appareils mobiles avec des ressources limitées, le choix de l'algorithme de tri peut avoir un impact significatif sur les performances.",
        algorithm:
          "Insertion Sort (petits ensembles), Merge Sort (grands ensembles)",
        code: `// Exemple Android (Kotlin) avec choix d'algorithme selon la taille
fun <T : Comparable<T>> sortList(list: MutableList<T>) {
    if (list.size <= 20) {
        // Pour les petites listes, utiliser Insertion Sort
        insertionSort(list)
    } else {
        // Pour les grandes listes, utiliser le tri de la bibliothèque
        // (sur la JVM : Timsort, hybride Merge Sort / Insertion Sort)
        list.sort()
    }
}`,
      },
    ],
  },
];

export function SortingRealWorldCases() {
  const [caseType, setCaseType] = useState<CaseStudyType>("database");

  // Trouver le cas d'étude sélectionné
  const selectedCase =
    caseStudies.find((cs) => cs.id === caseType) || caseStudies[0];

  return (
    <div className="space-y-8">
      {/* Études de cas détaillées */}
      <DetailedCaseStudies />

      {/* Exemples de cas concrets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Cas Concrets d&apos;Utilisation
          </CardTitle>
          <CardDescription>
            Découvrez comment les algorithmes de tri sont utilisés dans des
            applications réelles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection du type de cas d'utilisation */}
          <Tabs
            value={caseType}
            onValueChange={(value) => setCaseType(value as CaseStudyType)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              {caseStudies.map((cs) => (
                <TabsTrigger key={cs.id} value={cs.id} className="gap-2">
                  {cs.icon}
                  <span>{cs.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Contenu du cas d'utilisation sélectionné */}
            <TabsContent value={selectedCase.id} className="mt-6 space-y-6">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  {selectedCase.icon}
                  {selectedCase.title}
                </h3>
                <p className="text-muted-foreground">
                  {selectedCase.description}
                </p>
              </div>

              {/* Exemples */}
              <div className="space-y-6">
                {selectedCase.examples.map((example, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-l-4"
                    style={{ borderLeftColor: "var(--primary)" }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                          {example.algorithm}
                        </Badge>
                      </div>

                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Code2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-60" tabIndex={0}>
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Ressources supplémentaires */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">
              Ressources supplémentaires
            </h3>
            <div className="space-y-2">
              <a
                href="https://en.wikipedia.org/wiki/Sorting_algorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Wikipedia: Algorithmes de tri
              </a>
              <a
                href="https://www.geeksforgeeks.org/sorting-algorithms/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                GeeksforGeeks: Tutoriels sur les algorithmes de tri
              </a>
              <a
                href="https://visualgo.net/en/sorting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                VisuAlgo: Visualisation des algorithmes de tri
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
