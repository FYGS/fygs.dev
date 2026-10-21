import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const searchAlgorithms = [
  {
    name: "Recherche Linéaire",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)"
      },
      space: "O(1)"
    },
    characteristics: [
      "Parcours séquentiel des éléments",
      "Fonctionne sur des données non triées",
      "Simple à implémenter",
      "Efficace pour les petits ensembles"
    ],
    advantages: [
      "Fonctionne sur n'importe quel type de données",
      "Aucun prérequis sur l'ordre des données",
      "Utilisation minimale de mémoire",
      "Simple à comprendre et à maintenir"
    ],
    disadvantages: [
      "Inefficace pour les grands ensembles",
      "Temps de recherche linéaire",
      "Ne profite pas des données triées"
    ],
    code: `function linearSearch<T>(arr: T[], target: T): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`
  },
  {
    name: "Recherche Binaire",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)"
      },
      space: "O(1)"
    },
    characteristics: [
      "Nécessite des données triées",
      "Divise l'espace de recherche par 2 à chaque étape",
      "Très efficace pour les grands ensembles",
      "Peut être implémentée de façon itérative ou récursive"
    ],
    advantages: [
      "Très efficace sur les grands ensembles",
      "Complexité logarithmique",
      "Utilisation minimale de mémoire",
      "Idéal pour les recherches fréquentes"
    ],
    disadvantages: [
      "Nécessite des données triées",
      "Plus complexe à implémenter",
      "Moins efficace que la recherche linéaire pour les petits ensembles"
    ],
    code: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`
  },
  {
    name: "Recherche par Interpolation",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log log n)",
        worst: "O(n)"
      },
      space: "O(1)"
    },
    characteristics: [
      "Version améliorée de la recherche binaire",
      "Utilise la distribution uniforme des données",
      "Meilleure estimation de la position",
      "Idéale pour les données uniformément distribuées"
    ],
    advantages: [
      "Plus rapide que la recherche binaire pour des données uniformes",
      "Complexité moyenne excellente",
      "Utilisation minimale de mémoire"
    ],
    disadvantages: [
      "Nécessite des données triées et uniformes",
      "Performances variables selon la distribution",
      "Plus complexe à implémenter"
    ],
    code: `function interpolationSearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      return arr[low] === target ? low : -1;
    }

    // Calcul de la position probable
    const pos = low + Math.floor(
      ((high - low) * (target - arr[low])) / 
      (arr[high] - arr[low])
    );

    if (arr[pos] === target) {
      return pos;
    }

    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  return -1;
}`
  },
  {
    name: "Recherche par Saut (Jump Search)",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(√n)",
        worst: "O(√n)"
      },
      space: "O(1)"
    },
    characteristics: [
      "Combine recherche linéaire et par blocs",
      "Nécessite des données triées",
      "Saute des blocs de taille √n",
      "Alternative entre recherche binaire et linéaire"
    ],
    advantages: [
      "Plus rapide que la recherche linéaire",
      "Plus simple que la recherche binaire",
      "Bon pour les grandes listes triées",
      "Efficace pour les données sur disque"
    ],
    disadvantages: [
      "Moins efficace que la recherche binaire",
      "Nécessite des données triées",
      "Sensible à la taille du saut"
    ],
    code: `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  
  // Trouver le bloc
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  
  // Recherche linéaire dans le bloc
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  
  if (arr[prev] === target) return prev;
  
  return -1;
}`
  }
];

export function SearchAlgorithms() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Algorithmes de Recherche</h2>
        <p className="text-muted-foreground">
          Les algorithmes de recherche sont essentiels pour retrouver efficacement 
          des données dans différentes structures.
        </p>

        <div className="grid gap-8">
          {searchAlgorithms.map((algo) => (
            <Card key={algo.name} className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{algo.name}</h3>
                  <Badge variant="outline">Algorithme de Recherche</Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Complexité</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cas</TableHead>
                        <TableHead>Temps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Meilleur</TableCell>
                        <TableCell>{algo.complexity.time.best}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Moyen</TableCell>
                        <TableCell>{algo.complexity.time.average}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pire</TableCell>
                        <TableCell>{algo.complexity.time.worst}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Espace</TableCell>
                        <TableCell>{algo.complexity.space}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Caractéristiques</h4>
                  <ul className="space-y-1">
                    {algo.characteristics.map((char, index) => (
                      <li key={index} className="text-muted-foreground">• {char}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Avantages</h4>
                    <ul className="space-y-1">
                      {algo.advantages.map((adv, index) => (
                        <li key={index} className="text-muted-foreground">• {adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Inconvénients</h4>
                    <ul className="space-y-1">
                      {algo.disadvantages.map((dis, index) => (
                        <li key={index} className="text-muted-foreground">• {dis}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Implémentation</h4>
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto" tabIndex={0}>
                    <code className="text-sm">{algo.code}</code>
                  </pre>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Conseils de Choix</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              • Utilisez la recherche linéaire pour les petits ensembles ou les données non triées
            </p>
            <p className="text-muted-foreground">
              • Préférez la recherche binaire pour les grands ensembles triés avec accès aléatoire
            </p>
            <p className="text-muted-foreground">
              • Optez pour la recherche par interpolation si les données sont uniformément distribuées
            </p>
            <p className="text-muted-foreground">
              • Choisissez la recherche par saut pour un bon compromis entre simplicité et performance
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
