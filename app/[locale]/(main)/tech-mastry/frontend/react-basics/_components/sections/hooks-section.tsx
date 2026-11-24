"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions-new";

// Demo component for useState hook
function UseStateDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center">
      <p className="text-lg mb-2">
        Vous avez cliqué <span className="font-bold">{count}</span> fois
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 rounded-md bg-red-900/30 text-red-400 hover:bg-red-900/50"
          disabled={count <= 0}
        >
          -
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
          disabled={count === 0}
        >
          Reset
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Demo component for useEffect hook
function UseEffectDemo() {
  const [count, setCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Effect that runs on every render
  useEffect(() => {
    document.title = `Vous avez cliqué ${count} fois`;
  });

  // Effect with dependencies - runs only when count changes
  useEffect(() => {
    console.log(`Le compteur a changé: ${count}`);

    // Cleanup function (optional)
    return () => {
      console.log(
        `Nettoyage avant la prochaine exécution. Ancienne valeur: ${count}`
      );
    };
  }, [count]);

  // Effect that runs on mount (twice in development under StrictMode)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Cleanup function (runs on unmount)
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="text-center">
      <p className="text-lg mb-2">
        Compteur: <span className="font-bold">{count}</span>
      </p>
      <p className="text-sm mb-3 text-muted-foreground">
        Largeur de la fenêtre: {windowWidth}px
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
        >
          Incrémenter
        </button>
      </div>
      <p className="text-xs mt-3 text-muted-foreground">
        (Regardez le titre de l&apos;onglet et la console pour voir les effets)
      </p>
    </div>
  );
}

