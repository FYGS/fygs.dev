import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function ListingSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
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
  );
}
