import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Code2, Lightbulb, AlertCircle } from "lucide-react";

const searchAlgorithms = [
  {
    name: "Recherche Linéaire",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)",
      },
      space: "O(1)",
    },
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    description: "Parcourt séquentiellement le tableau jusqu'à trouver l'élément recherché.",
    useCases: [
      "Petits tableaux",
      "Tableaux non triés",
      "Recherche unique",
    ],
    pros: ["Simple à implémenter", "Fonctionne sur données non triées", "Peu de mémoire"],
    cons: ["Inefficace pour les grands tableaux", "Temps linéaire"],
  },
  {
    name: "Recherche Binaire",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)",
      },
      space: "O(1)",
    },
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    description: "Divise répétitivement l'espace de recherche en deux pour trouver l'élément.",
    useCases: [
      "Grands tableaux triés",
      "Recherches fréquentes",
      "Optimisation de performance",
    ],
    pros: ["Très efficace (O(log n))", "Excellent pour grands tableaux", "Peu de mémoire"],
    cons: ["Nécessite un tableau trié", "Plus complexe à implémenter"],
  },
  {
    name: "Recherche par Interpolation",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(log log n)",
        worst: "O(n)",
      },
      space: "O(1)",
    },
    code: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    // Évite une division par zéro (valeurs identiques dans [low, high])
    if (arr[low] === arr[high]) {
      return arr[low] === target ? low : -1;
    }
    
    const pos = low + Math.floor(
      ((high - low) * (target - arr[low])) /
      (arr[high] - arr[low])
    );
    
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
    description: "Utilise une formule d'interpolation pour estimer la position de l'élément.",
    useCases: [
      "Données uniformément distribuées",
      "Grands tableaux triés",
      "Optimisation avancée",
    ],
    pros: ["Plus rapide que binaire pour données uniformes", "Excellent pour grands tableaux"],
    cons: ["Performance variable selon distribution", "Plus complexe", "Nécessite tableau trié"],
  },
  {
    name: "Recherche par Hachage",
    complexity: {
      time: {
        best: "O(1)",
        average: "O(1)",
        worst: "O(n)",
      },
      space: "O(n)",
    },
    code: `function hashSearch(arr, target) {
  const hashMap = new Map();
  // Construction de la table en O(n) : à faire une seule fois,
  // puis à réutiliser pour les recherches suivantes en O(1)
  for (let i = 0; i < arr.length; i++) {
    // On ne définit que si la clé est absente : on garde la PREMIÈRE occurrence
    if (!hashMap.has(arr[i])) hashMap.set(arr[i], i);
  }
  return hashMap.has(target) ? hashMap.get(target) : -1;
}`,
    description: "Utilise une table de hachage pour accéder directement aux éléments.",
    useCases: [
      "Recherches très fréquentes",
      "Grands ensembles de données",
      "Priorité à la vitesse",
    ],
    pros: ["Accès O(1) en moyenne", "Très rapide pour recherches multiples"],
    cons: ["Utilise beaucoup de mémoire", "Coût initial de construction", "Collisions possibles"],
  },
];

const optimizationTips = [
  {
    title: "Choix de l'Algorithme",
    tips: [
      "Données triées → Recherche binaire",
      "Mémoire limitée → Recherche linéaire/binaire",
      "Recherches fréquentes → Table de hachage",
      "Distribution uniforme → Recherche par interpolation",
    ],
  },
  {
    title: "Optimisations Pratiques",
    tips: [
      "Prétraiter les données si possible",
      "Utiliser des indices pour accès rapide",
      "Combiner différentes approches",
      "Considérer la structure des données",
    ],
  },
];

const commonQuestions = [
  {
    question: "Quand préférer la recherche linéaire ?",
    answer: "Pour les petits tableaux ou les recherches uniques où le coût de tri/prétraitement ne serait pas amorti.",
  },
  {
    question: "Table de hachage vs Arbre binaire ?",
    answer: "Table de hachage pour O(1) moyen mais plus de mémoire, arbre binaire de recherche équilibré pour O(log n) garanti, avec en plus l'ordre des clés et les recherches par plage.",
  },
  {
    question: "Comment gérer les doublons ?",
    answer: "Retourner le premier trouvé, tous les indices, ou utiliser une structure adaptée selon les besoins.",
  },
];

export function SearchingGuide() {
  return (
    <div className="space-y-12">
      {/* Introduction */}
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-foreground">
          <Search className="w-10 h-10 text-primary" />
          Algorithmes de Recherche
        </h1>
        <p className="text-lg text-muted-foreground">
          Les algorithmes de recherche sont essentiels pour retrouver efficacement
          des données. Chaque approche a ses forces et ses cas d&apos;utilisation
          spécifiques.
        </p>
      </div>

      {/* Algorithmes */}
      <div className="space-y-8">
        {searchAlgorithms.map((algo) => (
          <Card key={algo.name} className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{algo.name}</h2>
                <p className="text-muted-foreground mt-1">{algo.description}</p>
              </div>

              {/* Complexité */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Complexité Temporelle</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meilleur cas:</span>
                      <code className="font-mono">{algo.complexity.time.best}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cas moyen:</span>
                      <code className="font-mono">{algo.complexity.time.average}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pire cas:</span>
                      <code className="font-mono">{algo.complexity.time.worst}</code>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complexité Spatiale</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mémoire auxiliaire:</span>
                    <code className="font-mono">{algo.complexity.space}</code>
                  </div>
                </div>
              </div>

              {/* Implémentation */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Implémentation
                </h3>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
                  <code>{algo.code}</code>
                </pre>
              </div>

              {/* Cas d'utilisation */}
              <div>
                <h3 className="font-semibold mb-2">Cas d&apos;utilisation</h3>
                <div className="flex flex-wrap gap-2">
                  {algo.useCases.map((useCase, index) => (
                    <Badge key={index} variant="outline">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Badge className="bg-green-500/10 text-green-500 mb-2">
                    Avantages
                  </Badge>
                  <ul className="space-y-1">
                    {algo.pros.map((pro, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge className="bg-red-500/10 text-red-500 mb-2">
                    Inconvénients
                  </Badge>
                  <ul className="space-y-1">
                    {algo.cons.map((con, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conseils d'Optimisation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Conseils d&apos;Optimisation
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
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

      {/* Questions Fréquentes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Questions Fréquentes
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {commonQuestions.map((qa) => (
            <Card key={qa.question} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{qa.question}</h3>
                <p className="text-muted-foreground text-sm">{qa.answer}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
