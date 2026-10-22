"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  Wrench,
  Bot,
  Settings2,
  Workflow,
  ArrowRight,
  Code2,
  CheckCircle2,
  Layers,
  MessageSquare,
} from "lucide-react";

/* ========== MCP PROTOCOL VISUALIZER ========== */
function MCPProtocolVisualizer() {
  const [activeLayer, setActiveLayer] = useState(0);

  const layers = [
    {
      name: "Host",
      desc: "L'application LLM (VS Code, Claude Desktop, Cursor, Claude Code) qui initie les connexions, gère le consentement de l'utilisateur et exécute la boucle d'agent.",
      examples: [
        "Claude Desktop",
        "VS Code + Copilot",
        "Cursor",
        "Claude Code CLI",
      ],
      color: "text-blue-500",
      icon: Code2,
    },
    {
      name: "Client",
      desc: "Connecteur créé par le host : chaque client maintient une connexion avec un serveur MCP (un client par serveur).",
      examples: [
        "1 client = 1 serveur",
        "Découverte des tools, resources, prompts",
        "Fonctionnalité client : elicitation",
      ],
      color: "text-sky-500",
      icon: MessageSquare,
    },
    {
      name: "Protocol Layer",
      desc: "Couche de communication JSON-RPC 2.0 entre clients et serveurs. Révision actuelle de la spécification : 2026-07-28 (à vérifier sur modelcontextprotocol.io).",
      examples: [
        "JSON-RPC 2.0",
        "stdio (serveur local)",
        "Streamable HTTP (serveur distant)",
        "HTTP+SSE : ancien transport, déprécié",
        "Autorisation HTTP basée sur OAuth 2.1",
      ],
      color: "text-amber-500",
      icon: Workflow,
    },
    {
      name: "MCP Server",
      desc: "Service qui expose du contexte et des fonctionnalités : Tools, Resources et Prompts. Il peut tourner en local (stdio) ou à distance (Streamable HTTP).",
      examples: [
        "Filesystem Server",
        "GitHub Server",
        "PostgreSQL Server",
        "Custom API Server",
      ],
      color: "text-green-500",
      icon: Settings2,
    },
    {
      name: "Capabilities",
      desc: "Les 3 primitives côté serveur : Tools (actions exécutées par le modèle), Resources (données contextuelles), Prompts (templates réutilisables). Les tools peuvent déclarer un outputSchema et renvoyer une sortie structurée. Les extensions optionnelles (par exemple Tasks, pour les opérations longues) sont négociées explicitement.",
      examples: [
        "Tools: read_file, search_code",
        "Resources: file://, db://",
        "Prompts: templates prédéfinis",
        "Sortie structurée : outputSchema + structuredContent",
      ],
      color: "text-purple-500",
      icon: Blocks,
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Layers className="w-5 h-5 text-violet-500" />
        Architecture du Protocole MCP
      </div>

      {/* Visual stack */}
      <div className="space-y-2">
        {layers.map((layer, i) => (
          <button
            key={layer.name}
            onClick={() => setActiveLayer(i)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              i === activeLayer
                ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
                : "border-border/20 bg-muted/10 hover:border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <layer.icon className={`w-5 h-5 ${layer.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{layer.name}</span>
                  <Badge variant="outline" className="text-[9px]">
                    Layer {i + 1}
                  </Badge>
                </div>
                {i === activeLayer && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {layer.desc}
                  </p>
                )}
              </div>
              {i < layers.length - 1 && i !== activeLayer && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
              )}
            </div>
            {i === activeLayer && (
              <div className="flex gap-2 flex-wrap mt-2">
                {layer.examples.map((ex) => (
                  <span
                    key={ex}
                    className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] border border-border/30"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ========== CREATE MCP SERVER ========== */
function CreateMCPServer() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "1. Initialiser le projet",
      code: "mkdir my-mcp-server && cd my-mcp-server\nnpm init -y\nnpm install @modelcontextprotocol/server zod\nnpm install -D typescript @types/node\nnpx tsc --init",
      desc: "Créez un nouveau projet Node.js avec le SDK MCP TypeScript (v2 : packages @modelcontextprotocol/server et /client ; l'ancien @modelcontextprotocol/sdk v1 reste maintenu) et Zod.",
    },
    {
      title: "2. Définir les outils (Tools)",
      code: `import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const server = new McpServer({
  name: "my-tools",
  version: "1.0.0",
});

// Définir un outil
server.registerTool(
  "search_docs",
  {
    description: "Recherche dans la documentation",
    inputSchema: z.object({
      query: z.string(),
      limit: z.number().optional(),
    }),
  },
  async ({ query, limit = 5 }) => {
    // Votre logique de recherche ici
    const results = await searchDocumentation(query, limit);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2),
      }],
    };
  }
);`,
      desc: "Définissez les outils que votre serveur expose. Chaque outil a un nom, une description, un schéma d'entrée Zod (un outputSchema optionnel permet une sortie structurée) et un handler.",
    },
    {
      title: "3. Ajouter des Resources",
      code: `// Resources = données contextuelles accessibles par l'IA
import { ResourceTemplate } from "@modelcontextprotocol/server";

server.registerResource(
  "config",
  "config://app",
  { title: "Configuration", mimeType: "application/json" },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({
        env: process.env.NODE_ENV,
        version: "1.0.0",
        features: ["auth", "payments"],
      }),
    }],
  })
);

// Resource template (dynamique)
server.registerResource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  { title: "Profil utilisateur", mimeType: "application/json" },
  async (uri, { userId }) => {
    const user = await getUser(userId);
    return { contents: [{ uri: uri.href, text: JSON.stringify(user) }] };
  }
);`,
      desc: "Les Resources fournissent du contexte au modèle. Elles peuvent être statiques ou dynamiques via des templates URI.",
    },
    {
      title: "4. Lancer le serveur",
      code: `// Transport stdio (recommandé pour un serveur local lancé par l'IDE)
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

const transport = new StdioServerTransport();
await server.connect(transport);

// package.json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": { "my-mcp-server": "./dist/index.js" },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}`,
      desc: "Connectez le serveur via un transport (stdio pour un serveur local, Streamable HTTP pour un serveur distant, avec autorisation OAuth 2.1). Avec stdio, n'écrivez jamais de logs sur stdout (console.log) : utilisez console.error. Compilez et testez.",
    },
    {
      title: "5. Configurer dans le client",
      code: `// .vscode/mcp.json (pour Copilot)
{
  "servers": {
    "my-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["./my-mcp-server/dist/index.js"]
    },
    "my-remote-tools": {
      "type": "http",
      "url": "https://example.com/mcp"
    }
  }
}

// claude_desktop_config.json (pour Claude)
{
  "mcpServers": {
    "my-tools": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"]
    }
  }
}`,
      desc: "Enregistrez votre serveur dans la configuration du client (VS Code, Claude Desktop, etc.).",
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Wrench className="w-5 h-5 text-green-500" />
        Créer un Serveur MCP Pas-à-Pas
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-medium border whitespace-nowrap transition-all ${
              i === step
                ? "border-primary bg-primary/10 text-primary"
                : i < step
                  ? "border-green-500/30 bg-green-500/5 text-green-600"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {i < step ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : null}
            Étape {i + 1}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">{steps[step].title}</h3>
        <p className="text-sm text-muted-foreground">{steps[step].desc}</p>
        <pre className="p-3 rounded-lg bg-muted/50 text-xs whitespace-pre-wrap border font-mono overflow-x-auto max-h-[300px] overflow-y-auto" tabIndex={0}>
          {steps[step].code}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-3 py-1.5 rounded-lg text-xs border border-border/40 disabled:opacity-30 hover:bg-muted/50 transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20 disabled:opacity-30 hover:bg-primary/20 transition-colors"
        >
          Suivant
        </button>
      </div>
    </Card>
  );
}

/* ========== SKILLS ARCHITECTURE ========== */
function SkillsArchitecture() {
  const skills = [
    {
      name: "Code Review Skill",
      desc: "Analyse le code pour détecter bugs, anti-patterns et opportunités d'amélioration.",
      tools: ["read_file", "search_code", "list_files"],
      trigger: "Quand l'utilisateur demande une review de code",
    },
    {
      name: "Database Skill",
      desc: "Interagit avec PostgreSQL : requêtes, schéma, migrations, optimisation.",
      tools: ["query_db", "get_schema", "explain_query"],
      trigger: "Quand l'utilisateur travaille avec la base de données",
    },
    {
      name: "Deployment Skill",
      desc: "Gère le déploiement : Docker, CI/CD, monitoring, rollback.",
      tools: ["docker_build", "deploy", "check_health", "rollback"],
      trigger: "Quand l'utilisateur veut déployer ou gérer l'infra",
    },
    {
      name: "Testing Skill",
      desc: "Génère et exécute des tests. Analyse la couverture.",
      tools: ["generate_test", "run_tests", "coverage_report"],
      trigger: "Quand l'utilisateur travaille sur les tests",
    },
  ];

  const [selected, setSelected] = useState(0);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Bot className="w-5 h-5 text-rose-500" />
        Architecture des Skills & Agents
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {skills.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                i === selected
                  ? "border-primary bg-primary/5"
                  : "border-border/20 hover:border-primary/20"
              }`}
            >
              <h4 className="text-sm font-semibold">{s.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3">
          <h3 className="font-semibold">{skills[selected].name}</h3>
          <p className="text-sm text-muted-foreground">
            {skills[selected].desc}
          </p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-primary">
              Outils utilisés
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {skills[selected].tools.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono border border-primary/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-amber-500">
              Déclencheur
            </label>
            <p className="text-xs text-muted-foreground">
              {skills[selected].trigger}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ========== AGENT PATTERNS ========== */
function AgentPatterns() {
  const patterns = [
    {
      name: "Single Agent + Tools",
      desc: "Un seul agent avec accès à plusieurs outils MCP. Simple et efficace pour la plupart des cas.",
      diagram: "User -> Agent -> [Tool 1, Tool 2, Tool 3] -> Agent -> Response",
      complexity: "Simple",
    },
    {
      name: "Router Agent",
      desc: "Un agent routeur qui redirige vers des agents spécialisés selon le type de requête.",
      diagram:
        "User -> Router -> [Agent Code | Agent Data | Agent Deploy] -> Response",
      complexity: "Intermédiaire",
    },
    {
      name: "Pipeline Agent",
      desc: "Chaîne d'agents où la sortie de l'un alimente l'entrée du suivant.",
      diagram:
        "User -> Research Agent -> Analysis Agent -> Writing Agent -> Response",
      complexity: "Intermédiaire",
    },
    {
      name: "Supervisor Pattern",
      desc: "Un agent superviseur qui coordonne et vérifie le travail de plusieurs agents workers.",
      diagram:
        "User -> Supervisor -> [Worker 1 | Worker 2 | Worker 3] -> Supervisor -> Response",
      complexity: "Avancé",
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        Patterns d&apos;Agents
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {patterns.map((p) => (
          <div
            key={p.name}
            className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{p.name}</h3>
              <Badge variant="outline" className="text-[9px]">
                {p.complexity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
            <pre className="text-[10px] font-mono text-primary/60 bg-muted/40 p-2 rounded">
              {p.diagram}
            </pre>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function SkillsAgentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10">
            <Blocks className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Skills & Agents MCP</h1>
            <p className="text-muted-foreground">
              Protocole MCP, création de serveurs, skills composées et agents en
              production
            </p>
          </div>
        </div>
      </div>

      <MCPProtocolVisualizer />
      <CreateMCPServer />
      <SkillsArchitecture />
      <AgentPatterns />
    </div>
  );
}
