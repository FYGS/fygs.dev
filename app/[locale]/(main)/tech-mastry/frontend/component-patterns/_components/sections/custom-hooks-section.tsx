"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";
import { useState, useEffect } from "react";

// Demo custom hook
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array: subscribe on mount, clean up on unmount (twice in dev under StrictMode)
  
  return windowSize;
}

function WindowSizeDemo() {
  const size = useWindowSize();
  
  return (
    <div className="p-4 border rounded-md bg-gray-900 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        Redimensionnez votre fenêtre pour voir les valeurs changer:
      </p>
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <div className="text-sm font-medium">Largeur</div>
          <div className="text-xl font-bold">{size.width}px</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">Hauteur</div>
          <div className="text-xl font-bold">{size.height}px</div>
        </div>
      </div>
    </div>
  );
}

export function CustomHooksSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Custom Hooks Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet d&apos;extraire et de réutiliser la logique d&apos;état et d&apos;effets entre composants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Les Custom Hooks sont une fonctionnalité de React qui vous permet d&apos;extraire la logique d&apos;état et d&apos;effets d&apos;un composant pour la réutiliser dans plusieurs composants.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Réutilisabilité</Badge>
            <Badge>Composition</Badge>
            <Badge>Séparation des Préoccupations</Badge>
            <Badge>Lisibilité</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Implémentation du Pattern Custom Hooks"
        description="Comment créer et utiliser des hooks personnalisés"
        code={`import { useState, useEffect } from 'react';

// 1. Création d'un custom hook
function useWindowSize() {
  // 2. Définition de l'état local
  // (window n'existe pas côté serveur : avec SSR/Next.js, initialisez à 0
  // puis mettez à jour dans l'effet, comme dans la démo ci-dessus)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // 3. Ajout d'effets de cycle de vie
  useEffect(() => {
    // 4. Fonction de gestionnaire d'événement
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // 5. Abonnement à l'événement
    window.addEventListener('resize', handleResize);
    
    // 6. Nettoyage lors du démontage du composant
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 7. Tableau vide = abonnement au montage, nettoyage au démontage (monté deux fois en dev avec StrictMode)
  
  // 8. Retour des données du hook
  return windowSize;
}

// 9. Utilisation du custom hook dans un composant
function WindowSizeDisplay() {
  // 10. Appel du hook comme une fonction normale
  const size = useWindowSize();
  
  return (
    <div>
      <h1>Dimensions de la fenêtre</h1>
      <p>Largeur: {size.width}px</p>
      <p>Hauteur: {size.height}px</p>
    </div>
  );
}

// 11. Autre exemple: hook de formulaire
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };
  
  return {
    values,
    errors,
    handleChange,
    reset,
    setErrors,
  };
}

// 12. Utilisation du hook de formulaire
function LoginForm() {
  const { values, errors, handleChange, reset } = useForm({
    email: '',
    password: '',
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission...
    console.log(values);
    reset();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <p>{errors.email}</p>}
      
      <input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {errors.password && <p>{errors.password}</p>}
      
      <button type="submit">Login</button>
    </form>
  );
}`}
        demo={<WindowSizeDemo />}
        explanation={
          <div>
            <p>
              Les Custom Hooks sont une fonctionnalité puissante de React qui permet d&apos;extraire la logique d&apos;état et d&apos;effets d&apos;un composant pour la réutiliser dans plusieurs composants.
            </p>
            <p className="mt-3">
              Les principes clés des Custom Hooks sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Convention de nommage</strong>: Les custom hooks commencent toujours par &quot;use&quot; (ex: useWindowSize, useForm).
              </li>
              <li>
                <strong>Composition</strong>: Les custom hooks peuvent utiliser d&apos;autres hooks, y compris d&apos;autres custom hooks.
              </li>
              <li>
                <strong>Isolation d&apos;état</strong>: Chaque appel à un custom hook a son propre état isolé.
              </li>
              <li>
                <strong>Logique réutilisable</strong>: Les custom hooks permettent de partager la logique sans partager l&apos;état.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé deux custom hooks:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><code>useWindowSize</code>: Suit les dimensions de la fenêtre et les met à jour lors du redimensionnement</li>
              <li><code>useForm</code>: Gère l&apos;état d&apos;un formulaire, y compris les valeurs, les erreurs et les gestionnaires d&apos;événements</li>
            </ul>
            <p className="mt-3">
              Les custom hooks offrent plusieurs avantages:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Réduction de la duplication de code</li>
              <li>Composants plus simples et plus lisibles</li>
              <li>Meilleure séparation des préoccupations</li>
              <li>Facilité de test de la logique isolée</li>
              <li>Possibilité de partager la logique entre projets</li>
            </ul>
            <p className="mt-3">
              Ce pattern est devenu la méthode privilégiée pour partager la logique entre composants depuis l&apos;introduction des Hooks dans React 16.8.
            </p>
          </div>
        }
        tips={[
          "Commencez toujours le nom de vos custom hooks par 'use'",
          "Gardez vos hooks simples et concentrés sur une seule responsabilité",
          "Documentez clairement ce que retourne votre hook",
          "Utilisez TypeScript pour typer les entrées et sorties de vos hooks"
        ]}
        interviewQuestions={[
          {
            question: "Quels sont les avantages des Custom Hooks par rapport aux autres patterns de réutilisation de code?",
            answer: "Avantages des Custom Hooks par rapport aux autres patterns: 1) Simplicité: Les hooks sont des fonctions JavaScript simples, sans abstraction complexe. 2) Composition: Faciles à composer et à combiner pour créer des abstractions plus complexes. 3) Lisibilité: Le code utilisant des hooks est généralement plus lisible que celui utilisant des HOCs ou des Render Props. 4) Pas de nesting: Évitent le 'wrapper hell' des HOCs ou le 'callback hell' des Render Props. 5) Isolation: Chaque appel à un hook a son propre état isolé. 6) Typage: Plus faciles à typer avec TypeScript que les HOCs. 7) Testabilité: Étant de simples fonctions isolées du rendu, ils sont plus faciles à tester (avec renderHook). 8) Optimisation: Permettent d'utiliser facilement des optimisations comme useMemo et useCallback. 9) Découvrabilité: La convention de nommage 'use' rend les hooks facilement identifiables. Ces avantages font des Custom Hooks le pattern privilégié pour la réutilisation de logique d'état dans les applications React modernes.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Comparison"]
          },
          {
            question: "Comment testeriez-vous un custom hook?",
            answer: "Pour tester un custom hook: 1) Utiliser renderHook() de @testing-library/react (depuis la v13.1; l'ancien paquet @testing-library/react-hooks est déprécié et ne supporte pas React 18+) pour tester les hooks isolément. Exemple: `const { result } = renderHook(() => useCounter())` puis `expect(result.current.count).toBe(0)`. 2) Tester les mises à jour: Utiliser act() pour simuler les changements d'état. Exemple: `act(() => { result.current.increment() })` puis vérifier le nouvel état. 3) Tester les effets de nettoyage: Utiliser unmount() pour vérifier que les effets sont bien nettoyés. 4) Mocker les dépendances: Pour les hooks qui dépendent d'APIs externes, utiliser vi.mock() (Vitest) ou jest.mock(). 5) Tester les erreurs: Vérifier que les hooks lancent les erreurs appropriées dans les cas limites. 6) Tester avec différents arguments: Vérifier le comportement avec différentes valeurs initiales. 7) Tester la réexécution: Utiliser rerender() pour simuler des changements de props. 8) Intégration dans des composants: Tester également le hook dans le contexte d'un composant réel. Cette approche permet de tester efficacement la logique isolée des hooks tout en vérifiant leur comportement dans différents scénarios.",
            difficulty: "hard",
            tags: ["Testing", "React", "Vitest"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur les Custom Hooks"
        questions={[
          {
            question: "Expliquez les règles des Hooks et pourquoi elles sont importantes.",
            answer: "Les règles des Hooks sont: 1) N'appelez les Hooks qu'au niveau supérieur: Ne pas appeler les hooks dans des boucles, des conditions ou des fonctions imbriquées. Cela garantit que les hooks sont appelés dans le même ordre à chaque rendu, permettant à React de maintenir correctement l'état entre les rendus. 2) N'appelez les Hooks que depuis des composants React ou d'autres Hooks personnalisés: Ne pas appeler les hooks depuis des fonctions JavaScript ordinaires. Cela garantit que toute la logique d'état d'un composant est visible dans son code source. Ces règles sont cruciales car React s'appuie sur l'ordre des appels de hooks pour associer correctement l'état local avec chaque hook. Si l'ordre change entre les rendus (par exemple, si un hook est dans une condition qui n'est pas toujours vraie), React peut associer incorrectement l'état, causant des bugs difficiles à détecter. L'ESLint plugin 'eslint-plugin-react-hooks' peut aider à faire respecter ces règles automatiquement.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Rules"]
          },
          {
            question: "Comment créeriez-vous un hook personnalisé pour gérer les appels API avec gestion d'état de chargement et d'erreur?",
            answer: "Pour créer un hook useFetch gérant les appels API: 1) Définir un état unique: `const [state, setState] = useState({ data: null, loading: true, error: null });` 2) Dans un useEffect dépendant de l'URL, créer un AbortController, passer son signal à fetch, vérifier response.ok (fetch ne rejette pas la promesse sur un statut 404 ou 500), ignorer l'AbortError et annuler la requête dans la fonction de nettoyage: `useEffect(() => { const controller = new AbortController(); setState(s => ({ ...s, loading: true, error: null })); fetch(url, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(data => setState({ data, loading: false, error: null })).catch(err => { if (err.name === 'AbortError') return; setState({ data: null, loading: false, error: err }); }); return () => controller.abort(); }, [url]);` 3) Retourner l'état: `return state;`. 4) Avec TypeScript: `function useFetch<T>(url: string): { data: T | null; loading: boolean; error: Error | null }`. 5) L'annulation évite les conditions de course (la réponse d'une ancienne URL qui écrase une plus récente) et rend inoffensif le double appel des effets de StrictMode en développement. 6) En production, préférez une bibliothèque dédiée (TanStack Query, SWR) pour le cache, la déduplication et les relances. Utilisation: `const { data, loading, error } = useFetch('/api/users');`",
            difficulty: "medium",
            tags: ["React", "API", "Implementation"]
          },
          {
            question: "Comment les Custom Hooks peuvent-ils aider à gérer les effets de bord dans une application React?",
            answer: "Les Custom Hooks aident à gérer les effets de bord dans React: 1) Encapsulation: Ils isolent la logique d'effets de bord (API calls, localStorage, subscriptions) du code de rendu. 2) Réutilisabilité: Un hook comme useLocalStorage peut être utilisé partout où vous avez besoin de persistance. 3) Testabilité: Les effets isolés sont plus faciles à tester que ceux mélangés au code de rendu. 4) Nettoyage cohérent: Les hooks garantissent que le nettoyage est effectué correctement (ex: désabonnements). 5) Séparation des préoccupations: Chaque hook peut gérer un type spécifique d'effet (réseau, stockage, etc.). 6) Composition: Vous pouvez composer des hooks pour des effets complexes (useAuthenticatedFetch combinant useAuth et useFetch). 7) Gestion du cycle de vie: Les hooks comme useMount, useUnmount simplifient la gestion du cycle de vie. 8) Synchronisation: useEffect avec des dépendances permet de synchroniser l'état avec des sources externes. 9) Abstraction des APIs: Des hooks comme useMediaQuery ou useOnlineStatus abstraient les APIs du navigateur. Cette approche rend le code plus maintenable, plus lisible et plus robuste face aux changements.",
            difficulty: "hard",
            tags: ["React", "Side Effects", "Architecture"]
          },
          {
            question: "Quelles sont les meilleures pratiques pour organiser et nommer les Custom Hooks dans une application de grande taille?",
            answer: "Meilleures pratiques pour organiser les Custom Hooks: 1) Structure de fichiers: Créez un répertoire /hooks avec sous-dossiers thématiques (/hooks/form, /hooks/auth, etc.). 2) Convention de nommage: Préfixez toujours par 'use' et utilisez des noms descriptifs (useFormValidation plutôt que useForm). 3) Granularité: Préférez plusieurs hooks spécifiques à un seul hook générique trop complexe. 4) Documentation: Ajoutez des commentaires JSDoc expliquant les paramètres, retours et exemples d'utilisation. 5) Couplage: Minimisez les dépendances entre hooks pour éviter les cycles. 6) Hooks composés: Créez des hooks de haut niveau qui utilisent des hooks plus primitifs. 7) Hooks partagés: Placez les hooks réutilisables dans une bibliothèque interne ou un monorepo. 8) Tests: Créez des tests unitaires pour chaque hook dans un fichier adjacent. 9) TypeScript: Utilisez des interfaces et des génériques pour un typage précis. 10) Versionnement: Pour les hooks critiques, considérez un versionnement explicite. 11) Hooks spécifiques aux fonctionnalités: Organisez certains hooks près des fonctionnalités qu'ils servent. 12) Index d'exportation: Utilisez des fichiers index.ts pour simplifier les imports. Cette organisation améliore la maintenabilité et la découvrabilité des hooks dans les grandes applications.",
            difficulty: "medium",
            tags: ["React", "Architecture", "Best Practices"]
          }
        ]}
      />
    </div>
  );
}
