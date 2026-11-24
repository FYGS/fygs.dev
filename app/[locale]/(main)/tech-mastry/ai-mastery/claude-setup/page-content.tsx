"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Settings2,
  Key,
  MessageSquare,
  Blocks,
  Terminal,
  Layers,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/* ========== SETUP STEPS INTERACTIVE ========== */
function SetupSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "1. Créer un compte Anthropic",
      icon: Key,
      color: "text-blue-500",
      content: [
        "Allez sur la console développeur Anthropic (console.anthropic.com, adresse à vérifier sur le site officiel)",
        "Créez un compte avec email ou SSO",
        "Vérifiez votre email et sécurisez le compte (mot de passe fort, authentification renforcée si proposée)",
        "Accédez au Dashboard principal",
      ],
      code: null,
    },
    {
      title: "2. Générer une clé API",
      icon: Key,
      color: "text-amber-500",
      content: [
        "Dashboard > API Keys > Create Key",
        "Nommez votre clé (ex: 'dev-local', 'production')",
        "Copiez-la immédiatement (affichée une seule fois)",
        "Stockez-la dans un .env.local et JAMAIS dans le code",
      ],
      code: "# .env.local\nANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx\n\n# Ne JAMAIS commit cette clé !\n# Ajoutez .env.local à .gitignore",
    },
    {
      title: "3. Premier appel API",
      icon: Terminal,
      color: "text-green-500",
      content: [
        "Installez le SDK : npm install @anthropic-ai/sdk",
        "Ou utilisez l'API REST directement via fetch",
        "Choisissez le modèle : identifiant à relever dans la documentation officielle des modèles (les versions évoluent)",
        "Configurez la temperature selon votre cas d'usage",
      ],
      code: "import Anthropic from '@anthropic-ai/sdk';\n\nconst client = new Anthropic({\n  apiKey: process.env.ANTHROPIC_API_KEY,\n});\n\nconst message = await client.messages.create({\n  model: 'MODEL_ID', // identifiant à vérifier sur le site officiel\n  max_tokens: 1024,\n  messages: [\n    { role: 'user', content: 'Bonjour Claude !' }\n  ],\n});",
    },
    {
      title: "4. Configurer un Project",
      icon: Layers,
      color: "text-purple-500",
      content: [
        "Projects permettent d'organiser vos conversations par contexte",
        "Ajoutez des fichiers de référence (code source, docs, specs)",
        "Définissez un system prompt spécifique au projet",
        "Les fichiers sont disponibles dans toutes les conversations du projet",
      ],
      code: "// System prompt pour un projet Next.js\n// -> Project > Instructions du projet\n\nTu es un expert Next.js (version récente) avec App Router.\nTu utilises TypeScript strict, shadcn/ui, et Tailwind.\nTu suis les patterns RSC (React Server Components).\nTu privilégies les Server Actions pour les mutations.\nTu valides avec Zod et utilises Prisma pour la BDD.",
    },
    {
      title: "5. Configurer MCP Servers",
      icon: Blocks,
      color: "text-rose-500",
      content: [
        "MCP (Model Context Protocol) connecte Claude à des outils externes",
        "Filesystem, GitHub, PostgreSQL, Brave Search, etc.",
        "Claude Desktop : claude_desktop_config.json ; Claude Code : claude mcp add ou .mcp.json",
        "Permet à Claude d'interagir avec votre système local",
      ],
      code: '// ~/Library/Application Support/Claude/claude_desktop_config.json\n// (macOS) ou %APPDATA%\\Claude\\ (Windows)\n// Les lignes // sont des commentaires : à retirer dans le vrai fichier JSON.\n// @modelcontextprotocol/server-github est déprécié : préférez le serveur MCP officiel de GitHub.\n\n{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": [\n        "-y",\n        "@modelcontextprotocol/server-filesystem",\n        "/Users/you/projects"\n      ]\n    },\n    "github": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-github"],\n      "env": {\n        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"\n      }\n    }\n  }\n}',
    },
    {
      title: "6. Claude Code (CLI)",
      icon: Terminal,
      color: "text-cyan-500",
      content: [
        "Claude Code est un agent de développement en ligne de commande",
        "Installation recommandée : l'installateur natif (mise à jour automatique) ; Homebrew et WinGet existent aussi",
        "npm reste valide (npm install -g @anthropic-ai/claude-code, Node.js 22+) mais les mises à jour sont à votre charge",
        "Naviguez dans votre repo et lancez 'claude'",
      ],
      code: `# Installation native (macOS, Linux, WSL)
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# Alternative : npm (Node.js 22+)
npm install -g @anthropic-ai/claude-code

# Utilisation
cd mon-projet
claude
claude doctor   # diagnostic de l'installation

# Commandes utiles dans Claude Code
> /init          # Créer un CLAUDE.md
> /compact       # Compresser le contexte
> /memory        # Éditer les fichiers de mémoire
> /mcp           # Gérer les serveurs MCP`,
    },
    {
      title: "7. Personnaliser Claude Code",
      icon: Settings2,
      color: "text-indigo-500",
      content: [
        "CLAUDE.md : instructions et conventions du projet, lues au démarrage de chaque session",
        ".claude/settings.json : permissions, variables d'environnement et hooks (settings.local.json pour le perso, non versionné)",
        "Hooks : commandes exécutées par Claude Code à des événements précis (avant/après un outil, etc.), par exemple pour formater ou bloquer",
        "Subagents (.claude/agents/*.md) et skills (.claude/skills/<nom>/SKILL.md) : rôles et savoir-faire réutilisables",
        "MCP : 'claude mcp add' ou un fichier .mcp.json à la racine du projet, partageable via git",
      ],
      code: `# CLAUDE.md (extrait)
## Commandes
- pnpm test : tests unitaires
- pnpm lint : ESLint

## Conventions
- TypeScript strict, pas de any

// .claude/settings.json (extrait)
{
  "permissions": {
    "allow": ["Bash(pnpm test:*)"],
    "deny": ["Read(./.env)"]
  }
}

# Ajouter un serveur MCP
claude mcp add --transport http mon-serveur https://example.com/mcp`,
    },
  ];

  const step = steps[currentStep];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Zap className="w-5 h-5 text-orange-500" />
        Guide Setup Pas-à-Pas
      </div>

      {/* Step navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setCurrentStep(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-medium border whitespace-nowrap transition-all ${
              i === currentStep
                ? "border-primary bg-primary/10 text-primary"
                : i < currentStep
                  ? "border-green-500/30 bg-green-500/5 text-green-600"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {i < currentStep ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <s.icon className="w-3 h-3" />
            )}
            Étape {i + 1}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <step.icon className={`w-6 h-6 ${step.color}`} />
          <h3 className="text-lg font-bold">{step.title}</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {step.content.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          {step.code && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-primary">
                Code / Config
              </label>
              <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto" tabIndex={0}>
                {step.code}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-1.5 rounded-lg text-xs border border-border/40 disabled:opacity-30 hover:bg-muted/50 transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={() =>
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
          }
          disabled={currentStep === steps.length - 1}
          className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20 disabled:opacity-30 hover:bg-primary/20 transition-colors"
        >
          Suivant
        </button>
      </div>
    </Card>
  );
}

/* ========== MODEL COMPARISON ========== */
function ModelComparison() {
  // Niveaux relatifs (1 à 4) : ils servent uniquement à remplir la jauge,
  // l'affichage est qualitatif. Source : page « Models overview » d'Anthropic.
  const models = [
    {
      name: "Claude Fable (gamme la plus capable)",
      speed: "Plus lente",
      speedLevel: 1,
      intel: "Très élevée",
      intelLevel: 4,
      cost: "Très élevé",
      costLevel: 4,
      best: "Raisonnement exigeant, tâches agentiques longues",
    },
    {
      name: "Claude Opus (gamme haute)",
      speed: "Modérée",
      speedLevel: 2,
      intel: "Élevée",
      intelLevel: 3,
      cost: "Élevé",
      costLevel: 3,
      best: "Développement agentique de longue durée, travail de connaissance complexe",
    },
    {
      name: "Claude Sonnet (gamme intermédiaire)",
      speed: "Rapide",
      speedLevel: 3,
      intel: "Élevée",
      intelLevel: 3,
      cost: "Modéré",
      costLevel: 2,
      best: "Développement, tâches quotidiennes, meilleur compromis vitesse / intelligence",
    },
    {
      name: "Claude Haiku (gamme rapide)",
      speed: "La plus rapide",
      speedLevel: 4,
      intel: "Correcte",
      intelLevel: 2,
      cost: "Faible",
      costLevel: 1,
      best: "Classification, extraction, routage : gros volumes et faible latence",
    },
  ];

  const bar = (level: number) => `${level * 25}%`;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="w-5 h-5 text-violet-500" />
        Comparatif des Modèles Claude (niveaux relatifs, sans chiffres)
      </div>
      <p className="text-xs text-muted-foreground">
        Les gammes (Fable, Opus, Sonnet, Haiku) existent en plusieurs
        générations. Les versions, identifiants, tarifs et fenêtres de contexte
        changent : vérifiez la page officielle « Models overview » de la
        documentation Anthropic avant de choisir un modèle.
      </p>

      <div className="space-y-4">
        {models.map((m) => (
          <div
            key={m.name}
            className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3"
          >
            <h3 className="font-semibold">{m.name}</h3>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Vitesse", text: m.speed, level: m.speedLevel, color: "bg-green-500" },
                { label: "Intelligence", text: m.intel, level: m.intelLevel, color: "bg-blue-500" },
                { label: "Coût", text: m.cost, level: m.costLevel, color: "bg-amber-500" },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{metric.label}</span>
                    <span>{metric.text}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${metric.color} transition-all`}
                      style={{ width: bar(metric.level) }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              <strong>Idéal pour :</strong> {m.best}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ========== BEST PRACTICES ========== */
function ClaudeBestPractices() {
  const practices = [
    {
      title: "System Prompts Efficaces",
      tips: [
        "Définissez un rôle précis et des contraintes claires",
        "Spécifiez le format de sortie attendu (JSON, Markdown, etc.)",
        "Préférez dire ce qu'il faut faire plutôt qu'empiler des interdictions en majuscules",
        "Utilisez des exemples few-shot dans le system prompt",
      ],
    },
    {
      title: "Gestion du Contexte",
      tips: [
        "Utilisez Projects pour organiser par domaine/projet",
        "Uploadez les fichiers de référence dans le Project",
        "Compressez le contexte avec /compact dans Claude Code et décrivez le projet dans CLAUDE.md",
        "Préférez des conversations courtes et focalisées",
      ],
    },
    {
      title: "MCP & Outils",
      tips: [
        "Configurez les serveurs MCP pour les tâches répétitives",
        "Filesystem MCP pour les opérations sur fichiers locaux",
        "GitHub MCP pour la gestion de repos et PRs",
        "Créez vos propres serveurs MCP pour vos APIs internes",
      ],
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="w-5 h-5 text-green-500" />
        Bonnes Pratiques Claude
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {practices.map((p) => (
          <div
            key={p.title}
            className="space-y-2 p-4 rounded-lg bg-muted/20 border border-border/30"
          >
            <h3 className="text-sm font-semibold">{p.title}</h3>
            <div className="space-y-1.5">
              {p.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function ClaudeSetupPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10">
            <Settings2 className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Setup Claude Complet</h1>
            <p className="text-muted-foreground">
              Configuration exhaustive : API, Projects, MCP, Claude Code,
              modèles et bonnes pratiques
            </p>
          </div>
        </div>
      </div>

      <SetupSteps />
      <ModelComparison />
      <ClaudeBestPractices />
    </div>
  );
}
