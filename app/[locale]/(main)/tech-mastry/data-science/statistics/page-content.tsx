"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sigma, TrendingUp, Shuffle } from "lucide-react";

/* ─────────── NormalDistribution Visualizer ─────────── */
function NormalDistributionViz() {
  const [mean, setMean] = useState(50);
  const [stdDev, setStdDev] = useState(10);

  const pdf = useCallback(
    (x: number) => {
      const exp = -0.5 * ((x - mean) / stdDev) ** 2;
      return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.E ** exp;
    },
    [mean, stdDev],
  );

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let x = 0; x <= 100; x += 0.5) {
      pts.push({ x, y: pdf(x) });
    }
    return pts;
  }, [pdf]);

  const maxY = Math.max(...points.map((p) => p.y));

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Distribution Normale (Gaussienne)
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Moyenne (μ): {mean}
          </label>
          <input
            type="range"
            min="10"
            max="90"
            value={mean}
            onChange={(e) => setMean(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Écart-type (σ): {stdDev}
          </label>
          <input
            type="range"
            min="3"
            max="25"
            value={stdDev}
            onChange={(e) => setStdDev(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 400 180"
        className="w-full h-44 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Zones sigma */}
        <rect
          x={((mean - stdDev) / 100) * 380 + 10}
          y="10"
          width={((2 * stdDev) / 100) * 380}
          height="150"
          fill="hsl(var(--primary))"
          opacity="0.08"
          rx="2"
        />
        <rect
          x={((mean - 2 * stdDev) / 100) * 380 + 10}
          y="10"
          width={((4 * stdDev) / 100) * 380}
          height="150"
          fill="hsl(var(--primary))"
          opacity="0.04"
          rx="2"
        />

        {/* Curve */}
        <polyline
          points={points
            .map((p) => `${(p.x / 100) * 380 + 10},${160 - (p.y / maxY) * 140}`)
            .join(" ")}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
        />

        {/* Mean line */}
        <line
          x1={(mean / 100) * 380 + 10}
          y1="10"
          x2={(mean / 100) * 380 + 10}
          y2="160"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="4"
        />
        <text
          x={(mean / 100) * 380 + 10}
          y="175"
          textAnchor="middle"
          className="fill-primary text-[10px]"
        >
          μ={mean}
        </text>

        {/* Sigma markers */}
        {[-2, -1, 1, 2].map((k) => {
          const xPos = ((mean + k * stdDev) / 100) * 380 + 10;
          if (xPos < 10 || xPos > 390) return null;
          return (
            <g key={k}>
              <line
                x1={xPos}
                y1="155"
                x2={xPos}
                y2="165"
                stroke="currentColor"
                strokeOpacity="0.3"
              />
              <text
                x={xPos}
                y="175"
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {k > 0 ? `+${k}σ` : `${k}σ`}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-xs text-muted-foreground">68.2%</div>
          <div className="text-sm font-semibold">μ ± 1σ</div>
        </div>
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-xs text-muted-foreground">95.4%</div>
          <div className="text-sm font-semibold">μ ± 2σ</div>
        </div>
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-xs text-muted-foreground">99.7%</div>
          <div className="text-sm font-semibold">μ ± 3σ</div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────── HypothesisTest Visualizer ─────────── */
function HypothesisTestViz() {
  const [alpha, setAlpha] = useState(0.05);
  const [pValue, setPValue] = useState(0.03);
  const reject = pValue < alpha;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Sigma className="w-5 h-5 text-green-500" />
        Test d&#39;Hypothèse Interactif
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Seuil α : {alpha.toFixed(2)}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={alpha * 100}
            onChange={(e) => setAlpha(+e.target.value / 100)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            p-value : {pValue.toFixed(3)}
          </label>
          <input
            type="range"
            min="1"
            max="500"
            value={pValue * 1000}
            onChange={(e) => setPValue(+e.target.value / 1000)}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border-2 text-center ${reject ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}
      >
        <div className="text-lg font-bold">
          {reject ? "❌ Rejet de H₀" : "✅ On ne rejette pas H₀"}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          p-value ({pValue.toFixed(3)}) {reject ? "<" : "≥"} α (
          {alpha.toFixed(2)}) →{" "}
          {reject
            ? "Résultat statistiquement significatif"
            : "Pas assez de preuves pour rejeter H₀"}
        </p>
      </div>

      {/* Visual scale */}
      <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-red-500/20 rounded-l-full"
          style={{ width: `${alpha * 100}%` }}
        />
        <div
          className="absolute inset-y-0 bg-green-500/20 rounded-r-full"
          style={{ left: `${alpha * 100}%`, right: 0 }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary"
          style={{ left: `${pValue * 100}%` }}
        />
        <div
          className="absolute -top-5 text-[10px] text-primary font-medium"
          style={{ left: `${pValue * 100}%`, transform: "translateX(-50%)" }}
        >
          p
        </div>
        <div
          className="absolute -bottom-5 text-[10px] text-muted-foreground"
          style={{ left: `${alpha * 100}%`, transform: "translateX(-50%)" }}
        >
          α
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
          <div className="text-xs font-semibold">H₀ (Hypothèse nulle)</div>
          <p className="text-xs text-muted-foreground">
            Pas de différence significative entre les groupes
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
          <div className="text-xs font-semibold">
            H₁ (Hypothèse alternative)
          </div>
          <p className="text-xs text-muted-foreground">
            Il existe une différence significative
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ─────────── Correlation Visualizer ─────────── */
function CorrelationViz() {
  const [r, setR] = useState(0.85);

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const seed = 42;
    for (let i = 0; i < 40; i++) {
      const x = 10 + (i / 40) * 80;
      const noise = Math.sin(seed + i * 3.7) * (1 - Math.abs(r)) * 40;
      const y =
        r > 0
          ? 90 - (x - 10) * 0.8 * r + noise
          : 10 + (x - 10) * 0.8 * Math.abs(r) + noise;
      pts.push({ x, y: Math.max(5, Math.min(95, y)) });
    }
    return pts;
  }, [r]);

  const rLabel =
    Math.abs(r) > 0.7 ? "Forte" : Math.abs(r) > 0.3 ? "Modérée" : "Faible";

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Shuffle className="w-5 h-5 text-purple-500" />
        Corrélation (Pearson)
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          r = {r.toFixed(2)} — Corrélation {rLabel}{" "}
          {r >= 0 ? "positive" : "négative"}
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={r * 100}
          onChange={(e) => setR(+e.target.value / 100)}
          className="w-full accent-primary"
        />
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-44 bg-muted/20 rounded-lg border border-border/20"
      >
        <line
          x1="40"
          y1="10"
          x2="40"
          y2="180"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <line
          x1="40"
          y1="180"
          x2="390"
          y2="180"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={40 + (p.x / 100) * 350}
            cy={10 + (p.y / 100) * 170}
            r="4"
            className="fill-primary/60 hover:fill-primary transition-all"
          />
        ))}
      </svg>
    </Card>
  );
}

/* ─────────── Main Page ─────────── */
const concepts = [
  {
    topic: "Mesures de tendance centrale",
    items: ["Moyenne", "Médiane", "Mode"],
    level: "Fondamental",
  },
  {
    topic: "Mesures de dispersion",
    items: ["Variance", "Écart-type", "IQR", "Étendue"],
    level: "Fondamental",
  },
  {
    topic: "Distributions",
    items: ["Normale", "Binomiale", "Poisson", "Uniforme", "Exponentielle"],
    level: "Intermédiaire",
  },
  {
    topic: "Tests statistiques",
    items: ["t-test", "Chi²", "ANOVA", "Mann-Whitney", "Kolmogorov-Smirnov"],
    level: "Intermédiaire",
  },
  {
    topic: "Statistiques bayésiennes",
    items: [
      "Théorème de Bayes",
      "Prior / Posterior",
      "MCMC",
      "Inférence bayésienne",
    ],
    level: "Avancé",
  },
  {
    topic: "Régression",
    items: ["Linéaire simple", "Multiple", "Logistique", "R² et résidus"],
    level: "Intermédiaire",
  },
];

const errorTypes = [
  {
    type: "Type I (α)",
    desc: "Faux positif — rejeter H₀ alors qu'elle est vraie",
    example: "Dire qu'un médicament marche alors qu'il n'a pas d'effet",
    color: "text-red-400",
  },
  {
    type: "Type II (β)",
    desc: "Faux négatif — ne pas rejeter H₀ alors qu'elle est fausse",
    example: "Ne pas détecter l'effet réel d'un traitement",
    color: "text-amber-400",
  },
];

export default function StatisticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Sigma className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Statistiques & Probabilités
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Les fondations mathématiques de la data science. Distributions, tests
          d&#39;hypothèses, corrélation, inférence — tout ce qu&#39;il faut pour
          analyser les données avec rigueur.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <NormalDistributionViz />
        <div className="grid md:grid-cols-2 gap-6">
          <HypothesisTestViz />
          <CorrelationViz />
        </div>
      </section>

      {/* Concepts Map */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Carte des concepts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.map((c) => (
            <Card
              key={c.topic}
              className="p-4 space-y-3 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{c.topic}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {c.level}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.items.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 bg-primary/5 rounded text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Error Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Erreurs statistiques</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {errorTypes.map((e) => (
            <Card key={e.type} className="p-5 space-y-2">
              <h3 className={`font-semibold ${e.color}`}>{e.type}</h3>
              <p className="text-sm text-muted-foreground">{e.desc}</p>
              <p className="text-xs italic text-muted-foreground/70">
                Ex : {e.example}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Formulas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Formules essentielles</h2>
        <Card className="p-5">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "Moyenne", formula: "x̄ = Σxᵢ / n" },
              {
                name: "Variance",
                formula: "σ² = Σ(xᵢ - μ)² / N (échantillon : s² = Σ(xᵢ - x̄)² / (n-1))",
              },
              { name: "Écart-type", formula: "σ = √(σ²)" },
              { name: "Bayes", formula: "P(A|B) = P(B|A)·P(A) / P(B)" },
              { name: "Z-score", formula: "z = (x - μ) / σ" },
              {
                name: "Corrélation",
                formula: "r = Σ(xᵢ-x̄)(yᵢ-ȳ) / √(Σ(xᵢ-x̄)²·Σ(yᵢ-ȳ)²)",
              },
            ].map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
              >
                <span className="text-sm font-semibold min-w-[100px]">
                  {f.name}
                </span>
                <code className="text-xs font-mono text-primary">
                  {f.formula}
                </code>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
