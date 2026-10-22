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

export function ReduxSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Redux</CardTitle>
          <CardDescription>
            Une bibliothèque de gestion d&apos;état prévisible pour les applications JavaScript
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Redux est une bibliothèque populaire pour gérer l&apos;état global d&apos;une application de manière prévisible, avec un flux de données unidirectionnel et des mises à jour immuables.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Single Store</Badge>
            <Badge>Immutable Updates</Badge>
            <Badge>Middleware</Badge>
            <Badge>DevTools</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Configuration de base de Redux"
        description="Comment configurer un store Redux avec Redux Toolkit"
        code={`// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import todosReducer from './todosSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

// counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;

// App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Counter from './Counter';
import TodoList from './TodoList';

function App() {
  return (
    <Provider store={store}>
      <div>
        <h1>Redux Toolkit Example</h1>
        <Counter />
        <TodoList />
      </div>
    </Provider>
  );
}

// Counter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              Redux est une bibliothèque de gestion d&apos;état qui suit le pattern Flux, avec un flux de données unidirectionnel. Redux Toolkit (RTK) est la méthode officielle recommandée pour écrire la logique Redux.
            </p>
            <p className="mt-3">
              Les concepts clés de Redux sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Store</strong>: Un objet qui contient l&apos;état global de l&apos;application.
              </li>
              <li>
                <strong>Actions</strong>: Des objets qui décrivent ce qui s&apos;est passé dans l&apos;application.
              </li>
              <li>
                <strong>Reducers</strong>: Des fonctions pures qui spécifient comment l&apos;état de l&apos;application change en réponse aux actions.
              </li>
              <li>
                <strong>Dispatch</strong>: La méthode pour envoyer des actions au store.
              </li>
              <li>
                <strong>Selectors</strong>: Des fonctions qui extraient des parties spécifiques de l&apos;état.
              </li>
            </ol>
            <p className="mt-3">
              Redux Toolkit simplifie l&apos;utilisation de Redux avec:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><code>configureStore</code>: Configure le store avec des defaults sensés</li>
              <li><code>createSlice</code>: Génère automatiquement les actions et les reducers</li>
              <li><code>createAsyncThunk</code>: Simplifie la gestion des actions asynchrones</li>
              <li>Immer intégré pour des mises à jour immuables plus simples</li>
            </ul>
          </div>
        }
        tips={[
          "Utilisez Redux Toolkit plutôt que Redux vanilla pour réduire le boilerplate",
          "Organisez votre état en 'slices' pour une meilleure séparation des préoccupations",
          "Utilisez les DevTools Redux pour déboguer l'état et les actions",
          "Normalisez vos données pour éviter la duplication et faciliter les mises à jour"
        ]}
        interviewQuestions={[
          {
            question: "Quels sont les principes fondamentaux de Redux?",
            answer: "Redux repose sur trois principes fondamentaux: 1) Source unique de vérité: L'état de toute l'application est stocké dans un seul arbre d'objets dans un seul store. 2) L'état est en lecture seule: Le seul moyen de modifier l'état est d'émettre une action, un objet décrivant ce qui s'est passé. 3) Les changements sont effectués par des fonctions pures: Les reducers sont des fonctions pures qui prennent l'état précédent et une action, et retournent le nouvel état. Ces principes garantissent que l'état est prévisible et traçable, facilitant le débogage et les tests.",
            difficulty: "easy",
            tags: ["Redux", "Fondamentaux"]
          },
          {
            question: "Expliquez la différence entre Redux et Redux Toolkit.",
            answer: "Redux Toolkit (RTK) est la méthode officielle recommandée pour écrire la logique Redux. Les principales différences sont: 1) Réduction du boilerplate: RTK réduit considérablement le code répétitif avec des fonctions comme createSlice. 2) Configuration simplifiée: configureStore configure automatiquement les DevTools, les middlewares courants, et combine les reducers. 3) Immer intégré: RTK utilise Immer pour permettre une syntaxe de 'mutation' qui produit en réalité des mises à jour immuables. 4) Gestion des actions asynchrones: createAsyncThunk simplifie la gestion des opérations asynchrones. 5) Normalisation des données: createEntityAdapter facilite la gestion des collections d'entités. RTK offre une expérience de développement plus agréable tout en conservant les principes fondamentaux de Redux.",
            difficulty: "medium",
            tags: ["Redux", "Redux Toolkit", "Comparaison"]
          }
        ]}
      />
      
      <CodeExample
        title="Gestion des Actions Asynchrones avec Redux Toolkit"
        description="Utilisation de createAsyncThunk pour gérer les appels API"
        code={`// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from './api';

// Création d'une action asynchrone
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.fetchAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Création d'une autre action asynchrone avec paramètres
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.fetchById(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    entities: [],
    selectedUser: null,
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducers synchrones ici
    userSelected(state, action) {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Gestion des états pour fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.entities = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })
      // Gestion des états pour fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export const { userSelected } = userSlice.actions;
export default userSlice.reducer;

// UserList.jsx - Utilisation dans un composant
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, fetchUserById, userSelected } from './userSlice';

