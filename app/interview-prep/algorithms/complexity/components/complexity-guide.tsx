import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Clock,
  HardDrive,
  LineChart,
  Binary,
  BarChart4,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const complexityClasses = [
  {
    name: "O(1)",
    type: "Constant",
    description: "Temps d'exécution constant, indépendant de la taille des données",
    examples: ["Accès à un élément de tableau", "Opérations arithmétiques simples"],
    realWorld: "Vérifier si un nombre est pair",
  },
  {
    name: "O(log n)",
    type: "Logarithmique",
    description: "Croissance très lente, divise le problème en parties plus petites",
    examples: ["Recherche binaire", "Certaines opérations sur les arbres équilibrés"],
    realWorld: "Rechercher un mot dans un dictionnaire",
  },
  {
    name: "O(n)",
    type: "Linéaire",
    description: "Croissance proportionnelle à la taille des données",
    examples: ["Parcours de tableau", "Recherche séquentielle"],
    realWorld: "Calculer la somme d'une liste de nombres",
  },
  {
    name: "O(n log n)",
    type: "Linéarithmique",
    description: "Légèrement plus que linéaire, typique des algorithmes efficaces",
    examples: ["Tri fusion", "Tri rapide (cas moyen)"],
    realWorld: "Trier une liste de noms",
  },
  {
    name: "O(n²)",
    type: "Quadratique",
    description: "Croissance au carré, problématique pour les grands ensembles",
    examples: ["Tri à bulles", "Comparaison de tous les éléments entre eux"],
    realWorld: "Détecter les doublons dans une liste",
  },
  {
    name: "O(2ⁿ)",
    type: "Exponentielle",
    description: "Croissance explosive, souvent impraticable",
    examples: ["Fibonacci récursif naïf", "Problème du voyageur de commerce"],
    realWorld: "Générer toutes les combinaisons possibles",
  },
];

const optimizationTips = [
  {
    title: "Structures de Données",
    tips: [
      "Utilisez des HashMaps pour O(1) d'accès moyen",
      "Préférez les tableaux pour l'accès séquentiel",
      "Utilisez des arbres équilibrés pour la recherche",
    ],
  },
  {
    title: "Algorithmes",
    tips: [
      "Évitez les boucles imbriquées inutiles",
      "Utilisez 'diviser pour régner' quand possible",
      "Considérez la programmation dynamique",
    ],
  },
  {
    title: "Mémoire",
    tips: [
      "Privilégiez les solutions in-place",
      "Attention aux copies inutiles",
      "Gérez les fuites de mémoire",
    ],
  },
];

const commonMistakes = [
  {
    mistake: "Ignorer les constantes",
    explanation:
      "Bien que O(100n) soit O(n), les constantes peuvent avoir un impact significatif sur les performances réelles.",
  },
  {
    mistake: "Oublier l'espace",
    explanation:
      "La complexité spatiale est aussi importante que la complexité temporelle, surtout avec les contraintes mémoire.",
  },
  {
    mistake: "Sur-optimisation",
    explanation:
      "Parfois, une solution O(n log n) plus simple est préférable à une solution O(n) complexe et sujette aux erreurs.",
  },
];

const practicalExamples = [
  {
    problem: "Trouver un élément dans un tableau trié",
    solutions: [
      {
        name: "Recherche linéaire",
        complexity: "O(n)",
        code: "for (let i = 0; i < arr.length; i++) if (arr[i] === target) return i;",
        pros: "Simple à implémenter",
        cons: "Inefficace pour les grands tableaux",
      },
      {
        name: "Recherche binaire",
        complexity: "O(log n)",
        code: "let l = 0, r = arr.length - 1;\nwhile (l <= r) {\n  let m = (l + r) / 2;\n  if (arr[m] === target) return m;\n  if (arr[m] < target) l = m + 1;\n  else r = m - 1;\n}",
        pros: "Très efficace pour les grands tableaux",
        cons: "Nécessite un tableau trié",
      },
    ],
  },
  {
    problem: "Trouver des doublons",
    solutions: [
      {
        name: "Double boucle",
        complexity: "O(n²)",
        code: "for (let i = 0; i < arr.length; i++)\n  for (let j = i + 1; j < arr.length; j++)\n    if (arr[i] === arr[j]) return true;",
        pros: "Pas de mémoire supplémentaire",
        cons: "Très lent pour les grands tableaux",
      },
      {
        name: "HashSet",
        complexity: "O(n)",
        code: "const seen = new Set();\nfor (const num of arr) {\n  if (seen.has(num)) return true;\n  seen.add(num);\n}",
        pros: "Rapide et efficace",
        cons: "Utilise O(n) d'espace supplémentaire",
      },
    ],
  },
];

export function ComplexityGuide() {
  return (
    <div className="space-y-12">
      {/* Introduction */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-foreground">
          <LineChart className="w-10 h-10 text-primary" />
          Complexité Algorithmique
        </h1>
        <p className="text-lg text-muted-foreground">
          La complexité algorithmique est un concept fondamental en programmation qui
          mesure l&apos;efficacité d&apos;un algorithme en termes de temps d&apos;exécution
          et d&apos;espace mémoire utilisé. Comprendre et analyser la complexité est
          crucial pour développer des solutions performantes.
        </p>
      </div>

      {/* Classes de Complexité */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart4 className="w-6 h-6" />
          Classes de Complexité
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-1/3">Description</TableHead>
                <TableHead>Exemples</TableHead>
                <TableHead>Cas Pratique</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complexityClasses.map((complexity) => (
                <TableRow key={complexity.name}>
                  <TableCell className="font-mono font-bold">
                    {complexity.name}
                  </TableCell>
                  <TableCell>{complexity.type}</TableCell>
                  <TableCell>{complexity.description}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside space-y-1">
                      {complexity.examples.map((example, index) => (
                        <li key={index} className="text-sm">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{complexity.realWorld}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Conseils d'Optimisation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Binary className="w-6 h-6" />
          Conseils d&apos;Optimisation
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {optimizationTips.map((section) => (
            <Card key={section.title} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Erreurs Courantes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Erreurs Courantes
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {commonMistakes.map((mistake) => (
            <Card key={mistake.mistake} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-red-500">{mistake.mistake}</h3>
                <p className="text-muted-foreground text-sm">
                  {mistake.explanation}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Exemples Pratiques */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Exemples Pratiques
        </h2>
        <div className="space-y-8">
          {practicalExamples.map((example) => (
            <Card key={example.problem} className="p-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{example.problem}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {example.solutions.map((solution) => (
                    <div key={solution.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{solution.name}</h4>
                        <Badge variant="outline" className="font-mono">
                          {solution.complexity}
                        </Badge>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{solution.code}</code>
                      </pre>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Badge className="bg-green-500/10 text-green-500">
                            Avantages
                          </Badge>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {solution.pros}
                          </p>
                        </div>
                        <div>
                          <Badge className="bg-red-500/10 text-red-500">
                            Inconvénients
                          </Badge>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {solution.cons}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <Card className="p-6 bg-muted">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Conseils Pro</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>
                • Commencez toujours par une solution qui fonctionne, même si elle
                n&apos;est pas optimale. Vous pourrez l&apos;optimiser ensuite.
              </p>
              <p>
                • Lors de l&apos;analyse de complexité, concentrez-vous sur le cas le
                plus défavorable (worst case) sauf indication contraire.
              </p>
              <p>
                • N&apos;oubliez pas que la lisibilité du code est souvent plus
                importante qu&apos;une optimisation marginale.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
