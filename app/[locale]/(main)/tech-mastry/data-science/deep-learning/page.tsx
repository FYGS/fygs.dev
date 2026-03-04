"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Layers, Zap, Network, Eye, MessageSquare } from "lucide-react";

/* ─────────── Neural Network Visualizer ─────────── */
function NeuralNetworkViz() {
  const [layers, setLayers] = useState([3, 5, 4, 2]);
  const [activeNeuron, setActiveNeuron] = useState<{
    l: number;
    n: number;
  } | null>(null);
  const [activation, setActivation] = useState<"relu" | "sigmoid" | "tanh">(
    "relu",
  );

  const layerNames = [
    "Input",
    ...layers.slice(1, -1).map((_, i) => `Hidden ${i + 1}`),
    "Output",
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Network className="w-5 h-5 text-red-500" />
        Réseau de neurones — Architecture
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Couches cachées
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                onClick={() => {
                  const hidden = Array.from(
                    { length: h },
                    (_, i) => [5, 4, 3][i] || 4,
                  );
                  setLayers([3, ...hidden, 2]);
                }}
                className={`px-3 py-1 rounded text-xs border ${layers.length - 2 === h ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Activation</label>
          <div className="flex gap-1.5">
            {(["relu", "sigmoid", "tanh"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setActivation(a)}
                className={`px-3 py-1 rounded text-xs border ${activation === a ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 500 250"
        className="w-full h-56 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Connections */}
        {layers.map((count, l) => {
          if (l === layers.length - 1) return null;
          const nextCount = layers[l + 1];
          const x1 = 40 + l * (420 / (layers.length - 1));
          const x2 = 40 + (l + 1) * (420 / (layers.length - 1));
          return Array.from({ length: count }, (_, n1) => {
            const y1 = 30 + n1 * (190 / Math.max(count - 1, 1));
            return Array.from({ length: nextCount }, (_, n2) => {
              const y2 = 30 + n2 * (190 / Math.max(nextCount - 1, 1));
              const isActive =
                activeNeuron &&
                ((activeNeuron.l === l && activeNeuron.n === n1) ||
                  (activeNeuron.l === l + 1 && activeNeuron.n === n2));
              return (
                <line
                  key={`${l}-${n1}-${n2}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--primary))"
                  strokeWidth={isActive ? 1.5 : 0.5}
                  opacity={isActive ? 0.6 : 0.1}
                />
              );
            });
          });
        })}

        {/* Neurons */}
        {layers.map((count, l) => {
          const x = 40 + l * (420 / (layers.length - 1));
          return Array.from({ length: count }, (_, n) => {
            const y = 30 + n * (190 / Math.max(count - 1, 1));
            const isActive = activeNeuron?.l === l && activeNeuron?.n === n;
            return (
              <g
                key={`${l}-${n}`}
                onMouseEnter={() => setActiveNeuron({ l, n })}
                onMouseLeave={() => setActiveNeuron(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 12 : 9}
                  className={`transition-all duration-200 ${l === 0 ? "fill-blue-500" : l === layers.length - 1 ? "fill-green-500" : "fill-primary"}`}
                  opacity={isActive ? 1 : 0.7}
                />
                {isActive && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-foreground text-[8px] font-bold pointer-events-none"
                  >
                    {activation === "relu"
                      ? "ReLU"
                      : activation === "sigmoid"
                        ? "σ"
                        : "tanh"}
                  </text>
                )}
              </g>
            );
          });
        })}

        {/* Layer labels */}
        {layers.map((_, l) => {
          const x = 40 + l * (420 / (layers.length - 1));
          return (
            <text
              key={l}
              x={x}
              y="245"
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {layerNames[l]}
            </text>
          );
        })}
      </svg>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        Architecture: {layers.join(" → ")} | Activation: {activation} | Params:
        ~
        {layers.reduce(
          (sum, c, i) => (i > 0 ? sum + layers[i - 1] * c + c : sum),
          0,
        )}
      </div>
    </Card>
  );
}

/* ─────────── Activation Functions ─────────── */
function ActivationFunctionsViz() {
  const [fn, setFn] = useState<
    "relu" | "sigmoid" | "tanh" | "leaky" | "softmax"
  >("relu");

  const compute = useCallback(
    (x: number): number => {
      switch (fn) {
        case "relu":
          return Math.max(0, x);
        case "sigmoid":
          return 1 / (1 + Math.exp(-x));
        case "tanh":
          return Math.tanh(x);
        case "leaky":
          return x > 0 ? x : 0.01 * x;
        case "softmax":
          return 1 / (1 + Math.exp(-x)); // simplified
      }
    },
    [fn],
  );

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let x = -5; x <= 5; x += 0.1) pts.push({ x, y: compute(x) });
    return pts;
  }, [compute]);

  const yMin = Math.min(...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y));
  const yRange = yMax - yMin || 1;

  const formulas: Record<string, string> = {
    relu: "f(x) = max(0, x)",
    sigmoid: "f(x) = 1 / (1 + e⁻ˣ)",
    tanh: "f(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)",
    leaky: "f(x) = x if x>0 else 0.01x",
    softmax: "f(xᵢ) = eˣⁱ / Σeˣʲ",
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Zap className="w-5 h-5 text-amber-500" />
        Fonctions d&#39;activation
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["relu", "sigmoid", "tanh", "leaky", "softmax"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFn(f)}
            className={`px-3 py-1.5 rounded text-xs border ${fn === f ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-2 text-center font-mono text-sm text-primary">
        {formulas[fn]}
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-44 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Axes */}
        <line
          x1="200"
          y1="10"
          x2="200"
          y2="190"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <line
          x1="10"
          y1="100"
          x2="390"
          y2="100"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        {/* Curve */}
        <polyline
          points={points
            .map((p) => {
              const sx = ((p.x + 5) / 10) * 380 + 10;
              const sy = 190 - ((p.y - yMin) / yRange) * 180;
              return `${sx},${sy}`;
            })
            .join(" ")}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
        />
      </svg>
    </Card>
  );
}

/* ─────────── Main Page ─────────── */
const architectures = [
  {
    name: "MLP (Perceptron multicouche)",
    type: "Dense",
    useCase: "Données tabulaires, classification/régression",
    params: "~100K-1M",
    icon: Network,
  },
  {
    name: "CNN (Convolutional)",
    type: "Convolutif",
    useCase: "Images, détection d'objets, segmentation",
    params: "~1M-100M",
    icon: Eye,
  },
  {
    name: "RNN / LSTM / GRU",
    type: "Récurrent",
    useCase: "Séries temporelles, NLP, séquences",
    params: "~500K-10M",
    icon: Layers,
  },
  {
    name: "Transformer",
    type: "Attention",
    useCase: "NLP, vision, multimodal (GPT, BERT, ViT)",
    params: "~100M-1T",
    icon: MessageSquare,
  },
];

const concepts = [
  {
    name: "Forward Propagation",
    desc: "Calcul de la sortie couche par couche : z = Wx + b, a = σ(z)",
  },
  {
    name: "Backpropagation",
    desc: "Calcul des gradients par la règle de la chaîne pour mettre à jour les poids",
  },
  {
    name: "Gradient Descent",
    desc: "Optimisation itérative : w ← w - α·∂L/∂w  (SGD, Adam, RMSprop)",
  },
  {
    name: "Batch Normalization",
    desc: "Normalisation des activations pour stabiliser et accélérer l'entraînement",
  },
  {
    name: "Dropout",
    desc: "Désactivation aléatoire de neurones pendant l'entraînement (régularisation)",
  },
  {
    name: "Transfer Learning",
    desc: "Réutiliser des modèles pré-entraînés et fine-tuner sur des données spécifiques",
  },
  {
    name: "Data Augmentation",
    desc: "Enrichir le dataset avec des transformations (rotation, flip, crop, bruit)",
  },
  {
    name: "Learning Rate Scheduling",
    desc: "Adapter le taux d'apprentissage pendant l'entraînement (warmup, cosine decay)",
  },
];

const frameworks = [
  {
    name: "PyTorch",
    desc: "Graphe dynamique, recherche, flexibilité maximale",
    color: "text-orange-400",
  },
  {
    name: "TensorFlow",
    desc: "Production, TF Serving, TF Lite, écosystème complet",
    color: "text-amber-400",
  },
  {
    name: "Keras",
    desc: "API haut niveau, prototypage rapide, intégré à TF",
    color: "text-red-400",
  },
  {
    name: "JAX",
    desc: "Différentiation auto, JIT compilation, TPU-first",
    color: "text-blue-400",
  },
  {
    name: "Hugging Face",
    desc: "Transformers pré-entraînés, NLP, diffusion",
    color: "text-yellow-400",
  },
];

const trainingTips = [
  {
    tip: "Commencer petit",
    detail: "Overfit sur un petit batch d'abord, puis scaler",
  },
  {
    tip: "Monitorer les losses",
    detail: "Train vs Val loss → détecter overfitting/underfitting",
  },
  {
    tip: "Learning rate finder",
    detail: "Tester des LR de 1e-7 à 1 et tracer la courbe",
  },
  {
    tip: "Gradient clipping",
    detail: "Limiter la norme des gradients pour stabiliser RNN/Transformers",
  },
  {
    tip: "Early stopping",
    detail: "Arrêter quand la val loss ne baisse plus (patience=5-10)",
  },
  {
    tip: "Mixed precision",
    detail: "FP16 pour accélérer x2 le training avec moins de VRAM",
  },
];

export default function DeepLearningPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Cpu className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">
          Deep Learning
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Réseaux de neurones, CNN, RNN, Transformers — architectures modernes,
          fonctions d&#39;activation, et techniques d&#39;entraînement avancées.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <NeuralNetworkViz />
        <ActivationFunctionsViz />
      </section>

      {/* Architectures */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Architectures principales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {architectures.map((a) => (
            <Card
              key={a.name}
              className="p-5 space-y-3 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {a.type}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{a.useCase}</p>
              <div className="text-xs text-muted-foreground/70">
                Paramètres typiques : {a.params}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Core Concepts */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Concepts fondamentaux</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {concepts.map((c) => (
            <Card
              key={c.name}
              className="p-4 hover:border-primary/30 transition-all"
            >
              <h3 className="font-semibold text-sm text-primary">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Frameworks */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Frameworks & Outils</h2>
        <div className="grid md:grid-cols-5 gap-3">
          {frameworks.map((f) => (
            <Card
              key={f.name}
              className="p-4 text-center hover:border-primary/30 transition-all space-y-1"
            >
              <h3 className={`font-semibold ${f.color}`}>{f.name}</h3>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Training Tips */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Tips d&#39;entraînement</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trainingTips.map((t) => (
            <Card
              key={t.tip}
              className="p-4 hover:border-primary/30 transition-all"
            >
              <h3 className="font-semibold text-sm">{t.tip}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PyTorch Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">PyTorch — Exemple complet</h2>
        <Card className="p-5">
          <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground">
            {`import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# 1. Modèle
class Net(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, output_dim),
        )

    def forward(self, x):
        return self.net(x)

# 2. Training loop
model = Net(784, 256, 10)
optimizer = optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

for epoch in range(20):
    model.train()
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        output = model(X_batch)
        loss = criterion(output, y_batch)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

    # Validation
    model.eval()
    with torch.no_grad():
        val_loss = sum(criterion(model(X), y) for X, y in val_loader) / len(val_loader)
    print(f"Epoch {epoch+1}: val_loss={val_loss:.4f}")`}
          </pre>
        </Card>
      </section>
    </div>
  );
}
