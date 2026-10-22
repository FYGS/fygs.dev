"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Workflow, Zap, RefreshCw, Target, Layers, MessageSquare, Settings2, ArrowRight } from "lucide-react";

/* ========== AGENT WORKFLOW VISUALIZER ========== */
function AgentWorkflowVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const [pattern, setPattern] = useState<"react" | "plan-execute" | "multi-agent">("react");

  const patterns = {
    react: {
      name: "ReAct (Reason + Act)",
      steps: [
        { label: "Observation", desc: "L'agent reçoit l'input et observe le contexte actuel", icon: Target, color: "text-blue-500" },
        { label: "Pensée", desc: "Le LLM raisonne sur ce qu'il faut faire ensuite", icon: Brain, color: "text-amber-500" },
        { label: "Action", desc: "Exécute un outil (API, recherche, calcul...)", icon: Zap, color: "text-green-500" },
        { label: "Évaluation", desc: "Vérifie le résultat et décide de continuer ou s'arrêter", icon: RefreshCw, color: "text-purple-500" },
      ],
    },
    "plan-execute": {
      name: "Plan & Execute",
      steps: [
        { label: "Planification", desc: "Le LLM crée un plan détaillé avec N étapes", icon: Layers, color: "text-violet-500" },
        { label: "Exécution", desc: "Chaque étape du plan est exécutée séquentiellement", icon: Zap, color: "text-green-500" },
        { label: "Vérification", desc: "Vérifie si le plan a été bien suivi et ajuste", icon: Target, color: "text-blue-500" },
        { label: "Re-planification", desc: "Si nécessaire, ajuste le plan selon les résultats", icon: RefreshCw, color: "text-amber-500" },
      ],
    },
    "multi-agent": {
      name: "Multi-Agent",
      steps: [
        { label: "Orchestrateur", desc: "Agent principal qui coordonne et distribue les tâches", icon: Settings2, color: "text-rose-500" },
        { label: "Agent Recherche", desc: "Agent spécialisé qui trouve les informations nécessaires", icon: Target, color: "text-blue-500" },
        { label: "Agent Analyse", desc: "Agent spécialisé qui analyse et synthétise les données", icon: Brain, color: "text-amber-500" },
        { label: "Agent Rédaction", desc: "Agent qui produit le résultat final formaté", icon: MessageSquare, color: "text-green-500" },
      ],
    },
  };

  const current = patterns[pattern];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Workflow className="w-5 h-5 text-blue-500" />
        Visualiseur de Workflows Agentiques
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(patterns) as Array<keyof typeof patterns>).map((key) => (
          <button key={key} onClick={() => { setPattern(key); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              pattern === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}>
            {patterns[key].name}
          </button>
        ))}
      </div>

      {/* Visual pipeline */}
      <div className="flex items-center justify-center gap-2 py-4">
        {current.steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <button onClick={() => setActiveStep(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[90px] ${
                i === activeStep
                  ? "border-primary bg-primary/10 scale-105 shadow-lg"
                  : i < activeStep ? "border-green-500/30 bg-green-500/5" : "border-border/30 bg-muted/20"
              }`}>
              <step.icon className={`w-6 h-6 ${step.color}`} />
              <span className="text-[10px] font-medium text-center">{step.label}</span>
            </button>
            {i < current.steps.length - 1 && (
              <ArrowRight className={`w-4 h-4 ${i < activeStep ? "text-green-500" : "text-muted-foreground/30"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          {(() => { const StepIcon = current.steps[activeStep].icon; return <StepIcon className={`w-5 h-5 ${current.steps[activeStep].color}`} />; })()}
          <h3 className="font-semibold">{current.steps[activeStep].label}</h3>
          <Badge variant="outline" className="text-[10px]">Étape {activeStep + 1}/{current.steps.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{current.steps[activeStep].desc}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="px-3 py-1.5 rounded-lg text-xs border border-border/40 disabled:opacity-30 hover:bg-muted/50 transition-colors">
          Précédent
        </button>
        <button onClick={() => setActiveStep(Math.min(current.steps.length - 1, activeStep + 1))}
          disabled={activeStep === current.steps.length - 1}
          className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20 disabled:opacity-30 hover:bg-primary/20 transition-colors">
          Suivant
        </button>
        <button onClick={() => setActiveStep(0)}
          className="px-3 py-1.5 rounded-lg text-xs border border-border/40 hover:bg-muted/50 transition-colors ml-auto">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}

/* ========== FRAMEWORKS COMPARISON ========== */
function FrameworksComparison() {
  const frameworks = [
    {
      name: "LangChain / LangGraph",
      desc: "Framework Python/JS très répandu. Chaînes, agents, RAG, graph-based workflows.",
      pros: ["Écosystème riche", "Communauté massive", "LangSmith pour le debug"],
      cons: ["Complexité croissante", "Abstractions parfois lourdes"],
      useCases: "RAG, chatbots, workflows complexes",
      color: "border-green-500/30",
    },
    {
      name: "CrewAI",
      desc: "Framework multi-agents avec rôles, objectifs et collaboration. Simplifié et intuitif.",
      pros: ["Très simple d'utilisation", "Multi-agents natif", "Délégation automatique"],
      cons: ["Moins flexible", "Communauté plus petite"],
      useCases: "Recherche, analyse, génération de contenu",
      color: "border-blue-500/30",
    },
    {
      name: "AutoGen (Microsoft)",
      desc: "Conversations multi-agents avec exécution de code.",
      pros: ["Conversations naturelles", "Code execution intégrée", "Flexible"],
      cons: ["Configuration complexe", "Évolution du projet à vérifier sur le site officiel (successeur Microsoft Agent Framework)"],
      useCases: "Développement, analyse de données, recherche",
      color: "border-amber-500/30",
    },
    {
      name: "Claude + MCP",
      desc: "Anthropic’s Model Context Protocol : agents via outils et serveurs MCP.",
      pros: ["Standard ouvert", "Intégration native Claude", "Permissions contrôlées côté client"],
      cons: ["Écosystème encore jeune", "Risques d'injection de prompt via les outils à maîtriser"],
      useCases: "Dev tools, IDE intégration, automatisation",
      color: "border-orange-500/30",
    },
  ];

  const [selected, setSelected] = useState(0);
  const fw = frameworks[selected];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Layers className="w-5 h-5 text-purple-500" />
        Comparatif des Frameworks Agentiques
      </div>

      <div className="flex gap-2 flex-wrap">
        {frameworks.map((f, i) => (
          <button key={f.name} onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              i === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}>
            {f.name}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-lg border-2 ${fw.color} bg-muted/20 space-y-3`}>
        <h3 className="text-lg font-bold">{fw.name}</h3>
        <p className="text-sm text-muted-foreground">{fw.desc}</p>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-green-500">Avantages</label>
            {fw.pros.map((p) => (
              <div key={p} className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-500">+</span> {p}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-red-500">Inconvénients</label>
            {fw.cons.map((c) => (
              <div key={c} className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-red-500">-</span> {c}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-blue-500">Cas d&apos;usage</label>
            <p className="text-xs text-muted-foreground">{fw.useCases}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ========== MEMORY & TOOLS SECTION ========== */
function MemoryAndTools() {
  const memoryTypes = [
    { name: "Short-term", desc: "Contexte de la conversation actuelle (context window)", color: "bg-blue-500/10 border-blue-500/20" },
    { name: "Long-term", desc: "Stockage persistant (vector DB, knowledge base)", color: "bg-green-500/10 border-green-500/20" },
    { name: "Episodic", desc: "Mémoire des interactions passées et résultats", color: "bg-amber-500/10 border-amber-500/20" },
    { name: "Semantic", desc: "Concepts et relations appris via embeddings", color: "bg-purple-500/10 border-purple-500/20" },
  ];

  const toolTypes = [
    { name: "API Calls", desc: "Appeler des APIs externes (météo, BDD, services web)" },
    { name: "Code Execution", desc: "Exécuter du code Python/JS dans un sandbox" },
    { name: "File I/O", desc: "Lire, écrire, modifier des fichiers" },
    { name: "Web Search", desc: "Rechercher sur le web en temps réel" },
    { name: "Database", desc: "Requêter une base de données (SQL, vector DB)" },
    { name: "Shell", desc: "Exécuter des commandes système" },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Brain className="w-5 h-5 text-amber-500" />
        Mémoire & Outils des Agents
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Types de Mémoire</h3>
          {memoryTypes.map((m) => (
            <div key={m.name} className={`p-3 rounded-lg border ${m.color}`}>
              <h4 className="text-sm font-semibold">{m.name}</h4>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Types d&apos;Outils</h3>
          <div className="grid grid-cols-2 gap-2">
            {toolTypes.map((t) => (
              <div key={t.name} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                <h4 className="text-xs font-semibold">{t.name}</h4>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function AgenticAIPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Bot className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">IA Agentiques</h1>
            <p className="text-muted-foreground">Architectures, frameworks et patterns pour construire des agents IA autonomes</p>
          </div>
        </div>
      </div>

      <AgentWorkflowVisualizer />
      <FrameworksComparison />
      <MemoryAndTools />
    </div>
  );
}