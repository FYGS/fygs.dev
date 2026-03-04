"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Table,
  BarChart3,
  ArrowRight,
  Code2,
} from "lucide-react";

/* ─────────── DataFrameVisualizer ─────────── */
function DataFrameVisualizer() {
  const initialData = useMemo(
    () => [
      { id: 1, name: "Alice", age: 28, salary: 55000, dept: "Eng" },
      { id: 2, name: "Bob", age: 34, salary: 72000, dept: "Sales" },
      { id: 3, name: "Claire", age: 25, salary: 48000, dept: "Eng" },
      { id: 4, name: "David", age: 41, salary: 91000, dept: "Mgmt" },
      { id: 5, name: "Eva", age: 30, salary: 63000, dept: "Sales" },
      { id: 6, name: "Frank", age: 37, salary: 85000, dept: "Eng" },
    ],
    [],
  );

  type Op = "none" | "filter" | "sort" | "groupby" | "select" | "mutate";
  const [op, setOp] = useState<Op>("none");

  const result = useMemo(() => {
    switch (op) {
      case "filter":
        return initialData.filter((r) => r.salary > 60000);
      case "sort":
        return [...initialData].sort((a, b) => a.age - b.age);
      case "select":
        return initialData.map(({ name, salary }) => ({
          name,
          salary,
        })) as any[];
      case "mutate":
        return initialData.map((r) => ({
          ...r,
          bonus: Math.round(r.salary * 0.1),
        }));
      case "groupby":
        const groups: Record<string, { count: number; avgSalary: number }> = {};
        initialData.forEach((r) => {
          if (!groups[r.dept]) groups[r.dept] = { count: 0, avgSalary: 0 };
          groups[r.dept].count++;
          groups[r.dept].avgSalary += r.salary;
        });
        return Object.entries(groups).map(([dept, v]) => ({
          dept,
          count: v.count,
          avgSalary: Math.round(v.avgSalary / v.count),
        }));
      default:
        return initialData;
    }
  }, [op, initialData]);

  const opCode: Record<Op, string> = {
    none: "df",
    filter: 'df[df["salary"] > 60000]',
    sort: 'df.sort_values("age")',
    groupby:
      'df.groupby("dept").agg(count=("id","count"), avgSalary=("salary","mean"))',
    select: 'df[["name", "salary"]]',
    mutate: 'df.assign(bonus=df["salary"] * 0.1)',
  };

  const cols = result.length > 0 ? Object.keys(result[0]) : [];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Table className="w-5 h-5 text-blue-500" />
        DataFrame Interactif — Pandas
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          ["none", "filter", "sort", "groupby", "select", "mutate"] as Op[]
        ).map((o) => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              op === o
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {o === "none"
              ? "Original"
              : o === "groupby"
                ? "Group By"
                : o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        <span className="text-muted-foreground">{">>> "}</span>
        {opCode[op]}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-3 py-2 text-left text-xs text-muted-foreground">
                #
              </th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-left text-xs font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-t border-border/20 hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 text-xs text-muted-foreground">{i}</td>
                {cols.map((c) => (
                  <td key={c} className="px-3 py-2 text-xs">
                    {String(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {result.length} ligne(s) × {cols.length} colonne(s)
      </p>
    </Card>
  );
}

/* ─────────── NumpyVisualizer ─────────── */
function NumpyVisualizer() {
  const [shape, setShape] = useState<"1d" | "2d" | "3d">("2d");
  const [opNp, setOpNp] = useState<
    "none" | "transpose" | "reshape" | "sum" | "dot"
  >("none");

  const matrix2d = useMemo(
    () => [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [],
  );
  const arr1d = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const display = useMemo(() => {
    if (shape === "1d")
      return {
        data: [arr1d],
        code: "np.array([1,2,3,4,5,6])",
        label: "Shape: (6,)",
      };
    if (shape === "3d")
      return {
        data: [
          [
            [1, 2],
            [3, 4],
          ],
          [
            [5, 6],
            [7, 8],
          ],
        ] as any,
        code: "np.arange(1,9).reshape(2,2,2)",
        label: "Shape: (2,2,2)",
      };
    switch (opNp) {
      case "transpose":
        return {
          data: [
            [1, 4],
            [2, 5],
            [3, 6],
          ],
          code: "arr.T",
          label: "Shape: (3,2)",
        };
      case "reshape":
        return {
          data: [
            [1, 2],
            [3, 4],
            [5, 6],
          ],
          code: "arr.reshape(3,2)",
          label: "Shape: (3,2)",
        };
      case "sum":
        return {
          data: [[5, 7, 9]],
          code: "arr.sum(axis=0)",
          label: "Shape: (3,)",
        };
      case "dot":
        return {
          data: [[14], [32]],
          code: "arr @ np.array([[1],[2],[3]])",
          label: "Shape: (2,1)",
        };
      default:
        return {
          data: matrix2d,
          code: "np.array([[1,2,3],[4,5,6]])",
          label: "Shape: (2,3)",
        };
    }
  }, [shape, opNp, arr1d, matrix2d]);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Code2 className="w-5 h-5 text-green-500" />
        NumPy — Opérations matricielles
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium">
            Dimension
          </span>
          <div className="flex gap-1.5">
            {(["1d", "2d", "3d"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setShape(s);
                  setOpNp("none");
                }}
                className={`px-3 py-1 rounded text-xs border ${shape === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {shape === "2d" && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">
              Opération
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {(["none", "transpose", "reshape", "sum", "dot"] as const).map(
                (o) => (
                  <button
                    key={o}
                    onClick={() => setOpNp(o)}
                    className={`px-3 py-1 rounded text-xs border ${opNp === o ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
                  >
                    {o === "none" ? "Original" : o}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        <span className="text-muted-foreground">{">>> "}</span>
        {display.code}
      </div>

      <div className="flex items-center gap-4">
        <div className="grid gap-1">
          {Array.isArray(display.data[0]) ? (
            (display.data as number[][]).map((row, i) => (
              <div key={i} className="flex gap-1">
                {(Array.isArray(row) ? row : [row]).map(
                  (v: number, j: number) => (
                    <div
                      key={j}
                      className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono font-semibold"
                    >
                      {v}
                    </div>
                  ),
                )}
              </div>
            ))
          ) : (
            <div className="flex gap-1">
              {(display.data as any as number[]).map((v, j) => (
                <div
                  key={j}
                  className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono font-semibold"
                >
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {display.label}
        </Badge>
      </div>
    </Card>
  );
}

/* ─────────── ChartDemo ─────────── */
function ChartDemo() {
  const data = [
    { label: "Jan", value: 42 },
    { label: "Feb", value: 58 },
    { label: "Mar", value: 35 },
    { label: "Apr", value: 71 },
    { label: "May", value: 64 },
    { label: "Jun", value: 89 },
  ];
  const [chartType, setChartType] = useState<"bar" | "line" | "scatter">("bar");
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="w-5 h-5 text-purple-500" />
        Visualisation — Matplotlib / Seaborn
      </div>

      <div className="flex gap-2">
        {(["bar", "line", "scatter"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`px-3 py-1.5 rounded text-xs border ${chartType === t ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
          >
            {t === "bar" ? "Barres" : t === "line" ? "Ligne" : "Nuage"}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        {chartType === "bar" && 'plt.bar(months, values, color="steelblue")'}
        {chartType === "line" &&
          'plt.plot(months, values, marker="o", linewidth=2)'}
        {chartType === "scatter" &&
          'plt.scatter(months, values, s=100, c="coral")'}
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-48 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Y axis */}
        <line
          x1="50"
          y1="10"
          x2="50"
          y2="170"
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        {/* X axis */}
        <line
          x1="50"
          y1="170"
          x2="380"
          y2="170"
          stroke="currentColor"
          strokeOpacity="0.2"
        />

        {data.map((d, i) => {
          const x = 50 + (i + 0.5) * (330 / data.length);
          const barW = (330 / data.length) * 0.6;
          const h = (d.value / maxVal) * 150;
          const y = 170 - h;

          if (chartType === "bar") {
            return (
              <g key={i}>
                <rect
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={h}
                  rx="3"
                  className="fill-primary/60 hover:fill-primary/80 transition-all"
                />
                <text
                  x={x}
                  y={185}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {d.label}
                </text>
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {d.value}
                </text>
              </g>
            );
          }
          return null;
        })}

        {chartType === "line" && (
          <>
            <polyline
              points={data
                .map((d, i) => {
                  const x = 50 + (i + 0.5) * (330 / data.length);
                  const y = 170 - (d.value / maxVal) * 150;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {data.map((d, i) => {
              const x = 50 + (i + 0.5) * (330 / data.length);
              const y = 170 - (d.value / maxVal) * 150;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" className="fill-primary" />
                  <text
                    x={x}
                    y={185}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {d.label}
                  </text>
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="fill-foreground text-[10px]"
                  >
                    {d.value}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {chartType === "scatter" &&
          data.map((d, i) => {
            const x = 50 + (i + 0.5) * (330 / data.length);
            const y = 170 - (d.value / maxVal) * 150;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  className="fill-orange-400/70 hover:fill-orange-500 transition-all"
                />
                <text
                  x={x}
                  y={185}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {d.label}
                </text>
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="fill-foreground text-[10px]"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
      </svg>
    </Card>
  );
}

/* ─────────── Main Page ─────────── */
const essentialLibs = [
  {
    name: "NumPy",
    desc: "Calcul numérique, tableaux N-dimensionnels, algèbre linéaire",
    usage: "import numpy as np",
    color: "text-blue-400",
  },
  {
    name: "Pandas",
    desc: "DataFrames, séries temporelles, nettoyage de données",
    usage: "import pandas as pd",
    color: "text-green-400",
  },
  {
    name: "Matplotlib",
    desc: "Graphiques statiques, personnalisation fine, subplots",
    usage: "import matplotlib.pyplot as plt",
    color: "text-purple-400",
  },
  {
    name: "Seaborn",
    desc: "Visualisations statistiques, thèmes élégants, intégration Pandas",
    usage: "import seaborn as sns",
    color: "text-cyan-400",
  },
  {
    name: "Scikit-learn",
    desc: "ML classique, preprocessing, métriques, pipelines",
    usage: "from sklearn import ...",
    color: "text-amber-400",
  },
  {
    name: "Jupyter",
    desc: "Notebooks interactifs, exploration, documentation vivante",
    usage: "jupyter notebook",
    color: "text-orange-400",
  },
];

const pandasOps = [
  { op: "read_csv()", desc: "Charger un CSV", cat: "I/O" },
  {
    op: "head() / tail()",
    desc: "Premières / dernières lignes",
    cat: "Exploration",
  },
  { op: "describe()", desc: "Statistiques descriptives", cat: "Exploration" },
  { op: "groupby()", desc: "Agrégation par groupes", cat: "Transformation" },
  {
    op: "merge() / join()",
    desc: "Jointures de DataFrames",
    cat: "Transformation",
  },
  {
    op: "fillna() / dropna()",
    desc: "Gestion des valeurs manquantes",
    cat: "Nettoyage",
  },
  {
    op: "apply() / map()",
    desc: "Application de fonctions",
    cat: "Transformation",
  },
  { op: "pivot_table()", desc: "Tableaux croisés dynamiques", cat: "Analyse" },
  { op: "value_counts()", desc: "Distribution de valeurs", cat: "Exploration" },
  { op: "to_csv() / to_sql()", desc: "Export de données", cat: "I/O" },
];

export default function PythonDataPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <FlaskConical className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
          Python pour la Data Science
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez l&#39;écosystème Python de la manipulation de données à la
          visualisation. NumPy, Pandas, Matplotlib, Seaborn — les outils
          indispensables du data scientist.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <DataFrameVisualizer />
        <div className="grid md:grid-cols-2 gap-6">
          <NumpyVisualizer />
          <ChartDemo />
        </div>
      </section>

      {/* Essential Libraries */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Écosystème essentiel</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {essentialLibs.map((lib) => (
            <Card
              key={lib.name}
              className="p-4 space-y-2 hover:border-primary/30 transition-all"
            >
              <h3 className={`font-semibold ${lib.color}`}>{lib.name}</h3>
              <p className="text-sm text-muted-foreground">{lib.desc}</p>
              <code className="block text-xs bg-muted/30 rounded px-2 py-1 text-primary font-mono">
                {lib.usage}
              </code>
            </Card>
          ))}
        </div>
      </section>

      {/* Pandas Operations Reference */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Pandas — Opérations essentielles</h2>
        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold">Opération</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {pandasOps.map((o, i) => (
                <tr
                  key={i}
                  className="border-t border-border/20 hover:bg-muted/20"
                >
                  <td className="px-4 py-2 font-mono text-xs text-primary">
                    {o.op}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{o.desc}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className="text-[10px]">
                      {o.cat}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Cleaning Pipeline */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Pipeline de nettoyage de données</h2>
        <Card className="p-5">
          <div className="flex items-center gap-3 flex-wrap">
            {[
              "Chargement",
              "Exploration",
              "Valeurs manquantes",
              "Types",
              "Outliers",
              "Feature Engineering",
              "Export",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  {step}
                </div>
                {i < 6 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <pre className="mt-4 bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
            {`import pandas as pd

# 1. Chargement
df = pd.read_csv("data.csv")

# 2. Exploration rapide
print(df.shape, df.dtypes)
print(df.describe())
print(df.isnull().sum())

# 3. Valeurs manquantes
df["age"].fillna(df["age"].median(), inplace=True)
df.dropna(subset=["target"], inplace=True)

# 4. Types
df["date"] = pd.to_datetime(df["date"])
df["category"] = df["category"].astype("category")

# 5. Outliers (IQR)
Q1, Q3 = df["salary"].quantile([0.25, 0.75])
IQR = Q3 - Q1
df = df[(df["salary"] >= Q1 - 1.5*IQR) & (df["salary"] <= Q3 + 1.5*IQR)]

# 6. Feature Engineering
df["age_group"] = pd.cut(df["age"], bins=[0,25,35,50,100], labels=["junior","mid","senior","expert"])

# 7. Export
df.to_parquet("clean_data.parquet", index=False)`}
          </pre>
        </Card>
      </section>
    </div>
  );
}
