"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions-new";

// Demo components
const FunctionalComponentDemo = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-md flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Counter: {count}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 rounded-md bg-red-900/30 text-red-400 hover:bg-red-900/50"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50"
        >
          Increment
        </button>
      </div>
    </div>
  );
};

export function ComponentsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Types de Composants React</CardTitle>
          <CardDescription>
            React propose plusieurs façons de créer des composants, chacune avec
            ses propres cas d&apos;utilisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="functional">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="functional">
                Composants Fonctionnels
              </TabsTrigger>
              <TabsTrigger value="class">Composants de Classe</TabsTrigger>
            </TabsList>

            <TabsContent value="functional" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Composants Fonctionnels
                  </h3>
                  <p className="text-muted-foreground">
                    Les composants fonctionnels sont des fonctions JavaScript
                    qui retournent des éléments React. Ils sont plus simples,
                    plus concis et, avec l&apos;introduction des Hooks, aussi
                    puissants que les composants de classe.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Moderne</Badge>
                  <Badge variant="outline">Recommandé</Badge>
                  <Badge variant="outline">Hooks</Badge>
                  <Badge variant="outline">Concis</Badge>
                </div>

                <CodeExample
                  title="Composant Fonctionnel Simple"
                  description="Un compteur implémenté avec un composant fonctionnel et le hook useState"
                  code={`import React, { useState } from 'react';

function Counter() {
  // Déclaration d'un état local avec useState
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Counter: {count}</h2>
      <div>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  );
}

export default Counter;`}
                  demo={<FunctionalComponentDemo />}
                  explanation={
                    <div>
                      <p>
                        Ce composant fonctionnel utilise le hook{" "}
                        <code>useState</code> pour gérer l&apos;état local du
                        compteur. Lorsque l&apos;utilisateur clique sur les
                        boutons, la fonction <code>setCount</code> est appelée
                        pour mettre à jour l&apos;état, ce qui déclenche un
                        re-rendu du composant avec la nouvelle valeur.
                      </p>
                      <p className="mt-2">
                        Les composants fonctionnels sont la méthode recommandée
                        pour créer des composants React modernes. Ils sont plus
                        faciles à lire, à tester et à maintenir que les
                        composants de classe.
                      </p>
                    </div>
                  }
                  tips={[
                    "Utilisez toujours des noms de composants commençant par une majuscule",
                    "Préférez les composants fonctionnels aux composants de classe pour les nouveaux projets",
                    "Décomposez les composants complexes en composants plus petits et réutilisables",
                    "Utilisez les hooks pour ajouter des fonctionnalités comme l'état et les effets",
                  ]}
                  interviewQuestions={[
                    {
                      question:
                        "Quelle est la différence entre les composants fonctionnels et les composants de classe?",
                      answer:
                        "Les composants fonctionnels sont des fonctions JavaScript simples qui acceptent des props et retournent des éléments React. Les composants de classe étendent React.Component et ont accès à des fonctionnalités supplémentaires comme les méthodes de cycle de vie. Depuis l'introduction des Hooks, les composants fonctionnels peuvent faire tout ce que les composants de classe peuvent faire, et sont généralement préférés pour leur simplicité et leur performance.",
                    },
                    {
                      question:
                        "Pourquoi les composants fonctionnels sont-ils recommandés par rapport aux composants de classe?",
                      answer:
                        "Les composants fonctionnels sont plus concis, plus faciles à lire et à tester, et moins sujets aux erreurs. Ils encouragent les bonnes pratiques comme la composition et la séparation des préoccupations. Avec les Hooks, ils offrent une meilleure réutilisation de la logique entre les composants sans les inconvénients des HOCs ou des render props.",
                    },
                  ]}
                />
              </div>
            </TabsContent>

            <TabsContent value="class" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Composants de Classe
                  </h3>
                  <p className="text-muted-foreground">
                    Les composants de classe étendent React.Component et
                    implémentent une méthode render. Ils étaient la méthode
                    principale pour créer des composants avec état avant
                    l&apos;introduction des Hooks.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Traditionnel</Badge>
                  <Badge variant="outline">Lifecycle</Badge>
                  <Badge variant="outline">this.state</Badge>
                  <Badge variant="outline">Legacy</Badge>
                </div>

                <CodeExample
                  title="Composant de Classe"
                  description="Le même compteur implémenté avec un composant de classe"
                  code={`import React, { Component } from 'react';

class Counter extends Component {
  constructor(props) {
    super(props);
    // Initialisation de l'état dans le constructeur
    this.state = {
      count: 0
    };
  }

  // Méthodes pour mettre à jour l'état
  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  }

  reset = () => {
    this.setState({ count: 0 });
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <h2>Counter: {this.state.count}</h2>
        <div>
          <button onClick={this.decrement}>Decrement</button>
          <button onClick={this.reset}>Reset</button>
          <button onClick={this.increment}>Increment</button>
        </div>
      </div>
    );
  }
}

export default Counter;`}
                  explanation={
                    <div>
                      <p>
                        Ce composant de classe utilise <code>this.state</code>{" "}
                        pour gérer l&apos;état local et{" "}
                        <code>this.setState()</code> pour le mettre à jour. Le
                        composant doit également lier les méthodes dans le
                        constructeur ou utiliser des fonctions fléchées pour
                        préserver le contexte <code>this</code>.
                      </p>
                      <p className="mt-2">
                        Les composants de classe offrent des méthodes de cycle
                        de vie comme <code>componentDidMount</code>,{" "}
                        <code>componentDidUpdate</code>, et{" "}
                        <code>componentWillUnmount</code>, qui sont maintenant
                        remplacées par le hook <code>useEffect</code> dans les
                        composants fonctionnels.
                      </p>
                      <p className="mt-2">
                        Bien que toujours pris en charge, les composants de
                        classe sont considérés comme legacy dans les nouvelles
                        applications React.
                      </p>
                    </div>
                  }
                  tips={[
                    "N'oubliez pas d'appeler super(props) dans le constructeur",
                    "Utilisez this.setState() au lieu de modifier this.state directement",
                    "Utilisez des fonctions fléchées pour les gestionnaires d'événements pour éviter les problèmes de liaison this",
                    "Nettoyez les ressources dans componentWillUnmount pour éviter les fuites de mémoire",
                  ]}
                  interviewQuestions={[
                    {
                      question:
                        "Comment fonctionne this.setState() et pourquoi ne devrait-on pas modifier this.state directement?",
                      answer:
                        "this.setState() planifie une mise à jour de l'état du composant et déclenche un re-rendu. Les mises à jour d'état peuvent être asynchrones et être regroupées pour des raisons de performance. Modifier this.state directement ne déclenchera pas de re-rendu et peut être écrasé par des appels ultérieurs à setState(), ce qui peut entraîner des bugs subtils.",
                    },
                    {
                      question:
                        "Expliquez le cycle de vie d'un composant de classe React.",
                      answer:
                        "Le cycle de vie d'un composant de classe comprend trois phases principales: Montage (constructor, getDerivedStateFromProps, render, componentDidMount), Mise à jour (getDerivedStateFromProps, shouldComponentUpdate, render, getSnapshotBeforeUpdate, componentDidUpdate), et Démontage (componentWillUnmount). Ces méthodes permettent d'exécuter du code à des moments spécifiques du cycle de vie du composant.",
                    },
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CodeExample
        title="Composition de Composants"
        description="Comment structurer et composer des composants React pour créer des interfaces modulaires"
        code={`import React from 'react';

// Composant pour l'en-tête de la carte
function CardHeader({ title }) {
  return (
    <div className="card-header">
      <h2>{title}</h2>
    </div>
  );
}

// Composant pour le contenu de la carte
function CardContent({ children }) {
  return (
    <div className="card-content">
      {children}
    </div>
  );
}

// Composant pour le pied de page de la carte
function CardFooter({ author, date }) {
  return (
    <div className="card-footer">
      <span>Par {author}</span>
      <span>{date}</span>
    </div>
  );
}

// Composant principal qui compose les autres
function Card({ title, author, date, children }) {
  return (
    <div className="card">
      <CardHeader title={title} />
      <CardContent>{children}</CardContent>
      <CardFooter author={author} date={date} />
    </div>
  );
}

// Utilisation du composant Card
function App() {
  return (
    <div>
      <Card
        title="Introduction à React"
        author="John Doe"
        date="15 Nov 2023"
      >
        <p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur.</p>
        <p>Elle est maintenue par Meta et une communauté de développeurs.</p>
      </Card>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              La composition est un concept fondamental en React. Au lieu
              d&apos;hériter de classes, React utilise la composition pour
              réutiliser du code entre les composants.
            </p>
            <p className="mt-2">
              Dans cet exemple, nous avons créé un composant <code>Card</code>{" "}
              qui est composé de plusieurs sous-composants:{" "}
              <code>CardHeader</code>, <code>CardContent</code>, et{" "}
              <code>CardFooter</code>. Chaque sous-composant est responsable
              d&apos;une partie spécifique de l&apos;interface utilisateur.
            </p>
            <p className="mt-2">
              La propriété spéciale <code>children</code> permet de passer des
              éléments JSX imbriqués à un composant, ce qui rend les composants
              plus flexibles et réutilisables.
            </p>
          </div>
        }
        tips={[
          "Préférez la composition à l'héritage pour réutiliser du code entre composants",
          "Créez des composants petits et ciblés avec une responsabilité unique",
          "Utilisez la prop children pour créer des composants flexibles et réutilisables",
          "Pensez à la façon dont vos composants seront utilisés par d'autres développeurs",
        ]}
        interviewQuestions={[
          {
            question:
              "Qu'est-ce que la composition de composants et pourquoi est-elle importante en React?",
            answer:
              "La composition de composants est une approche où des composants plus complexes sont construits en combinant des composants plus simples. C'est important en React car cela favorise la réutilisation du code, la séparation des préoccupations, et rend les composants plus testables et maintenables. React privilégie la composition plutôt que l'héritage pour partager des fonctionnalités entre composants.",
          },
          {
            question: "Expliquez l'utilisation de la prop 'children' en React.",
            answer:
              "La prop 'children' est une prop spéciale en React qui permet de passer des éléments JSX imbriqués à un composant. Elle permet de créer des composants wrapper qui enveloppent d'autres éléments, comme des layouts, des modales, ou des cartes. C'est un mécanisme clé pour la composition de composants en React, permettant de créer des composants plus flexibles et réutilisables.",
          },
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur les Composants React"
        questions={[
          {
            question:
              "Quelle est la différence entre les éléments et les composants en React?",
            answer:
              "Les éléments sont des objets JavaScript simples qui décrivent ce qui doit être affiché à l'écran. Ils sont immuables et peu coûteux à créer. Les composants, en revanche, sont des fonctions ou des classes qui peuvent accepter des entrées (props) et retournent des éléments React. Les composants encapsulent la logique et l'état, et peuvent être réutilisés dans l'application.",
            difficulty: "easy",
            tags: ["Fondamentaux", "Composants"],
          },
          {
            question:
              "Qu'est-ce qu'un composant pur (Pure Component) en React?",
            answer:
              "Un composant pur est un composant qui rend le même résultat avec les mêmes props et le même état. En classe, React.PureComponent implémente automatiquement shouldComponentUpdate avec une comparaison superficielle des props et de l'état. Pour les composants fonctionnels, React.memo offre une fonctionnalité similaire. Les composants purs peuvent améliorer les performances en évitant les rendus inutiles.",
            difficulty: "medium",
            tags: ["Optimisation", "Performance"],
          },
          {
            question:
              "Expliquez le concept de composants d'ordre supérieur (HOC) en React.",
            answer:
              "Un HOC est une fonction qui prend un composant et retourne un nouveau composant avec des fonctionnalités supplémentaires. C'est un modèle avancé de réutilisation de code en React, basé sur le principe de composition plutôt que d'héritage. Les HOCs sont utilisés pour des fonctionnalités transversales comme l'authentification, la journalisation, ou la gestion d'état. Exemple: connect de React Redux.",
            difficulty: "hard",
            tags: ["Avancé", "Patterns"],
          },
          {
            question:
              "Quand devriez-vous utiliser des composants React.memo, useMemo et useCallback?",
            answer:
              "React.memo est utilisé pour mémoriser un composant entier et éviter les re-rendus inutiles lorsque les props ne changent pas. useMemo est utilisé pour mémoriser le résultat d'un calcul coûteux et ne le recalculer que lorsque les dépendances changent. useCallback est utilisé pour mémoriser une fonction callback et éviter qu'elle ne soit recréée à chaque rendu. Utilisez ces optimisations lorsque vous constatez des problèmes de performance, pas prématurément.",
            difficulty: "hard",
            tags: ["Optimisation", "Hooks", "Performance"],
          },
        ]}
      />
    </div>
  );
}
