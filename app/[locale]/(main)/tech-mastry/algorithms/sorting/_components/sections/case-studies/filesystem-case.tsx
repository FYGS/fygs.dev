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
import { FolderOpen, Copy, Check } from "lucide-react";

export function FilesystemCaseStudy() {
  const [activeTab, setActiveTab] = useState("listing");
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
          <FolderOpen className="w-5 h-5 text-primary" />
          Étude de cas : Systèmes de fichiers
        </CardTitle>
        <CardDescription>
          Comment les algorithmes de tri sont utilisés dans les systèmes de
          fichiers et les explorateurs de fichiers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Introduction */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Les systèmes de fichiers et les explorateurs de fichiers utilisent
            des algorithmes de tri pour organiser et présenter les fichiers et
            dossiers de manière efficace. Cette étude de cas explore comment ces
            algorithmes sont implémentés et optimisés pour différents cas
            d&apos;usage.
          </p>
        </div>

        {/* Sélection des sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="listing">Listage de fichiers</TabsTrigger>
            <TabsTrigger value="search">Recherche de fichiers</TabsTrigger>
            <TabsTrigger value="indexing">Indexation de fichiers</TabsTrigger>
          </TabsList>

          {/* Section Listage de fichiers */}
          <TabsContent value="listing" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Listage et tri de fichiers
              </h3>
              <p className="text-muted-foreground">
                Les explorateurs de fichiers doivent trier efficacement les
                fichiers et dossiers selon différents critères (nom, date,
                taille, type). Ces tris doivent être rapides et réactifs pour
                une bonne expérience utilisateur.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Stratégies de tri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri naturel</strong> : Pour les noms de fichiers
                        (ex: &quot;file2&quot; vient avant &quot;file10&quot;)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par type</strong> : Regrouper les fichiers
                        par extension
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par date</strong> : Utiliser les métadonnées
                        pour trier par date de modification
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri par taille</strong> : Optimisé pour comparer
                        rapidement les tailles de fichiers
                      </span>
                    </li>
                  </ul>

                  <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800">
                    <p className="text-xs text-amber-400">
                      <strong>Note :</strong> La plupart des explorateurs de
                      fichiers modernes utilisent des variantes de QuickSort ou
                      TimSort pour le tri des listes de fichiers, avec des
                      comparateurs personnalisés pour chaque critère de tri.
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
                            `// Implémentation du tri naturel pour les noms de fichiers en JavaScript
function naturalSort(files) {
  return [...files].sort((a, b) => {
    // Fonction de comparaison pour le tri naturel
    return a.name.localeCompare(b.name, undefined, { 
      numeric: true,
      sensitivity: 'base'
    });
  });
}

// Tri par date de modification
function sortByDate(files) {
  return [...files].sort((a, b) => {
    return b.modifiedDate - a.modifiedDate; // Tri décroissant
  });
}

// Tri par taille
function sortBySize(files) {
  return [...files].sort((a, b) => {
    // Placer les dossiers avant les fichiers
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Trier par taille
    return b.size - a.size; // Tri décroissant
  });
}

// Tri par type (extension)
function sortByType(files) {
  return [...files].sort((a, b) => {
    // Placer les dossiers avant les fichiers
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Extraire les extensions
    const extA = a.name.split('.').pop().toLowerCase();
    const extB = b.name.split('.').pop().toLowerCase();
    
    // Comparer les extensions
    return extA.localeCompare(extB);
  });
}`,
                            "file-sort"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "file-sort" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Implémentation du tri naturel pour les noms de fichiers en JavaScript
function naturalSort(files) {
  return [...files].sort((a, b) => {
    // Fonction de comparaison pour le tri naturel
    return a.name.localeCompare(b.name, undefined, { 
      numeric: true,
      sensitivity: 'base'
    });
  });
}

// Tri par date de modification
function sortByDate(files) {
  return [...files].sort((a, b) => {
    return b.modifiedDate - a.modifiedDate; // Tri décroissant
  });
}

// Tri par taille
function sortBySize(files) {
  return [...files].sort((a, b) => {
    // Placer les dossiers avant les fichiers
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Trier par taille
    return b.size - a.size; // Tri décroissant
  });
}

// Tri par type (extension)
function sortByType(files) {
  return [...files].sort((a, b) => {
    // Placer les dossiers avant les fichiers
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Extraire les extensions
    const extA = a.name.split('.').pop().toLowerCase();
    const extB = b.name.split('.').pop().toLowerCase();
    
    // Comparer les extensions
    return extA.localeCompare(extB);
  });
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
                <h4 className="text-sm font-medium text-blue-300 mb-2">
                  Implémentation dans les explorateurs de fichiers
                </h4>
                <p className="text-sm text-blue-400">
                  L&apos;explorateur de fichiers Windows (File Explorer) utilise
                  une variante du tri naturel pour les noms de fichiers, ce qui
                  permet de trier correctement les séquences numériques (ex:
                  &quot;file1.txt&quot;, &quot;file2.txt&quot;,
                  &quot;file10.txt&quot;).
                </p>
                <p className="text-sm text-blue-400 mt-2">
                  macOS Finder utilise également un tri naturel, mais avec des
                  optimisations supplémentaires pour gérer les caractères
                  spéciaux et les différentes langues. Il utilise une
                  implémentation de TimSort pour de meilleures performances sur
                  des listes partiellement triées.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Section Recherche de fichiers */}
          <TabsContent value="search" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Recherche et tri des résultats
              </h3>
              <p className="text-muted-foreground">
                Les outils de recherche de fichiers doivent non seulement
                trouver les fichiers correspondant aux critères, mais aussi les
                présenter de manière pertinente, ce qui implique des algorithmes
                de tri sophistiqués.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Algorithmes de tri par pertinence
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Score de pertinence</strong> : Calcul d&apos;un
                        score basé sur la correspondance avec la requête
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Fréquence d&apos;accès</strong> : Priorisation
                        des fichiers récemment ou fréquemment utilisés
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Proximité lexicale</strong> : Mesure de la
                        distance entre les termes de recherche et les noms de
                        fichiers
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri multi-critères</strong> : Combinaison de
                        plusieurs facteurs pour déterminer l&apos;ordre final
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
                            `// Implémentation d'un tri par pertinence pour les résultats de recherche
function sortSearchResults(files, searchQuery) {
  // Calculer le score de pertinence pour chaque fichier
  const scoredFiles = files.map(file => {
    // Score initial
    let score = 0;
    
    // 1. Correspondance exacte dans le nom
    if (file.name.toLowerCase() === searchQuery.toLowerCase()) {
      score += 100;
    }
    
    // 2. Correspondance au début du nom
    if (file.name.toLowerCase().startsWith(searchQuery.toLowerCase())) {
      score += 50;
    }
    
    // 3. Correspondance dans le nom
    if (file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      score += 25;
    }
    
    // 4. Correspondance dans le contenu (pour les fichiers texte)
    if (file.isTextFile && file.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      score += 15;
    }
    
    // 5. Bonus pour les fichiers récemment modifiés
    const daysSinceModified = (Date.now() - file.modifiedDate) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 7) {
      score += 10;
    }
    
    // 6. Bonus pour les fichiers fréquemment accédés
    score += Math.min(file.accessCount, 10);
    
    return { ...file, score };
  });
  
  // Trier par score décroissant
  return scoredFiles.sort((a, b) => b.score - a.score);
}

// Exemple d'utilisation
const searchResults = sortSearchResults(files, "rapport");`,
                            "search-sort"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "search-sort" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Implémentation d'un tri par pertinence pour les résultats de recherche
function sortSearchResults(files, searchQuery) {
  // Calculer le score de pertinence pour chaque fichier
  const scoredFiles = files.map(file => {
    // Score initial
    let score = 0;
    
    // 1. Correspondance exacte dans le nom
    if (file.name.toLowerCase() === searchQuery.toLowerCase()) {
      score += 100;
    }
    
    // 2. Correspondance au début du nom
    if (file.name.toLowerCase().startsWith(searchQuery.toLowerCase())) {
      score += 50;
    }
    
    // 3. Correspondance dans le nom
    if (file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      score += 25;
    }
    
    // 4. Correspondance dans le contenu (pour les fichiers texte)
    if (file.isTextFile && file.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      score += 15;
    }
    
    // 5. Bonus pour les fichiers récemment modifiés
    const daysSinceModified = (Date.now() - file.modifiedDate) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 7) {
      score += 10;
    }
    
    // 6. Bonus pour les fichiers fréquemment accédés
    score += Math.min(file.accessCount, 10);
    
    return { ...file, score };
  });
  
  // Trier par score décroissant
  return scoredFiles.sort((a, b) => b.score - a.score);
}

