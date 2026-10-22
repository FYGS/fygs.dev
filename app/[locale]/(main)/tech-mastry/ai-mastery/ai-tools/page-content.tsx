"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  ArrowRight,
  ExternalLink,
  BarChart3,
} from "lucide-react";

/* ========== TOOL DATA ========== */
interface AITool {
  name: string;
  category: string;
  desc: string;
  features: string[];
  pricing: string;
  bestFor: string;
  url: string;
  color: string;
}

const tools: AITool[] = [
  {
    name: "Google Gemini / AI Studio",
    category: "LLM Platform",
    desc: "Suite IA de Google : modèles Gemini (gammes Pro/Flash), Google AI Studio pour le prototypage, et API Vertex AI pour la production.",
    features: [
      "Gemini Pro : contexte très long (jusqu'à 1M tokens selon le modèle, à vérifier)",
      "Google AI Studio : interface gratuite de test",
      "Multimodal : texte, images, vidéo, audio",
      "Grounding avec Google Search",
      "Intégration Google Workspace",
    ],
    pricing: "Offre gratuite (AI Studio) / paiement à l'usage (API), tarifs à vérifier sur le site officiel",
    bestFor: "Prototypage rapide, applications multimodales, long contexte",
    url: "aistudio.google.com",
    color: "border-blue-500/30",
  },
  {
    name: "Cursor",
    category: "IDE IA",
    desc: "Fork de VS Code avec IA intégrée nativement. Complétions, chat, mode Agent et support MCP.",
    features: [
      "Completions contextuelles avec codebase complète",
      "Chat avec @ références (fichiers, docs, web)",
      "Mode Agent : édition multi-fichiers et exécution de commandes",
      "Règles projet (.cursor/rules ou AGENTS.md ; l'ancien .cursorrules est déprécié)",
      "Support MCP natif",
    ],
    pricing: "Offre gratuite limitée + abonnements payants (tarifs à vérifier sur le site officiel)",
    bestFor: "Développeurs voulant l'IA nativement dans l'IDE",
    url: "cursor.com",
    color: "border-purple-500/30",
  },
  {
    name: "Windsurf (Codeium)",
    category: "IDE IA",
    desc: "IDE IA initialement développé par Codeium, depuis repris par Cognition (propriétaire actuel à vérifier sur le site officiel), avec l'agent Cascade et des suggestions de code avancées.",
    features: [
      "Cascade : flux agentique multi-étapes",
      "Suggestions multi-lignes contextuelles (Tab)",
      "Flows : workflows automatisés pour le développement",
      "Offre gratuite avec limites (à vérifier)",
      "Support de nombreux langages",
    ],
    pricing: "Offre gratuite + abonnement payant (tarifs à vérifier sur le site officiel)",
    bestFor: "Alternative à Cursor avec une offre gratuite, développeurs attentifs au budget",
    url: "windsurf.com",
    color: "border-teal-500/30",
  },
  {
    name: "ChatGPT (OpenAI)",
    category: "LLM Platform",
    desc: "Chatbot IA très répandu. Modèles GPT, modèles de raisonnement, génération d'images, GPTs personnalisés.",
    features: [
      "Modèles GPT généralistes et multimodaux",
      "Modèles de raisonnement dédiés (versions à vérifier)",
      "Custom GPTs : créez vos assistants spécialisés",
      "Code Interpreter : exécution Python",
      "API avec function calling",
    ],
    pricing: "Offre gratuite + abonnements payants (tarifs à vérifier sur le site officiel)",
    bestFor: "Usage général, raisonnement complexe, prototypage rapide",
    url: "chatgpt.com",
    color: "border-green-500/30",
  },
  {
    name: "v0 (Vercel, v0.app)",
    category: "Générateur UI",
    desc: "Génère des composants React/Next.js à partir de prompts textuels. shadcn/ui + Tailwind natif.",
    features: [
      "Génération de composants React complets",
      "shadcn/ui + Tailwind CSS par défaut",
      "Itération via chat pour affiner le design",
      "Export direct vers votre projet",
      "Support Next.js App Router natif",
    ],
    pricing: "Offre gratuite limitée + abonnements payants (tarifs à vérifier sur le site officiel)",
    bestFor: "Prototypage UI rapide, composants React/Next.js",
    url: "v0.app",
    color: "border-violet-500/30",
  },
  {
    name: "Bolt.new (StackBlitz)",
    category: "Full-Stack Builder",
    desc: "Développement full-stack dans le navigateur via IA. WebContainers pour exécution locale.",
    features: [
      "Création de projets complets via prompt",
      "Exécution dans le navigateur (WebContainers)",
      "Déploiement Netlify en un clic",
      "Multi-frameworks (React, Vue, Svelte...)",
      "Collaboration en temps réel",
    ],
    pricing: "Offre gratuite + abonnement payant (tarifs à vérifier sur le site officiel)",
    bestFor: "Prototypage rapide full-stack, démos, MVPs",
    url: "bolt.new",
    color: "border-amber-500/30",
  },
  {
    name: "Perplexity",
    category: "Recherche IA",
    desc: "Moteur de recherche IA avec citations. Idéal pour la recherche technique et la veille.",
    features: [
      "Recherche web avec réponses synthétisées",
      "Citations et sources vérifiables",
      "Sources et modes de recherche sélectionnables (web, académique, recherche approfondie ; l'interface évolue, à vérifier)",
      "Collections pour organiser les recherches",
      "API pour intégration",
    ],
    pricing: "Offre gratuite + abonnement payant (tarifs à vérifier sur le site officiel)",
    bestFor: "Recherche technique, veille technologique, documentation",
    url: "perplexity.ai",
    color: "border-cyan-500/30",
  },
];

