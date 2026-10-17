"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { KNNVisualizer } from "./_components/knn-visualizer";
import { LinearClassifierViz } from "./_components/linear-classifier-viz";
import { ConfusionMatrixViz } from "./_components/confusion-matrix-viz";
import { algorithms, pipeline } from "./_data/content";

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
