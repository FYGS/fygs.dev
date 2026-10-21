import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function ApiSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
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
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96" tabIndex={0}>
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

        <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
          <h4 className="text-sm font-medium text-blue-300 mb-2">
            Bonnes pratiques pour le tri dans les API
          </h4>
          <p className="text-sm text-blue-400">
            Pour les grandes collections de données, il est recommandé
            d&apos;utiliser des index de base de données pour optimiser
            les opérations de tri. Par exemple, avec MongoDB :
          </p>
          <div className="relative mt-2">
            <pre className="bg-blue-900/50 p-3 rounded-lg text-xs overflow-x-auto" tabIndex={0}>
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
  );
}
