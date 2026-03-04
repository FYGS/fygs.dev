"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle, ArrowRight, Lightbulb, Code2 } from "lucide-react";

const patterns = [
  {
    title: "Contraintes avec extends",
    level: "Intermédiaire",
    code: `// Contraindre un generic à avoir certaines propriétés
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Contrainte avec interface
interface HasId { id: string }
function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Contrainte mutuelle
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}`,
    insight: "extends dans les generics agit comme un contrat : le type doit satisfaire la contrainte pour être accepté.",
  },
  {
    title: "Inférence avancée",
    level: "Avancé",
    code: `// Le type est inféré automatiquement
function createPair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const pair = createPair("hello", 42); // [string, number]

// Inférence contextuelle dans les callbacks
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}
const lengths = map(["a", "bb", "ccc"], s => s.length); // number[]

// ASTUCE : forcer l'inférence avec satisfies
const config = {
  port: 3000,
  host: "localhost",
} satisfies Record<string, string | number>;
// Le type est { port: number; host: string } et non Record<string, string|number>`,
    insight: "TypeScript infère les generics à partir du contexte d'appel. satisfies permet de valider un type tout en gardant l'inférence précise.",
  },
  {
    title: "Builder Pattern Typé",
    level: "Avancé",
    code: `// Builder pattern avec types qui évoluent à chaque étape
class QueryBuilder<T extends Record<string, unknown> = {}> {
  private clauses: Record<string, unknown> = {};

  where<K extends string, V>(
    key: K,
    value: V
  ): QueryBuilder<T & Record<K, V>> {
    this.clauses[key] = value;
    return this as any;
  }

  build(): T {
    return this.clauses as T;
  }
}

// Le type s'affine à chaque appel
const query = new QueryBuilder()
  .where("name", "Fernand")      // QueryBuilder<{ name: string }>
  .where("age", 30)               // QueryBuilder<{ name: string; age: number }>
  .where("active", true)          // QueryBuilder<{ name: string; age: number; active: boolean }>
  .build();                        // { name: string; age: number; active: boolean }

console.log(query.name);  // OK
console.log(query.age);   // OK
// console.log(query.foo); // Error!`,
    insight: "Le type du builder s'enrichit à chaque appel grâce à l'intersection T & Record<K, V>. C'est le pattern 'type accumulation'.",
  },
  {
    title: "Generics Récursifs",
    level: "Expert",
    code: `// JSON type complet
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Paths type - extraire tous les chemins d'un objet
type Path<T> = T extends object
  ? { [K in keyof T & string]:
      | K
      | \`\${K}.\${Path<T[K]>}\`
    }[keyof T & string]
  : never;

interface Config {
  db: { host: string; port: number };
  auth: { secret: string; providers: { google: boolean } };
}

type ConfigPaths = Path<Config>;
// "db" | "db.host" | "db.port" | "auth" | "auth.secret" | "auth.providers" | "auth.providers.google"

// Type-safe get function
function get<T, P extends Path<T>>(obj: T, path: P): any {
  return path.split(".").reduce((o: any, k) => o?.[k], obj);
}`,
    insight: "Les types récursifs s'appellent eux-mêmes. Attention : TypeScript a une limite de profondeur (~50 niveaux). Utilisez des heuristiques de court-circuit.",
  },
  {
    title: "Higher-Kinded Types (simulés)",
    level: "Expert",
    code: `// TypeScript n'a pas de HKT natifs, mais on peut les simuler

// Le pattern "Type Class" via interface
interface Functor<F> {
  map: <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
}

// URI pattern utilisé par fp-ts
interface HKT<URI, A> {
  readonly _URI: URI;
  readonly _A: A;
}

// Exemple concret : Option monad
type Option<A> = { _tag: "Some"; value: A } | { _tag: "None" };

const some = <A>(value: A): Option<A> => ({ _tag: "Some", value });
const none: Option<never> = { _tag: "None" };

function mapOption<A, B>(opt: Option<A>, f: (a: A) => B): Option<B> {
  return opt._tag === "Some" ? some(f(opt.value)) : none;
}

function flatMap<A, B>(opt: Option<A>, f: (a: A) => Option<B>): Option<B> {
  return opt._tag === "Some" ? f(opt.value) : none;
}`,
    insight: "Les HKT permettent d'abstraire sur les conteneurs (Option, Array, Promise) de manière uniforme. C'est la base de la programmation fonctionnelle typée.",
  },
];

export default function GenericsDeepDivePage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Puzzle className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Generics Deep Dive</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Generics en Profondeur
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Des contraintes basiques aux higher-kinded types simulés.
          Maîtrisez chaque aspect des generics TypeScript.
        </p>
      </section>

      <div className="space-y-6">
        {patterns.map((p, idx) => (
          <Card
            key={p.title}
            className={`p-6 space-y-4 border-border/40 cursor-pointer transition-all ${openIdx === idx ? "ring-2 ring-purple-500/20" : ""}`}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold">{p.title}</h3>
                <Badge variant="outline" className="text-[10px]">{p.level}</Badge>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform ${openIdx === idx ? "rotate-90" : ""}`} />
            </div>

            {openIdx === idx && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                  {p.code}
                </pre>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{p.insight}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}