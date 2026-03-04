"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

interface Technique {
  title: string;
  level: string;
  problem: string;
  unsafe: string;
  safe: string;
  keyTakeaway: string;
}

const techniques: Technique[] = [
  {
    title: "Type Guards Personnalisés",
    level: "Intermédiaire",
    problem:
      "Valider et affiner les types à runtime sans perdre la sécurité de type.",
    unsafe: `// ❌ Dangereux : assertion aveugle
function processUser(data: unknown) {
  const user = data as User; // Pas de vérification !
  console.log(user.name);    // Runtime error si data n'est pas un User
}

// ❌ Dangereux : typeof insuffisant
if (typeof data === "object") {
  data.name; // Error : toujours 'object | null'
}`,
    safe: `// ✅ Type guard avec 'is'
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as User).name === "string" &&
    "email" in data &&
    typeof (data as User).email === "string"
  );
}

// ✅ Assertion function (throw si invalide)
function assertUser(data: unknown): asserts data is User {
  if (!isUser(data)) {
    throw new Error("Invalid user data");
  }
}

// Utilisation
function processUser(data: unknown) {
  assertUser(data); // Après cette ligne, data est User
  console.log(data.name);  // ✅ Typé correctement
  console.log(data.email); // ✅ Typé correctement
}`,
    keyTakeaway:
      "Les type guards avec 'is' affinent le type dans le scope. Les assertion functions avec 'asserts' lèvent une exception si la condition échoue.",
  },
  {
    title: "Validation avec Zod",
    level: "Intermédiaire",
    problem:
      "Valider les données externes (API, formulaires, env) avec des schémas déclaratifs.",
    unsafe: `// ❌ Pas de validation
const body = await req.json(); // any
const user = body.user;        // any
db.insert(user);               // Injection possible !

// ❌ Validation manuelle fragile
if (body.email && body.name) {
  // Et si email n'est pas un string ?
  // Et si name est vide ?
}`,
    safe: `import { z } from "zod";

// Schéma déclaratif
const UserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(13).max(150).optional(),
  role: z.enum(["admin", "user", "moderator"]),
  metadata: z.record(z.unknown()).optional(),
});

// Le type est dérivé automatiquement !
type User = z.infer<typeof UserSchema>;
// { name: string; email: string; age?: number; role: "admin"|"user"|"moderator"; metadata?: Record<string, unknown> }

// Validation d'API
export async function POST(req: Request) {
  const body = await req.json();
  const result = UserSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // result.data est typé User ✅
  return db.users.create({ data: result.data });
}

// Composition de schémas
const CreateUserSchema = UserSchema.omit({ role: true });
const UpdateUserSchema = UserSchema.partial().required({ email: true });
const AdminSchema = UserSchema.extend({ permissions: z.array(z.string()) });`,
    keyTakeaway:
      "Zod combine validation runtime et inférence de type. z.infer<typeof Schema> élimine la duplication type/validation.",
  },
  {
    title: "Discriminated Unions Runtime",
    level: "Avancé",
    problem:
      "Gérer le pattern Result/Either pour des erreurs typées sans exceptions.",
    unsafe: `// ❌ Exceptions non typées
async function getUser(id: string): Promise<User> {
  const user = await db.users.findUnique({ where: { id } });
  if (!user) throw new Error("Not found"); // Le type ne reflète pas l'erreur
  return user;
}

// L'appelant ne sait pas quelles erreurs peuvent survenir
try {
  const user = await getUser("123");
} catch (e) {
  // e est 'unknown' - pas d'auto-complétion
}`,
    safe: `// ✅ Result type explicite
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Erreurs typées
type UserError =
  | { code: "NOT_FOUND"; userId: string }
  | { code: "FORBIDDEN"; reason: string }
  | { code: "VALIDATION"; fields: string[] };

async function getUser(id: string): Promise<Result<User, UserError>> {
  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    return { success: false, error: { code: "NOT_FOUND", userId: id } };
  }

  return { success: true, data: user };
}

// L'appelant gère TOUTES les erreurs possibles
const result = await getUser("123");
if (!result.success) {
  switch (result.error.code) {
    case "NOT_FOUND":
      console.log(\`User \${result.error.userId} introuvable\`);
      break;
    case "FORBIDDEN":
      console.log(result.error.reason);
      break;
    case "VALIDATION":
      console.log(\`Champs invalides: \${result.error.fields.join(", ")}\`);
      break;
  }
  return;
}

// result.data est User ici ✅
console.log(result.data.name);`,
    keyTakeaway:
      "Le pattern Result encode les erreurs dans le type de retour. L'exhaustive check du switch garantit que tous les cas sont traités.",
  },
  {
    title: "Environment Variables Typées",
    level: "Avancé",
    problem:
      "Garantir la présence et le typage des variables d'environnement au démarrage.",
    unsafe: `// ❌ process.env est Record<string, string | undefined>
const secret = process.env.JWT_SECRET; // string | undefined
jwt.sign(payload, secret); // Error possible à runtime !

// ❌ process.env.PORT peut ne pas être un nombre valide
const port = Number(process.env.PORT); // NaN silencieux`,
    safe: `import { z } from "zod";

// Schéma des variables d'environnement
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
});

// Validation au démarrage (crash early)
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();

// Utilisation : tout est typé et garanti
env.JWT_SECRET;   // string (min 32 chars) ✅
env.PORT;         // number ✅
env.NODE_ENV;     // "development" | "production" | "test" ✅
env.REDIS_URL;    // string | undefined ✅`,
    keyTakeaway:
      "Validez les variables d'environnement au démarrage de l'application. Si une variable manque, mieux vaut crasher immédiatement que découvrir l'erreur en production.",
  },
  {
    title: "Narrowing Exhaustif",
    level: "Expert",
    problem:
      "Garantir au compile-time que tous les cas d'une union sont traités.",
    unsafe: `// ❌ Oublier un cas silencieusement
type Shape = "circle" | "square" | "triangle";

function area(shape: Shape): number {
  if (shape === "circle") return Math.PI * 10 * 10;
  if (shape === "square") return 10 * 10;
  // "triangle" oublié ! Retourne undefined → NaN à runtime
  return 0;
}`,
    safe: `// ✅ Exhaustive check avec never
function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${value}\`);
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
      // Si on ajoute un nouveau kind (ex: "hexagon"),
      // TypeScript signale IMMÉDIATEMENT l'erreur ici !
  }
}

// Variante avec satisfies pour les records
const shapeLabels = {
  circle: "Cercle",
  square: "Carré",
  triangle: "Triangle",
} satisfies Record<Shape["kind"], string>;
// Ajouter un kind sans le label → Error !`,
    keyTakeaway:
      "assertNever(value: never) force le compilateur à vérifier que toutes les branches sont couvertes. Ajoutez-le systématiquement dans les switch sur des discriminated unions.",
  },
];