export function HooksSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>React Hooks</CardTitle>
          <CardDescription>
            Les Hooks sont des fonctions qui permettent d&apos;utiliser
            l&apos;état et d&apos;autres fonctionnalités de React dans les
            composants fonctionnels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Introduits dans React 16.8, les Hooks permettent d&apos;utiliser des
            fonctionnalités comme l&apos;état local, les effets secondaires, le
            contexte, et plus encore, sans avoir à écrire un composant de
            classe.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>useState</Badge>
            <Badge>useEffect</Badge>
            <Badge>useContext</Badge>
            <Badge>useRef</Badge>
            <Badge>useMemo</Badge>
            <Badge>useCallback</Badge>
            <Badge>useReducer</Badge>
            <Badge>use</Badge>
            <Badge>useActionState</Badge>
            <Badge>useOptimistic</Badge>
          </div>
        </CardContent>
      </Card>

      {/* useState Hook */}
      <CodeExample
        title="useState Hook"
        description="Gérer l'état local dans un composant fonctionnel"
        code={`import React, { useState } from 'react';

function Counter() {
  // Déclarer une variable d'état "count" avec la valeur initiale 0
  const [count, setCount] = useState(0);

  // Déclarer plusieurs états
  const [user, setUser] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour un état objet en préservant les valeurs précédentes
  const updateName = (name) => {
    setUser(prevUser => ({
      ...prevUser,
      name
    }));
  };

  return (
    <div>
      <p>Vous avez cliqué {count} fois</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquez ici
      </button>
    </div>
  );
}`}
        demo={
          <div className="p-4 border rounded-md flex flex-col items-center gap-4">
            <UseStateDemo />
          </div>
        }
        explanation={
          <div>
            <p>
              <code>useState</code> est le Hook le plus fondamental en React. Il
              permet d&apos;ajouter un état local à un composant fonctionnel.
            </p>
            <p className="mt-2">
              <code>useState</code> retourne un tableau avec deux éléments:
            </p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>La valeur d&apos;état actuelle</li>
              <li>Une fonction pour mettre à jour cette valeur</li>
            </ul>
            <p className="mt-2">
              Vous pouvez appeler cette fonction de mise à jour depuis un
              gestionnaire d&apos;événement ou ailleurs. Elle est similaire à{" "}
              <code>this.setState</code> dans les composants de classe, mais
              elle ne fusionne pas automatiquement l&apos;ancien et le nouvel
              état.
            </p>
          </div>
        }
        tips={[
          "Utilisez la déstructuration d'array pour nommer vos variables d'état et fonctions de mise à jour",
          "Pour mettre à jour un état basé sur l'état précédent, utilisez la forme fonctionnelle: setCount(prevCount => prevCount + 1)",
          "Pour les objets et les tableaux, n'oubliez pas de préserver les valeurs que vous ne mettez pas à jour",
          "React peut regrouper les mises à jour d'état pour des raisons de performance, donc ne comptez pas sur les valeurs précédentes sans utiliser la forme fonctionnelle",
        ]}
        interviewQuestions={[
          {
            question:
              "Pourquoi devriez-vous utiliser la forme fonctionnelle de setState lorsque vous mettez à jour l'état basé sur l'état précédent?",
            answer:
              "React peut regrouper plusieurs mises à jour d'état pour des raisons de performance. Si vous utilisez l'état actuel pour calculer le nouvel état, vous pourriez utiliser une valeur obsolète. La forme fonctionnelle (prevState => newState) garantit que vous travaillez toujours avec la valeur la plus récente, même si plusieurs mises à jour sont regroupées.",
          },
          {
            question: "Comment gérer des objets complexes avec useState?",
            answer:
              "Pour les objets complexes, vous devez créer une nouvelle copie de l'objet et mettre à jour uniquement les propriétés nécessaires. Utilisez la syntaxe de décomposition (...prevState) pour copier toutes les propriétés existantes, puis remplacez celles que vous souhaitez mettre à jour. Par exemple: setUser(prevUser => ({ ...prevUser, name: 'Nouveau nom' })).",
          },
        ]}
      />

      {/* useEffect Hook */}
      <CodeExample
        title="useEffect Hook"
        description="Gérer les effets secondaires dans les composants fonctionnels"
        code={`import React, { useState, useEffect } from 'react';

function WindowSizeTracker() {
  const [count, setCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Effet qui s'exécute à chaque rendu
  useEffect(() => {
    document.title = \`Vous avez cliqué \${count} fois\`;
  });

  // Effet avec dépendances - s'exécute uniquement quand count change
  useEffect(() => {
    console.log(\`Le compteur a changé: \${count}\`);

    // Fonction de nettoyage (optionnelle)
    return () => {
      console.log(\`Nettoyage avant la prochaine exécution. Ancienne valeur: \${count}\`);
    };
  }, [count]);

  // Effet exécuté au montage (deux fois en développement avec StrictMode :
  // le nettoyage ci-dessous rend cela inoffensif)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Fonction de nettoyage (au démontage, et avant le re-montage de StrictMode)
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <p>Compteur: {count}</p>
      <p>Largeur de la fenêtre: {windowWidth}px</p>
      <button onClick={() => setCount(count + 1)}>
        Incrémenter
      </button>
    </div>
  );
}`}
        demo={
          <div className="p-4 border rounded-md flex flex-col items-center gap-4">
            <UseEffectDemo />
          </div>
        }
        explanation={
          <div>
            <p>
              <code>useEffect</code> vous permet d&apos;effectuer des effets
              secondaires dans vos composants fonctionnels. Les effets
              secondaires sont des opérations qui peuvent affecter d&apos;autres
              composants et ne peuvent pas être effectuées pendant le rendu,
              comme des requêtes de données, des abonnements, ou des
              manipulations manuelles du DOM.
            </p>
            <p className="mt-2">
              <code>useEffect</code> prend deux arguments:
            </p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Une fonction qui contient le code de l&apos;effet</li>
              <li>
                Un tableau de dépendances (optionnel) qui détermine quand
                l&apos;effet doit être ré-exécuté
              </li>
            </ul>
            <p className="mt-2">
              Le tableau de dépendances contrôle quand l&apos;effet
              s&apos;exécute:
            </p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Omis: l&apos;effet s&apos;exécute après chaque rendu</li>
              <li>
                Tableau vide []: l&apos;effet s&apos;exécute au montage du
                composant (une fois par montage). En développement,{" "}
                <code>StrictMode</code> monte, démonte puis remonte le
                composant : l&apos;effet et son nettoyage s&apos;exécutent donc
                deux fois, pour révéler les nettoyages manquants
              </li>
              <li>
                Avec valeurs [a, b]: l&apos;effet s&apos;exécute uniquement
                lorsque a ou b changent
              </li>
            </ul>
          </div>
        }
        tips={[
          "Utilisez la fonction de nettoyage (return) pour éviter les fuites de mémoire",
          "Séparez les préoccupations en utilisant plusieurs effets",
          "Incluez toutes les valeurs du composant utilisées dans l'effet dans le tableau de dépendances",
          "Utilisez des outils comme eslint-plugin-react-hooks pour éviter les bugs liés aux dépendances manquantes",
        ]}
        interviewQuestions={[
          {
            question:
              "Quelle est la différence entre useEffect avec un tableau de dépendances vide et useEffect sans tableau de dépendances?",
            answer:
              "useEffect sans tableau de dépendances s'exécute après chaque rendu du composant. useEffect avec un tableau de dépendances vide ([]) s'exécute au montage du composant (équivalent approximatif de componentDidMount dans les composants de classe). En développement, StrictMode monte, démonte et remonte le composant : l'effet s'exécute donc deux fois, d'où l'importance d'une fonction de nettoyage. Cette différence est cruciale pour les performances, car exécuter des effets inutilement peut ralentir votre application.",
          },
          {
            question: "Comment nettoyer les ressources dans useEffect?",
            answer:
              "Pour nettoyer des ressources (comme des abonnements ou des timers), retournez une fonction de nettoyage depuis votre effet. Cette fonction sera appelée avant que le composant soit retiré du DOM et avant que l'effet soit ré-exécuté si les dépendances changent. Par exemple: useEffect(() => { const subscription = source.subscribe(); return () => { subscription.unsubscribe(); }; }, [source]);",
          },
        ]}
      />

      {/* React 19 */}
      <CodeExample
        title="React 19 : use, Actions, useActionState, useOptimistic, useFormStatus"
        description="Les nouveautés de React 19 pour les données asynchrones et les formulaires"
        code={`import { use, useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

// 1. use(promise) : lit une promesse et suspend le composant jusqu'à sa résolution.
// La promesse doit être créée en dehors du rendu (parent, Server Component, cache).
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
// <Suspense fallback={<p>Chargement…</p>}>
//   <Comments commentsPromise={commentsPromise} />
// </Suspense>

// 2. Actions + useActionState : une Action est une fonction (souvent async)
// passée à <form action={...}>. useActionState gère l'état, l'erreur et le pending.
async function saveName(previousState, formData) {
  const name = formData.get('name');
  if (!name) return { error: 'Le nom est obligatoire' };
  await api.updateName(name);
  return { error: null, name };
}

// 3. useFormStatus : lit l'état du <form> parent
// (doit être appelé dans un composant enfant du form)
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Envoi…' : 'Enregistrer'}</button>;
}

function NameForm() {
  const [state, formAction, isPending] = useActionState(saveName, { error: null });
  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}

// 4. useOptimistic : affiche tout de suite le résultat attendu pendant l'Action,
// puis revient à la vraie valeur (succès ou échec) à la fin de la transition.
function Todos({ todos, addTodo }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (current, text) => [...current, { id: crypto.randomUUID(), text, sending: true }],
  );

  async function action(formData) {
    const text = formData.get('text');
    addOptimistic(text);   // mise à jour optimiste immédiate
    await addTodo(text);   // vraie mise à jour
  }

  return (
    <form action={action}>
      <input name="text" />
      <button>Ajouter</button>
      <ul>{optimisticTodos.map((t) => <li key={t.id}>{t.text}{t.sending && ' …'}</li>)}</ul>
    </form>
  );
}

// 5. ref est une simple prop : plus besoin de forwardRef (React 19)
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 6. Context : <ThemeContext value={...}> remplace <ThemeContext.Provider>`}
        explanation={
          <div>
            <p>
              React 19 introduit les <strong>Actions</strong> : des fonctions
              (souvent asynchrones) utilisées dans des transitions, qui gèrent
              automatiquement l&apos;état de chargement, les erreurs et les
              mises à jour optimistes.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <code>use(promise)</code> et <code>use(Context)</code> : lisent
                une promesse (avec Suspense) ou un contexte, y compris après un{" "}
                <code>if</code>.
              </li>
              <li>
                <code>useActionState(action, initialState)</code> retourne{" "}
                <code>[state, formAction, isPending]</code>.
              </li>
              <li>
                <code>useFormStatus()</code> (importé de{" "}
                <code>react-dom</code>) expose <code>pending</code> pour les
                composants enfants d&apos;un <code>&lt;form&gt;</code>.
              </li>
              <li>
                <code>useOptimistic(value, reducer)</code> affiche un état
                provisoire pendant qu&apos;une Action est en cours.
              </li>
              <li>
                <code>ref</code> devient une prop ordinaire pour les composants
                fonction : <code>forwardRef</code> n&apos;est plus nécessaire.
              </li>
            </ul>
          </div>
        }
        tips={[
          "Ne créez pas la promesse passée à use() pendant le rendu d'un Client Component : créez-la dans un parent, un Server Component ou un cache",
          "useFormStatus ne fonctionne que dans un composant rendu à l'intérieur du <form> : pas dans le composant qui contient le <form>",
          "useOptimistic revient automatiquement à la valeur réelle quand l'Action se termine, y compris en cas d'erreur",
          "Pour les formulaires, préférez <form action={...}> à onSubmit + preventDefault : le formulaire non contrôlé est réinitialisé après une Action réussie",
        ]}
        interviewQuestions={[
          {
            question: "À quoi sert useActionState et que retourne-t-il ?",
            answer:
              "useActionState(action, initialState) enveloppe une Action (fonction qui reçoit l'état précédent et les données du formulaire). Il retourne [state, formAction, isPending] : l'état renvoyé par la dernière exécution, une fonction à passer à <form action>, et un booléen vrai pendant l'exécution. Il remplace l'ancien useFormState de react-dom.",
          },
          {
            question: "Quelle différence entre use() et useContext() ?",
            answer:
              "Les deux lisent un contexte, mais use() peut être appelé dans une condition ou une boucle, ce qui n'est pas permis pour les autres Hooks, et accepte aussi une promesse (avec Suspense). Une promesse recréée à chaque rendu d'un Client Component provoque une boucle de suspension : il faut la créer en amont.",
          },
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur les Hooks React"
        questions={[
          {
            question: "Quelles sont les règles des Hooks?",
            answer:
              "Les Hooks ont deux règles principales: 1) N'appelez les Hooks qu'au niveau supérieur (pas dans des boucles, conditions ou fonctions imbriquées) pour garantir que les Hooks sont appelés dans le même ordre à chaque rendu. 2) N'appelez les Hooks que depuis des composants fonctionnels React ou des Hooks personnalisés, pas depuis des fonctions JavaScript ordinaires.",
            difficulty: "easy",
            tags: ["Fondamentaux", "Hooks"],
          },
          {
            question:
              "Qu'est-ce qu'un Hook personnalisé et quand devriez-vous en créer un?",
            answer:
              "Un Hook personnalisé est une fonction JavaScript dont le nom commence par 'use' et qui peut appeler d'autres Hooks. Ils permettent d'extraire la logique d'état et d'effets des composants pour la réutiliser. Créez un Hook personnalisé lorsque vous avez besoin de réutiliser une logique avec état entre plusieurs composants, ou pour organiser la logique complexe d'un composant en unités plus petites et testables.",
            difficulty: "medium",
            tags: ["Hooks", "Réutilisation"],
          },
          {
            question:
              "Comment useCallback et useMemo peuvent-ils améliorer les performances?",
            answer:
              "useCallback mémorise une fonction callback, ne la recréant que lorsque les dépendances changent. useMemo mémorise le résultat d'un calcul, ne le recalculant que lorsque les dépendances changent. Ces Hooks améliorent les performances en évitant des calculs ou des rendus inutiles, particulièrement importants lorsque vous passez des callbacks à des composants optimisés qui se fient à l'égalité référentielle pour éviter les rendus inutiles.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"],
          },
          {
            question:
              "Comparez useReducer et useState. Quand utiliseriez-vous l'un plutôt que l'autre?",
            answer:
              "useState est idéal pour des états simples et indépendants. useReducer est préférable pour des états complexes avec plusieurs sous-valeurs ou lorsque le nouvel état dépend de l'état précédent. Utilisez useReducer lorsque: 1) La logique d'état est complexe, impliquant plusieurs sous-valeurs. 2) Le prochain état dépend de l'état précédent. 3) Vous avez besoin de partager la logique d'état entre des composants. 4) Vous préférez une approche plus prévisible et testable de la gestion d'état.",
            difficulty: "medium",
            tags: ["Gestion d'État", "Patterns"],
          },
        ]}
      />
    </div>
  );
}
