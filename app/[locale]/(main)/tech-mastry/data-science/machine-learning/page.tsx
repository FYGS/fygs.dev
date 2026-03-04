"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, GitBranch, BarChart3 } from "lucide-react";

/* ─────────── KNN Visualizer ─────────── */
function KNNVisualizer() {
  const [k, setK] = useState(3);
  const [queryPt, setQueryPt] = useState({ x: 55, y: 45 });

  const dataPoints = useMemo(
    () => [
      { x: 20, y: 30, cls: "A" },
      { x: 25, y: 45, cls: "A" },
      { x: 15, y: 60, cls: "A" },
      { x: 30, y: 25, cls: "A" },
      { x: 35, y: 50, cls: "A" },
      { x: 22, y: 70, cls: "A" },
      { x: 28, y: 55, cls: "A" },
      { x: 18, y: 40, cls: "A" },
      { x: 70, y: 30, cls: "B" },
      { x: 75, y: 50, cls: "B" },
      { x: 80, y: 25, cls: "B" },
      { x: 65, y: 60, cls: "B" },
      { x: 85, y: 40, cls: "B" },
      { x: 72, y: 65, cls: "B" },
      { x: 78, y: 35, cls: "B" },
      { x: 68, y: 45, cls: "B" },
      { x: 45, y: 75, cls: "C" },
      { x: 50, y: 80, cls: "C" },
      { x: 55, y: 70, cls: "C" },
      { x: 40, y: 85, cls: "C" },
      { x: 48, y: 68, cls: "C" },
      { x: 52, y: 78, cls: "C" },
    ],
    [],
  );

  const distances = useMemo(() => {
    return dataPoints
      .map((p, i) => ({
        ...p,
        idx: i,
        dist: Math.sqrt((p.x - queryPt.x) ** 2 + (p.y - queryPt.y) ** 2),
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [dataPoints, queryPt]);

  const neighbors = distances.slice(0, k);
  const counts: Record<string, number> = {};
  neighbors.forEach((n) => {
    counts[n.cls] = (counts[n.cls] || 0) + 1;
  });
  const prediction =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "?";

  const clsColor: Record<string, string> = {
    A: "fill-blue-500",
    B: "fill-red-500",
    C: "fill-green-500",
  };
  const predColor: Record<string, string> = {
    A: "text-blue-500",
    B: "text-red-500",
    C: "text-green-500",
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Target className="w-5 h-5 text-amber-500" />
        K-Nearest Neighbors (KNN)
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">K = {k}</label>
          <input
            type="range"
            min="1"
            max="9"
            step="2"
            value={k}
            onChange={(e) => setK(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Position X: {queryPt.x}
          </label>
          <input
            type="range"
            min="5"
            max="95"
            value={queryPt.x}
            onChange={(e) => setQueryPt((p) => ({ ...p, x: +e.target.value }))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-48 bg-muted/20 rounded-lg border border-border/20"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setQueryPt({ x: Math.round(x), y: Math.round(y) });
        }}
      >
        {/* Neighbor lines */}
        {neighbors.map((n) => (
          <line
            key={n.idx}
            x1={queryPt.x * 3.8 + 10}
            y1={queryPt.y * 1.8 + 10}
            x2={n.x * 3.8 + 10}
            y2={n.y * 1.8 + 10}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="4"
            opacity="0.4"
          />
        ))}
        {/* Data points */}
        {dataPoints.map((p, i) => {
          const isNeighbor = neighbors.some((n) => n.idx === i);
          return (
            <circle
              key={i}
              cx={p.x * 3.8 + 10}
              cy={p.y * 1.8 + 10}
              r={isNeighbor ? 7 : 5}
              className={`${clsColor[p.cls]} ${isNeighbor ? "opacity-100" : "opacity-40"}`}
              strokeWidth={isNeighbor ? 2 : 0}
              stroke="hsl(var(--foreground))"
            />
          );
        })}
        {/* Query point */}
        <circle
          cx={queryPt.x * 3.8 + 10}
          cy={queryPt.y * 1.8 + 10}
          r="8"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />
        <text
          x={queryPt.x * 3.8 + 10}
          y={queryPt.y * 1.8 - 2}
          textAnchor="middle"
          className="fill-primary text-[10px] font-bold"
        >
          ?
        </text>
      </svg>

      <div className="flex items-center gap-4">
        <span className="text-sm">Prédiction :</span>
        <Badge className={`${predColor[prediction]} text-sm`}>
          Classe {prediction}
        </Badge>
        <span className="text-xs text-muted-foreground">
          (votes : {JSON.stringify(counts)})
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Cliquez sur le graphique pour déplacer le point de requête
      </p>
    </Card>
  );
}

/* ─────────── Decision Boundary (Linear) ─────────── */
function LinearClassifierViz() {
  const [bias, setBias] = useState(50);
  const [slope, setSlope] = useState(0);

  const points = useMemo(
    () => [
      { x: 15, y: 25 },
      { x: 20, y: 35 },
      { x: 25, y: 20 },
      { x: 30, y: 40 },
      { x: 22, y: 30 },
      { x: 18, y: 45 },
      { x: 28, y: 28 },
      { x: 65, y: 70 },
      { x: 70, y: 60 },
      { x: 75, y: 80 },
      { x: 80, y: 65 },
      { x: 72, y: 75 },
      { x: 78, y: 55 },
      { x: 68, y: 68 },
    ],
    [],
  );

  const classify = (p: { x: number; y: number }) => {
    return p.y > bias + (slope * (p.x - 50)) / 10 ? 1 : 0;
  };

  const correct = points.filter(
    (p, i) => classify(p) === (i < 7 ? 0 : 1),
  ).length;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <GitBranch className="w-5 h-5 text-violet-500" />
        Frontière de décision linéaire
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Biais: {bias}</label>
          <input
            type="range"
            min="10"
            max="90"
            value={bias}
            onChange={(e) => setBias(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Pente: {slope}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={slope}
            onChange={(e) => setSlope(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-44 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Decision boundary */}
        <line
          x1="10"
          y1={(bias + (slope * -50) / 10) * 1.8 + 10}
          x2="390"
          y2={(bias + (slope * 50) / 10) * 1.8 + 10}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="6"
        />
        {/* Points */}
        {points.map((p, i) => {
          const isCorrect = classify(p) === (i < 7 ? 0 : 1);
          return (
            <g key={i}>
              <circle
                cx={p.x * 3.8 + 10}
                cy={p.y * 1.8 + 10}
                r="6"
                className={i < 7 ? "fill-blue-500" : "fill-red-500"}
                opacity={isCorrect ? 1 : 0.3}
                strokeWidth={isCorrect ? 0 : 2}
                stroke="hsl(var(--foreground))"
              />
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-3">
        <Badge variant="outline">
          Précision : {Math.round((correct / points.length) * 100)}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          {correct}/{points.length} correctement classé(s)
        </span>
      </div>
    </Card>
  );
}

/* ─────────── Confusion Matrix ─────────── */
function ConfusionMatrixViz() {
  const [tp, setTp] = useState(85);
  const [fp, setFp] = useState(10);
  const [fn, setFn] = useState(15);
  const [tn, setTn] = useState(90);

  const total = tp + fp + fn + tn;
  const accuracy = (((tp + tn) / total) * 100).toFixed(1);
  const precision = ((tp / (tp + fp)) * 100).toFixed(1);
  const recall = ((tp / (tp + fn)) * 100).toFixed(1);
  const f1 = ((2 * +precision * +recall) / (+precision + +recall)).toFixed(1);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="w-5 h-5 text-cyan-500" />
        Matrice de Confusion
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "TP (Vrais Positifs)",
            val: tp,
            set: setTp,
            color: "bg-green-500/20 border-green-500/30",
          },
          {
            label: "FP (Faux Positifs)",
            val: fp,
            set: setFp,
            color: "bg-red-500/20 border-red-500/30",
          },
          {
            label: "FN (Faux Négatifs)",
            val: fn,
            set: setFn,
            color: "bg-orange-500/20 border-orange-500/30",
          },
          {
            label: "TN (Vrais Négatifs)",
            val: tn,
            set: setTn,
            color: "bg-blue-500/20 border-blue-500/30",
          },
        ].map((c) => (
          <div key={c.label} className="space-y-1">
            <label className="text-[10px] text-muted-foreground">
              {c.label}: {c.val}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={c.val}
              onChange={(e) => c.set(+e.target.value)}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      {/* Matrix visualization */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-1 text-center">
          <div className="px-6 py-4 rounded-tl-lg bg-green-500/20 border border-green-500/20">
            <div className="text-2xl font-bold">{tp}</div>
            <div className="text-[10px] text-muted-foreground">VP</div>
          </div>
          <div className="px-6 py-4 rounded-tr-lg bg-red-500/20 border border-red-500/20">
            <div className="text-2xl font-bold">{fp}</div>
            <div className="text-[10px] text-muted-foreground">FP</div>
          </div>
          <div className="px-6 py-4 rounded-bl-lg bg-orange-500/20 border border-orange-500/20">
            <div className="text-2xl font-bold">{fn}</div>
            <div className="text-[10px] text-muted-foreground">FN</div>
          </div>
          <div className="px-6 py-4 rounded-br-lg bg-blue-500/20 border border-blue-500/20">
            <div className="text-2xl font-bold">{tn}</div>
            <div className="text-[10px] text-muted-foreground">VN</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Accuracy", val: accuracy },
          { label: "Precision", val: precision },
          { label: "Recall", val: recall },
          { label: "F1-Score", val: f1 },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center"
          >
            <div className="text-lg font-bold text-primary">{m.val}%</div>
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── Main Page ─────────── */
const algorithms = [
  {
    name: "Régression Linéaire",
    type: "Supervisé",
    task: "Régression",
    complexity: "O(n·d)",
    pros: "Simple, interprétable",
    cons: "Linéarité assumée",
  },
  {
    name: "Régression Logistique",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n·d)",
    pros: "Probabiliste, rapide",
    cons: "Frontière linéaire",
  },
  {
    name: "KNN",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(n·d)",
    pros: "Pas d'entraînement",
    cons: "Lent en prédiction",
  },
  {
    name: "Decision Tree",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(n·d·log n)",
    pros: "Interprétable",
    cons: "Overfitting facile",
  },
  {
    name: "Random Forest",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(k·n·d·log n)",
    pros: "Robust, ensemble",
    cons: "Boîte noire",
  },
  {
    name: "SVM",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n²·d)",
    pros: "Marges maximales",
    cons: "Lent sur gros data",
  },
  {
    name: "K-Means",
    type: "Non-supervisé",
    task: "Clustering",
    complexity: "O(n·k·d·i)",
    pros: "Simple, scalable",
    cons: "K à choisir",
  },
  {
    name: "PCA",
    type: "Non-supervisé",
    task: "Réduction dim.",
    complexity: "O(d²·n)",
    pros: "Réduit bruit",
    cons: "Perd interprétabilité",
  },
  {
    name: "XGBoost",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(k·n·d·log n)",
    pros: "État de l'art",
    cons: "Hyperparamètres",
  },
  {
    name: "Naive Bayes",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n·d)",
    pros: "Très rapide",
    cons: "Indépendance assumée",
  },
];

const pipeline = [
  { step: "1. Collecte", desc: "Données brutes, API, CSV, bases de données" },
  {
    step: "2. EDA",
    desc: "Exploration, visualisations, statistiques descriptives",
  },
  {
    step: "3. Preprocessing",
    desc: "Nettoyage, encoding, scaling, feature engineering",
  },
  {
    step: "4. Splitting",
    desc: "Train / Validation / Test (70/15/15 ou cross-validation)",
  },
  {
    step: "5. Entraînement",
    desc: "Sélection d'algorithme, GridSearchCV, hyperparamètres",
  },
  {
    step: "6. Évaluation",
    desc: "Métriques, courbe ROC, matrice de confusion",
  },
  { step: "7. Déploiement", desc: "Sérialisation du modèle, API, monitoring" },
];

export default function MachineLearningPage() {
  const [algoFilter, setAlgoFilter] = useState<
    "all" | "Supervisé" | "Non-supervisé"
  >("all");

  const filtered =
    algoFilter === "all"
      ? algorithms
      : algorithms.filter((a) => a.type === algoFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Brain className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
          Machine Learning
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Des algorithmes fondamentaux aux pipelines de production. Supervisé,
          non-supervisé, évaluation de modèles — maîtrisez les concepts clés
          avec des démos interactives.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <KNNVisualizer />
        <div className="grid md:grid-cols-2 gap-6">
          <LinearClassifierViz />
          <ConfusionMatrixViz />
        </div>
      </section>

      {/* ML Pipeline */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Pipeline ML complet</h2>
        <div className="grid md:grid-cols-7 gap-2">
          {pipeline.map((s) => (
            <Card
              key={s.step}
              className="p-3 text-center hover:border-primary/30 transition-all space-y-1"
            >
              <div className="text-xs font-semibold text-primary">{s.step}</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Algorithms Comparison */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Algorithmes — Comparaison</h2>
          <div className="flex gap-2">
            {(["all", "Supervisé", "Non-supervisé"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAlgoFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs border ${algoFilter === f ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
              >
                {f === "all" ? "Tous" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-3 py-2 text-left font-semibold">
                  Algorithme
                </th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Tâche</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Complexité
                </th>
                <th className="px-3 py-2 text-left font-semibold text-green-400">
                  Avantages
                </th>
                <th className="px-3 py-2 text-left font-semibold text-red-400">
                  Limites
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.name}
                  className="border-t border-border/20 hover:bg-muted/20"
                >
                  <td className="px-3 py-2 font-medium">{a.name}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px]">
                      {a.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {a.task}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {a.complexity}
                  </td>
                  <td className="px-3 py-2 text-xs text-green-400">{a.pros}</td>
                  <td className="px-3 py-2 text-xs text-red-400">{a.cons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scikit-learn Code */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Scikit-learn — Pipeline complet</h2>
        <Card className="p-5">
          <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
            {`from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# 1. Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 2. Pipeline
pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(random_state=42))
])

# 3. Grid Search
params = {"clf__n_estimators": [100, 200], "clf__max_depth": [5, 10, None]}
grid = GridSearchCV(pipe, params, cv=5, scoring="f1_weighted", n_jobs=-1)
grid.fit(X_train, y_train)

# 4. Evaluation
print(f"Best params: {grid.best_params_}")
print(f"Best CV score: {grid.best_score_:.3f}")
y_pred = grid.predict(X_test)
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))`}
          </pre>
        </Card>
      </section>
    </div>
  );
}
