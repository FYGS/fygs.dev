import type { AreaQuizzes } from "./types";

export const typescriptMasteryQuizzes: AreaQuizzes = {
  "/tech-mastry/typescript-mastery/advanced-types": [
    {
      id: "typescript-mastery-advanced-types-1",
      question:
        "Que donne ce type ?\ntype Opt<T> = { [K in keyof T]?: T[K] };\ntype R = Opt<{ a: string; b: number }>;",
      options: [
        "{ a: string | undefined; b: number | undefined }",
        "{ a?: string; b?: number }",
        "{ a?: string } | { b?: number }",
        "Une erreur : un mapped type ne peut pas ajouter de modificateur",
      ],
      correctIndex: 1,
      explanation:
        "Le modificateur ? dans un mapped type rend chaque propriété optionnelle, exactement comme Partial. Ce n'est pas une union de deux objets : toutes les clés restent dans un seul objet.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-advanced-types-2",
      question:
        "type S = { status: \"idle\" } | { status: \"ok\"; data: string[] };\nfunction f(s: S) {\n  return s.data;\n}\nQue fait le compilateur ?",
      options: [
        "Il accepte et le type de retour est string[] | undefined",
        "Il accepte, car TypeScript fusionne les propriétés de tous les membres de l'union",
        "Il refuse : il faut un cast vers le membre ok avec as",
        "Il refuse : data n'existe pas sur tous les membres, testez d'abord s.status",
      ],
      correctIndex: 3,
      explanation:
        "On ne peut lire que les propriétés communes à tous les membres d'une union. Tester le discriminant s.status === \"ok\" affine le type, alors qu'un cast réduirait la sécurité sans rien vérifier.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-advanced-types-3",
      question:
        "type ElementOf<T> = T extends (infer E)[] ? E : never;\ntype X = ElementOf<string[] | number>;\nQuel est le type de X ?",
      options: ["string", "string | number", "never", "string[] | number"],
      correctIndex: 0,
      explanation:
        "Le conditional type est distributif sur une union nue : string[] donne string, number donne never, et never disparaît de l'union. On n'obtient pas string | number, car number ne correspond pas à un tableau.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-advanced-types-4",
      question:
        "type K = `${\"a\" | \"b\"}-${1 | 2}`;\nCombien de membres contient l'union K ?",
      options: [
        "2 : \"a-1\" et \"b-2\", appariés par position",
        "1 seul type : `${string}-${number}`",
        "4 : le produit cartésien des deux unions",
        "6 : chaque union plus leurs combinaisons",
      ],
      correctIndex: 2,
      explanation:
        "Un template literal type distribue chaque union et produit toutes les combinaisons : a-1, a-2, b-1, b-2. Il n'apparie pas les éléments par position et ne se généralise pas à string tant que les unions sont finies.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-advanced-types-5",
      question:
        "type Brand<T, B extends string> = T & { readonly __brand: B };\ntype UserId = Brand<string, \"UserId\">;\nconst id = \"u1\" as UserId;\nQuelle affirmation est vraie ?",
      options: [
        "Le compilateur ajoute réellement une propriété __brand à la valeur à l'exécution",
        "Le brand n'existe qu'au type : à l'exécution, id est une string ordinaire",
        "Le cast as UserId valide le format de la valeur à l'exécution",
        "Un OrderId construit de la même façon reste assignable à UserId",
      ],
      correctIndex: 1,
      explanation:
        "Les types sont effacés à la compilation : id est une simple string, et as ne vérifie rien (la sécurité vient d'une fonction de construction contrôlée). OrderId n'est pas assignable à UserId car les littéraux de __brand diffèrent, ce qui est justement le but.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/typescript-mastery/generics-deep-dive": [
    {
      id: "typescript-mastery-generics-deep-dive-1",
      question:
        "function getProperty<T, K extends keyof T>(o: T, k: K): T[K] {\n  return o[k];\n}\nconst v = getProperty({ a: 1, b: \"x\" }, \"b\");\nQuel est le type de v ?",
      options: ["number | string", "any", "string", "\"b\""],
      correctIndex: 2,
      explanation:
        "K est inféré comme le littéral \"b\", donc T[K] vaut le type de la propriété b, soit string. Le type n'est pas l'union des propriétés, c'est ce qui rend la signature utile.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-generics-deep-dive-2",
      question:
        "Pourquoi écrire <T, K extends keyof T>(o: T, k: K) plutôt que (o: object, k: string) ?",
      options: [
        "La clé est validée et le retour T[K] est précisément typé",
        "Le compilateur vérifie aussi que la clé existe dans l'objet à l'exécution",
        "Cela force K à être uniquement une string",
        "Cela évite de passer l'objet en premier paramètre",
      ],
      correctIndex: 0,
      explanation:
        "La contrainte relie la clé à l'objet : une clé inexistante est refusée et le type de retour suit la propriété choisie. Rien n'est vérifié à l'exécution, et keyof T peut aussi contenir des number ou des symbol.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-generics-deep-dive-3",
      question:
        "const c = { port: 3000, host: \"localhost\" }\n  satisfies Record<string, string | number>;\nc.port.toFixed(0);\nQue se passe-t-il ?",
      options: [
        "Erreur : c.port est de type string | number",
        "Erreur : satisfies convertit c en Record<string, ...>",
        "Il faut ajouter as const pour que cela compile",
        "Cela compile : c.port garde son type précis number",
      ],
      correctIndex: 3,
      explanation:
        "satisfies vérifie la conformité sans élargir le type de l'expression, donc c.port reste number. Avec une annotation : Record<string, string | number>, la propriété deviendrait string | number et toFixed serait refusé.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-generics-deep-dive-4",
      question:
        "where<K extends string, V>(key: K, value: V): QueryBuilder<T & Record<K, V>>\nPourquoi contraindre K avec extends string ?",
      options: [
        "Pour que la clé soit aussi vérifiée à l'exécution par le compilateur",
        "Pour garder le littéral \"name\" inféré, donc une vraie clé",
        "Pour empêcher que V soit inféré comme string",
        "Pour que build() renvoie T sans intersection",
      ],
      correctIndex: 1,
      explanation:
        "Sans contrainte primitive, le littéral inféré pour K serait élargi à string et Record<string, V> donnerait un index générique au lieu d'une clé précise. Avec extends string, \"name\" est conservé et query.name est correctement typé.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-generics-deep-dive-5",
      question:
        "type Path<T> = T extends object\n  ? { [K in keyof T & string]: K | `${K}.${Path<T[K]>}` }[keyof T & string]\n  : never;\ntype P = Path<{ a: { b: string } }>;\nQuel est P ?",
      options: [
        "\"a\" | \"a.b\" : la clé et son sous-chemin",
        "\"a.b\" seul, sans la clé intermédiaire a",
        "\"a\" | \"b\", chaque clé prise isolément",
        "string, car le template literal s'élargit",
      ],
      correctIndex: 0,
      explanation:
        "Path<string> vaut never, donc pour la feuille b on obtient seulement \"b\" (un template avec never donne never). Pour a, on garde \"a\" et on ajoute \"a.b\" : on ne perd pas la clé intermédiaire.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/typescript-mastery/type-challenges": [
    {
      id: "typescript-mastery-type-challenges-1",
      question:
        "type MyPick<T, K> = { [P in K]: T[P] };\nQue fait le compilateur ?",
      options: [
        "Il accepte et retourne toujours {} quel que soit K",
        "Il accepte n'importe quelle valeur de K, y compris un type non-clé",
        "Il refuse : un mapped type ne peut pas utiliser un paramètre générique",
        "Il refuse : sans K extends keyof T, P ne peut pas indexer T",
      ],
      correctIndex: 3,
      explanation:
        "Pour itérer avec in, K doit être un type de clé, et pour écrire T[P], P doit appartenir à keyof T. La contrainte K extends keyof T répond aux deux exigences ; un mapped type accepte très bien un paramètre générique.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-type-challenges-2",
      question:
        "type Flatten<T> = T extends readonly (infer U)[] ? Flatten<U> : T;\ntype B = Flatten<string[][]>;\nQuel est le type de B ?",
      options: ["string[]", "string", "string[][]", "never"],
      correctIndex: 1,
      explanation:
        "string[][] donne U = string[], puis string[] donne U = string, et string n'est pas un tableau : la récursion s'arrête sur T. Le résultat est l'élément final, pas un tableau aplati d'un niveau.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-type-challenges-3",
      question:
        "type Flatten<T> = T extends readonly (infer U)[] ? Flatten<U> : T;\ntype A = Flatten<[1, [2, [3]]]>;\nQuel est A ?",
      options: ["[1, 2, 3]", "[1, [2, [3]]]", "1 | 2 | 3", "number"],
      correctIndex: 2,
      explanation:
        "Ce Flatten extrait les éléments dans une union et ne reconstruit aucun tuple : on obtient 1 | 2 | 3. Les types littéraux sont conservés, donc le résultat n'est pas number.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-type-challenges-4",
      question:
        "type DR<T> = { readonly [P in keyof T]: T[P] extends object ? DR<T[P]> : T[P] };\nQue devient une propriété onSave: () => void dans DR<{ onSave: () => void }> ?",
      options: [
        "Un objet {} sans signature d'appel, plus appelable",
        "Rien ne change, la fonction reste appelable",
        "Une récursion infinie qui fait échouer le compilateur",
        "Une fonction readonly dont le corps est figé",
      ],
      correctIndex: 0,
      explanation:
        "Une fonction étend object, donc elle est traitée récursivement, et un mapped type appliqué à un type fonction perd sa signature d'appel. C'est pourquoi la solution exclut T[P] extends Function.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-type-challenges-5",
      question:
        "emit<K extends keyof T>(event: K, payload: T[K])\nQuel est l'avantage par rapport à emit(event: keyof T, payload: T[keyof T]) ?",
      options: [
        "Aucun : les deux signatures refusent les mêmes appels",
        "La version générique vérifie aussi le payload à l'exécution",
        "T[keyof T] est refusé par le compilateur dès que T est un paramètre générique",
        "K est inféré depuis event : le payload suit le type de cet événement",
      ],
      correctIndex: 3,
      explanation:
        "Avec K, le choix de l'événement fixe le type du payload attendu. Avec T[keyof T], le payload serait accepté s'il correspond à n'importe quel événement, ce qui perd la corrélation clé et valeur.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/typescript-mastery/design-patterns": [
    {
      id: "typescript-mastery-design-patterns-1",
      question:
        "type Transitions = { draft: \"pending\" | \"cancelled\"; pending: \"confirmed\" };\nconst o = new Order(\"draft\").transition(\"pending\");\n(transition<Next extends Transitions[S]>(n: Next): Order<Next>)\nQuel est le type de o ?",
      options: [
        "Order<\"pending\">",
        "Order<\"draft\">",
        "Order<\"pending\" | \"cancelled\">",
        "Order<OrderState>",
      ],
      correctIndex: 0,
      explanation:
        "Next est inféré à partir de l'argument, donc le littéral \"pending\" est conservé. Le type de retour encode ainsi l'état courant, et non l'ensemble des transitions possibles depuis draft.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-design-patterns-2",
      question:
        "Une fonction contient un switch sur un nom d'algorithme (\"quick\", \"merge\", \"heap\") et doit en accueillir d'autres. Quel pattern l'améliore ?",
      options: [
        "Builder : assembler l'algorithme choisi étape par étape à l'exécution",
        "Repository : isoler l'accès aux données",
        "Strategy : une interface commune, une implémentation par algorithme",
        "State Machine : encoder les transitions autorisées",
      ],
      correctIndex: 2,
      explanation:
        "Strategy remplace le switch par des objets interchangeables respectant une interface générique, ce qui permet d'ajouter un algorithme sans modifier le contexte. Les trois autres patterns répondent à d'autres problèmes.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-design-patterns-3",
      question:
        "send(this: RequestBuilder<true, true>) est déclaré sur le builder.\nnew RequestBuilder().url(\"/api\").send();\nPourquoi cette ligne ne compile-t-elle pas ?",
      options: [
        "send n'existe pas sur RequestBuilder",
        "this vaut RequestBuilder<true, false>, incompatible avec le this attendu",
        "url() renvoie void, ce qui rompt la chaîne d'appels de méthodes",
        "L'erreur n'apparaît qu'à l'exécution, quand fetch reçoit une requête incomplète",
      ],
      correctIndex: 1,
      explanation:
        "url() renvoie RequestBuilder<true, HasMethod> et HasMethod vaut false par défaut. Le paramètre this de send exige donc method() avant, et cette vérification est faite à la compilation.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-design-patterns-4",
      question:
        "create(data: Omit<T, keyof Entity>): Promise<T> dans Repository<T extends Entity>. Quel est le rôle de Omit ?",
      options: [
        "Rendre tous les champs de data optionnels",
        "Interdire deux entités avec le même email",
        "Vérifier à l'exécution, avant l'insertion, que id est absent de l'objet data",
        "L'appelant ne fournit pas id ni dates, générés par la base",
      ],
      correctIndex: 3,
      explanation:
        "Omit retire id, createdAt et updatedAt du type attendu, car ils sont produits par la base. C'est une contrainte purement statique : aucune vérification n'a lieu à l'exécution.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-design-patterns-5",
      question:
        "function force(o: Order<OrderState>) {\n  return o.transition(\"delivered\");\n}\nOrderState est l'union de tous les états. Que se passe-t-il ?",
      options: [
        "Erreur : delivered n'est atteignable que depuis l'état shipped, pas depuis l'union",
        "Erreur : Order<OrderState> n'est pas un type valide",
        "Cela compile : Transitions[OrderState] regroupe tous les états suivants",
        "Cela compile, mais une exception est levée à l'exécution",
      ],
      correctIndex: 2,
      explanation:
        "Quand S est l'union complète, Transitions[S] regroupe toutes les transitions de tous les états, dont delivered. La protection par type-state ne fonctionne que si l'état est un littéral précis ; rien n'est vérifié à l'exécution.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/typescript-mastery/runtime-safety": [
    {
      id: "typescript-mastery-runtime-safety-1",
      question:
        "function f(data: unknown) {\n  const user = data as User;\n  return user.name;\n}\nQue garantit le cast as User ?",
      options: [
        "Le compilateur insère une vérification des champs de User dans le code émis",
        "Une erreur est levée si data n'a pas la forme d'un User",
        "Rien à l'exécution : as ne change que le type vu par le compilateur",
        "Les champs en trop sont supprimés de data",
      ],
      correctIndex: 2,
      explanation:
        "Les assertions de type sont effacées à la compilation. Si data n'est pas un User, user.name échoue ou vaut undefined à l'exécution : pour une donnée externe, il faut une validation réelle (type guard ou schéma).",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-runtime-safety-2",
      question:
        "Que renvoie UserSchema.safeParse(body) quand body ne respecte pas le schéma Zod ?",
      options: [
        "Il lève une ZodError qu'il faut attraper avec try/catch",
        "Il renvoie null",
        "Il renvoie les champs valides en ignorant les autres",
        "Il renvoie { success: false, error } sans rien lever",
      ],
      correctIndex: 3,
      explanation:
        "safeParse retourne toujours un objet discriminé par success, ce qui évite le try/catch. C'est parse qui lève une exception en cas d'échec ; aucun des deux ne renvoie de données partielles.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-runtime-safety-3",
      question:
        "function isUser(d: unknown): d is User {\n  return typeof d === \"object\";\n}\nconst x: unknown = null;\nif (isUser(x)) console.log(x.name);\nQue se passe-t-il ?",
      options: [
        "Compile, puis TypeError à l'exécution : le prédicat est cru sur parole",
        "Erreur de compilation : le prédicat est jugé trop permissif par le compilateur",
        "Compile et affiche undefined",
        "Compile, mais le bloc if n'est jamais exécuté",
      ],
      correctIndex: 0,
      explanation:
        "Le compilateur ne vérifie jamais le corps d'un prédicat de type. Or typeof null vaut \"object\", donc le bloc s'exécute et x.name lève un TypeError : un guard trop laxiste produit un mensonge de type.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-runtime-safety-4",
      question:
        "PORT: z.coerce.number().int().min(1).max(65535).default(3000)\nQue se passe-t-il si process.env.PORT vaut \"abc\" ?",
      options: [
        "PORT vaut 3000, la valeur par défaut",
        "La validation échoue : Number(\"abc\") donne NaN, rejeté par Zod",
        "PORT vaut NaN et la validation réussit",
        "PORT vaut 0 car la coercion échoue silencieusement et renvoie zéro",
      ],
      correctIndex: 1,
      explanation:
        "default ne s'applique que si la valeur est undefined, pas si elle est invalide. La coercion produit NaN, que z.number() refuse, d'où l'échec de safeParse et l'arrêt au démarrage.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-runtime-safety-5",
      question:
        "Quel est le principal bénéfice de Result<User, UserError> par rapport à un throw new Error ?",
      options: [
        "Il s'exécute plus vite qu'un try/catch dans tous les moteurs JavaScript actuels",
        "Il rend inutile la validation des entrées",
        "Il capture automatiquement les erreurs réseau",
        "Les erreurs sont dans la signature : le compilateur impose de les traiter",
      ],
      correctIndex: 3,
      explanation:
        "Avec une union discriminée, on ne peut lire data qu'après avoir écarté le cas d'échec, et un switch sur error.code peut être vérifié. Un throw n'apparaît pas dans le type de retour et le catch reçoit un unknown.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-runtime-safety-6",
      question:
        "Un membre Hexagon vient d'être ajouté à l'union Shape.\nswitch (s.kind) {\n  case \"circle\": return 1;\n  case \"square\": return 2;\n  default: return assertNever(s);\n}\nOù l'erreur de compilation apparaît-elle ?",
      options: [
        "Nulle part : default couvre le nouveau cas",
        "Sur le case \"square\"",
        "Sur assertNever(s) : s est Hexagon, non assignable à never",
        "Uniquement à l'exécution, quand un Hexagon arrive",
      ],
      correctIndex: 2,
      explanation:
        "Dans default, s est le type restant non traité, ici Hexagon. Il n'est pas assignable au paramètre never, et le compilateur signale donc le cas oublié ; c'est tout l'intérêt de l'exhaustivité par never.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/typescript-mastery/compiler-api": [
    {
      id: "typescript-mastery-compiler-api-1",
      question:
        "Avec strict et noUncheckedIndexedAccess activés :\nconst a: string[] = [\"x\"];\nconst first = a[0];\nQuel est le type de first ?",
      options: ["string, type d'élément déclaré", "string | undefined (index hors bornes)", "string | null, comme le retour de find()", "never, tableau jugé vide"],
      correctIndex: 1,
      explanation:
        "noUncheckedIndexedAccess ajoute undefined à tout accès par index, car l'indice peut sortir du tableau. Il n'est pas inclus dans strict : sans lui, first serait simplement string.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-compiler-api-2",
      question: "Que fait l'option skipLibCheck ?",
      options: [
        "Elle désactive la vérification de vos fichiers .ts",
        "Elle empêche d'importer des bibliothèques qui n'ont pas de types",
        "Elle ignore la vérification des .d.ts, y compris dans node_modules",
        "Elle désactive la génération des fichiers .d.ts",
      ],
      correctIndex: 2,
      explanation:
        "skipLibCheck évite de re-vérifier les fichiers de déclaration, ce qui accélère la compilation mais peut masquer des conflits entre bibliothèques. Votre propre code reste entièrement vérifié.",
      difficulty: "easy",
    },
    {
      id: "typescript-mastery-compiler-api-3",
      question:
        "packages/api référence ../shared (composite). Pourquoi lancer tsc --build plutôt que tsc -p packages/api ?",
      options: [
        "-b compile shared d'abord si besoin et saute les projets à jour",
        "Seul -b génère des source maps pour les fichiers de déclaration",
        "-p ignore les fichiers listés dans include",
        "-b désactive la vérification de types pour aller plus vite",
      ],
      correctIndex: 0,
      explanation:
        "tsc -b parcourt le graphe de références dans l'ordre et ne recompile que ce qui a changé. Avec -p, les sorties de shared doivent déjà exister, sinon la compilation d'api échoue.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-compiler-api-4",
      question:
        "Dans le codemod addReadonly, pourquoi tester !node.modifiers?.some(m => m.kind === ReadonlyKeyword) avant de transformer ?",
      options: [
        "Pour ignorer les propriétés optionnelles",
        "Pour que le transformer n'écrive pas sur le disque",
        "Parce que updatePropertySignature échoue si modifiers est déjà défini",
        "Pour rendre le codemod idempotent et éviter readonly readonly",
      ],
      correctIndex: 3,
      explanation:
        "Sans ce test, relancer le codemod ajouterait un second readonly, ce qui produit du code invalide. Un transformer ne touche jamais au disque : il retourne de nouveaux nœuds que l'on imprime ensuite.",
      difficulty: "medium",
    },
    {
      id: "typescript-mastery-compiler-api-5",
      question:
        "Une règle parcourt l'AST et signale chaque nœud SyntaxKind.AnyKeyword. Quel any lui échappe ?",
      options: [
        "function f(p: any): void {}",
        "const x = JSON.parse(s);",
        "const y = JSON.parse(s) as any;",
        "let a: any = loadConfig();",
      ],
      correctIndex: 1,
      explanation:
        "Le any de JSON.parse est inféré depuis le type de retour de la bibliothèque : aucun mot-clé any n'est écrit dans le code, donc aucun nœud AnyKeyword. Les trois autres contiennent un any explicite.",
      difficulty: "hard",
    },
  ],
};
