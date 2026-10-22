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

export function ReactQuerySection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>React Query / TanStack Query</CardTitle>
          <CardDescription>
            Une bibliothèque de récupération, mise en cache et mise à jour de données asynchrones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            React Query (maintenant TanStack Query) est spécialisée dans la gestion des données serveur, offrant des fonctionnalités avancées comme la mise en cache, la déduplification des requêtes et la revalidation automatique.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Data Fetching</Badge>
            <Badge>Caching</Badge>
            <Badge>Background Updates</Badge>
            <Badge>Optimistic UI</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Requêtes de base avec React Query"
        description="Comment configurer et utiliser React Query pour récupérer des données"
        code={`// Installation
// npm install @tanstack/react-query
// ou
// yarn add @tanstack/react-query

// App.jsx - Configuration du QueryClient
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Users from './Users';

// Créer un client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // refetch automatique quand la fenêtre reprend le focus
      staleTime: 1000 * 60 * 5, // considérer les données comme périmées après 5 minutes
      gcTime: 1000 * 60 * 30, // garder les données inutilisées en mémoire 30 minutes (cacheTime avant la v5)
      retry: 3, // réessayer 3 fois en cas d'échec
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>React Query Example</h1>
        <Users />
      </div>
      <ReactQueryDevtools initialIsOpen={false} /> {/* DevTools en bas de l'écran */}
    </QueryClientProvider>
  );
}

// api.js - Fonctions d'API
export const fetchUsers = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchUserById = async (id) => {
  const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// Users.jsx - Utilisation de useQuery
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from './api';

function Users() {
  // Utilisation du hook useQuery
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch, // fonction pour forcer un refetch
    isFetching, // true pendant le fetching (même si les données sont déjà en cache)
  } = useQuery({
    queryKey: ['users'], // clé unique pour identifier cette requête
    queryFn: fetchUsers, // fonction qui retourne une promesse
    // options supplémentaires (remplacent les options par défaut)
    // staleTime: 1000 * 60 * 1, // 1 minute
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Users</h2>
      {isFetching && <div>Refreshing...</div>}
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// UserDetails.jsx - Requête avec paramètres
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from './api';

function UserDetails({ userId }) {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', userId], // inclure les paramètres dans la queryKey
    queryFn: () => fetchUserById(userId),
    enabled: !!userId, // ne pas exécuter la requête si userId est falsy
  });

  if (!userId) return <div>Select a user</div>;
  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error loading user</div>;

  return (
    <div>
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              React Query (maintenant TanStack Query) est une bibliothèque spécialisée dans la gestion des données serveur, offrant une solution complète pour la récupération, la mise en cache et la mise à jour des données asynchrones.
            </p>
            <p className="mt-3">
              Les concepts clés de React Query sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>QueryClient</strong>: Le cœur de React Query qui gère le cache et les options globales.
              </li>
              <li>
                <strong>QueryClientProvider</strong>: Composant qui fournit le QueryClient à l&apos;arbre de composants.
              </li>
              <li>
                <strong>useQuery</strong>: Hook principal pour récupérer des données.
              </li>
              <li>
                <strong>queryKey</strong>: Identifiant unique pour chaque requête, utilisé pour la mise en cache et l&apos;invalidation.
              </li>
              <li>
                <strong>queryFn</strong>: Fonction qui retourne une promesse avec les données.
              </li>
            </ol>
            <p className="mt-3">
              React Query offre de nombreux avantages:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Mise en cache automatique des résultats</li>
              <li>Déduplification des requêtes (évite les requêtes multiples pour les mêmes données)</li>
              <li>Revalidation en arrière-plan</li>
              <li>Gestion des erreurs et des retries</li>
              <li>Pagination et requêtes infinies</li>
              <li>Mutations optimistes</li>
              <li>DevTools pour le débogage</li>
            </ul>
            <p className="mt-3">
              React Query est particulièrement utile pour les applications qui interagissent beaucoup avec des API et nécessitent une gestion sophistiquée des données serveur.
            </p>
          </div>
        }
        tips={[
          "Utilisez des queryKeys structurées pour une meilleure organisation et invalidation",
          "Ajustez staleTime et gcTime (cacheTime avant la v5) en fonction des besoins de fraîcheur des données",
          "Utilisez enabled pour contrôler quand une requête doit s'exécuter",
          "Exploitez les DevTools pour comprendre le comportement du cache"
        ]}
        interviewQuestions={[
          {
            question: "Quelle est la différence entre staleTime et gcTime (anciennement cacheTime) dans React Query?",
            answer: "Dans React Query, staleTime et gcTime (cacheTime avant la v5) contrôlent différents aspects du cycle de vie des données: 1) staleTime détermine combien de temps les données restent 'fraîches'. Tant que les données sont fraîches, React Query ne déclenchera pas de refetch automatique lors d'un nouveau montage ou focus de fenêtre. Par défaut, staleTime est 0, ce qui signifie que les données sont immédiatement considérées comme périmées. 2) gcTime (nommé cacheTime avant la v5) détermine combien de temps les données inactives (non utilisées par un composant) restent en cache avant d'être supprimées. Par défaut, gcTime est de 5 minutes. Exemple: Avec staleTime=60000 (1 minute) et gcTime=300000 (5 minutes), les données seront considérées comme fraîches pendant 1 minute (pas de refetch automatique), puis resteront en cache pendant 5 minutes après que le dernier composant ait cessé de les utiliser.",
            difficulty: "medium",
            tags: ["React Query", "Caching"]
          },
          {
            question: "Comment React Query gère-t-il les requêtes en parallèle et en série?",
            answer: "React Query offre plusieurs mécanismes pour gérer les requêtes en parallèle et en série: 1) Requêtes en parallèle: Par défaut, plusieurs useQuery dans un composant s'exécutent en parallèle. Pour des cas plus complexes, utilisez useQueries qui accepte un tableau de configurations de requêtes: `const results = useQueries({ queries: [{ queryKey: ['post', 1], queryFn: getPost }, { queryKey: ['user', 2], queryFn: getUser }] });` 2) Requêtes en série (dépendantes): Utilisez le paramètre enabled avec les résultats d'une requête précédente: `const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: getUser }); const { data: posts } = useQuery({ queryKey: ['posts', user?.id], queryFn: () => getPosts(user.id), enabled: !!user?.id });` 3) Pour des cas plus complexes, vous pouvez utiliser des hooks personnalisés qui combinent plusieurs requêtes ou utiliser des bibliothèques comme react-query-kit pour une meilleure organisation.",
            difficulty: "medium",
            tags: ["React Query", "Advanced"]
          }
        ]}
      />
      
      <CodeExample
        title="Mutations et Mises à jour Optimistes"
        description="Comment effectuer des mutations et mettre à jour le cache"
        code={`// api.js - Fonctions d'API pour les mutations
