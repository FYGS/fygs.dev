"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createContext, useContext, useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions-new";

// Create a context for the demo
const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

// Demo component for Context API
function ContextDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="space-y-4">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground mb-1">
            Thème actuel: <span className="font-medium">{theme}</span>
          </p>
        </div>
        <AppLayout />
      </div>
    </ThemeContext.Provider>
  );
}

// Components that consume the context
function AppLayout() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`p-4 border rounded-lg ${
        theme === "light"
          ? "bg-white border-gray-200"
          : "bg-gray-800 border-gray-700"
      }`}
    >
      <Header />
      <main className="py-4">
        <Content />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header
      className={`flex justify-between items-center pb-3 border-b ${
        theme === "light" ? "border-gray-200" : "border-gray-700"
      }`}
    >
      <h2
        className={`font-bold ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}
      >
        Mon Application
      </h2>
      <button
        onClick={toggleTheme}
        className="px-3 py-1 text-xs rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
      >
        {theme === "light" ? "Mode Sombre" : "Mode Clair"}
      </button>
    </header>
  );
}

function Content() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={theme === "light" ? "text-gray-800" : "text-gray-200"}>
      <p className="mb-2">
        Ce contenu utilise le thème du contexte sans avoir à passer de props à
        travers plusieurs niveaux de composants.
      </p>
      <p className="text-sm text-muted-foreground">
        Le Context API permet de partager des données entre des composants sans
        avoir à les passer explicitement à travers chaque niveau.
      </p>
    </div>
  );
}

function Footer() {
  const { theme } = useContext(ThemeContext);

  return (
    <footer
      className={`pt-3 border-t text-center text-sm ${
        theme === "light"
          ? "border-gray-200 text-gray-600"
          : "border-gray-700 text-gray-400"
      }`}
    >
      © 2023 Exemple Context API
    </footer>
  );
}

export function ContextSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Context API</CardTitle>
          <CardDescription>
            Le Context API permet de partager des données entre des composants
            sans avoir à passer explicitement des props à chaque niveau.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le Context API est particulièrement utile pour des données qui sont
            considérées comme &quot;globales&quot; pour un arbre de composants
            React, comme le thème actuel, l&apos;utilisateur authentifié, ou les
            préférences de langue.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>createContext</Badge>
            <Badge>useContext</Badge>
            <Badge>Provider</Badge>
            <Badge>Consumer</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="Création et Utilisation d'un Context"
        description="Comment créer et utiliser un Context pour partager des données entre composants"
        code={`import React, { createContext, useContext, useState } from 'react';

// 1. Créer un Context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// 2. Créer un Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Consommer le Context dans un composant
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
        border: '1px solid #ccc',
        padding: '8px 16px',
      }}
    >
      Changer le thème
    </button>
  );
}

// 4. Utiliser le Provider dans l'application
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Mon Application avec Thème</h1>
        <ThemedButton />
        <Content />
      </div>
    </ThemeProvider>
  );
}

// Un composant imbriqué qui utilise également le Context
function Content() {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={{
      backgroundColor: theme === 'light' ? '#f8f8f8' : '#222',
      color: theme === 'light' ? '#333' : '#fff',
      padding: '20px',
      marginTop: '20px'
    }}>
      <p>Ce contenu utilise également le thème du Context.</p>
    </div>
  );
}`}
        demo={<ContextDemo />}
        explanation={
          <div>
            <p>Le Context API de React comprend trois parties principales:</p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>React.createContext</strong>: Crée un objet Context avec
                une valeur par défaut.
              </li>
              <li>
                <strong>Context.Provider</strong>: Composant qui permet aux
                composants consommateurs de s&apos;abonner aux changements du
                contexte.
              </li>
              <li>
                <strong>useContext</strong>: Hook qui permet de consommer le
                contexte dans un composant fonctionnel.
              </li>
            </ol>
            <p className="mt-3">Dans l&apos;exemple ci-dessus:</p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>
                Nous créons un <code>ThemeContext</code> avec une valeur par
                défaut.
              </li>
              <li>
                Le composant <code>ThemeProvider</code> gère l&apos;état du
                thème et fournit une fonction pour le basculer.
              </li>
              <li>
                Les composants <code>ThemedButton</code> et <code>Content</code>{" "}
                consomment le contexte avec <code>useContext</code> sans avoir à
                recevoir de props.
              </li>
            </ul>
            <p className="mt-3">
              Cela évite le &quot;prop drilling&quot; (passage de props à
              travers de nombreux niveaux de composants) et rend le code plus
              propre et plus maintenable.
            </p>
          </div>
        }
        tips={[
          "Utilisez le Context pour des données qui doivent être accessibles par de nombreux composants à différents niveaux",
          "Fournissez une valeur par défaut significative à createContext pour faciliter le test des composants",
          "Divisez les contextes par domaine fonctionnel plutôt que d'avoir un seul grand contexte",
          "Combinez Context avec useReducer pour une gestion d'état plus complexe",
        ]}
        interviewQuestions={[
          {
            question:
              "Quand devriez-vous utiliser Context API plutôt que de passer des props?",
            answer:
              "Utilisez Context API lorsque vous avez des données qui doivent être accessibles par de nombreux composants à différents niveaux de l'arbre des composants. Cela évite le 'prop drilling' (passage de props à travers de nombreux niveaux). Context est idéal pour des données 'globales' comme le thème, l'authentification, les préférences utilisateur, ou les paramètres de localisation. Cependant, pour des données utilisées seulement par quelques composants proches, les props restent souvent plus simples et plus explicites.",
          },
          {
            question:
              "Comment optimiser les performances lors de l'utilisation de Context?",
            answer:
              "Pour optimiser les performances avec Context: 1) Divisez vos contextes par domaine fonctionnel plutôt que d'avoir un seul grand contexte. 2) Utilisez plusieurs providers pour éviter des re-rendus inutiles. 3) Mémorisez la valeur du contexte avec useMemo pour éviter des re-rendus lorsque le composant parent re-rend mais que la valeur du contexte n'a pas changé. 4) Utilisez React.memo pour les composants qui consomment le contexte mais n'ont pas besoin de se re-rendre lorsque d'autres parties du contexte changent.",
          },
        ]}
      />

      <CodeExample
        title="Combinaison de Context et useReducer"
        description="Utiliser Context avec useReducer pour une gestion d'état plus complexe"
        code={`import React, { createContext, useContext, useReducer } from 'react';

