import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export function CacheSection({ copiedCode, copyCode }: {
  copiedCode: string | null;
  copyCode: (code: string, id: string) => void;
}) {
  return (
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
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96" tabIndex={0}>
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

        <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800">
          <h4 className="text-sm font-medium text-blue-300 mb-2">
            Applications dans les CDN et serveurs de cache
          </h4>
          <p className="text-sm text-blue-400">
            Les CDN (Content Delivery Networks) comme{" "}
            <strong>Cloudflare</strong> et <strong>Akamai</strong>{" "}
            utilisent des algorithmes de tri sophistiqués pour gérer leur
            cache. Ces algorithmes prennent en compte non seulement la
            fréquence d&apos;accès, mais aussi d&apos;autres facteurs
            comme la taille des fichiers, le coût de génération et la
            localisation géographique.
          </p>
          <p className="text-sm text-blue-400 mt-2">
            <strong>Redis</strong>, un serveur de cache populaire,
            implémente plusieurs politiques de remplacement basées sur des
            algorithmes de tri, notamment LRU (Least Recently Used) et LFU
            (Least Frequently Used), approximées par échantillonnage de
            clés pour minimiser l&apos;impact sur les performances.
          </p>
        </div>
      </div>
    </TabsContent>
  );
}
