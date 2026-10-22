"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ArrowRight, Lightbulb, Terminal, FileCode, Wrench } from "lucide-react";

interface Topic {
  title: string;
  icon: React.ReactNode;
  level: string;
  description: string;
  content: { tab: string; code: string }[];
  insight: string;
}

const topics: Topic[] = [
  {
    title: "tsconfig.json Avancé",
    icon: <Settings className="w-5 h-5 text-cyan-500" />,
    level: "Intermédiaire",
    description: "Options avancées pour un typage strict et des performances optimales.",
    content: [
      {
        tab: "Strict Mode",
        code: `{
  "compilerOptions": {
    // ✅ Base stricte
    "strict": true,
    // ✅ Active TOUTES les checks strictes :
    //   strictNullChecks, strictFunctionTypes,
    //   strictBindCallApply, strictPropertyInitialization,
    //   noImplicitAny, noImplicitThis,
    //   alwaysStrict, useUnknownInCatchVariables

    // ✅ Checks supplémentaires recommandées
    "noUncheckedIndexedAccess": true,
    // → arr[0] retourne T | undefined au lieu de T
    "exactOptionalPropertyTypes": true,
    // → Interdit { name: undefined } pour { name?: string }
    "noPropertyAccessFromIndexSignature": true,
    // → Force obj["key"] pour les index signatures

    // ✅ Unused code
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
  }
}`,
      },
      {
        tab: "Performance",
        code: `{
  "compilerOptions": {
    // ✅ Compilation incrémentale
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",

    // ✅ Module resolution moderne (app bundlée : Vite, Next.js...)
    // Pour du Node pur : "module": "nodenext" (moduleResolution suit)
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2022",

    // ✅ Path aliases : "paths" seul, valeurs relatives au tsconfig
    // ("baseUrl" est déprécié en TS 6 et retiré en TS 7)
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    },

    // ✅ Chaque fichier doit pouvoir être transpilé seul
    // (requis par les transpileurs fichier par fichier :
    //  esbuild, SWC, Babel). Interdit par ex. de ré-exporter
    //  un type sans "export type".
    "isolatedModules": true,
    // Imports de types explicites ("import type") : ce qui est
    // écrit est ce qui est émis (inclut le comportement d'isolatedModules)
    "verbatimModuleSyntax": true,
    // Interdit enum, namespace et paramètres de propriétés :
    // uniquement la syntaxe effaçable (Node peut exécuter le .ts
    // en retirant simplement les types)
    "erasableSyntaxOnly": true,
    "skipLibCheck": true,
    // skipLibCheck: ne type-check pas node_modules
    // Accélère sensiblement la compilation (surtout sur les gros projets)
  },
  "include": ["src/**/*", "next-env.d.ts"],
  "exclude": ["node_modules", "dist", ".next"]
}`,
      },
      {
        tab: "TS 6 → TS 7",
        code: `// TypeScript 7.0 : compilateur natif (réécrit en Go), commande tsc inchangée.
// Gains typiques annoncés par l'équipe TypeScript : builds complets 8x à 12x plus rapides.
// Flags utiles : --checkers (parallélisme du type-check), --builders
// (project references en parallèle), --singleThreaded.
// npm install -D typescript   →   npx tsc

// TypeScript 6.0 = dernière version basée sur la base de code JavaScript.
// Nouveaux défauts (déjà actifs en 6.0 et 7.0) :
//   "strict": true          (avant : false)
//   "module": "esnext"
//   "target": "es2025"      (dernier ECMAScript supporté)
//   "types": []             (ajoutez "types": ["node"] si besoin)
//   "rootDir": "."          (dossier du tsconfig ; mettez "./src" si besoin)

// Options dépréciées en 6.0, erreurs en 7.0 :
//   "baseUrl"                      → mettre le préfixe directement dans "paths"
//   "moduleResolution": "node"     → "nodenext" ou "bundler" (node10)
//   "moduleResolution": "classic"  → supprimé
//   "target": "es5"                → minimum ES2015
//   "downlevelIteration", "outFile", "module": amd/umd/systemjs
//   "esModuleInterop": false et "allowSyntheticDefaultImports": false
//                                  → ne peuvent plus être désactivés

// Migration : corrigez les avertissements sous TS 6.0 ; "ignoreDeprecations": "6.0"
// les masque temporairement mais ne fonctionne plus en 7.0.`,
      },
    ],
    insight: "noUncheckedIndexedAccess n'est pas incluse dans strict et attrape de vrais bugs (accès hors bornes, clés absentes). Elle vaut le coup d'être activée sur les nouveaux projets. Depuis TypeScript 6, strict est activé par défaut.",
  },
  {
    title: "Project References",
    icon: <FileCode className="w-5 h-5 text-cyan-500" />,
    level: "Avancé",
    description: "Monorepos et multi-projet avec compilation incrémentale intelligente.",
    content: [
      {
        tab: "Structure",
        code: `// monorepo/
// ├── tsconfig.json          (root - references)
// ├── packages/
// │   ├── shared/            (bibliothèque partagée)
// │   │   ├── tsconfig.json
// │   │   └── src/
// │   ├── api/               (serveur)
// │   │   ├── tsconfig.json
// │   │   └── src/
// │   └── web/               (frontend)
// │       ├── tsconfig.json
// │       └── src/

// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}`,
      },
      {
        tab: "Package Config",
        code: `// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // Requis pour les references
    "declaration": true,      // Génère les .d.ts
    "declarationMap": true,   // Source maps pour les déclarations
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// packages/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }  // Dépend de shared
  ],
  "include": ["src/**/*"]
}

// Build incrémental
// tsc --build              → Build tout le graphe
// tsc --build --watch      → Watch mode intelligent
// tsc --build --clean      → Nettoyer les outputs`,
      },
    ],
    insight: "Les project references permettent à tsc de ne recompiler que les packages modifiés et leurs dépendants. Le gain de temps peut être important sur les gros monorepos.",
  },
  {
    title: "AST et Transformers",
    icon: <Wrench className="w-5 h-5 text-cyan-500" />,
    level: "Expert",
    description: "Manipuler l'AST TypeScript pour créer des codemods et des transformations automatisées.",
    content: [
      {
        tab: "Lire l'AST",
        code: `import ts from "typescript";

// Parser un fichier source
const sourceFile = ts.createSourceFile(
  "example.ts",
  \`
  interface User {
    name: string;
    age: number;
  }
  function greet(user: User): string {
    return "Hello " + user.name;
  }
  \`,
  ts.ScriptTarget.Latest,
  true,
);

// Visiter tous les noeuds
function visit(node: ts.Node, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(\`\${indent}\${ts.SyntaxKind[node.kind]}\`);
  ts.forEachChild(node, child => visit(child, depth + 1));
}

visit(sourceFile);
// Output:
// SourceFile
//   InterfaceDeclaration
//     Identifier (User)
//     PropertySignature
//       Identifier (name)
//       StringKeyword
//     PropertySignature
//       Identifier (age)
//       NumberKeyword
//   FunctionDeclaration
//     ...`,
      },
      {
        tab: "Codemod",
        code: `import ts from "typescript";

// Transformer : ajouter 'readonly' à toutes les propriétés d'interface
function addReadonly(context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile): ts.SourceFile => {
    function visitor(node: ts.Node): ts.Node {
      // Si c'est une PropertySignature sans readonly
      if (
        ts.isPropertySignature(node) &&
        !node.modifiers?.some(
          m => m.kind === ts.SyntaxKind.ReadonlyKeyword
        )
      ) {
        return ts.factory.updatePropertySignature(
          node,
          [
            ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
            ...(node.modifiers ?? []),
          ],
          node.name,
          node.questionToken,
          node.type,
        );
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}

// Appliquer la transformation
const result = ts.transform(sourceFile, [addReadonly]);
const printer = ts.createPrinter();
const output = printer.printFile(result.transformed[0]);
// interface User {
//   readonly name: string;
//   readonly age: number;
// }`,
      },
    ],
    insight: "L'API du compilateur TypeScript permet de créer des outils d'analyse statique, des codemods (migrations automatiques) et des plugins personnalisés. Attention : TypeScript 7.0 (compilateur natif) est livré sans API programmatique, une nouvelle API est prévue pour la 7.1. Les outils qui importent « typescript » (typescript-eslint, codemods) restent sur l'API de TypeScript 6, disponible via le paquet @typescript/typescript6.",
  },
  {
    title: "Diagnostic API",
    icon: <Terminal className="w-5 h-5 text-cyan-500" />,
    level: "Expert",
    description: "Créer des outils d'analyse statique personnalisés avec l'API diagnostics de TypeScript.",
    content: [
      {
        tab: "Analyse",
        code: `import ts from "typescript";
import path from "node:path";

function analyzeProject(configPath: string) {
  // Lire le tsconfig
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );

  // Créer le programme
  const program = ts.createProgram(
    config.fileNames,
    config.options,
  );

  const checker = program.getTypeChecker();

  // Collecter les diagnostics
  const diagnostics = [
    ...program.getSemanticDiagnostics(),
    ...program.getSyntacticDiagnostics(),
  ];

  // Analyser chaque diagnostic
  for (const diag of diagnostics) {
    const message = ts.flattenDiagnosticMessageText(
      diag.messageText, "\\n"
    );
    const file = diag.file?.fileName ?? "unknown";
    const line = diag.file && diag.start !== undefined
      ? diag.file.getLineAndCharacterOfPosition(diag.start).line + 1
      : 0;

    console.log(\`\${file}:\${line} - \${message}\`);
  }

  return { diagnostics, program, checker };
}`,
      },
      {
        tab: "Custom Lint",
        code: `// Règle personnalisée : détecter les 'any' explicites
function findExplicitAny(program: ts.Program) {
  const checker = program.getTypeChecker();
  const issues: { file: string; line: number; text: string }[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;

    function visit(node: ts.Node) {
      // Le mot-clé 'any' est un nœud AnyKeyword, qu'il soit dans une
      // annotation (x: any) ou dans un cast (x as any) : un seul test
      // suffit, sinon le cast serait signalé deux fois.
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );
        const parent = node.parent;
        issues.push({
          file: sourceFile.fileName,
          line: line + 1,
          text: ts.isAsExpression(parent) && parent.type === node
            ? \`as any: \${parent.expression.getText()}\`
            : parent.getText(),
        });
      }

      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  return issues;
}

// Utilisation
const { program } = analyzeProject("./tsconfig.json");
const anyIssues = findExplicitAny(program);
console.log(\`Found \${anyIssues.length} explicit 'any' usages\`);`,
      },
    ],
    insight: "L'API diagnostics permet de créer des règles de lint personnalisées spécifiques à votre projet, bien au-delà de ce que ESLint peut faire avec les types.",
  },
];

