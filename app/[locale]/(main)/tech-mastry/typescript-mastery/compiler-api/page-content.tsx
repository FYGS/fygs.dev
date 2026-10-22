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

    // ✅ Module resolution moderne
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",

    // ✅ Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    },

    // ✅ Isolation pour builds parallèles
    "isolatedModules": true,
    "skipLibCheck": true,
    // skipLibCheck: ne type-check pas node_modules
    // Accélère sensiblement la compilation (surtout sur les gros projets)
  },
  "include": ["src/**/*", "next-env.d.ts"],
  "exclude": ["node_modules", "dist", ".next"]
}`,
      },
    ],
    insight: "noUncheckedIndexedAccess n'est pas incluse dans strict et attrape de vrais bugs (accès hors bornes, clés absentes). Elle vaut le coup d'être activée sur les nouveaux projets.",
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
    insight: "L'API du compilateur TypeScript permet de créer des outils d'analyse statique, des codemods (migrations automatiques) et des plugins personnalisés.",
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
    const line = diag.file && diag.start
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
      // Détecter les annotations de type 'any'
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );
        issues.push({
          file: sourceFile.fileName,
          line: line + 1,
          text: node.parent.getText(),
        });
      }

      // Détecter les 'as any' casts
      if (
        ts.isAsExpression(node) &&
        node.type.kind === ts.SyntaxKind.AnyKeyword
      ) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );
        issues.push({
          file: sourceFile.fileName,
          line: line + 1,
          text: \`as any: \${node.expression.getText()}\`,
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