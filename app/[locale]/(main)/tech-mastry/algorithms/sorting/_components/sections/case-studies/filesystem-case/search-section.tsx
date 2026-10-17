import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function SearchSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
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
  );
}
