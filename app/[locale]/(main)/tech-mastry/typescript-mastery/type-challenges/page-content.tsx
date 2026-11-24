"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  CheckCircle2,
  Eye,
  Code2,
  Lightbulb,
  Flame,
} from "lucide-react";

interface Challenge {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  description: string;
  starter: string;
  solution: string;
  tests: string;
  hint: string;
}

const challenges: Challenge[] = [
  {
    title: "MyPick<T, K>",
    difficulty: "Easy",
    description:
      "Implémenter le type utilitaire Pick<T, K> sans utiliser le Built-in.",
    starter: `type MyPick<T, K> = /* Votre implémentation */`,
    solution: `type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};`,
    tests: `interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type Expected = { title: string; completed: boolean };
type Result = MyPick<Todo, "title" | "completed">; // = Expected ✅`,
    hint: "Utilisez un mapped type avec 'in' pour itérer sur les clés K, et contraignez K avec 'extends keyof T'.",
  },
  {
    title: "DeepReadonly<T>",
    difficulty: "Medium",
    description:
      "Rendre toutes les propriétés d'un objet récursivement en lecture seule, y compris les objets imbriqués.",
    starter: `type DeepReadonly<T> = /* Votre implémentation */`,
    solution: `type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};`,
    tests: `interface Config {
  db: { host: string; port: number };
  features: { dark: boolean };
}

type FR = DeepReadonly<Config>;
// FR.db.host = "x"  ❌ Error: readonly
// FR.features.dark = false  ❌ Error: readonly`,
    hint: "Appliquez readonly récursivement avec un conditional type. N'oubliez pas d'exclure les fonctions du traitement récursif.",
  },
  {
    title: "Flatten<T>",
    difficulty: "Medium",
    description: "Aplatir un type tableau imbriqué en un tableau simple.",
    starter: `type Flatten<T> = /* Votre implémentation */`,
    solution: `type Flatten<T> = T extends readonly (infer U)[]
  ? Flatten<U>
  : T;

// Version pour un seul niveau
type FlattenOnce<T> = T extends readonly (infer U)[]
  ? U
  : T;`,
    tests: `type A = Flatten<[1, [2, [3]], [4, [5, [6]]]]>;
// A = 1 | 2 | 3 | 4 | 5 | 6

type B = Flatten<string[][]>;
// B = string`,
    hint: "Utilisez 'infer' pour extraire le type intérieur du tableau, puis appelez récursivement Flatten.",
  },
  {
    title: "ParseQueryString<S>",
    difficulty: "Hard",
    description:
      "Parser une query string en un objet typé. Exemple : 'a=1&b=2' → { a: '1'; b: '2' }",
    starter: `type ParseQueryString<S extends string> = /* Votre implémentation */`,
    solution: `type ParseQueryString<S extends string> =
  S extends \`\${infer Key}=\${infer Value}&\${infer Rest}\`
    ? { [K in Key]: Value } & ParseQueryString<Rest>
    : S extends \`\${infer Key}=\${infer Value}\`
      ? { [K in Key]: Value }
      : {};

type Prettify<T> = { [K in keyof T]: T[K] } & {};`,
    tests: `type Q1 = Prettify<ParseQueryString<"name=John&age=30&city=Paris">>;
// { name: "John"; age: "30"; city: "Paris" }

type Q2 = ParseQueryString<"">;
// {}

type Q3 = Prettify<ParseQueryString<"key=value">>;
// { key: "value" }`,
    hint: "Utilisez les template literal types avec infer pour extraire key, value, et le reste. Traitez récursivement en splittant sur '&'.",
  },
  {
    title: "Type-Safe EventEmitter",
    difficulty: "Extreme",
    description:
      "Créer un EventEmitter entièrement typé où chaque événement a son propre type de payload.",
    starter: `type EventMap = { /* ... */ }
class TypedEmitter<T extends EventMap> { /* ... */ }`,
    solution: `type EventMap = Record<string, any>;

class TypedEmitter<T extends EventMap> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, fn: (payload: T[K]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return this;
  }

  emit<K extends keyof T>(event: K, payload: T[K]): boolean {
    const fns = this.listeners.get(event);
    if (!fns?.size) return false;
    fns.forEach(fn => fn(payload));
    return true;
  }

  off<K extends keyof T>(event: K, fn: (payload: T[K]) => void): this {
    this.listeners.get(event)?.delete(fn);
    return this;
  }
}

// Utilisation
interface MyEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: Error;
}

const emitter = new TypedEmitter<MyEvents>();
emitter.on("login", (data) => {
  // data est typé : { userId: string; timestamp: number }
  console.log(data.userId);
});
// emitter.emit("login", { userId: "abc" });
// ❌ Error: property 'timestamp' manquant`,
    tests: `// ✅ Compile
emitter.emit("login", { userId: "1", timestamp: Date.now() });
emitter.emit("error", new Error("oops"));

// ❌ Ne compile pas
// emitter.emit("login", { userId: "1" }); // Missing timestamp
// emitter.emit("unknown", {}); // Unknown event
// emitter.on("error", (e: string) => {}); // Wrong handler type`,
    hint: "La clé est de contraindre K extends keyof T pour que le type du payload soit automatiquement déduit de T[K].",
  },
];

const difficultyColors: Record<string, string> = {
  Easy: "text-green-500 border-green-500/20 bg-green-500/10",
  Medium: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
  Hard: "text-orange-500 border-orange-500/20 bg-orange-500/10",
  Extreme: "text-red-500 border-red-500/20 bg-red-500/10",
};

const difficultyIcons: Record<string, React.ReactNode> = {
  Easy: <CheckCircle2 className="w-3 h-3" />,
  Medium: <Code2 className="w-3 h-3" />,
  Hard: <Flame className="w-3 h-3" />,
  Extreme: <Trophy className="w-3 h-3" />,
};

export default function TypeChallengesPage() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-500">
            Type Challenges
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Défis de Types TypeScript
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Progressez du niveau Easy à Extreme. Résolvez chaque défi sans
          regarder la solution !
        </p>
      </section>

      <div className="space-y-8">
        {challenges.map((c, idx) => (
          <Card key={c.title} className="p-6 space-y-5 border-border/40">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground/50">
                  #{idx + 1}
                </span>
                <h3 className="text-lg font-bold font-mono">{c.title}</h3>
              </div>
              <Badge
                variant="outline"
                className={`gap-1 ${difficultyColors[c.difficulty]}`}
              >
                {difficultyIcons[c.difficulty]}
                {c.difficulty}
              </Badge>
            </div>

            <p className="text-muted-foreground">{c.description}</p>

            <Tabs defaultValue="starter" className="w-full">
              <TabsList className="bg-muted/30">
                <TabsTrigger value="starter">Départ</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="solution" disabled={!revealed[idx]}>
                  Solution {!revealed[idx] && "🔒"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="starter">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
                  {c.starter}
                </pre>
              </TabsContent>

              <TabsContent value="tests">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
                  {c.tests}
                </pre>
              </TabsContent>

              <TabsContent value="solution">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto" tabIndex={0}>
                  {c.solution}
                </pre>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowHint((h) => ({ ...h, [idx]: !h[idx] }))}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                {showHint[idx] ? "Masquer l'indice" : "Voir l'indice"}
              </button>
              {!revealed[idx] && (
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [idx]: true }))}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Révéler la solution
                </button>
              )}
            </div>

            {showHint[idx] && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 animate-in fade-in">
                <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{c.hint}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
