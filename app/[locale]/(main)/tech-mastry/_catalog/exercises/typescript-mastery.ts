import type { AreaExercises } from "./types";

export const typescriptMasteryExercises: AreaExercises = {
  "/tech-mastry/typescript-mastery/advanced-types": [
    {
      id: "typescript-mastery-advanced-types-fill-1",
      type: "fill",
      prompt: "Complétez ces trois types avancés.",
      code: "type Opt<T> = { [K {{1}} keyof T]{{2}}: T[K] };\ntype ElementOf<T> = T extends (infer E)[] ? E : {{3}};",
      blanks: [
        { options: ["of", "in", "extends"], answer: 1 },
        { options: ["?", "-?", "readonly"], answer: 0 },
        { options: ["unknown", "T", "never"], answer: 2 },
      ],
      explanation:
        "Un mapped type itère avec in, et ? rend les propriétés optionnelles (-? ferait l'inverse). Le cas par défaut never fait disparaître les membres non tableau d'une union.",
    },
    {
      id: "typescript-mastery-advanced-types-match-1",
      type: "match",
      prompt: "Associez chaque notion de typage à sa définition.",
      pairs: [
        { term: "Mapped type", definition: "Itère sur les clés d'un type avec [K in keyof T]" },
        { term: "Conditional type", definition: "Choisit un type selon la forme T extends U ? X : Y" },
        { term: "infer", definition: "Capture un type à l'intérieur d'un conditional type" },
        { term: "Template literal type", definition: "Compose des types string avec une syntaxe `${...}`" },
        { term: "Discriminated union", definition: "Union dont un champ littéral commun permet d'affiner le type" },
      ],
      explanation:
        "infer n'existe que dans la branche extends d'un conditional type, alors qu'un mapped type construit un nouvel objet à partir des clés.",
    },
    {
      id: "typescript-mastery-advanced-types-classify-1",
      type: "classify",
      prompt: "Classez chaque élément selon qu'il disparaît à la compilation ou qu'il existe à l'exécution.",
      categories: ["N'existe qu'à la compilation", "Existe à l'exécution"],
      items: [
        { text: "Brand<string, \"UserId\">", category: 0 },
        { text: "interface User { name: string }", category: 0 },
        { text: "type Result<T> = { ok: true; data: T } | { ok: false }", category: 0 },
        { text: "La propriété status d'un objet réel", category: 1 },
        { text: "Un enum non const", category: 1 },
        { text: "Une classe", category: 1 },
      ],
      explanation:
        "Les types, interfaces et alias sont effacés ; classes et enums produisent du code JavaScript. C'est pourquoi un brand ou un cast ne valide rien à l'exécution.",
    },
  ],
  "/tech-mastry/typescript-mastery/generics-deep-dive": [
    {
      id: "typescript-mastery-generics-deep-dive-fill-1",
      type: "fill",
      prompt: "Complétez cette fonction générique et cette configuration validée.",
      code: "function pick<T, K {{1}} keyof T>(obj: T, key: K): {{2}} {\n  return obj[key];\n}\nconst cfg = { port: 3000 } {{3}} Record<string, number>;",
      blanks: [
        { options: ["in", "extends", "implements"], answer: 1 },
        { options: ["T[K]", "K", "T"], answer: 0 },
        { options: ["as", "satisfies", "extends"], answer: 1 },
      ],
      explanation:
        "Dans un paramètre de type, la contrainte s'écrit extends. satisfies vérifie la conformité sans élargir cfg, alors que as forcerait le type sans garantie.",
    },
    {
      id: "typescript-mastery-generics-deep-dive-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la construction d'une fonction getProperty typée.",
      steps: [
        "Écrire la fonction avec un paramètre T pour l'objet et un paramètre key",
        "Constater que obj[key] est refusé pour une clé quelconque",
        "Ajouter K extends keyof T pour contraindre la clé",
        "Typer le retour avec T[K]",
        "Appeler avec un littéral : K est inféré et le retour est précis",
      ],
      explanation:
        "On part de l'erreur pour comprendre la contrainte : sans lien entre la clé et l'objet, rien ne garantit que la propriété existe. Le retour T[K] découle de cette contrainte.",
    },
    {
      id: "typescript-mastery-generics-deep-dive-classify-1",
      type: "classify",
      prompt: "Avec getProperty<T, K extends keyof T>(o: T, k: K), classez chaque appel selon qu'il compile ou non.",
      categories: ["Compile", "Erreur de compilation"],
      items: [
        { text: "getProperty({ a: 1 }, \"a\")", category: 0 },
        { text: "getProperty({ a: 1, b: 2 }, \"b\")", category: 0 },
        { text: "getProperty(\"abc\", \"length\")", category: 0 },
        { text: "getProperty({ a: 1 }, \"b\")", category: 1 },
        { text: "getProperty({ a: 1 }, 0)", category: 1 },
        { text: "getProperty(null, \"x\")", category: 1 },
      ],
      explanation:
        "La clé doit appartenir à keyof T. Une string a une propriété length, mais keyof null est never, donc aucune clé n'est acceptée.",
    },
  ],
  "/tech-mastry/typescript-mastery/type-challenges": [
    {
      id: "typescript-mastery-type-challenges-fill-1",
      type: "fill",
      prompt: "Complétez ces deux types utilitaires.",
      code: "type MyPick<T, K extends {{1}} T> = { [P {{2}} K]: T[P] };\ntype IsString<T> = T {{3}} string ? true : false;",
      blanks: [
        { options: ["typeof", "keyof", "infer"], answer: 1 },
        { options: ["in", "of", "as"], answer: 0 },
        { options: ["extends", "in", "implements"], answer: 0 },
      ],
      explanation:
        "K doit être une clé de T (keyof T) pour écrire T[P]. extends sert aussi bien de contrainte que de test dans un conditional type.",
    },
    {
      id: "typescript-mastery-type-challenges-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la dérivation du type ParseQueryString.",
      steps: [
        "Matcher `${infer Key}=${infer Value}&${infer Rest}` pour isoler la première paire",
        "Produire { [K in Key]: Value } pour cette paire",
        "Appeler récursivement le type sur Rest",
        "Prévoir la branche finale sans & : `${infer Key}=${infer Value}`",
        "Aplatir l'intersection obtenue avec un utilitaire Prettify",
      ],
      explanation:
        "Sans la branche finale, la dernière paire serait perdue car le premier motif exige un &. Prettify n'est qu'un confort d'affichage.",
    },
    {
      id: "typescript-mastery-type-challenges-match-1",
      type: "match",
      prompt: "Associez chaque utility type à son effet.",
      pairs: [
        { term: "Partial<T>", definition: "Rend toutes les propriétés optionnelles" },
        { term: "Required<T>", definition: "Retire l'optionnalité de toutes les propriétés" },
        { term: "Pick<T, K>", definition: "Garde seulement les clés choisies" },
        { term: "Omit<T, K>", definition: "Retire les clés choisies" },
        { term: "ReturnType<F>", definition: "Extrait le type retourné par une fonction" },
        { term: "Record<K, V>", definition: "Construit un objet dont les clés et valeurs sont données" },
      ],
      explanation:
        "Pick et Omit sont complémentaires, tout comme Partial et Required. La plupart se réécrivent avec un mapped type, ce qui est précisément le but des défis.",
    },
  ],
  "/tech-mastry/typescript-mastery/design-patterns": [
    {
      id: "typescript-mastery-design-patterns-match-1",
      type: "match",
      prompt: "Associez chaque pattern à ce qu'il apporte.",
      pairs: [
        { term: "Builder", definition: "Construction progressive d'un objet, avec étapes vérifiées par les types" },
        { term: "Strategy", definition: "Algorithmes interchangeables derrière une interface commune" },
        { term: "State Machine", definition: "Transitions autorisées encodées dans les types" },
        { term: "Repository", definition: "Accès aux données abstrait derrière une interface générique" },
      ],
      explanation:
        "Strategy change un comportement à l'exécution, alors que State Machine contraint la suite des états. Ne confondez pas l'interchangeabilité et l'ordre des transitions.",
    },
    {
      id: "typescript-mastery-design-patterns-classify-1",
      type: "classify",
      prompt: "Rattachez chaque besoin au pattern qui y répond.",
      categories: ["Builder", "Strategy", "State Machine"],
      items: [
        { text: "send() doit exiger que url() et method() aient été appelés", category: 0 },
        { text: "Une API fluente avec header() répétable", category: 0 },
        { text: "Remplacer un switch sur le mode de tri", category: 1 },
        { text: "Plusieurs tarifs de livraison interchangeables à l'exécution", category: 1 },
        { text: "Une commande ne peut pas passer de delivered à pending", category: 2 },
        { text: "shipped ne peut aller que vers delivered", category: 2 },
      ],
      explanation:
        "Le critère est la nature du problème : construire par étapes (Builder), choisir un algorithme (Strategy), restreindre les transitions (State Machine).",
    },
    {
      id: "typescript-mastery-design-patterns-fill-1",
      type: "fill",
      prompt: "Complétez l'encodage des transitions et la contrainte de send().",
      code: "class Order<S extends OrderState> {\n  transition<Next extends {{1}}[S]>(next: Next): Order<Next> {\n    return new Order(next);\n  }\n}\nsend({{2}}: RequestBuilder<true, true>) {}",
      blanks: [
        { options: ["OrderState", "Transitions", "Order"], answer: 1 },
        { options: ["this", "self", "$this"], answer: 0 },
      ],
      explanation:
        "Transitions[S] donne les états atteignables depuis S. Le paramètre factice this permet à une méthode de n'être appelable que sur un état précis du builder.",
    },
  ],
  "/tech-mastry/typescript-mastery/runtime-safety": [
    {
      id: "typescript-mastery-runtime-safety-fill-1",
      type: "fill",
      prompt: "Complétez ce type guard et la validation d'un corps de requête.",
      code: "function isUser(d: unknown): {{1}} {\n  return typeof d === \"object\" && d !== null && \"name\" in d;\n}\nconst r = UserSchema.{{2}}(body);\nif (!r.{{3}}) return;",
      blanks: [
        { options: ["asserts d", "d is User", "d: User"], answer: 1 },
        { options: ["safeParse", "parse", "check"], answer: 0 },
        { options: ["ok", "success", "valid"], answer: 1 },
      ],
      explanation:
        "Un prédicat de type s'écrit d is User. safeParse renvoie un objet avec success, alors que parse renverrait directement les données ou lèverait une exception.",
    },
    {
      id: "typescript-mastery-runtime-safety-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le traitement sûr d'un corps de requête dans une route API.",
      steps: [
        "Lire le corps comme inconnu : await req.json()",
        "Le valider avec UserSchema.safeParse(body)",
        "Répondre 400 avec les erreurs quand success vaut false",
        "Utiliser result.data, désormais typé, pour écrire en base",
      ],
      explanation:
        "Une donnée externe reste suspecte tant qu'elle n'est pas validée. Après le test de success, TypeScript sait que result.data a le type du schéma.",
    },
    {
      id: "typescript-mastery-runtime-safety-classify-1",
      type: "classify",
      prompt: "Classez chaque mécanisme selon qu'il vérifie à la compilation ou à l'exécution.",
      categories: ["Vérifié à la compilation", "Vérifié à l'exécution"],
      items: [
        { text: "assertNever dans le default d'un switch", category: 0 },
        { text: "satisfies Record<Shape[\"kind\"], string>", category: 0 },
        { text: "z.infer<typeof Schema>", category: 0 },
        { text: "UserSchema.safeParse(body)", category: 1 },
        { text: "Le corps d'un type guard isUser(d)", category: 1 },
        { text: "envSchema.safeParse(process.env)", category: 1 },
      ],
      explanation:
        "z.infer ne fait que dériver un type : seul le schéma, lui, contrôle les données réelles. Le corps d'un type guard s'exécute, mais le compilateur ne le vérifie pas.",
    },
  ],
  "/tech-mastry/typescript-mastery/compiler-api": [
    {
      id: "typescript-mastery-compiler-api-match-1",
      type: "match",
      prompt: "Associez chaque option de tsconfig à son effet.",
      pairs: [
        { term: "strict", definition: "Active la famille des vérifications strictes" },
        { term: "noUncheckedIndexedAccess", definition: "Ajoute undefined aux accès par index" },
        { term: "skipLibCheck", definition: "Ignore la vérification des fichiers .d.ts" },
        { term: "composite", definition: "Requis pour qu'un projet puisse être référencé" },
        { term: "isolatedModules", definition: "Impose que chaque fichier soit transpilable seul (esbuild, SWC, Babel)" },
      ],
      explanation:
        "skipLibCheck porte sur les déclarations, pas sur votre code. composite est le prérequis des project references et du mode tsc --build.",
    },
    {
      id: "typescript-mastery-compiler-api-fill-1",
      type: "fill",
      prompt: "Complétez ce parcours d'AST avec l'API du compilateur.",
      code: "const sf = ts.{{1}}(\"a.ts\", code, ts.ScriptTarget.Latest, true);\nts.{{2}}(sf, (child) => visit(child));\nif (ts.{{3}}(node)) { /* propriété d'interface */ }",
      blanks: [
        { options: ["parseFile", "createSourceFile", "readFile"], answer: 1 },
        { options: ["visitEachChild", "walk", "forEachChild"], answer: 2 },
        { options: ["isPropertySignature", "isProperty", "hasSignature"], answer: 0 },
      ],
      explanation:
        "createSourceFile produit l'AST, forEachChild visite les enfants directs, et les fonctions ts.isXxx sont des type guards sur les nœuds. visitEachChild sert aux transformers et exige un contexte.",
    },
    {
      id: "typescript-mastery-compiler-api-classify-1",
      type: "classify",
      prompt: "Classez ces options selon qu'elles sont incluses dans strict ou à activer séparément.",
      categories: ["Incluse dans strict", "À activer à part"],
      items: [
        { text: "strictNullChecks", category: 0 },
        { text: "noImplicitAny", category: 0 },
        { text: "useUnknownInCatchVariables", category: 0 },
        { text: "noUncheckedIndexedAccess", category: 1 },
        { text: "noUnusedLocals", category: 1 },
        { text: "exactOptionalPropertyTypes", category: 1 },
      ],
      explanation:
        "strict regroupe une famille précise de vérifications. Les options plus rigoureuses comme noUncheckedIndexedAccess restent volontairement à part.",
    },
  ],
};
