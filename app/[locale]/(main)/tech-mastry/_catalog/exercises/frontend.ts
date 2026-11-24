import type { AreaExercises } from "./types";

export const frontendExercises: AreaExercises = {
  "/tech-mastry/frontend/react-basics": [
    {
      id: "frontend-react-basics-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre ce qui se passe quand l'état d'un composant avec un useEffect change.",
      steps: [
        "React appelle la fonction du composant et calcule le nouveau JSX",
        "React met à jour le DOM (phase de commit)",
        "Le navigateur peint l'écran",
        "L'effet useEffect s'exécute, après le nettoyage de l'effet précédent",
        "Un setState appelé dans l'effet planifie un nouveau rendu",
      ],
      explanation:
        "Le rendu est un calcul pur, le commit applique le résultat au DOM, et les effets passifs tournent ensuite. L'erreur classique est de croire que l'effet s'exécute pendant le rendu.",
    },
    {
      id: "frontend-react-basics-fill-1",
      type: "fill",
      prompt: "Complétez ce compteur automatique pour qu'il ne fuie pas et ne relance pas l'intervalle à chaque tick.",
      code: "const [count, setCount] = {{1}}(0);\nuseEffect(() => {\n  const id = setInterval(() => setCount((c) => c + 1), 1000);\n  return {{2}};\n}, {{3}});",
      blanks: [
        { options: ["useState", "useReducer", "useRef"], answer: 0 },
        { options: ["clearInterval(id)", "() => clearInterval(id)", "id"], answer: 1 },
        { options: ["[count]", "[id]", "[]"], answer: 2 },
      ],
      explanation:
        "L'effet doit retourner une fonction de nettoyage : écrire clearInterval(id) l'exécuterait immédiatement et ne retournerait rien. La forme fonctionnelle c => c + 1 évite de dépendre de count, donc [] suffit.",
    },
    {
      id: "frontend-react-basics-match-1",
      type: "match",
      prompt: "Associez chaque hook à son rôle.",
      pairs: [
        { term: "useState", definition: "Stocke une valeur locale et relance un rendu quand elle change" },
        { term: "useEffect", definition: "Synchronise le composant avec un système externe après le rendu" },
        { term: "useRef", definition: "Conserve une valeur mutable sans provoquer de rendu" },
        { term: "useContext", definition: "Lit la valeur du Provider le plus proche" },
        { term: "useReducer", definition: "Centralise les transitions d'état dans une fonction reducer" },
      ],
      explanation:
        "useRef et useState conservent tous deux une valeur entre les rendus, mais seul useState déclenche un nouveau rendu quand elle change.",
    },
  ],
  "/tech-mastry/frontend/component-patterns": [
    {
      id: "frontend-component-patterns-classify-1",
      type: "classify",
      prompt: "Classez chaque situation selon qu'elle concerne un champ contrôlé ou non contrôlé.",
      categories: ["Contrôlé", "Non contrôlé"],
      items: [
        { text: "<input value={v} onChange={onChange} />", category: 0 },
        { text: "<input defaultValue=\"abc\" ref={ref} />", category: 1 },
        { text: "La valeur est lue avec ref.current.value à la soumission", category: 1 },
        { text: "Validation à chaque frappe à partir de l'état React", category: 0 },
        { text: "<input type=\"file\" />", category: 1 },
        { text: "L'état du champ vit dans un useState du parent", category: 0 },
      ],
      explanation:
        "Un champ est contrôlé quand sa valeur vient de l'état React ; sinon le DOM garde l'état. Le champ de type file est toujours non contrôlé, car sa valeur ne peut pas être définie par code.",
    },
    {
      id: "frontend-component-patterns-match-1",
      type: "match",
      prompt: "Associez chaque pattern à son principe.",
      pairs: [
        { term: "Compound components", definition: "Sous-composants qui partagent un état implicite via un Context" },
        { term: "Render props", definition: "Une prop fonction décide de ce que le composant affiche" },
        { term: "HOC", definition: "Fonction qui prend un composant et retourne un composant enrichi" },
        { term: "Custom hook", definition: "Fonction use* qui réutilise de la logique avec état" },
        { term: "State reducer", definition: "Le consommateur fournit un reducer pour ajuster les transitions" },
      ],
      explanation:
        "Render props et custom hook réutilisent tous deux de la logique, mais le hook le fait sans imbriquer de composants, ce qui explique sa préférence actuelle.",
    },
    {
      id: "frontend-component-patterns-fill-1",
      type: "fill",
      prompt: "Complétez un sous-composant de Tabs qui lit l'onglet actif sans recevoir de prop.",
      code: "const TabsContext = {{1}}(null);\nfunction Tab({ id, children }) {\n  const { active, setActive } = {{2}}(TabsContext);\n  return <button aria-selected={active === id} onClick={() => setActive(id)}>{children}</button>;\n}\nTabs.Tab = {{3}};",
      blanks: [
        { options: ["createContext", "useContext", "createRef"], answer: 0 },
        { options: ["useState", "useRef", "useContext"], answer: 2 },
        { options: ["<Tab />", "Tab", "Tab()"], answer: 1 },
      ],
      explanation:
        "createContext crée le canal, useContext le lit. On attache la référence du composant (Tab) à Tabs, et non un élément ni le résultat d'un appel.",
    },
  ],
  "/tech-mastry/frontend/state-management": [
    {
      id: "frontend-state-management-classify-1",
      type: "classify",
      prompt: "Classez ces données selon qu'elles relèvent de l'état serveur ou de l'état client.",
      categories: ["État serveur", "État client"],
      items: [
        { text: "Liste d'articles chargée depuis une API", category: 0 },
        { text: "Thème clair ou sombre choisi dans l'interface", category: 1 },
        { text: "Résultats de recherche à mettre en cache et revalider", category: 0 },
        { text: "Menu latéral ouvert ou fermé", category: 1 },
        { text: "Profil utilisateur récupéré et partagé entre pages", category: 0 },
        { text: "Étape courante d'un formulaire multi-étapes", category: 1 },
      ],
      explanation:
        "L'état serveur est une copie asynchrone de données distantes : il peut devenir périmé et demande cache et revalidation (React Query). L'état client n'existe que dans l'interface.",
    },
    {
      id: "frontend-state-management-fill-1",
      type: "fill",
      prompt: "Complétez ce store Zustand et son utilisation avec un sélecteur.",
      code: "const useStore = {{1}}((set) => ({\n  count: 0,\n  inc: () => set((s) => ({ count: s.count + 1 })),\n}));\nconst count = useStore({{2}});",
      blanks: [
        { options: ["createSlice", "create", "configureStore"], answer: 1 },
        { options: ["s.count", "(s) => s.count", "(s) => s"], answer: 1 },
      ],
      explanation:
        "create construit le hook du store. Le sélecteur est une fonction : sans lui (ou avec (s) => s), le composant suit tout le store au lieu de la seule valeur count.",
    },
    {
      id: "frontend-state-management-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le trajet d'une action avec Redux Toolkit.",
      steps: [
        "Le composant appelle dispatch(action)",
        "Les middlewares (par exemple thunk) peuvent intercepter l'action",
        "Le reducer calcule le nouvel état",
        "Le store notifie ses abonnés",
        "useSelector relance le rendu si la valeur sélectionnée a changé",
      ],
      explanation:
        "Le flux est unidirectionnel. Le composant ne modifie jamais l'état directement : il décrit un événement, et seul le reducer produit le nouvel état.",
    },
  ],
  "/tech-mastry/frontend/performance": [
    {
      id: "frontend-performance-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre une démarche d'optimisation raisonnée.",
      steps: [
        "Mesurer avec le Profiler et l'analyse du bundle",
        "Identifier le goulot : rendus inutiles, gros chunk ou longue liste",
        "Appliquer la correction ciblée (memo, lazy, virtualisation)",
        "Mesurer à nouveau pour confirmer le gain",
      ],
      explanation:
        "Optimiser sans mesure revient à ajouter du code et de la mémoïsation coûteuse sans bénéfice prouvé. La mesure finale vérifie que la correction a bien servi.",
    },
    {
      id: "frontend-performance-fill-1",
      type: "fill",
      prompt: "Choisissez l'outil adapté à chaque besoin.",
      code: "const Chart = {{1}}(() => import(\"./Chart\"));\nconst Row = {{2}}(function Row({ item }) {\n  return <li>{item.name}</li>;\n});\nconst onPick = {{3}}((id) => select(id), []);",
      blanks: [
        { options: ["React.lazy", "React.memo", "useMemo"], answer: 0 },
        { options: ["useCallback", "React.memo", "React.lazy"], answer: 1 },
        { options: ["useMemo", "React.memo", "useCallback"], answer: 2 },
      ],
      explanation:
        "lazy découpe le code, memo saute le rendu si les props sont égales, useCallback fige la référence d'une fonction. useMemo mémorise une valeur, pas une fonction à passer en prop.",
    },
    {
      id: "frontend-performance-match-1",
      type: "match",
      prompt: "Associez chaque technique à ce qu'elle fait.",
      pairs: [
        { term: "React.memo", definition: "Évite le rendu si les props sont égales en surface" },
        { term: "useMemo", definition: "Mémorise le résultat d'un calcul" },
        { term: "useCallback", definition: "Mémorise la référence d'une fonction" },
        { term: "React.lazy", definition: "Charge un composant à la demande dans un chunk séparé" },
        { term: "Virtualisation", definition: "Ne monte que les lignes visibles d'une grande liste" },
      ],
      explanation:
        "useCallback(fn, deps) revient à useMemo(() => fn, deps) : les deux mémorisent, l'un une fonction, l'autre une valeur calculée.",
    },
  ],
  "/tech-mastry/frontend/accessibility": [
    {
      id: "frontend-accessibility-fill-1",
      type: "fill",
      prompt: "Complétez ces trois éléments pour qu'ils soient correctement exposés aux technologies d'assistance.",
      code: "<button {{1}}=\"Fermer la fenêtre\"><XIcon /></button>\n<img src=\"deco.svg\" {{2}} />\n<div {{3}}=\"polite\">{message}</div>",
      blanks: [
        { options: ["aria-hidden", "aria-label", "aria-live"], answer: 1 },
        { options: ["alt=\"\"", "alt=\"image\"", "aria-hidden=\"false\""], answer: 0 },
        { options: ["aria-atomic", "aria-live", "aria-busy"], answer: 1 },
      ],
      explanation:
        "Un bouton-icône a besoin d'un nom accessible (aria-label), une image décorative d'un alt vide, et une région dynamique d'aria-live. alt=\"image\" ajouterait du bruit sans information.",
    },
    {
      id: "frontend-accessibility-classify-1",
      type: "classify",
      prompt: "Pour chaque besoin, indiquez si un élément HTML natif suffit ou si ARIA est nécessaire.",
      categories: ["Un élément natif suffit", "ARIA est nécessaire"],
      items: [
        { text: "Un bouton qui enregistre le formulaire", category: 0 },
        { text: "Un lien de navigation vers une autre page", category: 0 },
        { text: "Un champ de saisie avec son libellé", category: 0 },
        { text: "Un message de statut annoncé sans déplacer le focus", category: 1 },
        { text: "Un onglet dans un composant d'onglets personnalisé", category: 1 },
        { text: "Un bouton d'icône sans texte visible", category: 1 },
      ],
      explanation:
        "La première règle d'ARIA est de préférer le HTML natif. ARIA sert à décrire ce que le HTML ne sait pas exprimer : rôles composites, régions dynamiques, noms de contrôles sans texte.",
    },
    {
      id: "frontend-accessibility-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes pour rendre une fenêtre modale accessible.",
      steps: [
        "Donner à la modale role=\"dialog\", aria-modal et un nom accessible",
        "À l'ouverture, déplacer le focus à l'intérieur de la modale",
        "Garder le focus piégé dans la modale pendant la tabulation",
        "Permettre la fermeture avec la touche Échap",
        "À la fermeture, rendre le focus au bouton qui l'a ouverte",
      ],
      explanation:
        "Sans déplacement ni restitution du focus, un utilisateur au clavier ou au lecteur d'écran perd sa position. Oublier la restitution est l'erreur la plus fréquente.",
    },
  ],
  "/tech-mastry/frontend/css-advanced": [
    {
      id: "frontend-css-advanced-fill-1",
      type: "fill",
      prompt: "Complétez ces règles de grille responsive et de container query.",
      code: ".card-container { container-type: {{1}}; }\n@{{2}} (min-width: 400px) {\n  .layout { display: grid; }\n}\n.grid { grid-template-columns: repeat({{3}}, minmax(300px, 1fr)); }",
      blanks: [
        { options: ["inline-size", "size-container", "width"], answer: 0 },
        { options: ["layer", "container", "supports"], answer: 1 },
        { options: ["fit-content", "minmax", "auto-fit"], answer: 2 },
      ],
      explanation:
        "container-type: inline-size crée le contexte de mesure que @container interroge. auto-fit fait varier le nombre de colonnes selon la largeur disponible, sans media query.",
    },
    {
      id: "frontend-css-advanced-classify-1",
      type: "classify",
      prompt: "Classez ces propriétés animées selon leur coût : compositeur ou recalcul de la mise en page.",
      categories: ["Reste sur le compositeur", "Déclenche une mise en page"],
      items: [
        { text: "transform: translateX()", category: 0 },
        { text: "opacity", category: 0 },
        { text: "left", category: 1 },
        { text: "width", category: 1 },
        { text: "margin-left", category: 1 },
      ],
      explanation:
        "transform et opacity peuvent être animés sans toucher à la géométrie des autres éléments. left, width et margin modifient la mise en page et la recalculent à chaque image.",
    },
    {
      id: "frontend-css-advanced-match-1",
      type: "match",
      prompt: "Associez chaque fonctionnalité CSS à son rôle.",
      pairs: [
        { term: "@layer", definition: "Ordonne la cascade par couches, avant la spécificité" },
        { term: ":has()", definition: "Sélectionne un élément d'après ses descendants" },
        { term: "container-type", definition: "Déclare un élément comme conteneur de requêtes" },
        { term: "auto-fit", definition: "Crée autant de colonnes que la largeur le permet et réduit les vides" },
        { term: "clamp()", definition: "Borne une valeur entre un minimum et un maximum" },
      ],
      explanation:
        "Les couches de cascade changent l'ordre de priorité des déclarations, alors que :has() ne fait que modifier ce que le sélecteur peut cibler.",
    },
  ],
  "/tech-mastry/frontend/testing": [
    {
      id: "frontend-testing-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'un test de composant avec Testing Library.",
      steps: [
        "Rendre le composant avec render()",
        "Simuler l'interaction avec await user.click(...)",
        "Attendre le résultat avec findBy ou waitFor",
        "Vérifier le résultat avec expect",
      ],
      explanation:
        "C'est le schéma préparer, agir, vérifier. Oublier d'attendre une mise à jour asynchrone est la cause principale des tests instables.",
    },
    {
      id: "frontend-testing-fill-1",
      type: "fill",
      prompt: "Complétez ce test de formulaire qui vérifie aussi l'absence d'un message d'erreur.",
      code: "const user = userEvent.{{1}}();\nrender(<LoginForm />);\nawait user.{{2}}(screen.getByLabelText(/email/i), \"a@b.fr\");\nexpect(screen.{{3}}(/erreur/i)).not.toBeInTheDocument();",
      blanks: [
        { options: ["create", "setup", "init"], answer: 1 },
        { options: ["type", "keyboardInput", "change"], answer: 0 },
        { options: ["getByText", "queryByText", "findByText"], answer: 1 },
      ],
      explanation:
        "userEvent.setup() prépare une session d'interaction réaliste. Pour affirmer une absence il faut queryBy, car getBy et findBy lèvent une erreur si l'élément n'existe pas.",
    },
    {
      id: "frontend-testing-classify-1",
      type: "classify",
      prompt: "Classez chaque test au niveau de la pyramide qui lui convient le mieux.",
      categories: ["Test unitaire", "Test de composant", "Test E2E"],
      items: [
        { text: "Formater une devise avec plusieurs entrées (it.each)", category: 0 },
        { text: "Fonction pure de validation, sans DOM", category: 0 },
        { text: "Vérifier avec getByRole que le bouton est désactivé pendant l'envoi", category: 1 },
        { text: "Rendre un formulaire dans jsdom et simuler la frappe", category: 1 },
        { text: "page.goto puis expect(page).toHaveURL('/dashboard')", category: 2 },
        { text: "Parcours de connexion complet dans un vrai navigateur", category: 2 },
      ],
      explanation:
        "On place chaque vérification au niveau le plus bas et le plus rapide qui la permet. Les tests E2E, lents, sont réservés aux parcours critiques.",
    },
  ],
  "/tech-mastry/frontend/nextjs-patterns": [
    {
      id: "frontend-nextjs-patterns-classify-1",
      type: "classify",
      prompt: "Classez chaque besoin selon qu'il se traite dans un Server Component ou un Client Component.",
      categories: ["Server Component", "Client Component"],
      items: [
        { text: "Lire la base de données avec db.user.find()", category: 0 },
        { text: "useState pour un compteur", category: 1 },
        { text: "Gestionnaire onClick sur un bouton", category: 1 },
        { text: "Utiliser une variable d'environnement secrète", category: 0 },
        { text: "useEffect pour écouter window.resize", category: 1 },
        { text: "await fetch() directement dans le composant", category: 0 },
      ],
      explanation:
        "Tout ce qui touche à l'état, aux effets, aux événements ou au navigateur exige un Client Component. L'accès aux données et aux secrets reste côté serveur.",
    },
    {
      id: "frontend-nextjs-patterns-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le déroulement d'une Server Action de création d'article.",
      steps: [
        "L'utilisateur soumet le formulaire (action={createPost})",
        "Le serveur valide les données avec un schéma Zod",
        "L'article est écrit en base",
        "revalidatePath(\"/posts\") invalide les données en cache",
        "redirect(\"/posts\") envoie l'utilisateur vers la liste",
      ],
      explanation:
        "La revalidation doit précéder redirect, car redirect interrompt l'exécution de la fonction. Valider avant d'écrire évite d'enregistrer des données invalides.",
    },
    {
      id: "frontend-nextjs-patterns-fill-1",
      type: "fill",
      prompt: "Complétez cette Server Action.",
      code: "{{1}}\n\nexport async function createPost(formData: FormData) {\n  await db.post.create({ data: parse(formData) });\n  {{2}}(\"/posts\");\n  redirect(\"/posts\");\n}",
      blanks: [
        { options: ["\"use server\"", "\"use client\"", "\"use cache\""], answer: 0 },
        { options: ["refresh", "revalidatePath", "invalidateCache"], answer: 1 },
      ],
      explanation:
        "\"use server\" marque les fonctions appelables depuis le client comme Server Actions. revalidatePath est la fonction de next/cache qui invalide les données d'une route après la mutation.",
    },
  ],
};