export default function RuntimeSafetyPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            Runtime Safety
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Sécurité à l{"'"}Exécution
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Combler le fossé entre les types compile-time et la réalité runtime.
          Validez, gardez, et sécurisez vos données.
        </p>
      </section>

      <div className="space-y-6">
        {techniques.map((t, idx) => (
          <Card
            key={t.title}
            className={`p-6 space-y-4 border-border/40 cursor-pointer transition-all ${openIdx === idx ? "ring-2 ring-green-500/20" : ""}`}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-bold">{t.title}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {t.level}
                </Badge>
              </div>
              <ArrowRight
                className={`w-4 h-4 transition-transform ${openIdx === idx ? "rotate-90" : ""}`}
              />
            </div>

            <p className="text-sm text-muted-foreground">{t.problem}</p>

            {openIdx === idx && (
              <div
                className="space-y-4 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Tabs defaultValue="safe" className="w-full">
                  <TabsList className="bg-muted/30">
                    <TabsTrigger value="unsafe" className="gap-1">
                      <XCircle className="w-3 h-3 text-red-500" />
                      Dangereux
                    </TabsTrigger>
                    <TabsTrigger value="safe" className="gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Sécurisé
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="unsafe">
                    <pre className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {t.unsafe}
                    </pre>
                  </TabsContent>
                  <TabsContent value="safe">
                    <pre className="rounded-xl bg-green-500/5 border border-green-500/20 p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {t.safe}
                    </pre>
                  </TabsContent>
                </Tabs>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t.keyTakeaway}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