// Exemple d'utilisation
const searchResults = sortSearchResults(files, "rapport");`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
                <h4 className="text-sm font-medium text-blue-300 mb-2">
                  Applications réelles
                </h4>
                <p className="text-sm text-blue-400">
                  La recherche Spotlight sur macOS utilise un système de score
                  sophistiqué pour trier les résultats, prenant en compte non
                  seulement la correspondance textuelle, mais aussi
                  l&apos;historique d&apos;utilisation, les métadonnées et même
                  le contexte de l&apos;utilisateur.
                </p>
                <p className="text-sm text-blue-400 mt-2">
                  Windows Search utilise également un algorithme de tri par
                  pertinence, avec des optimisations pour les différents types
                  de fichiers et applications. Il utilise un index pour
                  accélérer les recherches et le tri des résultats.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Section Indexation de fichiers */}
          <TabsContent value="indexing" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Indexation et organisation des fichiers
              </h3>
              <p className="text-muted-foreground">
                Les systèmes d&apos;indexation de fichiers utilisent des
                algorithmes de tri pour organiser efficacement les métadonnées
                et permettre des recherches rapides. Ces systèmes sont
                essentiels pour les outils de recherche modernes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">
                    Techniques d&apos;indexation
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Index inversé</strong> : Structure de données
                        qui mappe les mots aux fichiers qui les contiennent
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>B-trees</strong> : Utilisés pour stocker et
                        rechercher efficacement les métadonnées des fichiers
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tables de hachage</strong> : Pour un accès
                        rapide aux fichiers par leur nom ou identifiant
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      <span>
                        <strong>Tri lexicographique</strong> : Pour organiser
                        les termes dans l&apos;index
                      </span>
                    </li>
                  </ul>

                  <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800">
                    <p className="text-xs text-amber-400">
                      <strong>Note :</strong> La création et la maintenance
                      d&apos;un index de fichiers nécessitent des algorithmes de
                      tri efficaces pour traiter de grandes quantités de
                      données, souvent avec des contraintes de mémoire.
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
                            `// Implémentation simplifiée d'un index inversé
