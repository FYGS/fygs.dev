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

export function ZustandSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Zustand</CardTitle>
          <CardDescription>
            Une solution de gestion d&apos;état minimaliste et flexible pour React
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Zustand est une bibliothèque de gestion d&apos;état légère qui utilise les hooks et offre une API simple sans boilerplate, tout en restant performante.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Lightweight</Badge>
            <Badge>Hook-based</Badge>
            <Badge>No Providers</Badge>
            <Badge>Middleware</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="Store Zustand de base"
        description="Comment créer et utiliser un store Zustand simple"
        code={`// store.ts (Zustand v5)
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}

// Avec TypeScript, utilisez la forme curryfiée create<T>()(...)
export const useCounterStore = create<CounterState>()((set) => ({
  // État initial
  count: 0,

  // Actions pour mettre à jour l'état
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
}));

// Counter.tsx
import { useShallow } from 'zustand/react/shallow';
import { useCounterStore } from './store';

function Counter() {
  // Extraction des valeurs et actions du store
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  // Alternative : sélectionner plusieurs valeurs en une fois.
  // Zustand v5 : un sélecteur qui retourne un NOUVEL objet à chaque appel
  // provoque une boucle de rendus ; enveloppez-le avec useShallow.
  // const { count, increment } = useCounterStore(
  //   useShallow((state) => ({ count: state.count, increment: state.increment })),
  // );
  // (appeler useCounterStore() sans sélecteur abonne le composant à tout le store)

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// App.tsx
import Counter from './Counter';

function App() {
  return (
    <div>
      <h1>Zustand Example</h1>
      <Counter />
      {/* Pas besoin de Provider! */}
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              Zustand est une bibliothèque de gestion d&apos;état minimaliste qui offre une API simple et intuitive basée sur les hooks.
            </p>
            <p className="mt-3">
              Les avantages clés de Zustand sont:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pas de Provider nécessaire, contrairement à Redux ou Context</li>
              <li>API minimaliste avec très peu de boilerplate</li>
              <li>Sélection automatique pour éviter les re-rendus inutiles</li>
              <li>Support pour TypeScript</li>
              <li>Bibliothèque très légère (vérifiez sa taille actuelle sur bundlephobia.com)</li>
            </ul>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>Nous créons un store avec <code>create</code> qui contient l&apos;état initial et les actions</li>
              <li>La fonction <code>set</code> est utilisée pour mettre à jour l&apos;état de manière immuable</li>
              <li>Dans les composants, nous utilisons le hook du store pour extraire les valeurs et les actions</li>
              <li>Zustand s&apos;occupe automatiquement de ne re-rendre le composant que lorsque les valeurs sélectionnées changent</li>
            </ol>
            <p className="mt-3">
              Cette simplicité fait de Zustand un excellent choix pour les applications de petite à moyenne taille, ou comme solution de gestion d&apos;état locale pour des parties spécifiques d&apos;une grande application.
            </p>
          </div>
        }
        tips={[
          "Utilisez des sélecteurs pour n'extraire que les valeurs dont vous avez besoin et éviter les re-rendus inutiles",
          "Organisez votre store en slices pour une meilleure séparation des préoccupations",
          "Utilisez les middlewares intégrés comme persist pour la persistance de l'état",
          "Combinez Zustand avec Immer pour des mises à jour d'état plus simples",
          "Zustand v5 : un sélecteur qui retourne un nouvel objet ou tableau à chaque appel boucle à l'infini ; utilisez useShallow (zustand/react/shallow)",
          "Avec Next.js (SSR), évitez un store global partagé entre requêtes : créez un store par requête avec createStore et fournissez-le via un Context"
        ]}
        interviewQuestions={[
          {
            question: "Quels sont les avantages de Zustand par rapport à Redux?",
            answer: "Zustand offre plusieurs avantages par rapport à Redux: 1) API plus simple et moins de boilerplate: pas besoin d'actions, de types d'action ou de reducers séparés. 2) Pas de Provider nécessaire: pas besoin d'envelopper l'application dans un Provider. 3) Légèreté: Zustand est une bibliothèque beaucoup plus petite que Redux Toolkit + React-Redux (comparez les tailles sur bundlephobia.com). 4) Sélection automatique: Zustand réabonne automatiquement les composants uniquement lorsque les valeurs sélectionnées changent. 5) Courbe d'apprentissage plus douce: API plus intuitive et moins de concepts à comprendre. 6) Meilleure intégration avec TypeScript par défaut. Cependant, Redux reste plus adapté pour les très grandes applications avec des besoins complexes de gestion d'état, de middleware et de débogage.",
            difficulty: "medium",
            tags: ["Zustand", "Redux", "Comparaison"]
          },
          {
            question: "Comment gérer les opérations asynchrones avec Zustand?",
            answer: "Zustand permet de gérer les opérations asynchrones de manière simple et directe: 1) Méthode directe: Ajoutez simplement des fonctions asynchrones à votre store qui utilisent 'set' pour mettre à jour l'état une fois l'opération terminée: `fetchUsers: async () => { const response = await fetch('/api/users'); const users = await response.json(); set({ users, loading: false }); }`. 2) Avec gestion d'état de chargement: `fetchUsers: async () => { set({ loading: true, error: null }); try { const response = await fetch('/api/users'); const users = await response.json(); set({ users, loading: false }); } catch (error) { set({ error: error.message, loading: false }); } }`. 3) Avec un set fonctionnel (ou get()): Vous pouvez accéder à l'état actuel dans vos fonctions asynchrones: `addUser: async (userData) => { const response = await fetch('/api/users', { method: 'POST', body: JSON.stringify(userData) }); const newUser = await response.json(); set((state) => ({ users: [...state.users, newUser] })); }`. Zustand ne nécessite pas de middleware spécial comme Redux Thunk pour gérer l'asynchronicité.",
            difficulty: "medium",
            tags: ["Zustand", "Async"]
          }
        ]}
      />

      <CodeExample
        title="Fonctionnalités avancées de Zustand"
        description="Slices, middleware et persistance d'état"
        code={`// store.ts (Zustand v5)
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface User { id: number; name: string }
interface Todo { id: string; text: string; completed: boolean; assignedTo?: number }

interface AppState {
  users: {
    list: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    addUser: (user: User) => void;
  };
  todos: {
    items: Todo[];
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    removeTodo: (id: string) => void;
  };
  assignTodoToUser: (todoId: string, userId: number) => void;
}

// create<T>()(...) : la forme curryfiée est nécessaire avec les middlewares en TypeScript
const useStore = create<AppState>()(
  devtools(
  // Middleware persist pour sauvegarder l'état dans localStorage
  persist(
    // Middleware immer pour des mises à jour d'état plus simples
    immer((set, get) => ({
      // Slice users
      users: {
        list: [],
        loading: false,
        error: null,

        fetchUsers: async () => {
          set(state => { state.users.loading = true; state.users.error = null; });
          try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const users: User[] = await response.json();
            set(state => { state.users.list = users; state.users.loading = false; });
          } catch (error) {
            set(state => {
              state.users.error = error instanceof Error ? error.message : 'Erreur inconnue';
              state.users.loading = false;
            });
          }
        },

        addUser: (user) => {
          set(state => { state.users.list.push(user); });
        },
      },

      // Slice todos
      todos: {
        items: [],

        addTodo: (text) => {
          const newTodo: Todo = { id: crypto.randomUUID(), text, completed: false };
          set(state => { state.todos.items.push(newTodo); });
        },

        toggleTodo: (id) => {
          set(state => {
            const todo = state.todos.items.find(item => item.id === id);
            if (todo) todo.completed = !todo.completed;
          });
        },

        removeTodo: (id) => {
          set(state => {
            state.todos.items = state.todos.items.filter(item => item.id !== id);
          });
        },
      },

      // Actions qui utilisent plusieurs slices
      assignTodoToUser: (todoId, userId) => {
        const todo = get().todos.items.find(t => t.id === todoId);
        const user = get().users.list.find(u => u.id === userId);

        if (todo && user) {
          set(state => {
            const todoIndex = state.todos.items.findIndex(t => t.id === todoId);
            state.todos.items[todoIndex].assignedTo = userId;
          });
        }
      },
    })),
    {
      name: 'app-storage', // nom unique pour le stockage
      storage: createJSONStorage(() => localStorage), // type de stockage
      partialize: (state) => ({ todos: { items: state.todos.items } }), // ne persister que les données (pas les fonctions)
      // Le merge par défaut est superficiel : sans ceci, la slice todos réhydratée écraserait les actions
      merge: (persisted, current) => ({
        ...current,
        todos: { ...current.todos, ...(persisted as Partial<AppState>).todos },
      }),
    }
  ),
  { name: 'AppStore' } // devtools : nom affiché dans Redux DevTools
  )
);

