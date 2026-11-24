"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Settings2,
  MessageSquare,
  Keyboard,
  FileText,
  Blocks,
  Zap,
  ArrowRight,
  CheckCircle2,
  Bot,
} from "lucide-react";

/* ========== MODES COMPARISON ========== */
function CopilotModes() {
  const [activeMode, setActiveMode] = useState<
    "inline" | "chat" | "edit" | "agent"
  >("inline");

  const modes = {
    inline: {
      name: "Inline Completions",
      desc: "Suggestions automatiques en temps réel pendant que vous tapez. Tab pour accepter.",
      features: [
        "Suggestions contextuelles ligne par ligne",
        "Complétion de fonctions entières",
        "Tab pour accepter, Esc pour rejeter",
        "Alt+] / Alt+[ pour naviguer les suggestions",
      ],
      config:
        '// settings.json\n{\n  "github.copilot.enable": {\n    "*": true,\n    "plaintext": true,\n    "markdown": true,\n    "scminput": false\n  },\n  "github.copilot.inlineSuggest.enable": true\n}',
      icon: Code2,
      color: "text-green-500",
    },
    chat: {
      name: "Chat (Ask Mode)",
      desc: "Posez des questions sur votre code, obtenez des explications et des suggestions.",
      features: [
        "Ctrl+I pour ouvrir le chat inline",
        "Ctrl+Alt+I pour le panneau chat (VS Code, Windows/Linux)",
        "@ pour invoquer un participant (@workspace, @vscode, @terminal)",
        "# pour référencer fichiers, symboles ou sélection (#file, #selection)",
      ],
      config:
        "// Commandes utiles dans le chat\n@workspace Comment fonctionne l'auth ?\n@vscode Comment configurer le debug ?\n#file:auth.ts Explique cette fonction\n/explain  Sélection > Expliquer\n/fix      Sélection > Corriger\n/tests    Sélection > Générer des tests",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    edit: {
      name: "Edit Mode",
      desc: "Demandez des modifications précises sur votre code avec diff intégré.",
      features: [
        "Sélectionnez du code + Ctrl+I (chat inline) ou utilisez le mode Edits du panneau chat",
        "Prévisualisation diff avant application",
        "Accepter/Rejeter chaque modification",
        "Multi-fichier : ajoutez les fichiers concernés avec #",
      ],
      config:
        '// Exemples de requêtes Edit\n"Refactore en utilisant async/await"\n"Ajoute la gestion d\'erreurs"\n"Convertis en TypeScript strict"\n"Optimise les performances"\n"Ajoute des commentaires JSDoc"',
      icon: Settings2,
      color: "text-amber-500",
    },
    agent: {
      name: "Agent Mode",
      desc: "L'agent peut créer des fichiers, exécuter des commandes, et résoudre des problèmes complexes.",
      features: [
        "Création et modification de fichiers multiples",
        "Exécution de commandes terminal",
        "Recherche dans le workspace complet",
        "MCP servers pour des outils externes",
      ],
      config:
        "// .github/copilot-instructions.md\n// Instructions globales pour tous les modes\n\n# Instructions Copilot\n\n## Stack technique\n- Next.js (version récente) avec App Router\n- TypeScript strict\n- Prisma + PostgreSQL\n- Tailwind CSS + shadcn/ui\n\n## Conventions\n- Utilise des Server Components par défaut\n- Valide avec Zod\n- Tests avec Vitest\n- Pas de `any` en TypeScript",
      icon: Bot,
      color: "text-violet-500",
    },
  };

  const mode = modes[activeMode];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Zap className="w-5 h-5 text-green-500" />
        Modes de GitHub Copilot
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(modes) as Array<keyof typeof modes>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeMode === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {(() => {
              const Icon = modes[key].icon;
              return <Icon className="w-3.5 h-3.5" />;
            })()}
            {modes[key].name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <mode.icon className={`w-6 h-6 ${mode.color}`} />
            <h3 className="text-lg font-bold">{mode.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{mode.desc}</p>

          <div className="space-y-2">
            {mode.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-primary">
            Configuration / Exemples
          </label>
          <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto min-h-[200px]" tabIndex={0}>
            {mode.config}
          </pre>
        </div>
      </div>
    </Card>
  );
}

/* ========== KEYBINDINGS ========== */
function KeybindingsRef() {
  const bindings = [
    { action: "Accepter suggestion", keys: "Tab", category: "Inline" },
    { action: "Rejeter suggestion", keys: "Esc", category: "Inline" },
    { action: "Suggestion suivante", keys: "Alt+]", category: "Inline" },
    { action: "Suggestion précédente", keys: "Alt+[", category: "Inline" },
    { action: "Déclencher suggestion", keys: "Alt+\\", category: "Inline" },
    { action: "Chat inline", keys: "Ctrl+I", category: "Chat" },
    { action: "Panneau chat", keys: "Ctrl+Alt+I", category: "Chat" },
    { action: "Quick chat", keys: "Ctrl+Shift+Alt+L", category: "Chat" },
    { action: "New chat", keys: "Ctrl+L", category: "Chat" },
    { action: "Expliquer", keys: "/explain", category: "Commande" },
    { action: "Corriger", keys: "/fix", category: "Commande" },
    { action: "Générer tests", keys: "/tests", category: "Commande" },
    { action: "Générer docs", keys: "/doc", category: "Commande" },
  ];

  const [filterCat, setFilterCat] = useState<string>("all");
  const cats = ["all", ...new Set(bindings.map((b) => b.category))];
  const filtered =
    filterCat === "all"
      ? bindings
      : bindings.filter((b) => b.category === filterCat);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Keyboard className="w-5 h-5 text-amber-500" />
        Raccourcis Clavier Essentiels
      </div>

      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filterCat === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {c === "all" ? "Tous" : c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        {filtered.map((b) => (
          <div
            key={b.action}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20"
          >
            <span className="text-sm">{b.action}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {b.category}
              </Badge>
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono border">
                {b.keys}
              </kbd>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ========== CUSTOM INSTRUCTIONS ========== */
function CustomInstructions() {
  const files = [
    {
      name: ".github/copilot-instructions.md",
      desc: "Instructions globales pour tout le repo, ajoutées automatiquement au contexte des requêtes de chat et d'agent.",
      example:
        "# Copilot Instructions\n\n## Stack\n- Next.js App Router\n- TypeScript strict (no any)\n- Prisma + PostgreSQL\n- Tailwind CSS + shadcn/ui\n\n## Conventions\n- Server Components par défaut\n- Validation Zod obligatoire\n- Pas de console.log en production\n- Tests Vitest pour chaque feature",
    },
    {
      name: ".github/instructions/*.instructions.md",
      desc: "Instructions ciblées : un frontmatter applyTo (glob) limite le fichier aux fichiers concernés. Complète copilot-instructions.md sans le surcharger.",
      example:
        "---\napplyTo: \"**/*.test.ts\"\n---\n\n# Tests\n- Vitest avec describe/it\n- Un test = un comportement\n- Pas de mock inutile",
    },
    {
      name: "AGENTS.md",
      desc: "Format ouvert d'instructions pour agents, lu par Copilot (et par d'autres outils comme Codex ou Cursor). Placé à la racine, et dans des sous-dossiers si besoin (les fichiers imbriqués sont encore expérimentaux dans VS Code).",
      example:
        "# AGENTS.md\n\n## Commandes\n- pnpm test : tests unitaires\n- pnpm lint : ESLint\n\n## Conventions\n- TypeScript strict, pas de any\n- Validation Zod en entrée d'API",
    },
    {
      name: ".github/prompts/*.prompt.md",
      desc: "Prompt files : tâches réutilisables lancées avec /nom dans le chat. Le frontmatter peut définir description, agent, model et tools.",
      example:
        "---\ndescription: Générer des tests Vitest\nagent: agent\n---\n\nGénère des tests Vitest pour #selection.\nCouvre les cas limites et les erreurs.",
    },
    {
      name: ".github/agents/*.agent.md",
      desc: "Agents personnalisés (custom agents) : un rôle avec ses instructions et la liste des outils autorisés, sélectionnable dans le chat.",
      example:
        "---\nname: Planner\ndescription: Planifie sans modifier le code\ntools: ['read', 'search']\n---\n\nAnalyse la demande et retourne un plan en Markdown.\nNe modifie aucun fichier.",
    },
    {
      name: ".github/skills/<nom>/SKILL.md",
      desc: "Agent Skills : un dossier par skill contenant un SKILL.md (frontmatter name = nom du dossier, et description) plus d'éventuels scripts et ressources. Copilot charge le skill quand la description correspond à la tâche. VS Code lit aussi .claude/skills/ et .agents/skills/.",
      example:
        "---\nname: shadcn-component\ndescription: Crée un composant shadcn/ui. À utiliser pour tout nouveau composant d'interface.\n---\n\n# Instructions\n1. Utilisez les composants de @/components/ui\n2. Appliquez les variants avec cva()\n3. Typez les props en TypeScript",
    },
    {
      name: "Réglages VS Code",
      desc: "Les réglages github.copilot.chat.codeGeneration.instructions et testGeneration.instructions sont obsolètes depuis VS Code 1.102 : utilisez des fichiers d'instructions. Restent actifs les réglages pour la revue, les messages de commit et les descriptions de PR.",
      example:
        '// settings.json\n{\n  "github.copilot.chat.commitMessageGeneration.instructions": [\n    { "text": "Conventional Commits, en anglais." }\n  ],\n  "github.copilot.chat.reviewSelection.instructions": [\n    { "text": "Vérifier la gestion des erreurs." }\n  ]\n}',
    },
  ];

  const [selected, setSelected] = useState(0);
  const file = files[selected];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FileText className="w-5 h-5 text-blue-500" />
        Instructions Personnalisées
      </div>

      <div className="flex gap-2 flex-wrap">
        {files.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-mono border transition-all ${
              i === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold font-mono text-sm">{file.name}</h3>
          <p className="text-sm text-muted-foreground">{file.desc}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-primary">Exemple</label>
          <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto" tabIndex={0}>
            {file.example}
          </pre>
        </div>
      </div>
    </Card>
  );
}

/* ========== MCP IN COPILOT ========== */
function CopilotMCP() {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Blocks className="w-5 h-5 text-rose-500" />
        MCP dans GitHub Copilot
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copilot agent mode supporte les serveurs MCP pour étendre ses
            capacités avec des outils externes personnalisés.
          </p>

          <div className="space-y-2">
            {[
              "Ajoutez des serveurs MCP dans .vscode/mcp.json (clé servers ; type stdio, http ou sse)",
              "Les outils MCP sont disponibles en mode Agent",
              "Accédez à des APIs, bases de données, services externes",
              "Créez vos propres serveurs MCP avec le SDK",
              "Secrets : ${input:id} (promptString, demandé une fois et stocké de façon sécurisée) ou envFile non versionné ; jamais en clair",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-primary">
            .vscode/mcp.json
          </label>
          <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono">
            {`{
  "inputs": [
    {
      "type": "promptString",
      "id": "api-key",
      "description": "Clé API du serveur",
      "password": true
    }
  ],
  "servers": {
    "my-api": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "API_KEY": "\${input:api-key}"
      }
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "local-tools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-package"],
      "envFile": "\${workspaceFolder}/.env"
    }
  }
}`}
          </pre>
        </div>
      </div>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function CopilotSetupPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-green-500/10">
            <Code2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Setup GitHub Copilot</h1>
            <p className="text-muted-foreground">
              Configuration complète : modes, raccourcis, instructions custom,
              MCP et agent
            </p>
          </div>
        </div>
      </div>

      <CopilotModes />
      <KeybindingsRef />
      <CustomInstructions />
      <CopilotMCP />
    </div>
  );
}