class InvertedIndex {
  constructor() {
    this.index = new Map(); // terme -> [fichiers]
    this.documents = new Map(); // id -> métadonnées du fichier
  }
  
  // Ajouter un document à l'index
  addDocument(docId, content, metadata) {
    // Stocker les métadonnées du document
    this.documents.set(docId, metadata);
    
    // Tokeniser le contenu
    const terms = this.tokenize(content);
    
    // Ajouter chaque terme à l'index
    for (const term of terms) {
      if (!this.index.has(term)) {
        this.index.set(term, new Set());
      }
      this.index.get(term).add(docId);
    }
  }
  
  // Rechercher des documents par terme
  search(query) {
    const queryTerms = this.tokenize(query);
    
    // Trouver les documents qui contiennent tous les termes
    let resultSet = null;
    
    for (const term of queryTerms) {
      const termDocs = this.index.get(term) || new Set();
      
      if (resultSet === null) {
        resultSet = new Set(termDocs);
      } else {
        // Intersection avec les résultats précédents
        resultSet = new Set(
          [...resultSet].filter(docId => termDocs.has(docId))
        );
      }
    }
    
    // Convertir les IDs en métadonnées
    const results = [...(resultSet || [])].map(docId => ({
      id: docId,
      ...this.documents.get(docId)
    }));
    
    // Trier les résultats par pertinence (ici, par date de modification)
    return results.sort((a, b) => b.modifiedDate - a.modifiedDate);
  }
  