function UserList() {
  const dispatch = useDispatch();
  const { entities, selectedUser, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleUserClick = (userId) => {
    dispatch(fetchUserById(userId));
  };

  if (loading === 'pending') {
    return <div>Loading...</div>;
  }

  if (loading === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {entities.map((user) => (
          <li key={user.id} onClick={() => handleUserClick(user.id)}>
            {user.name}
          </li>
        ))}
      </ul>
      {selectedUser && (
        <div>
          <h3>Selected User</h3>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
        </div>
      )}
    </div>
  );
}`}
        explanation={
          <div>
            <p>
              La gestion des opérations asynchrones est un aspect crucial des applications modernes. Redux Toolkit simplifie considérablement ce processus avec <code>createAsyncThunk</code>.
            </p>
            <p className="mt-3">
              <code>createAsyncThunk</code> génère automatiquement trois types d&apos;actions:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><code>pending</code>: Dispatché lorsque l&apos;opération asynchrone commence</li>
              <li><code>fulfilled</code>: Dispatché lorsque l&apos;opération réussit</li>
              <li><code>rejected</code>: Dispatché lorsque l&apos;opération échoue</li>
            </ul>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>Créé deux thunks asynchrones pour récupérer des utilisateurs</li>
              <li>Défini un état initial avec des champs pour suivre le statut de chargement</li>
              <li>Utilisé <code>extraReducers</code> avec le builder pattern pour gérer les différents états des actions asynchrones</li>
              <li>Implémenté un composant qui dispatche les actions et affiche les données</li>
            </ol>
            <p className="mt-3">
              Ce pattern permet une gestion robuste des opérations asynchrones, avec un suivi clair de l&apos;état de chargement et des erreurs, tout en maintenant la prévisibilité de Redux.
            </p>
          </div>
        }
        tips={[
          "Utilisez rejectWithValue pour renvoyer des données d'erreur personnalisées",
          "Gérez différents états de chargement (idle, pending, succeeded, failed) pour une meilleure UX",
          "Considérez RTK Query pour les cas d'utilisation d'API plus complexes",
          "Utilisez le second paramètre de createAsyncThunk pour accéder à getState et dispatch"
        ]}
        interviewQuestions={[
          {
            question: "Comparez les différentes approches pour gérer les actions asynchrones dans Redux.",
            answer: "Il existe plusieurs approches pour gérer les actions asynchrones dans Redux: 1) Redux Thunk: Middleware le plus simple qui permet aux action creators de retourner des fonctions au lieu d'objets. Ces fonctions peuvent effectuer des opérations asynchrones et dispatcher d'autres actions. 2) Redux Saga: Utilise les générateurs JavaScript pour gérer les effets secondaires de manière plus déclarative. Offre un contrôle plus fin sur les flux asynchrones complexes, mais avec une courbe d'apprentissage plus raide. 3) Redux Observable: Basé sur RxJS, utilise des observables pour créer des flux d'actions réactifs. Puissant pour des opérations complexes comme l'annulation, la limitation de débit, etc. 4) createAsyncThunk de Redux Toolkit: Simplifie l'approche Thunk en générant automatiquement les actions pending/fulfilled/rejected et en gérant les erreurs. 5) RTK Query: Solution complète pour la récupération et la mise en cache de données, avec invalidation automatique et dédoublonnage des requêtes.",
            difficulty: "hard",
            tags: ["Redux", "Async", "Middleware"]
          },
          {
            question: "Comment optimiseriez-vous les performances d'une application Redux?",
            answer: "Pour optimiser les performances d'une application Redux: 1) Utilisez des sélecteurs mémoïsés avec Reselect pour éviter des calculs inutiles. 2) Normalisez votre état pour éviter les duplications et faciliter les mises à jour. 3) Utilisez React.memo, useMemo et useCallback pour éviter les re-rendus inutiles. 4) Implémentez une logique de 'shallow equality' dans mapStateToProps ou useSelector. 5) Profitez du batching automatique de React 18 (les mises à jour déclenchées par plusieurs dispatch successifs sont regroupées en un seul rendu). 6) Évitez de stocker des données dérivées dans le store; calculez-les avec des sélecteurs. 7) Pour les grandes listes, utilisez la virtualisation (react-window, react-virtualized). 8) Utilisez l'immutabilité structurelle pour des comparaisons rapides. 9) Pour les applications plus petites, des alternatives plus légères comme Zustand peuvent suffire.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur Redux"
        questions={[
          {
            question: "Quand devriez-vous utiliser Redux dans une application React?",
            answer: "Vous devriez envisager d'utiliser Redux lorsque: 1) Votre application a un état complexe partagé entre de nombreux composants. 2) L'état de l'application change fréquemment. 3) La logique pour mettre à jour l'état est complexe. 4) L'application a une taille moyenne à grande avec de nombreux contributeurs. 5) Vous avez besoin d'un historique des changements d'état pour le débogage. 6) Vous avez besoin de persistance et de restauration faciles de l'état. Redux n'est pas toujours nécessaire pour les petites applications ou lorsque l'état peut être géré efficacement avec useState, useReducer et Context API. Comme le dit Dan Abramov, co-créateur de Redux: 'Ne l'utilisez pas à moins que vous n'en ayez besoin'.",
            difficulty: "medium",
            tags: ["Redux", "Use Cases"]
          },
          {
            question: "Expliquez le flux de données unidirectionnel dans Redux.",
            answer: "Le flux de données unidirectionnel dans Redux suit un cycle strict: 1) L'utilisateur interagit avec l'interface utilisateur, déclenchant un événement. 2) Le composant dispatche une action (objet JavaScript avec un type et éventuellement un payload). 3) Le store transmet l'action au reducer. 4) Le reducer, fonction pure, calcule le nouvel état en fonction de l'état précédent et de l'action. 5) Le store met à jour son état avec la valeur retournée par le reducer. 6) Les composants abonnés au store sont notifiés du changement d'état. 7) Les composants re-rendent avec le nouvel état. Ce flux unidirectionnel rend les changements d'état prévisibles et traçables, facilitant le débogage et les tests. Il garantit également que l'état ne peut être modifié que par des actions explicites.",
            difficulty: "easy",
            tags: ["Redux", "Fondamentaux"]
          },
          {
            question: "Comment Redux Toolkit résout-il les problèmes courants de Redux?",
            answer: "Redux Toolkit résout plusieurs problèmes courants de Redux: 1) Boilerplate excessif: createSlice génère automatiquement les action creators et les reducers. 2) Configuration complexe: configureStore simplifie la configuration avec des defaults sensés. 3) Immutabilité verbeuse: Immer permet d'écrire des 'mutations' qui produisent des mises à jour immuables. 4) Actions asynchrones complexes: createAsyncThunk simplifie la gestion des opérations asynchrones. 5) Normalisation manuelle: createEntityAdapter facilite la gestion des collections d'entités. 6) Sélecteurs non optimisés: createSelector intègre la mémoisation. 7) DevTools difficiles à configurer: activés par défaut. 8) Middleware verbeux: thunk intégré et configuration simplifiée. 9) Typage TypeScript complexe: types générés automatiquement. RTK offre une expérience de développement plus agréable tout en conservant les principes fondamentaux de Redux.",
            difficulty: "medium",
            tags: ["Redux", "Redux Toolkit"]
          },
          {
            question: "Comment implémenteriez-vous un middleware personnalisé dans Redux?",
            answer: "Pour implémenter un middleware personnalisé dans Redux: 1) Créez une fonction qui retourne une fonction qui prend store en paramètre, qui retourne une fonction qui prend next en paramètre, qui retourne une fonction qui prend action en paramètre: `const myMiddleware = store => next => action => { /* logique ici */ };` 2) Avant d'appeler next(action), vous pouvez exécuter du code qui s'exécutera avant que l'action n'atteigne le reducer. 3) Après avoir appelé next(action), vous pouvez exécuter du code qui s'exécutera après que l'action ait été traitée par le reducer. 4) Vous pouvez accéder à l'état actuel avec store.getState() et dispatcher d'autres actions avec store.dispatch(). 5) Vous pouvez transformer l'action, l'annuler (en ne appelant pas next), ou en dispatcher plusieurs. Exemple de middleware de journalisation: `const loggerMiddleware = store => next => action => { console.log('dispatching', action); const result = next(action); console.log('next state', store.getState()); return result; };` 6) Ajoutez-le à votre store: `configureStore({ reducer, middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware) });`",
            difficulty: "hard",
            tags: ["Redux", "Middleware", "Advanced"]
          }
        ]}
      />
    </div>
  );
}
