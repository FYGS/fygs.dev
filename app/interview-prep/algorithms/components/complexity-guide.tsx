import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const complexityExamples = [
  {
    name: "O(1) - Constant",
    description:
      "Temps d'exécution constant, indépendant de la taille des données",
    examples: [
      "Accès à un élément d'un tableau par index",
      "Opérations arithmétiques simples",
    ],
    realWorld: "Vérification du premier élément d'une liste",
  },
  {
    name: "O(log n) - Logarithmique",
    description:
      "Le temps d'exécution augmente de façon logarithmique avec la taille des données",
    examples: ["Recherche binaire", "Parcours d'un arbre binaire équilibré"],
    realWorld: "Recherche dans un annuaire téléphonique",
  },
  {
    name: "O(n) - Linéaire",
    description:
      "Le temps d'exécution augmente linéairement avec la taille des données",
    examples: ["Parcours d'un tableau", "Recherche séquentielle"],
    realWorld: "Lecture d'une liste d'emails",
  },
  {
    name: "O(n log n) - Linéarithmique",
    description: "Combine les caractéristiques linéaire et logarithmique",
    examples: ["Merge Sort", "Quick Sort", "Heap Sort"],
    realWorld: "Tri d'une grande base de données",
  },
  {
    name: "O(n²) - Quadratique",
    description:
      "Le temps d'exécution augmente au carré de la taille des données",
    examples: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
    realWorld: "Comparaison de tous les éléments entre eux",
  },
  {
    name: "O(2ⁿ) - Exponentiel",
    description:
      "Le temps d'exécution double pour chaque élément supplémentaire",
    examples: ["Fibonacci récursif naïf", "Tour de Hanoi"],
    realWorld: "Résolution du problème du voyageur de commerce par force brute",
  },
];

const spaceComplexityExamples = [
  {
    type: "In-Place",
    description: "Algorithmes utilisant O(1) espace supplémentaire",
    examples: ["Quick Sort", "Bubble Sort", "Cycle Sort"],
  },
  {
    type: "Linear Space",
    description: "Algorithmes utilisant O(n) espace supplémentaire",
    examples: ["Merge Sort", "Création d'une nouvelle liste"],
  },
  {
    type: "Recursive",
    description: "Utilisation de la pile d'appels",
    examples: ["DFS récursif", "Fibonacci récursif"],
  },
];

export function ComplexityGuide() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité Temporelle</h2>
        <p className="text-muted-foreground">
          La complexité temporelle mesure comment le temps d&apos;exécution
          d&apos;un algorithme augmente en fonction de la taille des données
          d&apos;entrée.
        </p>

        <div className="grid gap-6">
          {complexityExamples.map((complexity) => (
            <Card key={complexity.name} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{complexity.name}</h3>
                  <Badge variant="secondary" className="text-sm">
                    Complexité
                  </Badge>
                </div>

                <p className="text-muted-foreground">
                  {complexity.description}
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium">Exemples courants :</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {complexity.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-medium">Application réelle :</h4>
                  <p className="text-muted-foreground">
                    {complexity.realWorld}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité Spatiale</h2>
        <p className="text-muted-foreground">
          La complexité spatiale mesure la quantité de mémoire supplémentaire
          nécessaire à l&apos;exécution d&apos;un algorithme.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Exemples</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spaceComplexityExamples.map((example) => (
              <TableRow key={example.type}>
                <TableCell className="font-medium">{example.type}</TableCell>
                <TableCell>{example.description}</TableCell>
                <TableCell>{example.examples.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Conseils d&apos;Optimisation</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              • Privilégiez les algorithmes in-place quand la mémoire est
              limitée
            </p>
            <p className="text-muted-foreground">
              • Évitez la récursion pour les entrées très grandes (risque de
              stack overflow)
            </p>
            <p className="text-muted-foreground">
              • Utilisez des structures de données appropriées (HashSet pour la
              recherche O(1))
            </p>
            <p className="text-muted-foreground">
              • Faites attention aux copies inutiles de données
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