export default function CompilerApiPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <Settings className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-medium text-cyan-500">Compiler API</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Compilateur et Outillage
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          De tsconfig avancé aux codemods avec l{"'"}AST.
          Maîtrisez les outils qui font de TypeScript un écosystème puissant.
        </p>
      </section>

      <div className="space-y-6">
        {topics.map((t, idx) => (
          <Card
            key={t.title}
            className={`p-6 space-y-4 border-border/40 cursor-pointer transition-all ${openIdx === idx ? "ring-2 ring-cyan-500/20" : ""}`}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {t.icon}
                <h3 className="text-lg font-bold">{t.title}</h3>
                <Badge variant="outline" className="text-[10px]">{t.level}</Badge>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform ${openIdx === idx ? "rotate-90" : ""}`} />
            </div>

            <p className="text-sm text-muted-foreground">{t.description}</p>

            {openIdx === idx && (
              <div className="space-y-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
                <Tabs defaultValue={t.content[0].tab} className="w-full">
                  <TabsList className="bg-muted/30">
                    {t.content.map(c => (
                      <TabsTrigger key={c.tab} value={c.tab}>{c.tab}</TabsTrigger>
                    ))}
                  </TabsList>
                  {t.content.map(c => (
                    <TabsContent key={c.tab} value={c.tab}>
                      <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
                        {c.code}
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <Lightbulb className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{t.insight}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}