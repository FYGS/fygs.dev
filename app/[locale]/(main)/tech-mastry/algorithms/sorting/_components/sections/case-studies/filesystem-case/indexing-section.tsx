import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function IndexingSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
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
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96" tabIndex={0}>
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
  );
}