export const addTodo = async (newTodo) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTodo),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }
  
  return response.json();
};

export const updateTodo = async ({ id, ...updates }) => {
  const response = await fetch(\`https://jsonplaceholder.typicode.com/todos/\${id}\`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  
  return response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetch(\`https://jsonplaceholder.typicode.com/todos/\${id}\`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
  
  return true;
};

export const fetchTodos = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
};

// TodoList.jsx - Utilisation de useMutation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api';
import { useState } from 'react';

function TodoList() {
  const [newTodoText, setNewTodoText] = useState('');
  const queryClient = useQueryClient();
  
  // Requête pour récupérer les todos
  const {
    data: todos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });
  
  // Mutation pour ajouter un todo
  const addTodoMutation = useMutation({
    mutationFn: addTodo,
    // Mise à jour optimiste du cache
    onMutate: async (newTodo) => {
      // Annuler les requêtes en cours pour éviter d'écraser notre mise à jour optimiste
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // Sauvegarder l'état précédent
      const previousTodos = queryClient.getQueryData(['todos']);
      
      // Mettre à jour le cache avec notre nouveau todo (optimiste)
      queryClient.setQueryData(['todos'], old => [
        ...old,
        { ...newTodo, id: Date.now() }, // ID temporaire
      ]);
      
      // Retourner le contexte avec l'état précédent
      return { previousTodos };
    },
    // En cas d'erreur, restaurer l'état précédent
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    // Toujours invalider la requête après la mutation, qu'elle réussisse ou échoue
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  // Mutation pour mettre à jour un todo
  const updateTodoMutation = useMutation({
    mutationFn: updateTodo,
    // Mise à jour optimiste similaire à addTodo
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], old =>
        old.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        )
      );
      
      return { previousTodos };
    },
    onError: (err, updatedTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  // Mutation pour supprimer un todo
  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], old =>
        old.filter(todo => todo.id !== id)
      );
      
      return { previousTodos };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    addTodoMutation.mutate({
      title: newTodoText,
      completed: false,
      userId: 1,
    });
    
    setNewTodoText('');
  };
  
  const handleToggleTodo = (todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };
  
  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };
  
  if (isLoading) return <div>Loading todos...</div>;
  if (isError) return <div>Error loading todos</div>;
  
  return (
    <div>
      <h2>Todo List</h2>
      
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo"
        />
        <button
          type="submit"
          disabled={addTodoMutation.isPending}
        >
          {addTodoMutation.isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              disabled={updateTodoMutation.isPending}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              disabled={deleteTodoMutation.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              React Query offre un support puissant pour les mutations (opérations qui modifient les données) avec le hook <code>useMutation</code>. Les mutations optimistes sont particulièrement utiles pour améliorer l&apos;expérience utilisateur en mettant à jour l&apos;interface avant que la requête au serveur ne soit terminée.
            </p>
            <p className="mt-3">
              Le processus de mutation optimiste comprend généralement ces étapes:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>onMutate</strong>: Exécuté avant la mutation. C&apos;est ici que vous mettez à jour le cache de manière optimiste.
                <ul className="list-disc pl-6 mt-1">
                  <li>Annuler les requêtes en cours pour éviter les conflits</li>
                  <li>Sauvegarder l&apos;état précédent pour pouvoir revenir en arrière</li>
                  <li>Mettre à jour le cache avec la modification attendue</li>
                </ul>
              </li>
              <li>
                <strong>onError</strong>: Exécuté si la mutation échoue. Vous restaurez généralement l&apos;état précédent ici.
              </li>
              <li>
                <strong>onSuccess</strong>: Exécuté si la mutation réussit. Vous pouvez mettre à jour le cache avec les données réelles retournées par le serveur.
              </li>
              <li>
                <strong>onSettled</strong>: Exécuté après la mutation, qu&apos;elle réussisse ou échoue. Souvent utilisé pour invalider et refetch les requêtes affectées.
              </li>
            </ol>
            <p className="mt-3">
              L&apos;exemple ci-dessus montre trois types de mutations courantes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Ajout</strong>: Ajouter un nouvel élément à une liste</li>
              <li><strong>Mise à jour</strong>: Modifier un élément existant</li>
              <li><strong>Suppression</strong>: Retirer un élément de la liste</li>
            </ul>
            <p className="mt-3">
              Chaque mutation utilise une mise à jour optimiste pour donner un feedback immédiat à l&apos;utilisateur, tout en gérant correctement les erreurs potentielles en restaurant l&apos;état précédent si nécessaire.
            </p>
          </div>
        }
        tips={[
          "Utilisez toujours onMutate pour sauvegarder l'état précédent avant une mise à jour optimiste",
          "Annulez les requêtes en cours avec cancelQueries pour éviter les conflits",
          "Utilisez onSettled pour invalider les requêtes affectées et garantir la cohérence des données",
          "Considérez l'utilisation de setQueryData pour des mises à jour précises du cache"
        ]}
        interviewQuestions={[
          {
            question: "Expliquez le concept de mutations optimistes et comment les implémenter avec React Query.",
            answer: "Les mutations optimistes consistent à mettre à jour l'UI immédiatement avant que la requête au serveur ne soit terminée, en supposant qu'elle réussira. Avec React Query, on les implémente via useMutation avec ces étapes: 1) Dans onMutate: a) Annuler les requêtes en cours avec cancelQueries pour éviter les conflits. b) Sauvegarder l'état actuel du cache. c) Mettre à jour le cache de manière optimiste avec setQueryData. d) Retourner l'état précédent comme contexte. 2) Dans onError: Restaurer l'état précédent si la mutation échoue. 3) Dans onSuccess: Mettre à jour le cache avec les données réelles si nécessaire. 4) Dans onSettled: Invalider les requêtes affectées pour garantir la cohérence. Les avantages sont une UI plus réactive et une meilleure UX, mais il faut gérer correctement les erreurs et les conflits potentiels.",
            difficulty: "hard",
            tags: ["React Query", "Mutations", "UX"]
          },
          {
            question: "Comment gérer les dépendances entre mutations et requêtes dans React Query?",
            answer: "Pour gérer les dépendances entre mutations et requêtes dans React Query: 1) Invalidation ciblée: Après une mutation, invalidez les requêtes affectées: `queryClient.invalidateQueries({ queryKey: ['todos'] });` 2) Mise à jour directe du cache: Utilisez setQueryData pour mettre à jour précisément les données sans refetch: `queryClient.setQueryData(['todo', id], updatedTodo);` 3) Requêtes dépendantes: Utilisez le paramètre enabled pour contrôler quand une requête s'exécute en fonction d'une autre: `useQuery({ queryKey: ['comments', postId], enabled: !!postId });` 4) Mutations en chaîne: Utilisez onSuccess pour déclencher une autre mutation: `onSuccess: (data) => { secondMutation.mutate(data.id); }` 5) Synchronisation entre onglets: Activez l'option broadcastQueryClient pour synchroniser les invalidations entre onglets. 6) Gestion des erreurs en cascade: Utilisez onError pour annuler les mutations dépendantes si une mutation échoue.",
            difficulty: "hard",
            tags: ["React Query", "Advanced", "Data Flow"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur React Query"
        questions={[
          {
            question: "Quels sont les avantages de React Query par rapport à la gestion manuelle des requêtes avec useEffect et useState?",
            answer: "React Query offre de nombreux avantages par rapport à la gestion manuelle des requêtes: 1) Mise en cache automatique: Les données sont mises en cache et réutilisées sans refetch inutile. 2) Déduplification des requêtes: Évite les requêtes multiples pour les mêmes données. 3) Revalidation automatique: Refetch automatique lors du focus de la fenêtre, de la reconnexion réseau, ou à intervalles réguliers. 4) Gestion des erreurs et retries: Retry automatique avec backoff exponentiel. 5) Gestion de l'état de chargement: isLoading, isFetching, etc. 6) Pagination et requêtes infinies: Support intégré pour ces patterns complexes. 7) Mutations optimistes: Mise à jour de l'UI avant la confirmation du serveur. 8) Invalidation intelligente du cache: Invalidation précise des données liées. 9) DevTools: Outils de débogage puissants. 10) Gestion de la concurrence: Annulation des requêtes obsolètes. Ces fonctionnalités permettent de réduire considérablement le code boilerplate et d'éviter de nombreux bugs courants.",
            difficulty: "medium",
            tags: ["React Query", "Comparaison"]
          },
          {
            question: "Comment optimiser les performances avec React Query dans une application à grande échelle?",
            answer: "Pour optimiser React Query dans une application à grande échelle: 1) Ajustez staleTime et gcTime (cacheTime avant la v5) en fonction des besoins de fraîcheur des données. 2) Utilisez des queryKeys structurées pour une meilleure organisation et invalidation ciblée. 3) Implémentez la pagination ou les requêtes infinies pour les grandes listes. 4) Utilisez select pour transformer et filtrer les données côté client. 5) Préchargez les données importantes avec prefetchQuery. 6) Utilisez placeholderData ou initialData pour éviter les états de chargement. 7) Implémentez des sélecteurs partiels pour éviter les re-rendus inutiles. 8) Utilisez placeholderData: keepPreviousData (l'option keepPreviousData a été supprimée en v5) pour les transitions de page fluides. 9) Profitez du partage structurel (structuralSharing, activé par défaut) pour limiter les re-rendus. 10) Utilisez suspense pour une meilleure UX pendant le chargement. 11) Optimisez la taille du cache avec removeQueries pour les données non essentielles. 12) Utilisez des queryFilters précis pour l'invalidation.",
            difficulty: "hard",
            tags: ["React Query", "Performance", "Scaling"]
          },
          {
            question: "Comment tester des composants qui utilisent React Query?",
            answer: "Pour tester des composants utilisant React Query: 1) Configurez un QueryClient de test: `const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });` 2) Enveloppez vos composants dans un QueryClientProvider: `render(<QueryClientProvider client={queryClient}><Component /></QueryClientProvider>);` 3) Mockez les fonctions de requête: `jest.mock('../api', () => ({ fetchTodos: jest.fn() }));` 4) Préremplissez le cache pour les tests qui n'ont pas besoin de tester le chargement: `queryClient.setQueryData(['todos'], mockTodos);` 5) Utilisez waitFor pour attendre la résolution des requêtes: `await waitFor(() => expect(screen.getByText('Todo 1')).toBeInTheDocument());` 6) Testez les différents états (chargement, erreur, succès): `fetchTodos.mockRejectedValueOnce(new Error('Failed to fetch'));` 7) Pour les mutations, utilisez des mocks et vérifiez les appels: `expect(addTodo).toHaveBeenCalledWith({ title: 'New Todo' });` 8) Réinitialisez le queryClient entre les tests: `queryClient.clear();` 9) Utilisez des outils comme msw pour mocker les requêtes HTTP au niveau du réseau.",
            difficulty: "medium",
            tags: ["React Query", "Testing"]
          },
          {
            question: "Comment React Query s'intègre-t-il avec d'autres solutions de gestion d'état comme Redux ou Zustand?",
            answer: "React Query peut coexister et s'intégrer avec d'autres solutions de gestion d'état comme Redux ou Zustand: 1) Séparation des responsabilités: Utilisez React Query pour l'état serveur (données d'API) et Redux/Zustand pour l'état client (préférences utilisateur, état UI). 2) Synchronisation avec Redux: Utilisez onSuccess dans useMutation pour dispatcher des actions Redux: `onSuccess: (data) => { dispatch(addTodoSuccess(data)); }` 3) Utilisation des données de Redux dans queryFn: `queryFn: () => fetchData(store.getState().auth.token)` 4) Persistance du cache React Query dans Redux: Créez un middleware personnalisé. 5) Avec Zustand: Créez des hooks personnalisés qui combinent les deux: `const useTodos = () => { const token = useAuthStore(state => state.token); return useQuery({ queryKey: ['todos', token], queryFn: () => fetchTodos(token) }); }` 6) Invalidation basée sur l'état global: `useEffect(() => { if (authStore.isLoggedOut) queryClient.clear(); }, [authStore.isLoggedOut]);` Cette approche hybride permet d'exploiter les forces de chaque bibliothèque.",
            difficulty: "hard",
            tags: ["React Query", "Integration", "Architecture"]
          }
        ]}
      />
    </div>
  );
}