/* ========== TOOLS GRID ========== */
function ToolsGrid() {
  const [filterCat, setFilterCat] = useState<string>("all");
  const [selectedTool, setSelectedTool] = useState<number | null>(null);

  const categories = ["all", ...new Set(tools.map((t) => t.category))];
  const filtered =
    filterCat === "all" ? tools : tools.filter((t) => t.category === filterCat);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Wrench className="w-5 h-5 text-amber-500" />
        Catalogue des Outils IA
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setFilterCat(c);
              setSelectedTool(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterCat === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {c === "all" ? "Tous" : c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((tool) => {
          const globalIdx = tools.indexOf(tool);
          const isSelected = selectedTool === globalIdx;
          return (
            <button
              key={tool.name}
              onClick={() => setSelectedTool(isSelected ? null : globalIdx)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${tool.color} bg-muted/30 scale-[1.02] shadow-lg`
                  : "border-border/20 bg-muted/10 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{tool.name}</h3>
                <Badge variant="outline" className="text-[9px]">
                  {tool.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {tool.desc}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {tool.pricing}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedTool !== null && (
        <div
          className={`p-4 rounded-lg border-2 ${tools[selectedTool].color} bg-muted/20 space-y-3`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{tools[selectedTool].name}</h3>
            <a
              href={`https://${tools[selectedTool].url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {tools[selectedTool].url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            {tools[selectedTool].desc}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-primary">
                Fonctionnalités clés
              </label>
              {tools[selectedTool].features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-green-500">
                Idéal pour
              </label>
              <p className="text-sm text-muted-foreground">
                {tools[selectedTool].bestFor}
              </p>
              <label className="text-xs font-medium text-amber-500 mt-2 block">
                Tarification
              </label>
              <p className="text-sm text-muted-foreground">
                {tools[selectedTool].pricing}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ========== COMPARISON TABLE ========== */
function ComparisonTable() {
  const criteria = [
    "Complétions",
    "Chat",
    "Agent",
    "MCP",
    "Multimodal",
    "Gratuit",
  ];

  const comparison: Record<string, Record<string, string>> = {
    "GitHub Copilot": {
      Complétions: "Oui (IDE)",
      Chat: "Oui",
      Agent: "Oui (mode Agent)",
      MCP: "Oui",
      Multimodal: "Images dans le chat",
      Gratuit: "Offre gratuite limitée",
    },
    Cursor: {
      Complétions: "Oui (natif)",
      Chat: "Oui",
      Agent: "Oui (mode Agent)",
      MCP: "Oui",
      Multimodal: "Images dans le chat",
      Gratuit: "Offre gratuite limitée",
    },
    Windsurf: {
      Complétions: "Oui (natif)",
      Chat: "Oui",
      Agent: "Oui (Cascade)",
      MCP: "Oui",
      Multimodal: "Images dans le chat",
      Gratuit: "Offre gratuite limitée",
    },
    Gemini: {
      Complétions: "Via Gemini Code Assist",
      Chat: "Oui",
      Agent: "Oui (Gemini CLI)",
      MCP: "Oui (Gemini CLI)",
      Multimodal: "Texte, image, audio, vidéo",
      Gratuit: "AI Studio gratuit",
    },
    ChatGPT: {
      Complétions: "Non (chat ; Codex pour le code)",
      Chat: "Oui",
      Agent: "Oui (Codex, mode agent)",
      MCP: "Oui (connecteurs)",
      Multimodal: "Texte, image, audio",
      Gratuit: "Offre gratuite limitée",
    },
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Tableau Comparatif qualitatif (fonctionnalités à vérifier sur les sites officiels)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left p-2 font-medium">Outil</th>
              {criteria.map((c) => (
                <th key={c} className="text-center p-2 font-medium text-xs">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(comparison).map(([tool, grades]) => (
              <tr
                key={tool}
                className="border-b border-border/10 hover:bg-muted/20"
              >
                <td className="p-2 font-medium">{tool}</td>
                {criteria.map((c) => (
                  <td key={c} className="text-center p-2">
                    <span className="text-xs text-muted-foreground">
                      {grades[c]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Comparaison qualitative, sans note chiffrée : les offres, les modèles et
        les fonctionnalités évoluent vite.
      </p>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function AIToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Wrench className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Outils IA Modernes</h1>
            <p className="text-muted-foreground">
              Panorama complet : IDE IA, plateformes LLM, générateurs et outils
              de recherche
            </p>
          </div>
        </div>
      </div>

      <ToolsGrid />
      <ComparisonTable />
    </div>
  );
}
