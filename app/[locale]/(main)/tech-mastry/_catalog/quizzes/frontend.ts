import type { AreaQuizzes } from "./types";

export const frontendQuizzes: AreaQuizzes = {
  "/tech-mastry/frontend/react-basics": [
    {
      id: "frontend-react-basics-1",
      question:
        "const [count, setCount] = useState(0);\nfunction handle() {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n}\nDe combien count augmente-t-il après un clic ?",
      options: [
        "De 1 : les trois appels lisent la même valeur de count",
        "De 3 : React applique les trois appels l'un après l'autre",
        "De 0 : React ignore les appels identiques",
        "De 2 : seuls les deux derniers sont pris en compte",
      ],
      correctIndex: 0,
      explanation:
        "Dans un rendu, count est une valeur figée : les trois appels envoient 0 + 1. Pour cumuler, il faut la forme fonctionnelle setCount(c => c + 1), qui part de l'état en attente.",
      difficulty: "easy",
    },
    {
      id: "frontend-react-basics-2",
      question:
        "Avec const [user, setUser] = useState({ name: \"a\", age: 1 }), quelle mise à jour déclenche bien un nouveau rendu ?",
      options: [
        "user.name = \"b\"; setUser(user);",
        "setUser(Object.assign(user, { name: \"b\" }));",
        "setUser({ ...user, name: \"b\" });",
        "const u = user; u.name = \"b\"; setUser(u);",
      ],
      correctIndex: 2,
      explanation:
        "React compare l'ancien et le nouvel état avec Object.is : il faut une nouvelle référence. Les trois autres variantes mutent l'objet existant puis le renvoient, donc la référence est identique et le rendu est ignoré.",
      difficulty: "easy",
    },
    {
      id: "frontend-react-basics-3",
      question:
        "useEffect(() => {\n  const id = setInterval(tick, 1000);\n}, []);\nQuel est le problème de cet effet ?",
      options: [
        "Le tableau de dépendances vide empêche l'effet de s'exécuter au montage",
        "tick n'est appelé qu'une fois car l'effet ne se relance jamais",
        "setInterval doit être appelé dans un gestionnaire d'événement, pas un effet",
        "Aucun nettoyage : l'intervalle n'est jamais arrêté, et Strict en crée deux",
      ],
      correctIndex: 3,
      explanation:
        "L'effet doit retourner () => clearInterval(id). En développement, le mode Strict monte, démonte et remonte le composant, ce qui révèle la fuite en laissant deux intervalles actifs.",
      difficulty: "medium",
    },
    {
      id: "frontend-react-basics-4",
      question:
        "function Provider({ children }) {\n  const [user, setUser] = useState(null);\n  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;\n}\nPourquoi les consommateurs se rendent-ils à chaque rendu de Provider, même si user n'a pas changé ?",
      options: [
        "Context re-rend tout le sous-arbre du Provider, même les composants non abonnés",
        "L'objet value est recréé à chaque rendu : sa référence change (useMemo)",
        "setUser change de référence à chaque rendu",
        "Les consommateurs ne comparent jamais la valeur reçue",
      ],
      correctIndex: 1,
      explanation:
        "React compare la valeur du Provider avec Object.is : un littéral d'objet est une nouvelle référence à chaque rendu. useMemo sur value évite ce coût, alors que setUser, lui, est stable.",
      difficulty: "medium",
    },
    {
      id: "frontend-react-basics-5",
      question:
        "function List({ page }) {\n  const [rows, setRows] = useState([]);\n  const opts = { page };\n  useEffect(() => {\n    load(opts).then(setRows);\n  }, [opts]);\n}\nQue se passe-t-il ?",
      options: [
        "L'effet ne s'exécute qu'une fois, au montage",
        "Erreur de compilation : un objet ne peut pas être une dépendance",
        "Boucle : setRows relance un rendu, opts est un nouvel objet, l'effet repart",
        "L'effet ne repart que si page change, car React compare les objets en profondeur",
      ],
      correctIndex: 2,
      explanation:
        "Les dépendances sont comparées par référence (Object.is), pas en profondeur. opts est recréé à chaque rendu et setRows reçoit un nouveau tableau, donc la boucle ne s'arrête pas ; mettez page en dépendance, ou créez l'objet dans l'effet.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/component-patterns": [
    {
      id: "frontend-component-patterns-1",
      question:
        "Que se passe-t-il avec <input value={name} /> sans gestionnaire onChange ?",
      options: [
        "L'utilisateur peut taper : React synchronise name avec le champ automatiquement",
        "Le champ est en lecture seule et React affiche un avertissement",
        "Le champ devient non contrôlé automatiquement",
        "Erreur de compilation TypeScript",
      ],
      correctIndex: 1,
      explanation:
        "Avec value, l'input est contrôlé : sa valeur affichée vient toujours de l'état. Sans onChange pour la mettre à jour, la frappe est annulée, d'où l'avertissement de React.",
      difficulty: "easy",
    },
    {
      id: "frontend-component-patterns-2",
      question:
        "Dans <Tabs><Tabs.List /><Tabs.Panel /></Tabs>, comment Tabs.Panel connaît-il l'onglet actif sans prop explicite ?",
      options: [
        "Il lit une variable globale du module",
        "Il interroge le DOM avec querySelector",
        "React injecte automatiquement l'état du composant parent dans ses enfants",
        "Tabs fournit un Context que ses sous-composants consomment",
      ],
      correctIndex: 3,
      explanation:
        "Le pattern compound components partage un état implicite par un Context créé dans le composant racine. Une variable globale casserait avec plusieurs instances, et React n'injecte rien automatiquement.",
      difficulty: "easy",
    },
    {
      id: "frontend-component-patterns-3",
      question:
        "<Mouse render={(pos) => <Cat pos={pos} />} /> avec Mouse enveloppé dans React.memo. Que se passe-t-il quand le parent se rend ?",
      options: [
        "Mouse se rend aussi : la fonction inline change de référence à chaque rendu",
        "Mouse est ignoré, car memo compare le résultat du rendu, pas les props",
        "Erreur : React.memo refuse les composants qui reçoivent des fonctions en props",
        "Seul Cat se rend à nouveau, car il reçoit la position en argument",
      ],
      correctIndex: 0,
      explanation:
        "La comparaison de props de memo est faite par référence, et une fonction inline est recréée à chaque rendu. Il faut définir la render prop en dehors ou la stabiliser avec useCallback.",
      difficulty: "medium",
    },
    {
      id: "frontend-component-patterns-4",
      question:
        "A et B appellent chacun const c = useCounter(). Si A incrémente son compteur, que voit B ?",
      options: [
        "Le compteur incrémenté : un hook partage son état entre appelants",
        "Une erreur : un hook ne se partage pas entre composants",
        "Rien : chaque appel de useCounter a son propre état",
        "Le compteur incrémenté, après un rendu de B",
      ],
      correctIndex: 2,
      explanation:
        "Un custom hook partage de la logique, pas de l'état : chaque appel crée ses propres états. Pour partager une valeur, il faut remonter l'état, utiliser un Context ou un store externe.",
      difficulty: "medium",
    },
    {
      id: "frontend-component-patterns-5",
      question:
        "Un composant Toggle expose un reducer par défaut. Un consommateur veut limiter à 4 le nombre de bascules. Quelle approche relève du State Reducer ?",
      options: [
        "Cloner le composant Toggle et y dupliquer toute sa logique interne de bascule",
        "Passer un reducer qui appelle celui par défaut et refuse la 5e bascule",
        "Lire l'état interne via un ref et le réécrire",
        "L'envelopper dans un HOC qui bloque les clics",
      ],
      correctIndex: 1,
      explanation:
        "Le State Reducer inverse le contrôle : le composant délègue la décision finale au reducer du consommateur, qui peut modifier ou rejeter le changement proposé. Les autres approches contournent le composant au lieu de s'y brancher proprement.",
      difficulty: "medium",
    },
    {
      id: "frontend-component-patterns-6",
      question:
        "function App() {\n  const Enhanced = withAuth(Page);\n  return <Enhanced />;\n}\nQuel problème pose ce code ?",
      options: [
        "Enhanced change à chaque rendu : l'arbre est remonté et son état perdu",
        "withAuth ne peut pas recevoir un composant en argument, seulement un élément",
        "Le HOC s'applique deux fois sur Page",
        "Aucun, React met les HOC en cache",
      ],
      correctIndex: 0,
      explanation:
        "withAuth retourne un nouveau composant à chaque appel, donc React voit un type différent et démonte l'ancien sous-arbre. Appliquez le HOC une seule fois, en dehors du rendu.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/state-management": [
    {
      id: "frontend-state-management-1",
      question:
        "Une liste d'articles vient d'une API et nécessite cache, relance sur erreur et état de chargement. Quel outil est le mieux adapté ?",
      options: [
        "useReducer dans un Context global",
        "Un store Zustand alimenté par un useEffect",
        "Un useState local dans chaque composant",
        "React Query, conçu pour l'état serveur",
      ],
      correctIndex: 3,
      explanation:
        "Ces données appartiennent au serveur : elles demandent cache, déduplication, revalidation et gestion d'erreurs, que React Query fournit. Les autres options obligent à réécrire cette logique à la main.",
      difficulty: "easy",
    },
    {
      id: "frontend-state-management-2",
      question:
        "Dans un createSlice de Redux Toolkit, state.items.push(item) est-il correct ?",
      options: [
        "Non, il faut toujours retourner un nouveau tableau depuis le reducer",
        "Oui : Immer transforme cette écriture en mise à jour immuable",
        "Oui, Redux autorise la mutation directe du store",
        "Non, push est interdit par Redux Toolkit",
      ],
      correctIndex: 1,
      explanation:
        "Les reducers de createSlice sont exécutés avec Immer, qui produit un nouvel état immuable à partir de l'écriture « mutable ». Dans un reducer Redux classique écrit à la main, la même ligne serait un bug.",
      difficulty: "easy",
    },
    {
      id: "frontend-state-management-3",
      question:
        "useQuery({ queryKey, queryFn, staleTime: 60_000 }). Un composant utilisant cette query est remonté 10 secondes après le premier chargement. Que se passe-t-il ?",
      options: [
        "Un refetch en arrière-plan, car la donnée est périmée",
        "Un écran de chargement, car le cache a été vidé",
        "La donnée du cache est servie sans nouvelle requête",
        "Une erreur, car la query a expiré",
      ],
      correctIndex: 2,
      explanation:
        "Pendant staleTime la donnée est considérée fraîche : elle est lue dans le cache sans requête. Avec staleTime à 0 (valeur par défaut), elle serait affichée puis rechargée en arrière-plan.",
      difficulty: "medium",
    },
    {
      id: "frontend-state-management-4",
      question:
        "Avec Zustand, quelle différence entre const { count } = useStore() et const count = useStore(s => s.count) ?",
      options: [
        "Sans sélecteur, le composant se rend à chaque changement du store",
        "Les deux sont équivalentes, Zustand compare la destructuration",
        "La seconde est invalide, un sélecteur doit renvoyer un objet",
        "Seule la première garde le composant synchronisé avec le store Zustand",
      ],
      correctIndex: 0,
      explanation:
        "Un hook sans sélecteur abonne le composant à tout l'état. Avec un sélecteur, Zustand ne relance le rendu que si la valeur sélectionnée change.",
      difficulty: "medium",
    },
    {
      id: "frontend-state-management-5",
      question:
        "Un seul Context fournit { state, dispatch }. Des boutons n'utilisent que dispatch mais se rendent à chaque changement d'état. Quelle correction convient ?",
      options: [
        "Envelopper chaque bouton dans React.memo pour bloquer les rendus inutiles",
        "Séparer en deux Contexts, état et dispatch, ce dernier étant stable",
        "Remplacer useReducer par useState",
        "Ajouter useCallback sur dispatch",
      ],
      correctIndex: 1,
      explanation:
        "Un composant qui consomme un Context se rend dès que sa valeur change, même sous React.memo. Avec un Context dédié à dispatch (qui est déjà stable), les boutons ne dépendent plus de l'état ; useCallback sur dispatch n'apporte rien.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/performance": [
    {
      id: "frontend-performance-1",
      question:
        "const Child = React.memo(ChildBase);\n<Child onSelect={() => select(id)} />\nLe parent se rend à nouveau. Que fait Child ?",
      options: [
        "Il ne se rend pas, memo bloque tous les rendus déclenchés par le parent",
        "Il se rend seulement si id change",
        "Il se rend : la fonction inline est nouvelle, useCallback règle cela",
        "Il ne se rend pas, memo ne compare jamais les props de type fonction",
      ],
      correctIndex: 2,
      explanation:
        "memo compare les props avec Object.is : une fonction inline est une nouvelle référence à chaque rendu, donc la comparaison échoue. useCallback conserve la même référence tant que ses dépendances ne changent pas.",
      difficulty: "easy",
    },
    {
      id: "frontend-performance-2",
      question:
        "const Chart = lazy(() => import(\"./Chart\"));\nQuand le code de Chart est-il téléchargé ?",
      options: [
        "Au premier rendu de <Chart />",
        "Au build, dans le bundle principal",
        "Au chargement de la page, en parallèle du bundle",
        "Au survol d'un lien qui y mène",
      ],
      correctIndex: 0,
      explanation:
        "import() crée un chunk séparé chargé à la demande, au premier rendu du composant, qui doit être placé sous un Suspense. Il n'est donc pas inclus dans le bundle initial.",
      difficulty: "easy",
    },
    {
      id: "frontend-performance-3",
      question: "Dans quel cas useMemo apporte-t-il un gain réel ?",
      options: [
        "useMemo(() => a + b, [a, b]) pour deux nombres déjà calculés",
        "useMemo(() => [...bigList].sort(cmp), [bigList]) avec 20 000 lignes",
        "useMemo(() => \"Bonjour \" + name, [name]) pour un titre de page",
        "useMemo(() => Boolean(user), [user]) pour un simple indicateur booléen",
      ],
      correctIndex: 1,
      explanation:
        "La mémoïsation a un coût (comparaison des dépendances, mémoire) et ne vaut la peine que pour un calcul réellement coûteux. Pour une addition ou une concaténation, le calcul est moins cher que la mémoïsation elle-même.",
      difficulty: "medium",
    },
    {
      id: "frontend-performance-4",
      question:
        "Une liste de 10 000 lignes est virtualisée. Quel inconvénient réel faut-il anticiper ?",
      options: [
        "Le DOM contient plus de nœuds qu'avant",
        "Toutes les lignes doivent avoir la même couleur",
        "React ne peut plus mettre à jour les lignes visibles",
        "Ctrl+F ne trouve pas les lignes non rendues",
      ],
      correctIndex: 3,
      explanation:
        "La virtualisation ne monte que les lignes visibles, donc la recherche native et les ancres vers des lignes hors écran ne fonctionnent pas, et l'accessibilité demande du soin. Le nombre de nœuds DOM diminue fortement.",
      difficulty: "medium",
    },
    {
      id: "frontend-performance-5",
      question:
        "function App() {\n  const [pos, setPos] = useState(0);\n  return (\n    <div onMouseMove={(e) => setPos(e.clientX)}>\n      <p>{pos}</p>\n      <Slow />\n    </div>\n  );\n}\nComment éviter les rendus de Slow sans React.memo ?",
      options: [
        "Extraire l'état et le div dans un composant recevant <Slow /> en children",
        "Mettre pos en dépendance d'un useEffect qui relance ensuite le rendu de Slow",
        "Appeler setPos dans un setTimeout",
        "Ajouter une key sur Slow",
      ],
      correctIndex: 0,
      explanation:
        "L'élément <Slow /> créé par le parent ne change pas quand le composant enveloppant se rend : React réutilise la même référence et saute son rendu. Les autres pistes ne changent rien au fait que Slow est recréé dans le composant qui porte l'état.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/accessibility": [
    {
      id: "frontend-accessibility-1",
      question:
        "<div role=\"button\" onClick={save}>Enregistrer</div>\nQue manque-t-il pour un utilisateur au clavier ?",
      options: [
        "Rien, role=\"button\" ajoute aussi le focus clavier et les touches Entrée et Espace",
        "Le focus (tabIndex) et Entrée/Espace, que fournit un vrai button",
        "Un attribut aria-label obligatoire sur chaque élément cliquable",
        "Un gestionnaire onHover",
      ],
      correctIndex: 1,
      explanation:
        "Un role change seulement ce qui est annoncé, pas le comportement : le div n'est pas focusable et ignore Entrée et Espace. Un élément button natif apporte tout cela sans code supplémentaire.",
      difficulty: "easy",
    },
    {
      id: "frontend-accessibility-2",
      question:
        "Quel est le ratio de contraste minimal WCAG AA pour du texte de taille normale ?",
      options: ["3:1, seuil du grand texte", "7:1, seuil du niveau AAA", "2:1, seuil des éléments décoratifs", "4,5:1, seuil du texte normal"],
      correctIndex: 3,
      explanation:
        "AA demande 4,5:1 pour le texte normal et 3:1 pour le grand texte. Le 7:1 correspond au niveau AAA, plus exigeant.",
      difficulty: "easy",
    },
    {
      id: "frontend-accessibility-3",
      question:
        "Un toast est ajouté au DOM avec <div aria-live=\"polite\">Enregistré</div>, texte déjà inclus. Pourquoi risque-t-il de ne pas être annoncé ?",
      options: [
        "polite n'est jamais annoncé par les lecteurs d'écran",
        "Il manque aria-hidden=\"false\" sur la région pour qu'elle soit exposée",
        "La région doit exister avant le changement de texte ; ici elle arrive remplie",
        "Les lecteurs n'annoncent que les éléments avec role=\"alert\" ou aria-live=\"assertive\"",
      ],
      correctIndex: 2,
      explanation:
        "Les lecteurs d'écran observent les modifications d'une région déjà présente. La bonne pratique est de rendre le conteneur aria-live vide dès le départ, puis d'y insérer le message.",
      difficulty: "medium",
    },
    {
      id: "frontend-accessibility-4",
      question:
        "Une vague décorative <img src=\"wave.svg\"> est ajoutée en fond de bandeau. Quelle est la bonne pratique ?",
      options: [
        "alt=\"\" pour que le lecteur d'écran l'ignore",
        "Omettre alt, l'image sera ignorée automatiquement",
        "alt=\"image\" pour signaler sa présence",
        "alt=\"wave.svg\" pour décrire le fichier",
      ],
      correctIndex: 0,
      explanation:
        "Un alt vide marque l'image comme décorative. Sans attribut alt, certains lecteurs annoncent le nom du fichier, ce qui ajoute du bruit.",
      difficulty: "medium",
    },
    {
      id: "frontend-accessibility-5",
      question:
        "<main id=\"content\" tabIndex={-1}> est la cible d'un lien d'évitement. Pourquoi -1 plutôt que 0 ?",
      options: [
        "-1 masque main aux lecteurs d'écran",
        "0 est interdit sur les éléments de structure comme main",
        "-1 place main en tout premier dans l'ordre de tabulation de la page",
        "-1 le rend focusable par script sans l'ajouter à la tabulation",
      ],
      correctIndex: 3,
      explanation:
        "Avec tabIndex -1, le focus peut être déplacé vers main par le lien ou par script, mais un utilisateur ne s'y arrête pas en tabulant. Avec 0, un conteneur non interactif encombrerait l'ordre de tabulation.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/css-advanced": [
    {
      id: "frontend-css-advanced-1",
      question:
        "Un conteneur de 1000 px a gap: 1.5rem (24 px) et grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)). Combien de colonnes obtient-on ?",
      options: [
        "3 colonnes d'environ 317 px",
        "4 colonnes de 250 px",
        "3 colonnes de 300 px, laissant 52 px vides",
        "1 seule colonne de 1000 px",
      ],
      correctIndex: 0,
      explanation:
        "Trois colonnes de 300 px avec deux gaps tiennent (948 px), pas quatre (1272 px). Les colonnes sont ensuite étirées par 1fr pour remplir la largeur, soit environ 317 px chacune.",
      difficulty: "easy",
    },
    {
      id: "frontend-css-advanced-2",
      question:
        ".card-container { container-name: card; }\n@container card (min-width: 400px) {\n  .layout { display: grid; }\n}\nLa règle ne s'applique jamais. Pourquoi ?",
      options: [
        "min-width est interdit dans une règle @container",
        "Le nom du conteneur doit commencer par --",
        "Il manque container-type, par exemple inline-size, sur .card-container",
        "@container doit être placé dans un @media",
      ],
      correctIndex: 2,
      explanation:
        "Un élément n'est un conteneur de requêtes que s'il déclare container-type. container-name seul donne un nom, mais ne crée pas le contexte de mesure.",
      difficulty: "easy",
    },
    {
      id: "frontend-css-advanced-3",
      question:
        "@layer base, components, utilities;\n@layer base { #title { color: red; } }\n@layer utilities { .blue { color: blue; } }\nQuelle couleur pour <h1 id=\"title\" class=\"blue\"> ?",
      options: [
        "Rouge : l'identifiant est plus spécifique",
        "Rouge : base est déclarée en premier",
        "Bleue seulement si on ajoute !important",
        "Bleue : la couche déclarée plus tard l'emporte, quelle que soit la spécificité",
      ],
      correctIndex: 3,
      explanation:
        "Entre couches, l'ordre de déclaration prime sur la spécificité : utilities passe après base. La spécificité ne départage que les règles d'une même couche.",
      difficulty: "medium",
    },
    {
      id: "frontend-css-advanced-4",
      question:
        "Un panneau doit glisser à l'écran. Quelle implémentation évite de recalculer la mise en page à chaque image ?",
      options: [
        "Une transition sur left, de -300px à 0",
        "Une transition sur transform: translateX, de -300px à 0",
        "Une transition sur width, de 0 à 300px",
        "Une transition sur margin-left, de -300px à 0",
      ],
      correctIndex: 1,
      explanation:
        "transform et opacity peuvent être traités par le compositeur sans relancer la mise en page. left, width et margin changent la géométrie et déclenchent un layout à chaque image.",
      difficulty: "medium",
    },
    {
      id: "frontend-css-advanced-5",
      question:
        ".form:has(input:invalid) .submit-btn {\n  opacity: .5;\n  pointer-events: none;\n}\nQuelle limite ce style présente-t-il ?",
      options: [
        "Le bouton reste cliquable à la souris",
        "Le sélecteur :has ne s'applique pas avec input:invalid",
        "Le bouton reste focusable et activable au clavier, pointer-events ne concerne que souris et tactile",
        "Le bouton est retiré de l'arbre d'accessibilité",
      ],
      correctIndex: 2,
      explanation:
        "pointer-events: none bloque la souris et le tactile, pas le clavier ni les technologies d'assistance. Pour désactiver réellement, utilisez l'attribut disabled, le style n'étant qu'un indice visuel.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/testing": [
    {
      id: "frontend-testing-1",
      question:
        "Quelle requête Testing Library privilégier pour cibler le bouton d'envoi d'un formulaire de connexion ?",
      options: [
        "getByTestId(\"submit\")",
        "container.querySelector(\".btn-primary\")",
        "getByText(\"Connexion\") combiné à une classe CSS",
        "getByRole(\"button\", { name: /connexion/i })",
      ],
      correctIndex: 3,
      explanation:
        "getByRole reflète ce que perçoit l'utilisateur et les technologies d'assistance, et vérifie au passage l'accessibilité du bouton. Les sélecteurs CSS et data-testid dépendent de détails d'implémentation.",
      difficulty: "easy",
    },
    {
      id: "frontend-testing-2",
      question:
        "Quelle requête permet de vérifier qu'un message d'erreur n'est PAS affiché ?",
      options: [
        "getByText, qui renvoie null si absent",
        "queryByText, qui renvoie null si absent",
        "findByText, qui attend sa disparition",
        "getAllByText avec une longueur de 0",
      ],
      correctIndex: 1,
      explanation:
        "getBy lève une erreur quand l'élément manque, ce qui fait échouer le test avant l'assertion. queryBy renvoie null et s'utilise avec not.toBeInTheDocument().",
      difficulty: "easy",
    },
    {
      id: "frontend-testing-3",
      question:
        "const user = userEvent.setup();\nuser.type(input, \"abc\");\nexpect(input).toHaveValue(\"abc\");\nPourquoi ce test est-il instable ?",
      options: [
        "Les méthodes de userEvent sont asynchrones : sans await, l'assertion passe avant la fin de la frappe",
        "type n'existe plus dans cette version",
        "L'assertion devrait utiliser findBy",
        "userEvent n'attend que les clics",
      ],
      correctIndex: 0,
      explanation:
        "Depuis userEvent v14, chaque interaction retourne une promesse. Il faut écrire await user.type(...) pour que la frappe soit terminée avant l'assertion.",
      difficulty: "medium",
    },
    {
      id: "frontend-testing-4",
      question:
        "validateEmail est une fonction pure avec 20 cas limites. Où les tester ?",
      options: [
        "En E2E avec Playwright, un test par cas",
        "Dans un test de composant avec capture d'écran",
        "En tests unitaires paramétrés (it.each), rapides et isolés",
        "Dans un seul test E2E qui les enchaîne",
      ],
      correctIndex: 2,
      explanation:
        "La pyramide place les nombreux cas fins en tests unitaires, rapides et précis en cas d'échec. L'E2E, lent, reste réservé aux parcours critiques.",
      difficulty: "medium",
    },
    {
      id: "frontend-testing-5",
      question:
        "Un test fait global.fetch = vi.fn() sans jamais le restaurer. Quelle est la conséquence ?",
      options: [
        "Les tests suivants du même fichier voient le faux fetch, d'où des dépendances à l'ordre",
        "Vitest restaure automatiquement les globales après chaque test",
        "Le vrai fetch est quand même appelé",
        "Seul ce test est concerné par le faux fetch",
      ],
      correctIndex: 0,
      explanation:
        "Une affectation directe n'est pas annulée entre deux tests du même fichier. Préférez vi.stubGlobal avec vi.unstubAllGlobals() (ou la configuration correspondante) pour éviter les fuites.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/frontend/nextjs-patterns": [
    {
      id: "frontend-nextjs-patterns-1",
      question:
        "Un fichier page.tsx sans directive appelle useState. Que se passe-t-il ?",
      options: [
        "Cela fonctionne, mais sans hydratation",
        "Cela fonctionne, Next.js ajoute \"use client\" automatiquement",
        "Erreur : les hooks d'état sont réservés aux Client Components",
        "Le hook s'exécute seulement côté serveur",
      ],
      correctIndex: 2,
      explanation:
        "Dans l'App Router, un composant est un Server Component par défaut, et useState, useEffect ou onClick demandent \"use client\". Next.js ne l'ajoute pas pour vous.",
      difficulty: "easy",
    },
    {
      id: "frontend-nextjs-patterns-2",
      question:
        "const a = await getUsers();\nconst b = await getPosts();\nconst c = await getStats();\nLes trois requêtes sont indépendantes et durent 1 s chacune. Quelle est la durée totale ?",
      options: [
        "Environ 3 s, et Promise.all la ramène à environ 1 s",
        "Environ 1 s, car await ne bloque pas",
        "Environ 3 s, et Promise.all ne change rien",
        "Environ 1 s, car React parallélise automatiquement",
      ],
      correctIndex: 0,
      explanation:
        "Chaque await attend la fin de la requête précédente : c'est une cascade. Promise.all([...]) lance les trois en même temps, donc la durée est celle de la plus lente.",
      difficulty: "easy",
    },
    {
      id: "frontend-nextjs-patterns-3",
      question:
        "Une Server Action fait db.post.create(data) puis redirect(\"/posts\"), mais la liste affiche parfois l'ancienne donnée. Que manque-t-il ?",
      options: [
        "Un \"use client\" en tête de fichier",
        "Un revalidatePath(\"/posts\") (ou revalidateTag) avant le redirect",
        "Un cache: \"no-store\" sur le formulaire",
        "Un useEffect qui recharge la page",
      ],
      correctIndex: 1,
      explanation:
        "Après une mutation, il faut invalider les données mises en cache. L'appel doit précéder redirect, qui interrompt l'exécution en lançant une exception interne.",
      difficulty: "medium",
    },
    {
      id: "frontend-nextjs-patterns-4",
      question:
        "Une page affiche <QuickStats /> (rapide) et <SlowChart /> (composant async de 3 s), sans Suspense ni loading.tsx. Que voit l'utilisateur ?",
      options: [
        "QuickStats tout de suite, puis le graphique plus tard",
        "Une page vide, puis une erreur de rendu",
        "Le graphique d'abord, puis QuickStats",
        "Rien avant environ 3 s : tout le rendu attend le composant lent",
      ],
      correctIndex: 3,
      explanation:
        "Sans frontière Suspense, le serveur ne peut pas envoyer la partie prête avant la fin de la lente. Entourer SlowChart d'un Suspense avec un fallback permet de streamer le reste immédiatement.",
      difficulty: "medium",
    },
    {
      id: "frontend-nextjs-patterns-5",
      question:
        "Sidebar (\"use client\") doit afficher <Stats />, qui lit la base de données. Quelle approche est correcte ?",
      options: [
        "Importer Stats dans Sidebar : Next.js le garde côté serveur",
        "Rendre <Stats /> dans un parent serveur et le passer à Sidebar via children",
        "Ajouter \"use server\" en tête de Stats",
        "Appeler Stats() depuis un useEffect de Sidebar",
      ],
      correctIndex: 1,
      explanation:
        "Un module importé par un fichier client rejoint le bundle client, donc Stats ne pourrait plus accéder à la base. En passant l'élément en children depuis un parent serveur, il reste rendu côté serveur ; \"use server\" sert aux Server Actions, pas aux composants.",
      difficulty: "hard",
    },
  ],
};