// Définir les types d'actions
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';

// Créer un reducer
function todoReducer(state, action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          completed: false
        }
      ];
    case TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

// Créer le Context
const TodoContext = createContext();

// Créer un Provider personnalisé
function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  // Actions
  const addTodo = (text) => {
    dispatch({ type: ADD_TODO, payload: text });
  };

  const toggleTodo = (id) => {
    dispatch({ type: TOGGLE_TODO, payload: id });
  };

  const deleteTodo = (id) => {
    dispatch({ type: DELETE_TODO, payload: id });
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

// Hook personnalisé pour utiliser le Context
function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}

// Composant qui utilise le Context
function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useTodo();

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => deleteTodo(todo.id)}>Supprimer</button>
        </li>
      ))}
    </ul>
  );
}

// Composant pour ajouter un todo
function AddTodo() {
  const [text, setText] = useState('');
  const { addTodo } = useTodo();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ajouter une tâche"
      />
      <button type="submit">Ajouter</button>
    </form>
  );
}

// Application complète
function TodoApp() {
  return (
    <TodoProvider>
      <h1>Liste de tâches</h1>
      <AddTodo />
      <TodoList />
    </TodoProvider>
  );
}`}
        explanation={
          <div>
            <p>
              Combiner Context API avec <code>useReducer</code> est une approche
              puissante pour gérer un état complexe dans une application React.
              Cette combinaison offre plusieurs avantages:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gestion centralisée de l&apos;état</li>
              <li>Logique de mise à jour d&apos;état prévisible et testable</li>
              <li>
                Séparation claire entre la logique d&apos;état et les composants
                d&apos;UI
              </li>
              <li>Facilité à déboguer les changements d&apos;état</li>
            </ul>
            <p className="mt-3">Dans l&apos;exemple ci-dessus:</p>
            <ol className="list-decimal pl-6 mt-1 space-y-1">
              <li>
                Nous définissons un reducer qui spécifie comment l&apos;état
                change en réponse à différentes actions.
              </li>
              <li>
                Nous créons un Context et un Provider qui utilise{" "}
                <code>useReducer</code> pour gérer l&apos;état.
              </li>
              <li>
                Nous exposons l&apos;état et des fonctions d&apos;action via le
                Context.
              </li>
              <li>
                Nous créons un hook personnalisé <code>useTodo</code> pour
                faciliter l&apos;utilisation du Context.
              </li>
              <li>
                Les composants consomment le Context pour accéder à l&apos;état
                et dispatcher des actions.
              </li>
            </ol>
            <p className="mt-3">
              Cette approche est similaire à ce que des bibliothèques comme
              Redux offrent, mais en utilisant uniquement les API intégrées de
              React.
            </p>
          </div>
        }
        tips={[
          "Créez des hooks personnalisés pour encapsuler la logique d'accès au Context",
          "Ajoutez une vérification dans vos hooks personnalisés pour s'assurer qu'ils sont utilisés à l'intérieur du Provider",
          "Utilisez TypeScript pour typer vos actions et votre état",
          "Divisez les reducers complexes en sous-reducers pour une meilleure maintenabilité",
        ]}
        interviewQuestions={[
          {
            question:
              "Quels sont les avantages de combiner Context et useReducer par rapport à useState?",
            answer:
              "La combinaison de Context et useReducer offre plusieurs avantages par rapport à useState pour des états complexes: 1) Centralisation de la logique de mise à jour d'état dans un reducer, ce qui la rend plus prévisible et testable. 2) Réduction du nombre de re-rendus car vous n'avez qu'un seul dispatch au lieu de multiples fonctions setState. 3) Facilité à implémenter des fonctionnalités comme l'annulation/rétablissement ou la journalisation des changements d'état. 4) Meilleure séparation des préoccupations entre la logique d'état et les composants d'UI.",
          },
          {
            question:
              "Comment structureriez-vous plusieurs contextes dans une application React de taille moyenne à grande?",
            answer:
              "Pour structurer plusieurs contextes dans une grande application: 1) Divisez les contextes par domaine fonctionnel (authentification, préférences utilisateur, données métier). 2) Créez des hooks personnalisés pour chaque contexte pour encapsuler la logique d'accès. 3) Utilisez la composition de providers plutôt qu'un seul provider global. 4) Considérez une structure de dossiers qui regroupe chaque contexte avec ses reducers et hooks associés. 5) Pour les données qui doivent être partagées entre plusieurs contextes, envisagez un niveau supérieur de contexte ou une solution de gestion d'état plus robuste comme Redux.",
          },
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur Context API"
        questions={[
          {
            question: "Quelle est la différence entre le Context API et Redux?",
            answer:
              "Context API est une fonctionnalité intégrée de React pour passer des données à travers l'arbre des composants sans props drilling. Redux est une bibliothèque de gestion d'état avec un store global, des reducers et des actions. Principales différences: 1) Redux offre des outils de débogage plus avancés. 2) Redux a une architecture plus stricte qui facilite la maintenance des grandes applications. 3) Context peut causer des problèmes de performance avec des re-rendus fréquents, tandis que Redux est optimisé pour minimiser les re-rendus. 4) Redux facilite les tests et le middleware. Utilisez Context pour des besoins simples de partage d'état et Redux pour des applications complexes avec beaucoup d'état global.",
            difficulty: "medium",
            tags: ["Context", "Redux", "Gestion d'État"],
          },
          {
            question:
              "Comment éviter les re-rendus inutiles lors de l'utilisation du Context API?",
            answer:
              "Pour éviter les re-rendus inutiles avec Context: 1) Divisez vos contextes en unités plus petites et spécifiques. 2) Utilisez React.memo pour les composants qui consomment le contexte mais n'ont pas besoin de se re-rendre pour tous les changements. 3) Mémorisez la valeur du contexte avec useMemo pour éviter de créer de nouvelles références à chaque rendu. 4) Utilisez useCallback pour les fonctions passées via le contexte. 5) Considérez des bibliothèques comme use-context-selector qui permettent aux composants de s'abonner uniquement à des parties spécifiques du contexte.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"],
          },
          {
            question:
              "Comment tester des composants qui utilisent le Context API?",
            answer:
              "Pour tester des composants qui utilisent Context: 1) Créez un wrapper de test qui fournit le contexte avec des valeurs mockées. 2) Utilisez ce wrapper dans vos tests pour envelopper le composant testé. 3) Pour les tests d'intégration, vous pouvez fournir un vrai provider avec un état initial contrôlé. 4) Testez les hooks personnalisés qui utilisent useContext séparément. 5) Utilisez jest.mock() pour mocker les modules de contexte entiers si nécessaire. Exemple: const wrapper = ({ children }) => <MyContext.Provider value={mockValue}>{children}</MyContext.Provider>; render(<MyComponent />, { wrapper });",
            difficulty: "medium",
            tags: ["Tests", "Bonnes Pratiques"],
          },
          {
            question:
              "Quand devriez-vous créer un hook personnalisé pour un contexte?",
            answer:
              "Créez un hook personnalisé pour un contexte lorsque: 1) Vous voulez encapsuler la logique d'accès au contexte et cacher les détails d'implémentation. 2) Vous avez besoin d'ajouter une validation ou une logique supplémentaire lors de l'accès au contexte. 3) Vous voulez fournir une meilleure expérience de développement avec l'autocomplétion et la vérification de type. 4) Vous voulez vous assurer que le contexte est utilisé correctement (par exemple, vérifier qu'il est appelé dans un Provider). Un hook personnalisé comme useTheme() est plus expressif et maintenable que useContext(ThemeContext) répété dans plusieurs composants.",
            difficulty: "easy",
            tags: ["Hooks", "Bonnes Pratiques"],
          },
        ]}
      />
    </div>
  );
}
