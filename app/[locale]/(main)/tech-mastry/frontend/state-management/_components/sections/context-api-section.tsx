"use client";

import { useState, createContext, useContext } from "react";
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

// Demo components for Context API
const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className={`px-4 py-2 rounded-md ${
        theme === "light"
          ? "bg-gray-200 text-gray-800"
          : "bg-gray-800 text-white"
      }`}
    >
      Current theme: {theme}
      <br />
      Click to toggle
    </button>
  );
}

function ContextDemo() {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center gap-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Context API Demo</h3>
        <p className="text-sm text-muted-foreground">
          This component uses Context API to manage theme state
        </p>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}

export function ContextApiSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>React Context API</CardTitle>
          <CardDescription>
            Une solution intégrée à React pour partager l&apos;état entre les composants sans passer par les props
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Context API permet de créer un état global accessible à tous les composants d&apos;un arbre, sans avoir à passer explicitement les props à chaque niveau.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Built-in</Badge>
            <Badge>No Dependencies</Badge>
            <Badge>Simple API</Badge>
            <Badge>Provider/Consumer</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Création et Utilisation d'un Context"
        description="Comment créer, fournir et consommer un contexte dans React"
        code={`import React, { createContext, useContext, useState } from 'react';

// 1. Créer un contexte avec une valeur par défaut
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// 2. Créer un Provider qui fournira l'état et les fonctions de mise à jour
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // La valeur fournie au contexte
  const value = {
    theme,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Composant qui consomme le contexte
function ThemedButton() {
  // Utilisation du hook useContext pour accéder au contexte
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
        color: theme === 'light' ? '#333' : '#f0f0f0',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px'
      }}
    >
      Current theme: {theme}
    </button>
  );
}

// 4. Application qui utilise le Provider
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Theme Switcher Example</h1>
        <ThemedButton />
        <Content />
      </div>
    </ThemeProvider>
  );
}

// 5. Composant imbriqué qui accède également au contexte
function Content() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div style={{
      backgroundColor: theme === 'light' ? '#fff' : '#222',
      color: theme === 'light' ? '#222' : '#fff',
      padding: '20px',
      marginTop: '20px'
    }}>
      <p>This content uses the theme from context.</p>
    </div>
  );
}`}
        demo={<ContextDemo />}
        explanation={
          <div>
            <p>
              React Context API est un mécanisme intégré à React qui permet de partager des données entre des composants sans avoir à passer explicitement les props à travers chaque niveau de l&apos;arbre de composants.
            </p>
            <p className="mt-3">
              Le Context API se compose de trois parties principales:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Context Object</strong>: Créé avec <code>createContext(defaultValue)</code>, il contient un Provider et un Consumer.
              </li>
              <li>
                <strong>Provider</strong>: Composant qui permet aux composants enfants de s&apos;abonner aux changements de contexte.
              </li>
              <li>
                <strong>Consumer</strong>: Permet de consommer la valeur actuelle du contexte. Dans les composants fonctionnels, on utilise généralement le hook <code>useContext</code>.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé un contexte de thème qui permet à n&apos;importe quel composant de l&apos;arbre d&apos;accéder et de modifier le thème actuel sans avoir à passer des props à travers tous les composants intermédiaires.
            </p>
          </div>
        }
        tips={[
          "Utilisez Context pour des données qui doivent être accessibles par de nombreux composants à différents niveaux",
          "Évitez de mettre trop de données dans un seul contexte, préférez plusieurs contextes spécifiques",
          "Pour les mises à jour fréquentes, considérez d'autres solutions comme Redux ou Zustand",
          "Utilisez la technique de séparation du Provider et du hook personnalisé pour une meilleure organisation"
        ]}
        interviewQuestions={[
          {
            question: "Quand devriez-vous utiliser Context API plutôt que Redux?",
            answer: "Utilisez Context API pour des applications simples à moyennes avec des besoins de gestion d'état modérés. Context est idéal lorsque: 1) Vous avez besoin de partager des données entre des composants imbriqués sans prop drilling. 2) Votre état global est relativement simple et ne change pas fréquemment. 3) Vous préférez utiliser uniquement les fonctionnalités intégrées de React sans dépendances externes. Préférez Redux lorsque: 1) Votre application a un état complexe avec de nombreuses mises à jour. 2) Vous avez besoin d'une logique de mise à jour plus sophistiquée (middleware, etc.). 3) Vous avez besoin d'outils de débogage avancés. 4) Vous avez besoin d'une meilleure performance pour les mises à jour fréquentes.",
            difficulty: "medium",
            tags: ["Context API", "Redux", "Comparaison"]
          },
          {
            question: "Comment optimiser les performances lors de l'utilisation de Context API?",
            answer: "Pour optimiser les performances avec Context API: 1) Divisez votre état global en plusieurs contextes plus petits et spécifiques pour éviter des re-rendus inutiles. 2) Utilisez React.memo sur les composants enfants qui ne consomment pas le contexte (React.memo n'empêche pas le re-rendu d'un composant dont le contexte consommé change). 3) Implémentez une structure de contexte à deux niveaux: un pour l'état et un pour les fonctions de mise à jour. 4) Utilisez useReducer avec useMemo pour stabiliser les références des fonctions. 5) Considérez des bibliothèques comme use-context-selector qui permettent de ne s'abonner qu'à une partie spécifique du contexte. 6) Pour les applications plus grandes avec des mises à jour fréquentes, envisagez d'utiliser une solution de gestion d'état plus optimisée comme Redux ou Zustand.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"]
          }
        ]}
      />
      
      <CodeExample
        title="Pattern de Context avec useReducer"
        description="Combiner Context API avec useReducer pour une gestion d'état plus robuste"
        code={`import React, { createContext, useContext, useReducer } from 'react';

// 1. Définir les types d'actions
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';

// 2. Créer un reducer
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

// 3. Créer le contexte
const TodoContext = createContext();

// 4. Créer un hook personnalisé pour utiliser le contexte
function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}

// 5. Créer le Provider
function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  // Actions
  const addTodo = text => dispatch({ type: ADD_TODO, payload: text });
  const toggleTodo = id => dispatch({ type: TOGGLE_TODO, payload: id });
  const deleteTodo = id => dispatch({ type: DELETE_TODO, payload: id });
  
  const value = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  };
  
  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

// 6. Composants qui utilisent le contexte
function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useTodos();
  
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
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

function AddTodo() {
  const { addTodo } = useTodos();
  const [text, setText] = React.useState('');
  
  const handleSubmit = e => {
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
        onChange={e => setText(e.target.value)}
        placeholder="Add todo..."
      />
      <button type="submit">Add</button>
    </form>
  );
}

// 7. Application complète
function TodoApp() {
  return (
    <TodoProvider>
      <h1>Todo List</h1>
      <AddTodo />
      <TodoList />
    </TodoProvider>
  );
}`}
        explanation={
          <div>
            <p>
              Combiner Context API avec <code>useReducer</code> est un pattern puissant qui offre une gestion d&apos;état plus structurée, similaire à Redux mais sans dépendance externe.
            </p>
            <p className="mt-3">
              Ce pattern présente plusieurs avantages:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Logique de mise à jour centralisée dans le reducer</li>
              <li>Actions clairement définies pour les modifications d&apos;état</li>
              <li>Facilite le débogage et les tests</li>
              <li>Meilleure séparation des préoccupations</li>
            </ul>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>Un reducer qui définit comment l&apos;état est mis à jour en réponse à différentes actions</li>
              <li>Un contexte qui fournit l&apos;état et les fonctions d&apos;action aux composants</li>
              <li>Un hook personnalisé <code>useTodos</code> qui facilite l&apos;accès au contexte</li>
              <li>Des composants qui utilisent ce hook pour accéder et modifier l&apos;état</li>
            </ol>
            <p className="mt-3">
              Ce pattern est particulièrement utile pour les applications de taille moyenne où Redux pourrait être excessif, mais où une simple utilisation de <code>useState</code> avec Context deviendrait difficile à gérer.
            </p>
          </div>
        }
        tips={[
          "Créez toujours un hook personnalisé pour accéder au contexte, cela améliore la réutilisabilité et la lisibilité",
          "Séparez les préoccupations en créant plusieurs contextes pour différentes parties de votre état",
          "Utilisez TypeScript pour améliorer la sécurité de type de vos actions et de votre état",
          "Considérez d'utiliser immer.js avec useReducer pour des mises à jour d'état immuables plus simples"
        ]}
        interviewQuestions={[
          {
            question: "Expliquez le pattern de Context avec useReducer et ses avantages par rapport à useState avec Context.",
            answer: "Le pattern Context + useReducer combine le Context API pour le partage d'état global avec useReducer pour une gestion d'état plus structurée. Avantages par rapport à useState + Context: 1) Logique de mise à jour centralisée dans un reducer, facilitant la maintenance. 2) Actions explicites qui documentent toutes les façons dont l'état peut changer. 3) Une seule fonction dispatch stable (identité constante) que l'on peut exposer dans un contexte séparé pour limiter les re-rendus. 4) Facilite le débogage car toutes les transitions d'état sont explicites. 5) Pattern similaire à Redux, facilitant la transition si nécessaire. 6) Meilleure séparation des préoccupations entre la logique d'état et les composants UI.",
            difficulty: "medium",
            tags: ["Context API", "useReducer", "Patterns"]
          },
          {
            question: "Comment implémenteriez-vous un middleware avec Context et useReducer?",
            answer: "Pour implémenter un middleware avec Context et useReducer: 1) Créez une fonction d'enrobage pour votre dispatch qui intercepte les actions avant qu'elles n'atteignent le reducer. 2) Implémentez la logique de middleware dans cette fonction. Par exemple: `const withLoggingMiddleware = dispatch => action => { console.log('Action:', action); const result = dispatch(action); console.log('New state:', state); return result; };` 3) Pour les effets asynchrones, créez des action creators qui retournent des fonctions: `const asyncActionCreator = (params) => async (dispatch, getState) => { dispatch({ type: 'LOADING_START' }); try { const data = await api.fetchData(params); dispatch({ type: 'DATA_LOADED', payload: data }); } catch (error) { dispatch({ type: 'ERROR', payload: error }); } };` 4) Modifiez votre dispatch pour gérer ces fonctions: `const enhancedDispatch = action => { if (typeof action === 'function') { return action(enhancedDispatch, getState); } return dispatch(action); };`",
            difficulty: "hard",
            tags: ["Advanced", "Middleware", "Async"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur Context API"
        questions={[
          {
            question: "Quels sont les cas d'utilisation typiques de Context API?",
            answer: "Les cas d'utilisation typiques de Context API incluent: 1) Thèmes UI - partager les préférences de thème à travers l'application. 2) Authentification - partager l'état de connexion et les informations utilisateur. 3) Préférences utilisateur - langue, fuseau horaire, etc. 4) État de navigation - informations sur la route actuelle. 5) État global léger - pour les applications de petite à moyenne taille. 6) Gestion de formulaires complexes - partager l'état et les validations entre plusieurs composants de formulaire. Context est particulièrement utile pour les données qui changent rarement et qui doivent être accessibles par de nombreux composants à différents niveaux de l'arbre.",
            difficulty: "easy",
            tags: ["Context API", "Use Cases"]
          },
          {
            question: "Quelles sont les limitations de Context API?",
            answer: "Les principales limitations de Context API sont: 1) Performance - Context n'est pas optimisé pour des mises à jour fréquentes; tous les consommateurs se re-rendent lorsque la valeur du contexte change. 2) Pas de middleware intégré - contrairement à Redux, il n'y a pas de système de middleware pour les effets secondaires. 3) Pas d'outils de débogage avancés par défaut. 4) Pas de mécanisme intégré pour combiner plusieurs reducers. 5) Pas de sélecteurs optimisés - impossible de s'abonner à une partie spécifique du contexte sans bibliothèques tierces. 6) Complexité accrue pour les états très imbriqués. Pour les applications complexes avec des mises à jour fréquentes, des bibliothèques comme Redux, Zustand ou Jotai peuvent être plus appropriées.",
            difficulty: "medium",
            tags: ["Context API", "Limitations"]
          },
          {
            question: "Comment éviter les re-rendus inutiles lors de l'utilisation de Context?",
            answer: "Pour éviter les re-rendus inutiles avec Context: 1) Divisez votre état global en plusieurs contextes plus petits et spécifiques. 2) Séparez l'état et les fonctions de mise à jour dans des contextes différents. 3) Utilisez React.memo sur les composants enfants qui ne consomment pas le contexte (il n'empêche pas le re-rendu d'un composant dont le contexte consommé change). 4) Utilisez useMemo pour mémoriser les valeurs du contexte: `const value = useMemo(() => ({ state, actions }), [state]);` 5) Utilisez useCallback pour stabiliser les références des fonctions. 6) Considérez des bibliothèques comme use-context-selector qui permettent de ne s'abonner qu'à une partie spécifique du contexte. 7) Pour les structures de données complexes, utilisez l'immutabilité structurelle pour permettre des comparaisons de référence rapides.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"]
          },
          {
            question: "Comment tester des composants qui utilisent Context API?",
            answer: "Pour tester des composants qui utilisent Context API: 1) Créez un wrapper de test qui fournit le contexte nécessaire: `const wrapper = ({ children }) => <MyContext.Provider value={mockValue}>{children}</MyContext.Provider>;` 2) Utilisez ce wrapper lors du rendu du composant dans vos tests: `render(<MyComponent />, { wrapper });` 3) Pour les hooks personnalisés qui utilisent useContext, vous pouvez soit les tester dans un composant de test, soit mocker le hook useContext lui-même. 4) Utilisez jest.mock pour mocker les hooks personnalisés qui accèdent au contexte: `jest.mock('../hooks/useMyContext', () => ({ useMyContext: () => mockContextValue }));` 5) Pour les tests d'intégration, fournissez un état réaliste au Provider. 6) Testez les interactions en simulant les événements et en vérifiant que le contexte est mis à jour correctement. 7) Utilisez des outils comme React Testing Library qui encouragent à tester le comportement plutôt que l'implémentation.",
            difficulty: "medium",
            tags: ["Testing", "Best Practices"]
          }
        ]}
      />
    </div>
  );
}
