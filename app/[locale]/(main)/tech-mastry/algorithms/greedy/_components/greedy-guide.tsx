"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Code2, Lightbulb, AlertTriangle } from "lucide-react";
import { useState } from "react";

const greedyAlgorithms = [
  {
    name: "Sélection d'Activités",
    complexity: "O(n log n)",
    description: "Sélectionner le maximum d'activités non-chevauchantes. Trier par fin, puis sélectionner gloutonement.",
    code: `function activitySelection(activities) {
  if (activities.length === 0) return [];
  // Trier par temps de fin (sur une copie, sans muter l'entrée)
  const sorted = [...activities].sort((a, b) => a.end - b.end);

  const selected = [sorted[0]];
  let lastEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start >= lastEnd) {
      selected.push(sorted[i]);
      lastEnd = sorted[i].end;
    }
  }
  
  return selected;
}`,
    whenToUse: "Problèmes d'ordonnancement, allocation de ressources",
    proof: "Le choix qui finit le plus tôt laisse le maximum de place pour les suivants.",
  },
  {
    name: "Codage de Huffman",
    complexity: "O(n log n)",
    description: "Compression de données par codage à longueur variable. Les caractères fréquents ont des codes plus courts.",
    code: `class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function buildHuffmanTree(text) {
  // Compter les fréquences
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  
  // Créer les noeuds initiaux
  const nodes = Object.entries(freq)
    .map(([char, f]) => new HuffmanNode(char, f));
  
  // Construire l'arbre (version simplifiée : le tri à chaque tour coûte
  // O(n² log n) ; avec un vrai min-heap on obtient O(n log n))
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new HuffmanNode(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    nodes.push(parent);
  }
  
  return nodes[0];
}`,
    whenToUse: "Compression de fichiers, encodage de données",
    proof: "Les caractères les moins fréquents sont les plus profonds ; fusionner à chaque étape les deux plus faibles fréquences est optimal (argument d'échange).",
  },
  {
    name: "Algorithme de Kruskal",
    complexity: "O(E log E)",
    description: "Trouver l'arbre couvrant minimum (MST) d'un graphe pondéré en ajoutant les arêtes par poids croissant.",
    code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x, y) {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }
}

function kruskal(n, edges) {
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(n);
  const mst = [];
  
  for (const edge of sortedEdges) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge);
      if (mst.length === n - 1) break;
    }
  }
  
  return mst;
}`,
    whenToUse: "Réseaux de câblage, clustering, infrastructure réseau",
    proof: "Cut property : l'arête la plus légère traversant une coupe est dans le MST.",
  },
  {
    name: "Problème du Sac à Dos Fractionnaire",
    complexity: "O(n log n)",
    description: "Maximiser la valeur dans un sac en pouvant prendre des fractions d'objets. Trier par ratio valeur/poids.",
    code: `function fractionalKnapsack(capacity, items) {
  // Trier par ratio valeur/poids décroissant
  const sorted = [...items].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  
  let totalValue = 0;
  let remaining = capacity;
  
  for (const item of sorted) {
    if (remaining <= 0) break;
    
    if (item.weight <= remaining) {
      // Prendre l'objet entier
      totalValue += item.value;
      remaining -= item.weight;
    } else {
      // Prendre une fraction
      const fraction = remaining / item.weight;
      totalValue += item.value * fraction;
      remaining = 0;
    }
  }
  
  return totalValue;
}`,
    whenToUse: "Allocation de ressources divisibles, investissements",
    proof: "Le ratio valeur/poids maximal est optimal quand les objets sont divisibles.",
  },
];

const vsDP = [
  { aspect: "Choix", greedy: "Localement optimal", dp: "Tous les sous-problèmes" },
  { aspect: "Retour en arrière", greedy: "Jamais", dp: "Explore toutes les options" },
  { aspect: "Complexité", greedy: "Souvent O(n log n)", dp: "Souvent O(n²) ou plus" },
  { aspect: "Optimal ?", greedy: "Pas toujours", dp: "Toujours (si applicable)" },
  { aspect: "Facilité", greedy: "Plus simple", dp: "Plus complexe" },
];

export function GreedyGuide() {
  const [activeAlgo, setActiveAlgo] = useState(0);

  return (
    <div className="space-y-12">
      {/* Algorithm Selector */}
      <div className="flex flex-wrap gap-2">
        {greedyAlgorithms.map((algo, i) => (
          <button
            key={algo.name}
            onClick={() => setActiveAlgo(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeAlgo === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Active Algorithm Detail */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{greedyAlgorithms[activeAlgo].name}</h2>
            <Badge variant="outline">{greedyAlgorithms[activeAlgo].complexity}</Badge>
          </div>
          <p className="text-muted-foreground">{greedyAlgorithms[activeAlgo].description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Implémentation
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
            <code>{greedyAlgorithms[activeAlgo].code}</code>
          </pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-green-500">Quand utiliser</h4>
            </div>
            <p className="text-sm text-muted-foreground">{greedyAlgorithms[activeAlgo].whenToUse}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-blue-500">Preuve d&apos;optimalité</h4>
            </div>
            <p className="text-sm text-muted-foreground">{greedyAlgorithms[activeAlgo].proof}</p>
          </div>
        </div>
      </Card>

      {/* Greedy vs DP Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          Greedy vs Programmation Dynamique
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Aspect</th>
                <th className="p-3 text-left font-semibold text-green-500">Greedy</th>
                <th className="p-3 text-left font-semibold text-blue-500">DP</th>
              </tr>
            </thead>
            <tbody>
              {vsDP.map((row) => (
                <tr key={row.aspect} className="border-b last:border-0">
                  <td className="p-3 font-medium">{row.aspect}</td>
                  <td className="p-3 text-muted-foreground">{row.greedy}</td>
                  <td className="p-3 text-muted-foreground">{row.dp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Key Takeaways */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Points clés pour les entretiens</h3>
        <ul className="space-y-2">
          {[
            "Identifiez la propriété gloutonne : le choix local mène-t-il à l'optimum global ?",
            "Prouvez l'optimalité : échange d'arguments (exchange argument) ou contradiction",
            "Vérifiez la sous-structure optimale : la solution optimale contient des sous-solutions optimales",
            "Si Greedy ne fonctionne pas, pensez DP (ex: sac à dos 0/1 → DP, fractionnaire → Greedy)",
            "Souvent, un tri selon un critère pertinent est la première étape (fin, ratio, poids...)",
          ].map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
