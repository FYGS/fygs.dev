"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ArrowRight,
  Gauge,
  RefreshCw,
  Container,
} from "lucide-react";

/* ─────────── ML Lifecycle Visualizer ─────────── */
function MLLifecycleViz() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      name: "Expérimentation",
      icon: "🔬",
      color: "border-blue-500/40 bg-blue-500/10",
      activities: [
        "Jupyter Notebooks",
        "Feature exploration",
        "Model prototyping",
        "Hyperparameter tuning",
      ],
      tools: ["MLflow", "W&B", "Neptune"],
      metrics: ["Experiment tracking", "Artifact logging", "Parameter logging"],
    },
    {
      name: "Entraînement",
      icon: "⚡",
      color: "border-amber-500/40 bg-amber-500/10",
      activities: [
        "Pipeline d'entraînement reproductible",
        "Data versioning",
        "Distributed training",
        "GPU orchestration",
      ],
      tools: ["Kubeflow", "SageMaker", "Vertex AI"],
      metrics: ["Training time", "Resource utilization", "Cost per experiment"],
    },
    {
      name: "Validation",
      icon: "✅",
      color: "border-green-500/40 bg-green-500/10",
      activities: [
        "Model evaluation",
        "A/B testing design",
        "Bias detection",
        "Performance benchmarks",
      ],
      tools: ["Evidently", "Great Expectations", "Deepchecks"],
      metrics: ["Accuracy/F1", "Latency p50/p99", "Fairness metrics"],
    },
    {
      name: "Déploiement",
      icon: "🚀",
      color: "border-purple-500/40 bg-purple-500/10",
      activities: [
        "Model serving (REST/gRPC)",
        "Canary / Blue-Green",
        "Feature Store sync",
        "CI/CD pipeline",
      ],
      tools: ["BentoML", "Seldon", "TF Serving"],
      metrics: ["Deployment frequency", "Rollback rate", "Availability"],
    },
    {
      name: "Monitoring",
      icon: "📊",
      color: "border-red-500/40 bg-red-500/10",
      activities: [
        "Data drift detection",
        "Prediction quality",
        "Infrastructure alerts",
        "Retraining triggers",
      ],
      tools: ["Evidently", "Prometheus", "Grafana"],
      metrics: ["PSI (data drift)", "Prediction accuracy", "SLA compliance"],
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <RefreshCw className="w-5 h-5 text-teal-500" />
        Cycle de vie MLOps
      </div>

      {/* Phase selector (circular) */}
      <div className="flex items-center gap-1 flex-wrap">
        {phases.map((p, i) => (
          <div key={p.name} className="flex items-center gap-1">
            <button
              onClick={() => setActivePhase(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
                activePhase === i
                  ? `${p.color} font-medium`
                  : "border-border/30 text-muted-foreground hover:border-primary/20"
              }`}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.name}</span>
            </button>
            {i < phases.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            )}
            {i === phases.length - 1 && (
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Phase details */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Activités
          </h4>
          {phases[activePhase].activities.map((a) => (
            <div key={a} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {a}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Outils
          </h4>
          <div className="flex flex-wrap gap-2">
            {phases[activePhase].tools.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Métriques clés
          </h4>
          {phases[activePhase].metrics.map((m) => (
            <div
              key={m}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <Gauge className="w-3 h-3" />
              {m}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ─────────── Model Registry Visualizer ─────────── */
function ModelRegistryViz() {
  const [selectedModel, setSelectedModel] = useState(0);

  const models = [
    {
      name: "fraud-detector-v3",
      stage: "Production",
      version: "3.2.1",
      metrics: { accuracy: 0.967, f1: 0.943, latency: "12ms" },
      created: "2024-01-15",
      framework: "XGBoost",
      stageColor: "bg-green-500/20 text-green-400",
    },
    {
      name: "fraud-detector-v4",
      stage: "Staging",
      version: "4.0.0-rc1",
      metrics: { accuracy: 0.971, f1: 0.952, latency: "15ms" },
      created: "2024-02-01",
      framework: "LightGBM",
      stageColor: "bg-amber-500/20 text-amber-400",
    },
    {
      name: "fraud-detector-v2",
      stage: "Archived",
      version: "2.8.0",
      metrics: { accuracy: 0.941, f1: 0.912, latency: "18ms" },
      created: "2023-11-20",
      framework: "Random Forest",
      stageColor: "bg-gray-500/20 text-gray-400",
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Container className="w-5 h-5 text-purple-500" />
        Model Registry
      </div>

      <div className="space-y-2">
        {models.map((m, i) => (
          <button
            key={m.name}
            onClick={() => setSelectedModel(i)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
              selectedModel === i
                ? "border-primary bg-primary/5"
                : "border-border/30 hover:border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium">{m.name}</span>
              <Badge className={`text-[10px] ${m.stageColor}`}>{m.stage}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">v{m.version}</span>
          </button>
        ))}
      </div>

      {/* Selected model details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <div className="text-lg font-bold text-primary">
            {(models[selectedModel].metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground">Accuracy</div>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <div className="text-lg font-bold text-primary">
            {(models[selectedModel].metrics.f1 * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground">F1-Score</div>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <div className="text-lg font-bold text-primary">
            {models[selectedModel].metrics.latency}
          </div>
          <div className="text-[10px] text-muted-foreground">Latency p50</div>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <div className="text-lg font-bold text-primary">
            {models[selectedModel].framework}
          </div>
          <div className="text-[10px] text-muted-foreground">Framework</div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────── Main Page Content ─────────── */
const maturityLevels = [
  {
    level: "0 — Manuel",
    desc: "Notebooks en local, pas de versioning, déploiement manuel",
    practices: ["Scripts ad hoc", "Copy-paste de modèles", "Aucun monitoring"],
    color: "border-red-500/30",
  },
  {
    level: "1 — Automatisation partielle",
    desc: "CI/CD de base, experiment tracking, tests unitaires",
    practices: ["MLflow / W&B", "Git pour le code", "Tests de base"],
    color: "border-amber-500/30",
  },
  {
    level: "2 — Pipeline ML",
    desc: "Pipelines reproductibles, feature store, registry de modèles",
    practices: ["Kubeflow / Vertex AI", "Feature Store", "Model Registry"],
    color: "border-yellow-500/30",
  },
  {
    level: "3 — Full MLOps",
    desc: "Retraining automatique, monitoring avancé, A/B testing, GitOps",
    practices: ["Auto-retraining", "Data + model drift", "Shadow deployment"],
    color: "border-green-500/30",
  },
];

const cicdSteps = [
  { step: "Lint & Format", desc: "black, isort, flake8, mypy" },
  { step: "Unit Tests", desc: "pytest, mocking des I/O" },
  { step: "Data Validation", desc: "Great Expectations checks" },
  { step: "Train & Evaluate", desc: "Pipeline reproductible, métriques" },
  { step: "Model Validation", desc: "Performance gates, bias check" },
  { step: "Build Container", desc: "Docker multi-stage, slim image" },
  { step: "Deploy Canary", desc: "10% du traffic, monitoring" },
  { step: "Promote", desc: "100% si métriques OK" },
];

const monitoring = [
  {
    metric: "Data Drift",
    desc: "PSI, KL-divergence sur features d'input",
    seuil: "PSI > 0.2",
  },
  {
    metric: "Concept Drift",
    desc: "Dégradation de la qualité des prédictions",
    seuil: "Accuracy -5%",
  },
  {
    metric: "Latency",
    desc: "Temps de réponse du modèle serving",
    seuil: "p99 > 200ms",
  },
  {
    metric: "Throughput",
    desc: "Requêtes par seconde traitées",
    seuil: "< 100 RPS",
  },
  { metric: "Error Rate", desc: "Taux d'erreurs HTTP 5xx", seuil: "> 0.1%" },
  {
    metric: "Resource Usage",
    desc: "CPU/GPU/RAM utilisation",
    seuil: "CPU > 80%",
  },
];

export default function MLOpsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-500">
          <GitBranch className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-600 bg-clip-text text-transparent">
          MLOps & Déploiement
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          CI/CD pour le ML, monitoring de modèles, versioning, feature stores —
          mettez vos modèles en production avec fiabilité et automatisation.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <MLLifecycleViz />
        <ModelRegistryViz />
      </section>

      {/* Maturity Levels */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Niveaux de maturité MLOps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {maturityLevels.map((m) => (
            <Card
              key={m.level}
              className={`p-5 space-y-3 border ${m.color} hover:border-primary/30 transition-all`}
            >
              <h3 className="font-semibold">{m.level}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.practices.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CI/CD Pipeline */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">CI/CD pour le ML</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {cicdSteps.map((s, i) => (
            <div key={s.step} className="flex items-center gap-1">
              <Card className="px-3 py-2 text-center hover:border-primary/30 transition-all">
                <div className="text-xs font-semibold text-primary">
                  {s.step}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {s.desc}
                </div>
              </Card>
              {i < cicdSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Monitoring */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Monitoring en production</h2>
        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold">Métrique</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Seuil d&#39;alerte
                </th>
              </tr>
            </thead>
            <tbody>
              {monitoring.map((m) => (
                <tr
                  key={m.metric}
                  className="border-t border-border/20 hover:bg-muted/20"
                >
                  <td className="px-4 py-2 font-medium">{m.metric}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.desc}</td>
                  <td className="px-4 py-2 font-mono text-xs text-red-400">
                    {m.seuil}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Docker + Serving Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Déploiement — Docker + FastAPI</h2>
        <Card className="p-5">
          <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
            {`# Dockerfile
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# FastAPI serving
FROM base AS serve
EXPOSE 8080
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8080"]

# serve.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ML Model API")
model = joblib.load("model/fraud_detector_v3.joblib")

class PredictRequest(BaseModel):
    features: list[float]

class PredictResponse(BaseModel):
    prediction: int
    probability: float

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    X = np.array(req.features).reshape(1, -1)
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0].max()
    return PredictResponse(prediction=int(pred), probability=float(prob))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_version": "3.2.1"}`}
          </pre>
        </Card>
      </section>
    </div>
  );
}
