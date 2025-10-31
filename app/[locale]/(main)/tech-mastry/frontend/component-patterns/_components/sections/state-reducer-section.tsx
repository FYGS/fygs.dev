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
import { useReducer } from "react";

// Demo components for State Reducer pattern
type CounterState = { count: number };
type CounterAction = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; payload: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET':
      return { count: action.payload };
    default:
      return state;
  }
}

function CounterDemo() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  
  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 flex flex-col items-center gap-4">
      <div className="text-4xl font-bold">{state.count}</div>
      <div className="flex gap-2">
        <button 
          onClick={() => dispatch({ type: 'DECREMENT' })}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          -
        </button>
        <button 
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Reset
        </button>
        <button 
          onClick={() => dispatch({ type: 'INCREMENT' })}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          +
        </button>
      </div>
      <div className="mt-2">
        <button 
          onClick={() => dispatch({ type: 'SET', payload: 100 })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Set to 100
        </button>
      </div>
    </div>
  );
}

export function StateReducerSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>State Reducer Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet de gérer des états complexes et de personnaliser la logique d&apos;état
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le pattern State Reducer est une technique avancée qui permet de gérer des états complexes et d&apos;offrir aux utilisateurs de vos composants la possibilité de personnaliser la logique d&apos;état.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Flexibilité</Badge>
            <Badge>Inversion de Contrôle</Badge>
            <Badge>États Complexes</Badge>
            <Badge>Personnalisation</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Implémentation du Pattern State Reducer"
        description="Comment créer un composant avec le pattern State Reducer"
        code={`import React, { useReducer } from 'react';

// 1. Définir les types d'état et d'actions
type CounterState = { count: number };
type CounterAction = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; payload: number };

// 2. Créer un reducer par défaut
function defaultReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET':
      return { count: action.payload };
    default:
      return state;
  }
}

// 3. Créer un composant qui utilise le pattern State Reducer
function Counter({
  initialCount = 0,
  reducer = defaultReducer,
  onChange,
}: {
  initialCount?: number;
  reducer?: (state: CounterState, action: CounterAction) => CounterState;
  onChange?: (count: number) => void;
}) {
  // 4. Utiliser useReducer avec le reducer personnalisable
  const [state, dispatch] = useReducer(reducer, { count: initialCount });
  
  // 5. Appeler le callback onChange lorsque l'état change
  React.useEffect(() => {
    onChange?.(state.count);
  }, [state.count, onChange]);
  
  // 6. Exposer les actions via des fonctions
  const increment = () => dispatch({ type: 'INCREMENT' });
  const decrement = () => dispatch({ type: 'DECREMENT' });
  const reset = () => dispatch({ type: 'RESET' });
  const setCount = (value: number) => dispatch({ type: 'SET', payload: value });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
      <button onClick={increment}>+</button>
      <button onClick={() => setCount(100)}>Set to 100</button>
    </div>
  );
}

// 7. Utilisation du composant avec le reducer par défaut
function BasicExample() {
  return <Counter initialCount={10} onChange={(count) => console.log(count)} />;
}

// 8. Utilisation avec un reducer personnalisé
function CustomExample() {
  // 9. Créer un reducer personnalisé qui étend le comportement par défaut
  function customReducer(state: CounterState, action: CounterAction): CounterState {
    switch (action.type) {
      case 'INCREMENT':
        // Incrémenter par 10 au lieu de 1
        return { count: state.count + 10 };
      case 'DECREMENT':
        // Ne pas permettre des valeurs négatives
        return { count: Math.max(0, state.count - 1) };
      default:
        // Utiliser le reducer par défaut pour les autres actions
        return defaultReducer(state, action);
    }
  }
  
  return <Counter reducer={customReducer} />;
}`}
        demo={<CounterDemo />}
        explanation={
          <div>
            <p>
              Le pattern State Reducer est une technique avancée qui combine le pattern Inversion of Control avec le hook useReducer de React. Il permet de créer des composants hautement personnalisables en donnant aux utilisateurs la possibilité de contrôler la logique d&apos;état.
            </p>
            <p className="mt-3">
              Les principes clés du pattern State Reducer sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Inversion de contrôle</strong>: Le composant délègue la logique de mise à jour de l&apos;état à l&apos;utilisateur.
              </li>
              <li>
                <strong>Reducer par défaut</strong>: Le composant fournit un comportement par défaut via un reducer standard.
              </li>
              <li>
                <strong>Personnalisation</strong>: L&apos;utilisateur peut remplacer ou étendre le reducer par défaut pour personnaliser le comportement.
              </li>
              <li>
                <strong>Actions typées</strong>: Les actions sont bien définies et typées pour faciliter la personnalisation.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé un composant <code>Counter</code> qui:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Définit un état et des actions typés</li>
              <li>Fournit un reducer par défaut avec un comportement standard</li>
              <li>Permet à l&apos;utilisateur de fournir son propre reducer</li>
              <li>Expose des fonctions d&apos;action pour faciliter l&apos;utilisation</li>
            </ul>
            <p className="mt-3">
              Ce pattern est particulièrement utile pour:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Les composants avec une logique d&apos;état complexe</li>
              <li>Les bibliothèques de composants qui doivent être hautement personnalisables</li>
              <li>Les composants qui doivent s&apos;adapter à différents cas d&apos;utilisation</li>
              <li>Les situations où vous voulez permettre aux utilisateurs de modifier le comportement sans avoir à fork le code</li>
            </ul>
            <p className="mt-3">
              Le State Reducer pattern est plus avancé que les autres patterns, mais il offre un niveau de flexibilité inégalé pour les composants complexes.
            </p>
          </div>
        }
        tips={[
          "Définissez clairement les types d'état et d'actions pour faciliter la personnalisation",
          "Documentez bien les actions disponibles et leur comportement par défaut",
          "Utilisez TypeScript pour garantir la sécurité de type des reducers personnalisés",
          "Considérez d'exposer des méthodes d'action en plus du dispatch brut pour une meilleure expérience développeur"
        ]}
        interviewQuestions={[
          {
            question: "Quand devriez-vous utiliser le pattern State Reducer plutôt que d'autres patterns de gestion d'état?",
            answer: "Le pattern State Reducer est particulièrement adapté dans les situations suivantes: 1) Composants complexes: Lorsque vous avez un composant avec une logique d'état complexe avec de nombreuses transitions d'état interdépendantes. 2) Besoin de personnalisation: Quand vous créez une bibliothèque de composants qui doit s'adapter à divers cas d'utilisation que vous ne pouvez pas tous anticiper. 3) Inversion de contrôle: Lorsque vous voulez donner aux utilisateurs de votre composant un contrôle précis sur la logique d'état sans exposer l'état lui-même. 4) Comportement extensible: Quand vous voulez permettre aux utilisateurs d'étendre le comportement par défaut plutôt que de le remplacer entièrement. 5) Logique métier spécifique: Pour les composants qui doivent s'adapter à différentes règles métier selon le contexte. 6) Débogage avancé: Le pattern facilite le suivi des changements d'état et le débogage. Utilisez ce pattern quand les hooks d'état simples ou les props de contrôle ne suffisent pas à offrir la flexibilité nécessaire, mais soyez conscient qu'il ajoute une complexité qui n'est pas toujours justifiée pour des composants simples.",
            difficulty: "hard",
            tags: ["React", "Architecture", "Decision Making"]
          },
          {
            question: "Comment combiner le pattern State Reducer avec d'autres patterns comme les Render Props ou les Custom Hooks?",
            answer: "Combinaison du State Reducer avec d'autres patterns: 1) Avec Custom Hooks: Créez un hook personnalisé qui encapsule la logique du reducer et expose l'état et les actions. Exemple: `function useCustomCounter(initialState, reducer) { const [state, dispatch] = useReducer(reducer, initialState); const increment = () => dispatch({type: 'INCREMENT'}); return { state, dispatch, increment }; }`. 2) Avec Render Props: Utilisez le pattern State Reducer pour gérer l'état et exposez-le via une render prop. Exemple: `<Counter reducer={customReducer} render={({ count, increment }) => <Button onClick={increment}>{count}</Button>} />`. 3) Avec HOCs: Créez un HOC qui injecte l'état et les actions du reducer dans le composant enveloppé. 4) Avec Context: Utilisez un Context Provider avec un reducer personnalisable pour partager l'état entre plusieurs composants. 5) Avec Compound Components: Combinez State Reducer pour la logique d'état avec Compound Components pour l'API. Cette combinaison de patterns permet de créer des abstractions puissantes et flexibles, où chaque pattern résout un aspect spécifique du problème: State Reducer pour la personnalisation de la logique d'état, Render Props pour la personnalisation du rendu, Custom Hooks pour la réutilisation de la logique, etc.",
            difficulty: "hard",
            tags: ["React", "Advanced", "Pattern Composition"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur le Pattern State Reducer"
        questions={[
          {
            question: "Expliquez le pattern State Reducer et ses avantages par rapport à d'autres approches de gestion d'état.",
            answer: "Le pattern State Reducer est une technique qui combine le hook useReducer de React avec le principe d'inversion de contrôle. Il consiste à créer un composant qui utilise un reducer pour gérer son état interne, mais permet à l'utilisateur de fournir son propre reducer pour personnaliser la logique d'état. Avantages: 1) Flexibilité maximale: Les utilisateurs peuvent modifier n'importe quel aspect du comportement d'état sans avoir à fork le code. 2) Inversion de contrôle: Le composant délègue la logique de mise à jour de l'état à l'utilisateur. 3) Encapsulation: L'état reste encapsulé dans le composant, seule la logique de transition est exposée. 4) Extensibilité: Les utilisateurs peuvent étendre le comportement par défaut plutôt que de le remplacer entièrement. 5) Prévisibilité: Les transitions d'état sont explicites et suivent le modèle action/reducer. 6) Débogage facilité: Les actions et les changements d'état sont clairement définis et traçables. Comparé à d'autres approches: Plus flexible que les props contrôlées qui limitent les personnalisations possibles; Plus structuré que les Render Props qui exposent tout l'état; Plus encapsulé que les Custom Hooks qui exposent souvent l'état directement.",
            difficulty: "medium",
            tags: ["React", "Design Patterns", "State Management"]
          },
          {
            question: "Comment implémenteriez-vous un composant de formulaire complexe utilisant le pattern State Reducer?",
            answer: "Implémentation d'un formulaire avec State Reducer: 1) Définir les types: `type FormState = { values: Record<string, any>; errors: Record<string, string>; touched: Record<string, boolean>; isSubmitting: boolean; }; type FormAction = { type: 'CHANGE_VALUE'; field: string; value: any; } | { type: 'SET_ERROR'; field: string; error: string; } | { type: 'TOUCH_FIELD'; field: string; } | { type: 'SUBMIT_START'; } | { type: 'SUBMIT_SUCCESS'; } | { type: 'SUBMIT_FAILURE'; errors: Record<string, string>; } | { type: 'RESET_FORM'; };` 2) Créer le reducer par défaut: `function defaultReducer(state: FormState, action: FormAction): FormState { switch(action.type) { case 'CHANGE_VALUE': return {...state, values: {...state.values, [action.field]: action.value}}; case 'SET_ERROR': return {...state, errors: {...state.errors, [action.field]: action.error}}; // autres cas... } }` 3) Créer le composant Form: `function Form({initialValues, onSubmit, reducer = defaultReducer, children}) { const [state, dispatch] = useReducer(reducer, {values: initialValues, errors: {}, touched: {}, isSubmitting: false}); const handleSubmit = async (e) => { e.preventDefault(); dispatch({type: 'SUBMIT_START'}); try { await onSubmit(state.values); dispatch({type: 'SUBMIT_SUCCESS'}); } catch (errors) { dispatch({type: 'SUBMIT_FAILURE', errors}); } }; const getFieldProps = (field) => ({ name: field, value: state.values[field], onChange: (e) => dispatch({type: 'CHANGE_VALUE', field, value: e.target.value}), onBlur: () => dispatch({type: 'TOUCH_FIELD', field}) }); return <form onSubmit={handleSubmit}>{typeof children === 'function' ? children({state, dispatch, getFieldProps}) : children}</form>; }` 4) Utilisation: `<Form initialValues={{name: ''}} reducer={customReducer} onSubmit={handleSubmit}> {({state, getFieldProps}) => ( <div> <input {...getFieldProps('name')} /> {state.errors.name && state.touched.name && <div>{state.errors.name}</div>} <button type=\"submit\" disabled={state.isSubmitting}>Submit</button> </div> )} </Form>`",
            difficulty: "hard",
            tags: ["React", "Forms", "Implementation"]
          },
          {
            question: "Quels sont les défis potentiels lors de l'utilisation du pattern State Reducer et comment les surmonter?",
            answer: "Défis du pattern State Reducer et solutions: 1) Complexité accrue: Le pattern ajoute une couche d'indirection qui peut être difficile à comprendre. Solution: Documenter clairement le comportement par défaut et fournir des exemples de personnalisation. 2) Courbe d'apprentissage: Les utilisateurs doivent comprendre le concept de reducers. Solution: Fournir des helpers et des abstractions pour les cas d'utilisation courants. 3) Typage des actions: En TypeScript, typer correctement les actions peut être complexe. Solution: Utiliser des types discriminés et des génériques pour assurer la sécurité de type. 4) Débogage: Il peut être difficile de suivre les changements d'état. Solution: Implémenter un middleware de logging ou utiliser des outils comme Redux DevTools. 5) Performances: Les reducers complexes peuvent affecter les performances. Solution: Utiliser la mémorisation et éviter les calculs inutiles dans le reducer. 6) Composition de reducers: Combiner plusieurs reducers personnalisés peut être délicat. Solution: Créer des utilitaires de composition comme combineReducers. 7) API trop ouverte: Donner trop de contrôle peut mener à des utilisations incorrectes. Solution: Fournir des guards et des validations dans le reducer par défaut. 8) Compatibilité avec d'autres patterns: L'intégration avec d'autres patterns peut être complexe. Solution: Créer des adaptateurs ou des wrappers pour faciliter l'interopérabilité.",
            difficulty: "hard",
            tags: ["React", "Challenges", "Best Practices"]
          },
          {
            question: "Comment le pattern State Reducer se compare-t-il à des bibliothèques de gestion d'état comme Redux ou MobX?",
            answer: "Comparaison du State Reducer avec Redux et MobX: 1) Portée: State Reducer est local à un composant, tandis que Redux et MobX sont conçus pour gérer l'état global de l'application. 2) Complexité: State Reducer est plus léger et ne nécessite pas de bibliothèques externes, contrairement à Redux ou MobX qui ajoutent des dépendances. 3) Boilerplate: State Reducer nécessite moins de code répétitif que Redux, mais plus que MobX qui est basé sur l'observation. 4) Flexibilité: State Reducer offre une flexibilité au niveau du composant, tandis que Redux et MobX offrent des solutions complètes avec middleware, devtools, etc. 5) Courbe d'apprentissage: State Reducer est plus simple à apprendre que Redux ou MobX car il utilise des concepts React natifs. 6) Performance: Pour des états locaux complexes, State Reducer peut être plus performant que de connecter chaque composant à un store global. 7) Interopérabilité: State Reducer peut être utilisé avec Redux ou MobX, permettant une approche hybride. 8) Cas d'utilisation: State Reducer est idéal pour des composants réutilisables avec état complexe, Redux pour des applications avec beaucoup d'état partagé, et MobX pour des applications avec des modèles de données complexes. 9) Testabilité: Tous les trois facilitent les tests, mais de manières différentes. Le choix dépend de la taille de l'application, des besoins de partage d'état, et des préférences de l'équipe.",
            difficulty: "medium",
            tags: ["React", "State Management", "Comparison"]
          }
        ]}
      />
    </div>
  );
}
