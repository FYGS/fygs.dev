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
import { ArrowRight } from "lucide-react";

const dataStructures = [
  {
    name: "Arrays",
    category: "Linéaire",
    operations: [
      { name: "Accès", complexity: "O(1)", note: "Accès direct par index" },
      {
        name: "Insertion (début)",
        complexity: "O(n)",
        note: "Nécessite de décaler tous les éléments",
      },
      {
        name: "Insertion (fin)",
        complexity: "O(1)",
        note: "Amortie pour les tableaux dynamiques",
      },
      {
        name: "Suppression",
        complexity: "O(n)",
        note: "Nécessite de décaler les éléments",
      },
      { name: "Recherche", complexity: "O(n)", note: "Parcours linéaire" },
    ],
    useCases: [
      "Stockage séquentiel",
      "Accès rapide par index",
      "Manipulation de matrices",
    ],
    advantages: [
      "Accès rapide aux éléments",
      "Cache-friendly",
      "Pas de surcharge mémoire",
    ],
    disadvantages: [
      "Taille fixe (arrays statiques)",
      "Insertions/suppressions coûteuses",
      "Gaspillage mémoire possible",
    ],
  },
  {
    name: "Linked Lists",
    category: "Linéaire",
    operations: [
      {
        name: "Accès",
        complexity: "O(n)",
        note: "Nécessite de parcourir la liste",
      },
      {
        name: "Insertion (début)",
        complexity: "O(1)",
        note: "Modification des pointeurs uniquement",
      },
      {
        name: "Insertion (position)",
        complexity: "O(n)",
        note: "Nécessite de trouver la position",
      },
      {
        name: "Suppression",
        complexity: "O(1)",
        note: "Après avoir trouvé l'élément",
      },
      { name: "Recherche", complexity: "O(n)", note: "Parcours séquentiel" },
    ],
    useCases: ["Files et piles", "Gestion de mémoire", "Éditeur de texte"],
    advantages: [
      "Insertion/suppression efficaces",
      "Taille dynamique",
      "Pas de pré-allocation",
    ],
    disadvantages: [
      "Accès séquentiel",
      "Surcharge mémoire (pointeurs)",
      "Cache-unfriendly",
    ],
  },
  {
    name: "Hash Tables",
    category: "Non-linéaire",
    operations: [
      {
        name: "Insertion",
        complexity: "O(1)*",
        note: "En moyenne, O(n) dans le pire cas",
      },
      {
        name: "Suppression",
        complexity: "O(1)*",
        note: "En moyenne, O(n) dans le pire cas",
      },
      {
        name: "Recherche",
        complexity: "O(1)*",
        note: "En moyenne, O(n) dans le pire cas",
      },
    ],
    useCases: ["Cache de données", "Dictionnaires", "Détection de doublons"],
    advantages: [
      "Opérations très rapides en moyenne",
      "Flexibilité des clés",
      "Idéal pour les lookups",
    ],
    disadvantages: [
      "Collisions possibles",
      "Surcharge mémoire",
      "Pas d'ordre naturel",
    ],
  },
  {
    name: "Binary Trees",
    category: "Hiérarchique",
    operations: [
      {
        name: "Insertion",
        complexity: "O(log n)*",
        note: "Pour un arbre équilibré",
      },
      {
        name: "Suppression",
        complexity: "O(log n)*",
        note: "Pour un arbre équilibré",
      },
      {
        name: "Recherche",
        complexity: "O(log n)*",
        note: "Pour un arbre équilibré",
      },
    ],
    useCases: [
      "Base de données indexées",
      "Systèmes de fichiers",
      "Compression Huffman",
    ],
    advantages: [
      "Recherche efficace",
      "Maintient un ordre naturel",
      "Structure flexible",
    ],
    disadvantages: [
      "Peut devenir déséquilibré",
      "Complexité d'implémentation",
      "Surcharge mémoire",
    ],
  },
  {
    name: "Heaps",
    category: "Non-linéaire",
    operations: [
      {
        name: "Insertion",
        complexity: "O(log n)",
        note: "Remontée (heapify-up)",
      },
      {
        name: "Extract Min/Max",
        complexity: "O(log n)",
        note: "Descente (heapify-down)",
      },
      {
        name: "Peek Min/Max",
        complexity: "O(1)",
        note: "Toujours à la racine",
      },
    ],
    useCases: [
      "Files de priorité",
      "Algorithmes de tri",
      "Planification de tâches",
    ],
    advantages: [
      "Accès rapide au min/max",
      "Implémentation efficace",
      "Auto-équilibré",
    ],
    disadvantages: [
      "Pas de recherche efficace",
      "Structure rigide",
      "Limité aux opérations min/max",
    ],
  },
];

export function DataStructuresGuide() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">
          Structures de Données Fondamentales
        </h2>
        <p className="text-muted-foreground">
          Une compréhension approfondie des structures de données est
          essentielle pour concevoir des algorithmes efficaces et optimiser les
          performances.
        </p>

        <div className="grid gap-8">
          {dataStructures.map((structure) => (
            <Card key={structure.name} className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{structure.name}</h3>
                  <Badge>{structure.category}</Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Complexités des Opérations</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Opération</TableHead>
                        <TableHead>Complexité</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structure.operations.map((op) => (
                        <TableRow key={op.name}>
                          <TableCell className="font-medium">
                            {op.name}
                          </TableCell>
                          <TableCell>{op.complexity}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {op.note}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Cas d&apos;Utilisation</h4>
                    <ul className="space-y-2">
                      {structure.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 mt-1 text-primary" />
                          <span className="text-muted-foreground">
                            {useCase}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Avantages</h4>
                      <ul className="mt-2 space-y-1">
                        {structure.advantages.map((adv, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {adv}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Inconvénients</h4>
                      <ul className="mt-2 space-y-1">
                        {structure.disadvantages.map((dis, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {dis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
              • Choisissez les arrays pour des données de taille fixe avec accès
              fréquent par index
            </p>
            <p className="text-muted-foreground">
              • Préférez les listes chaînées pour des insertions/suppressions
              fréquentes
            </p>
            <p className="text-muted-foreground">
              • Utilisez les tables de hachage pour des recherches rapides par
              clé
            </p>
            <p className="text-muted-foreground">
              • Optez pour les arbres binaires quand vous avez besoin de
              maintenir un ordre
            </p>
            <p className="text-muted-foreground">
              • Choisissez les tas pour une gestion efficace des priorités
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
