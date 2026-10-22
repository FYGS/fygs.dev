"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Braces, ChevronDown, ChevronUp, Copy, CheckCircle } from "lucide-react";

interface TypeConcept {
  name: string;
  category: string;
  description: string;
  code: string;
  explanation: string;
}

const concepts: TypeConcept[] = [
  {
    name: "Mapped Types",
    category: "Transformation",
    description: "Transformez chaque propriété d'un type existant.",
    code: `// Rendre toutes les propriétés optionnelles en profondeur
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

// Rendre toutes les propriétés readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// Usage
interface User { name: string; settings: { theme: string; lang: string } }
type PartialUser = DeepPartial<User>;
// { name?: string; settings?: { theme?: string; lang?: string } }`,
    explanation: "Les mapped types itèrent sur les clés d'un type avec [K in keyof T]. Combinés avec des conditional types, ils permettent des transformations profondes (récursives).",
  },
  {
    name: "Conditional Types",
    category: "Logique",
    description: "Branching au niveau des types avec extends et infer.",
    code: `// Extraire le type de retour d'une fonction
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Extraire le type des éléments d'un tableau
type ElementOf<T> = T extends (infer E)[] ? E : never;

// Déballage récursif d'une Promise (Awaited<T> existe déjà dans lib.d.ts)
type UnwrapPromise<T> = T extends Promise<infer U>
  ? UnwrapPromise<U>
  : T;

// Exemples
type A = ReturnOf<() => string>; // string
type B = ElementOf<number[]>;    // number
type C = UnwrapPromise<Promise<Promise<boolean>>>; // boolean`,
    explanation: "Les conditional types utilisent le pattern T extends U ? X : Y. Le keyword infer permet d'extraire un type depuis la structure.",
  },
  {
    name: "Template Literal Types",
    category: "String",
    description: "Manipulation de strings au niveau des types.",
    code: `// Event handler type-safe
type EventName = "click" | "focus" | "blur";
type Handler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onFocus" | "onBlur"

// Extraction de route params
type ExtractParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
      ? Param
      : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

// Type-safe CSS properties
type CSSUnit = "px" | "rem" | "em" | "vh" | "vw" | "%";
type CSSValue = \`\${number}\${CSSUnit}\`;
const width: CSSValue = "100px"; // OK
// const bad: CSSValue = "abc"; // Error`,
    explanation: "Les template literal types permettent de composer et transformer des types string au compile-time. Très puissants avec Capitalize, Lowercase, etc.",
  },
  {
    name: "Discriminated Unions",
    category: "Pattern",
    description: "Unions avec un champ discriminant pour le type narrowing.",
    code: `// Result pattern (comme Rust)
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    // TypeScript sait que result.data existe ici
    console.log(result.data);
  } else {
    // TypeScript sait que result.error existe ici
    console.error(result.error);
  }
}

// State Machine
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function render(state: State) {
  switch (state.status) {
    case "idle": return "Ready";
    case "loading": return "Loading...";
    case "success": return state.data.join(", ");
    case "error": return state.message;
  }
}`,
    explanation: "Le champ discriminant (success, status) permet à TypeScript d'affiner le type dans chaque branche. C'est le pattern le plus important pour du code robuste.",
  },
  {
    name: "Branded / Nominal Types",
    category: "Sécurité",
    description: "Créez des types nominaux pour éviter les confusions entre valeurs structurellement identiques.",
    code: `// Branded Types - empêcher de mixer des IDs
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

const userId = "user_123" as UserId;
const orderId = "order_456" as OrderId;

getUser(userId);   // OK
// getUser(orderId); // Error! OrderId not assignable to UserId

// Newtype pattern plus strict
declare const __newtype: unique symbol;
type NewType<T, N extends string> = T & { readonly [__newtype]: N };

type Email = NewType<string, "Email">;
type URL = NewType<string, "URL">;`,
    explanation: "Les branded types ajoutent un champ fantôme qui rend les types structurellement incompatibles, empêchant les erreurs d'inversion de paramètres.",
  },
  {
    name: "Syntaxe moderne : satisfies, using, décorateurs, enum",
    category: "Moderne",
    description: "satisfies, using, décorateurs standard et alternatives aux enum, avec erasableSyntaxOnly.",
    code: `// satisfies (TS 4.9) : valide la forme sans élargir le type inféré
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<string, string | number[]>;
palette.red.map((c) => c * 2); // red reste number[]

// using (TS 5.2) : libération automatique de ressources
// (Symbol.dispose / Symbol.asyncDispose, nécessite un runtime ou un polyfill)
function openFile() {
  return { [Symbol.dispose]() { console.log("fermé"); } };
}
{
  using file = openFile();
  // ... utiliser file
} // file[Symbol.dispose]() est appelé en sortie de bloc

// Décorateurs standard (TS 5.0) : sans l'option experimentalDecorators
function logged<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This>,
) {
  return function (this: This, ...args: Args): R {
    console.log(\`appel de \${String(context.name)}\`);
    return target.call(this, ...args);
  };
}
class Service {
  @logged
  run() { /* ... */ }
}

// Alternative aux enum : objet const + union de littéraux
const Role = { Admin: "admin", User: "user" } as const;
type Role = (typeof Role)[keyof typeof Role]; // "admin" | "user"

// TS 5.8 : "erasableSyntaxOnly": true interdit enum, namespace
// et paramètres de propriétés (constructor(private x)) : seule la
// syntaxe qui disparaît en retirant les types est acceptée.`,
    explanation: "satisfies vérifie sans élargir, using automatise le nettoyage, les décorateurs standard (TS 5.0) remplacent l'ancienne option experimentalDecorators, et un objet as const avec une union remplace avantageusement un enum quand erasableSyntaxOnly est activé.",
  },
];

function ConceptCard({ concept }: { concept: TypeConcept }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <Card className="p-6 space-y-4 border-border/40">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Braces className="w-4 h-4 text-blue-500" />
            <h3 className="text-lg font-bold">{concept.name}</h3>
            <Badge variant="outline" className="text-[10px]">{concept.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{concept.description}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative group">
            <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
              {concept.code}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(concept.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground bg-blue-500/5 p-3 rounded-lg border border-blue-500/20">
            {concept.explanation}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function AdvancedTypesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Braces className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Types Avancés</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Types Avancés TypeScript
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les types avancés de TypeScript : mapped types, conditional types,
          template literal types, discriminated unions, branded types et syntaxe moderne (satisfies, using, décorateurs).
        </p>
      </section>

      <div className="space-y-6">
        {concepts.map((c) => (
          <ConceptCard key={c.name} concept={c} />
        ))}
      </div>
    </div>
  );
}