  // Tokeniser le texte en termes
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\\s+/)
      .filter(term => term.length > 0);
  }
}

// Exemple d'utilisation
const index = new InvertedIndex();
index.addDocument(1, "Rapport annuel 2023", { name: "rapport_2023.pdf", modifiedDate: new Date(2023, 0, 15) });
index.addDocument(2, "Présentation du projet", { name: "presentation.pptx", modifiedDate: new Date(2023, 1, 20) });

const results = index.search("rapport 2023");`,
                            "index-code"
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        {copiedCode === "index-code" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code className="text-xs">
                        {`// Implémentation simplifiée d'un index inversé
class InvertedIndex {
  constructor() {
    this.index = new Map(); // terme -> [fichiers]
    this.documents = new Map(); // id -> métadonnées du fichier
  }
  
  // Ajouter un document à l'index
  addDocument(docId, content, metadata) {
    // Stocker les métadonnées du document
    this.documents.set(docId, metadata);
    
    // Tokeniser le contenu
    const terms = this.tokenize(content);
    
    // Ajouter chaque terme à l'index
    for (const term of terms) {
      if (!this.index.has(term)) {
        this.index.set(term, new Set());
      }
      this.index.get(term).add(docId);
    }
  }
  
  // Rechercher des documents par terme
  search(query) {
    const queryTerms = this.tokenize(query);
    
    // Trouver les documents qui contiennent tous les termes
    let resultSet = null;
    
    for (const term of queryTerms) {
      const termDocs = this.index.get(term) || new Set();
      
      if (resultSet === null) {
        resultSet = new Set(termDocs);
      } else {
        // Intersection avec les résultats précédents
        resultSet = new Set(
          [...resultSet].filter(docId => termDocs.has(docId))
        );
      }
    }
    
    // Convertir les IDs en métadonnées
    const results = [...(resultSet || [])].map(docId => ({
      id: docId,
      ...this.documents.get(docId)
    }));
    
    // Trier les résultats par pertinence (ici, par date de modification)
    return results.sort((a, b) => b.modifiedDate - a.modifiedDate);
  }
  
  // Tokeniser le texte en termes
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\\s+/)
      .filter(term => term.length > 0);
  }
}

// Exemple d'utilisation
const index = new InvertedIndex();
index.addDocument(1, "Rapport annuel 2023", { name: "rapport_2023.pdf", modifiedDate: new Date(2023, 0, 15) });
index.addDocument(2, "Présentation du projet", { name: "presentation.pptx", modifiedDate: new Date(2023, 1, 20) });

const results = index.search("rapport 2023");`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
                <h4 className="text-sm font-medium text-blue-300 mb-2">
                  Systèmes d&apos;indexation réels
                </h4>
                <p className="text-sm text-blue-400">
                  <strong>Elasticsearch</strong>, utilisé pour l&apos;indexation
                  de fichiers dans de nombreuses applications, utilise des
                  structures de données optimisées comme les index inversés et
                  les B-trees. Il implémente des algorithmes de tri sophistiqués
                  pour organiser les résultats par pertinence.
                </p>
                <p className="text-sm text-blue-400 mt-2">
                  <strong>Windows Search Index</strong> utilise une combinaison
                  de tables de hachage et de B-trees pour indexer les fichiers.
                  Il implémente également un système de tri par pertinence basé
                  sur plusieurs critères, dont la fréquence des termes et
                  l&apos;historique d&apos;utilisation.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
