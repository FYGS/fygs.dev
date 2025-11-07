"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions-new";
import Image from "next/image";

// Demo component for props
function PropsDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTheme("light")}
          className={`px-3 py-1 rounded-md ${
            theme === "light"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`px-3 py-1 rounded-md ${
            theme === "dark"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Dark
        </button>
      </div>

      <UserProfile
        name="John Doe"
        role="Developer"
        avatar="https://i.pravatar.cc/150?u=john"
        theme={theme}
      />
    </div>
  );
}

// Child component receiving props
function UserProfile({
  name,
  role,
  avatar,
  theme,
}: {
  name: string;
  role: string;
  avatar: string;
  theme: "light" | "dark";
}) {

  return (
    <div
      className={`p-4 border rounded-lg bg-gray-800 border-gray-700 text-white`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

// Demo component for state
function StateDemo() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([
    { id: 1, text: "Apprendre React", completed: true },
    { id: 2, text: "Créer une application", completed: false },
    { id: 3, text: "Déployer l'application", completed: false },
  ]);

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: `Nouvelle tâche ${todos.length + 1}`,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-800">
        <h3 className="font-medium mb-2">Compteur: {count}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCount(count - 1)}
            className="px-3 py-1 rounded-md bg-red-900/30 text-red-400 hover:bg-red-900/50"
          >
            -
          </button>
          <button
            onClick={() => setCount(count + 1)}
            className="px-3 py-1 rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50"
          >
            +
          </button>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Liste de tâches</h3>
          <button
            onClick={addTodo}
            className="px-2 py-1 text-xs rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
          >
            Ajouter
          </button>
        </div>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 p-2 border rounded"
              onClick={() => toggleTodo(todo.id)}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => {}}
                className="h-4 w-4"
              />
              <span
                className={todo.completed ? "line-through text-gray-500" : ""}
              >
                {todo.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PropsStateSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Props & State</CardTitle>
          <CardDescription>
            Les props et le state sont les deux types de données qui contrôlent
            un composant React.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Les props sont passées au composant (similaires aux arguments
            d&apos;une fonction), tandis que le state est géré à
            l&apos;intérieur du composant (similaire aux variables déclarées
            dans une fonction).
          </p>
        </CardContent>
      </Card>

      <CodeExample
        title="Props: Passage de Données"
        description="Comment passer des données d'un composant parent à un composant enfant"
        code={`import React, { useState } from 'react';
import Image from 'next/image';

// Composant parent qui passe des props
function ParentComponent() {
  const [theme, setTheme] = useState('light');

  return (
    <div>
      <div>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')}>Dark</button>
      </div>

      <UserProfile
        name="John Doe"
        role="Developer"
        avatar="https://example.com/avatar.jpg"
        theme={theme}
      />
    </div>
  );
}

// Composant enfant qui reçoit des props
function UserProfile({ name, role, avatar, theme }) {
  return (
    <div className="bg-gray-800 text-white">
      <div className="relative w-12 h-12 rounded-full overflow-hidden">
        <Image 
          src={avatar} 
          alt={name} 
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}

// Avec TypeScript, vous pouvez typer vos props
interface UserProfileProps {
  name: string;
  role: string;
  avatar: string;
  theme: 'light' | 'dark';
}

function UserProfileTyped({ name, role, avatar, theme }: UserProfileProps) {
  // ...
}`}
        demo={<PropsDemo />}
        explanation={
          <div>
            <p>
              Les props (abréviation de &quot;properties&quot;) sont un moyen de
              passer des données d&apos;un composant parent à un composant
              enfant. Elles sont en lecture seule et ne doivent pas être
              modifiées par le composant qui les reçoit.
            </p>
            <p className="mt-2">
              Les props peuvent être de n&apos;importe quel type de données
              JavaScript: chaînes, nombres, tableaux, objets, fonctions, et même
              d&apos;autres composants React.
            </p>
            <p className="mt-2">
              Dans l&apos;example ci-dessus, le composant{" "}
              <code>ParentComponent</code> passe plusieurs props au composant{" "}
              <code>UserProfile</code>:<code>name</code>, <code>role</code>,{" "}
              <code>avatar</code>, et <code>theme</code>. Le composant{" "}
              <code>UserProfile</code> utilise ces props pour rendre son
              contenu.
            </p>
            <p className="mt-2">
              Avec TypeScript, vous pouvez définir une interface pour typer vos
              props, ce qui améliore l&apos;autocomplétion et la détection
              d&apos;erreurs.
            </p>
          </div>
        }
        tips={[
          "Utilisez la déstructuration pour extraire les props dans la signature de la fonction",
          "Définissez des valeurs par défaut pour les props optionnelles",
          "Avec TypeScript, définissez des interfaces pour typer vos props",
          "Utilisez React.memo pour éviter les rendus inutiles lorsque les props ne changent pas",
        ]}
        interviewQuestions={[
          {
            question: "Quelle est la différence entre props et state?",
            answer:
              "Les props sont passées au composant par son parent et sont en lecture seule. Le state est géré à l&apos;intérieur du composant et peut être modifié par le composant lui-même. Les changements de props ou de state déclenchent un re-rendu du composant.",
          },
          {
            question:
              "Comment passer une fonction comme prop à un composant enfant?",
            answer:
              "Vous pouvez passer une fonction comme prop de la même manière que vous passez d&apos;autres types de données. Par exemple: <ChildComponent onClick={handleClick} />. Dans le composant enfant, vous pouvez appeler cette fonction comme n&apos;importe quelle autre prop: props.onClick() ou avec la déstructuration: { onClick } => onClick().",
          },
        ]}
      />

      <CodeExample
        title="State: Gestion de l'État Local"
        description="Comment gérer et mettre à jour l'état local d'un composant"
        code={`import React, { useState } from 'react';

function TodoApp() {
  // État simple (nombre)
  const [count, setCount] = useState(0);

  // État complexe (tableau d'objets)
  const [todos, setTodos] = useState([
    { id: 1, text: "Apprendre React", completed: true },
    { id: 2, text: "Créer une application", completed: false }
  ]);

  // Fonction pour ajouter un todo
  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: \`Nouvelle tâche \${todos.length + 1}\`,
      completed: false
    };
    // Important: créer un nouveau tableau, ne pas modifier l'ancien
    setTodos([...todos, newTodo]);
  };

  // Fonction pour basculer l'état completed d'un todo
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  return (
    <div>
      <div>
        <h3>Compteur: {count}</h3>
        <button onClick={() => setCount(count - 1)}>-</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>

      <div>
        <h3>Liste de tâches</h3>
        <button onClick={addTodo}>Ajouter une tâche</button>
        <ul>
          {todos.map(todo => (
            <li
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            >
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}`}
        demo={<StateDemo />}
        explanation={
          <div>
            <p>
              Le state (état) permet aux composants React de stocker et gérer
              des données qui peuvent changer au fil du temps. Lorsque le state
              change, React re-rend le composant pour refléter ces changements.
            </p>
            <p className="mt-2">
              Dans les composants fonctionnels, nous utilisons le Hook{" "}
              <code>useState</code> pour ajouter et gérer l&apos;état local.
              <code>useState</code> retourne un tableau avec deux éléments: la
              valeur actuelle de l&apos;état et une fonction pour le mettre à
              jour.
            </p>
            <p className="mt-2">
              Dans l&apos;example ci-dessus, nous avons deux états:
            </p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>
                Un état simple <code>count</code> qui stocke un nombre
              </li>
              <li>
                Un état complexe <code>todos</code> qui stocke un tableau
                d&apos;objets
              </li>
            </ul>
            <p className="mt-2">
              Lorsque nous mettons à jour l&apos;état, nous ne modifions jamais
              directement l&apos;état existant. Au lieu de cela, nous créons une
              nouvelle valeur basée sur l&apos;état précédent. C&apos;est
              particulièrement important pour les objets et les tableaux, où
              nous utilisons la syntaxe de décomposition (<code>...</code>) pour
              créer des copies.
            </p>
          </div>
        }
        tips={[
          "Ne modifiez jamais directement l&apos;état, utilisez toujours la fonction de mise à jour",
          "Pour les objets et tableaux, créez toujours une nouvelle copie lors de la mise à jour",
          "Utilisez la forme fonctionnelle de setState lorsque le nouvel état dépend de l&apos;état précédent",
          "Divisez l&apos;état complexe en plusieurs variables d&apos;état plus petites et indépendantes",
        ]}
        interviewQuestions={[
          {
            question:
              "Pourquoi ne devriez-vous pas modifier directement l&apos;état en React?",
            answer:
              "Modifier directement l&apos;état (par exemple, this.state.count = 1 ou directement modifier un objet dans useState) ne déclenchera pas de re-rendu et peut causer des bugs subtils. React compare l&apos;ancienne et la nouvelle valeur de l&apos;état par référence pour déterminer si un re-rendu est nécessaire. De plus, les modifications directes peuvent interférer avec les optimisations de performance de React et rendre le débogage plus difficile.",
          },
          {
            question:
              "Comment mettre à jour correctement un objet imbriqué dans l&apos;état?",
            answer:
              "Pour mettre à jour un objet imbriqué, vous devez créer une copie profonde de l&apos;objet en utilisant la syntaxe de décomposition (...) à chaque niveau. Par exemple: setUser(prevUser => ({ ...prevUser, address: { ...prevUser.address, city: &apos;Paris&apos; } })). Pour des structures plus complexes, vous pouvez utiliser des bibliothèques comme Immer qui simplifient les mises à jour immuables.",
          },
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur Props & State"
        questions={[
          {
            question: "Expliquez le flux de données unidirectionnel en React.",
            answer:
              "Le flux de données unidirectionnel signifie que les données circulent dans une seule direction: du composant parent vers les composants enfants via les props. Cela rend l&apos;application plus prévisible et plus facile à comprendre, car vous savez toujours d&apos;où viennent les données. Si un enfant a besoin de communiquer avec un parent, il doit le faire via des callbacks passés en tant que props par le parent.",
            difficulty: "medium",
            tags: ["Fondamentaux", "Architecture"],
          },
          {
            question:
              "Qu&apos;est-ce que le prop drilling et comment l&apos;éviter?",
            answer:
              "Le prop drilling se produit lorsque vous devez passer des props à travers plusieurs niveaux de composants imbriqués, même si certains composants intermédiaires n&apos;utilisent pas ces props. Cela peut rendre le code difficile à maintenir. Pour éviter le prop drilling, vous pouvez utiliser: 1) Context API pour partager des données accessibles à de nombreux composants à différents niveaux. 2) Des bibliothèques de gestion d&apos;état comme Redux. 3) La composition de composants pour restructurer votre hiérarchie de composants.",
            difficulty: "medium",
            tags: ["Architecture", "Patterns"],
          },
          {
            question:
              "Comment implémenter le state lifting en React et pourquoi est-ce utile?",
            answer:
              "Le state lifting consiste à déplacer l&apos;état d&apos;un composant enfant vers un composant parent commun. Cela permet à plusieurs composants de partager et de modifier le même état. Pour l&apos;implémenter: 1) Déplacez l&apos;état vers le plus proche ancêtre commun. 2) Passez l&apos;état aux composants enfants via les props. 3) Passez des fonctions de mise à jour aux enfants pour qu&apos;ils puissent modifier l&apos;état. C&apos;est utile pour maintenir un état cohérent entre plusieurs composants et respecter le flux de données unidirectionnel de React.",
            difficulty: "medium",
            tags: ["Patterns", "Architecture"],
          },
          {
            question:
              "Quand devriez-vous utiliser les props.children en React?",
            answer:
              "Utilisez props.children lorsque vous créez des composants wrapper ou des composants de mise en page qui ne connaissent pas à l&apos;avance leur contenu. Cela permet une plus grande flexibilité et réutilisabilité. Exemples d&apos;utilisation: 1) Composants de mise en page (Layout, Card, Modal). 2) Composants d&apos;UI réutilisables (Button, Panel). 3) Composants de contexte qui fournissent des données à leurs enfants. 4) Composants de rendu conditionnel qui affichent ou masquent leur contenu en fonction de certaines conditions.",
            difficulty: "easy",
            tags: ["Fondamentaux", "Composition"],
          },
        ]}
      />
    </div>
  );
}
