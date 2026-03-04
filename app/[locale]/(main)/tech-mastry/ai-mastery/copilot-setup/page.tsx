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
        "Ctrl+] / Ctrl+[ pour naviguer les suggestions",
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
        "Ctrl+Shift+I pour le panneau chat",
        "@ pour référencer fichiers, symbols, workspace",
        "# pour référencer des fichiers spécifiques",
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
        "Sélectionnez du code + Ctrl+I",
        "Prévisualisation diff avant application",
        "Accepter/Rejeter chaque modification",
        "Multi-fichier avec références @",
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
        "// .github/copilot-instructions.md\n// Instructions globales pour tous les modes\n\n# Instructions Copilot\n\n## Stack technique\n- Next.js 15+ avec App Router\n- TypeScript strict\n- Prisma + PostgreSQL\n- Tailwind CSS + shadcn/ui\n\n## Conventions\n- Utilise des Server Components par défaut\n- Valide avec Zod\n- Tests avec Vitest\n- Pas de `any` en TypeScript",
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
          <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto min-h-[200px]">
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
    { action: "Panneau chat", keys: "Ctrl+Shift+I", category: "Chat" },
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
      desc: "Instructions globales pour tout le repo. Tous les modes lisent ce fichier.",
      example:
        "# Copilot Instructions\n\n## Stack\n- Next.js 15+ App Router\n- TypeScript strict (no any)\n- Prisma + PostgreSQL\n- Tailwind CSS + shadcn/ui\n\n## Conventions\n- Server Components par défaut\n- Validation Zod obligatoire\n- Pas de console.log en production\n- Tests Vitest pour chaque feature",
    },
    {
      name: ".vscode/settings.json",
      desc: "Configuration VS Code pour le workspace. Affecte le comportement de Copilot.",
      example:
        '{\n  "github.copilot.chat.codeGeneration.instructions": [\n    { "file": ".github/copilot-instructions.md" }\n  ],\n  "github.copilot.chat.testGeneration.instructions": [\n    {\n      "text": "Use Vitest with describe/it blocks."\n    }\n  ]\n}',
    },
    {
      name: ".copilot/skills/",
      desc: "Dossier de skills custom. Chaque skill est un fichier .md avec des instructions spécifiques.",
      example:
        "# SKILL.md\n\n## Description\nSkill pour créer des composants shadcn/ui\n\n## Instructions\n1. Utilisez les composants de @/components/ui\n2. Appliquez les variants avec cva()\n3. Exportez avec displayName\n4. Ajoutez les props TypeScript",
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
          <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto">
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
              "Ajoutez des serveurs MCP dans .vscode/mcp.json",
              "Les outils MCP sont disponibles en mode Agent",
              "Accédez à des APIs, bases de données, services externes",
              "Créez vos propres serveurs MCP avec le SDK",
              "Partagez les configs MCP via le repo",
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
  "servers": {
    "my-api": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "API_KEY": "\${env:MY_API_KEY}"
      }
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${env:GITHUB_TOKEN}"
      }
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