// Hooks personnalisés pour accéder aux slices spécifiques
export const useUsers = () => useStore((state) => state.users);
export const useTodos = () => useStore((state) => state.todos);
export const useAssignTodoToUser = () => useStore((state) => state.assignTodoToUser);

// Sélectionner plusieurs valeurs : useShallow évite les rendus inutiles (et la boucle
// infinie de la v5) quand le sélecteur construit un nouvel objet à chaque appel
export const useTodoActions = () =>
  useStore(
    useShallow((state) => ({
      addTodo: state.todos.addTodo,
      toggleTodo: state.todos.toggleTodo,
      removeTodo: state.todos.removeTodo,
    })),
  );

// UserList.tsx
import { useEffect } from 'react';
import { useUsers } from './store';

function UserList() {
  const { list, loading, error, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {list.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// TodoList.tsx
import { useState } from 'react';
import { useTodos, useTodoActions, useUsers, useAssignTodoToUser } from './store';

function TodoList() {
  const { items } = useTodos();
  const { addTodo, toggleTodo, removeTodo } = useTodoActions();
  const { list: users } = useUsers();
  const assignTodoToUser = useAssignTodoToUser();
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  return (
    <div>
      <h2>Todos</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add todo..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <select
              value={todo.assignedTo || ''}
              onChange={(e) => assignTodoToUser(todo.id, Number(e.target.value))}
            >
              <option value="">Assign to...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              Zustand offre plusieurs fonctionnalités avancées qui le rendent adapté à des cas d&apos;utilisation plus complexes.
            </p>
            <p className="mt-3">
              <strong>1. Organisation en slices</strong>
            </p>
            <p>
              Diviser votre store en slices permet une meilleure organisation et séparation des préoccupations. Chaque slice gère sa propre partie de l&apos;état et ses propres actions.
            </p>
            <p className="mt-3">
              <strong>2. Middlewares</strong>
            </p>
            <p>
              Zustand supporte les middlewares pour étendre ses fonctionnalités:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><code>immer</code>: Permet d&apos;écrire des mises à jour d&apos;état de manière &quot;mutable&quot; qui sont en réalité immuables</li>
              <li><code>persist</code>: Sauvegarde automatiquement l&apos;état dans localStorage, sessionStorage ou un autre stockage</li>
              <li><code>devtools</code>: Intégration avec Redux DevTools pour le débogage</li>
              <li>Middlewares personnalisés: Vous pouvez créer vos propres middlewares</li>
            </ul>
            <p className="mt-3">
              <strong>3. Hooks personnalisés</strong>
            </p>
            <p>
              Créer des hooks personnalisés pour accéder à des parties spécifiques du store améliore la lisibilité et la maintenabilité du code.
            </p>
            <p className="mt-3">
              <strong>4. Accès à l&apos;état actuel avec get()</strong>
            </p>
            <p>
              La fonction <code>get()</code> permet d&apos;accéder à l&apos;état actuel dans les actions, ce qui est utile pour les opérations qui dépendent de l&apos;état actuel ou qui impliquent plusieurs slices.
            </p>
            <p className="mt-3">
              Ces fonctionnalités font de Zustand une solution flexible et puissante pour la gestion d&apos;état, capable de s&apos;adapter à des applications de différentes tailles et complexités.
            </p>
          </div>
        }
        tips={[
          "Utilisez le middleware immer pour simplifier les mises à jour d'état complexes",
          "Créez des hooks personnalisés pour chaque slice pour une meilleure organisation",
          "Utilisez le middleware persist pour sauvegarder l'état entre les sessions",
          "Combinez get() et set() pour des actions qui dépendent de l'état actuel"
        ]}
        interviewQuestions={[
          {
            question: "Comment organiseriez-vous un grand store Zustand pour une application complexe?",
            answer: "Pour organiser un grand store Zustand dans une application complexe: 1) Divisez l'état en slices logiques: chaque slice gère une partie spécifique de l'état (users, auth, ui, etc.). 2) Créez des hooks personnalisés pour chaque slice: `useUsers()`, `useAuth()`, etc., qui sélectionnent uniquement la partie pertinente du store. 3) Utilisez des fichiers séparés pour chaque slice et combinez-les: `const createUserSlice = (set, get) => ({ users: {...} });` puis `create((...args) => ({ ...createUserSlice(...args), ...createAuthSlice(...args) }))`. 4) Implémentez des actions qui traversent les slices dans un fichier séparé. 5) Utilisez TypeScript pour garantir la sécurité de type. 6) Utilisez le middleware immer pour simplifier les mises à jour d'état complexes. 7) Considérez l'utilisation de middlewares comme persist pour des parties spécifiques de l'état. Cette approche maintient la simplicité de Zustand tout en permettant une organisation scalable.",
            difficulty: "hard",
            tags: ["Zustand", "Architecture", "Scaling"]
          },
          {
            question: "Comparez les middlewares disponibles dans Zustand et expliquez quand les utiliser.",
            answer: "Zustand offre plusieurs middlewares intégrés: 1) immer: Permet d'écrire des mises à jour d'état de manière 'mutable' qui sont en réalité immuables. Utilisez-le pour simplifier les mises à jour d'objets et tableaux imbriqués. 2) persist: Sauvegarde automatiquement l'état dans localStorage, sessionStorage ou un autre stockage. Idéal pour persister l'état entre les sessions ou pour le mode hors ligne. 3) devtools: Intègre Redux DevTools pour le débogage. Utilisez-le en développement pour inspecter l'état et les actions. 4) subscribeWithSelector: Permet de s'abonner à des parties spécifiques de l'état. Utile pour les réactions aux changements d'état spécifiques. 5) combine: Crée un store à partir d'un état initial et d'un créateur d'actions; utile surtout pour l'inférence de types TypeScript. Vous pouvez également créer des middlewares personnalisés pour des besoins spécifiques comme la journalisation, la validation, ou l'intégration avec d'autres bibliothèques.",
            difficulty: "medium",
            tags: ["Zustand", "Middleware"]
          }
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur Zustand"
        questions={[
          {
            question: "Quels sont les cas d'utilisation idéaux pour Zustand?",
            answer: "Zustand est particulièrement adapté pour: 1) Applications de petite à moyenne taille où Redux serait trop lourd. 2) Composants ou fonctionnalités isolés nécessitant un état partagé, même dans une application utilisant déjà Redux pour l'état global principal. 3) Prototypes et MVPs nécessitant une mise en place rapide. 4) Applications où la simplicité et la réduction du boilerplate sont prioritaires. 5) Projets où la taille du bundle est une préoccupation importante. 6) Applications nécessitant une gestion d'état avec une courbe d'apprentissage minimale. 7) Cas où vous voulez éviter le 'Provider Hell' avec de multiples contextes imbriqués. 8) Équipes qui préfèrent une approche plus fonctionnelle et moins verbale que Redux.",
            difficulty: "medium",
            tags: ["Zustand", "Use Cases"]
          },
          {
            question: "Comment Zustand évite-t-il les re-rendus inutiles?",
            answer: "Zustand évite les re-rendus inutiles grâce à plusieurs mécanismes: 1) Sélection automatique: Lorsque vous utilisez un sélecteur avec useStore((state) => state.count), Zustand ne re-rend le composant que si la valeur sélectionnée change. 2) Égalité par référence: Zustand utilise Object.is pour comparer les valeurs avant et après une mise à jour. 3) Middleware subscribeWithSelector: Permet de s'abonner hors React (store.subscribe) à des parties spécifiques de l'état. 4) Attention: les sélecteurs ne sont pas mémoïsés; un sélecteur qui retourne un nouvel objet ou tableau à chaque appel provoque des re-rendus (et, en v5, une boucle infinie). Pour optimiser davantage, vous pouvez: 1) Utiliser des sélecteurs granulaires pour n'extraire que ce dont vous avez besoin. 2) Utiliser useShallow (zustand/react/shallow) pour une comparaison peu profonde des objets ou tableaux retournés. 3) Créer des hooks personnalisés qui sélectionnent des parties spécifiques de l'état.",
            difficulty: "hard",
            tags: ["Zustand", "Performance", "Optimisation"]
          },
          {
            question: "Comment tester un composant qui utilise Zustand?",
            answer: "Pour tester un composant qui utilise Zustand: 1) Mocker le store: Créez une version mock du store pour les tests: `vi.mock('../store', () => ({ useStore: () => ({ count: 5, increment: vi.fn() }) }));` (Vitest ; jest.mock avec Jest) 2) Utiliser createStore pour les tests: Créez une instance de store spécifique aux tests: `const createTestStore = () => create(...)` puis utilisez-la dans vos tests. 3) Injecter le store: Modifiez votre hook pour accepter un store optionnel: `export const useStore = (selector, store = defaultStore) => store(selector)` puis injectez un store de test. 4) Tester les actions directement: `const store = createStore(); store.getState().increment(); expect(store.getState().count).toBe(1);` 5) Pour les tests d'intégration, utilisez le vrai store et testez le comportement complet. 6) Utilisez act() de React Testing Library pour les mises à jour d'état asynchrones. 7) Testez les sélecteurs séparément des composants pour une meilleure isolation.",
            difficulty: "medium",
            tags: ["Zustand", "Testing"]
          },
          {
            question: "Comment migrer d'une application Redux vers Zustand?",
            answer: "Pour migrer de Redux vers Zustand: 1) Migration progressive: Commencez par migrer des fonctionnalités isolées tout en conservant Redux pour le reste. 2) Convertissez les reducers en slices Zustand: Transformez chaque reducer en une fonction qui utilise set() pour mettre à jour l'état. 3) Transformez les actions en fonctions simples: Remplacez les action creators et les types d'action par des fonctions directes dans le store. 4) Remplacez useSelector et useDispatch: Utilisez useStore avec des sélecteurs pour extraire l'état et les actions. 5) Middleware: Remplacez les middlewares Redux par leurs équivalents Zustand ou des implémentations personnalisées. 6) DevTools: Activez le middleware devtools pour conserver la capacité de débogage. 7) Tests: Mettez à jour vos tests pour refléter la nouvelle structure. 8) Supprimez progressivement les dépendances Redux une fois la migration terminée. Cette approche permet une migration en douceur sans réécriture complète de l'application.",
            difficulty: "hard",
            tags: ["Zustand", "Redux", "Migration"]
          }
        ]}
      />
    </div>
  );
}
