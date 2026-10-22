"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";

// Define the props that will be injected by the HOC
interface WithCounterProps {
  count: number;
  increment: () => void;
}

// Demo component for HOC pattern
function withCounter<P extends object>(
  WrappedComponent: React.ComponentType<P & WithCounterProps>
) {
  // The returned component accepts props without count and increment
  // since those will be provided by the HOC
  return function WithCounter(props: Omit<P, keyof WithCounterProps>) {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);

    // Cast props to P to satisfy TypeScript
    return (
      <WrappedComponent {...(props as P)} count={count} increment={increment} />
    );
  };
}

function SimpleCounter({
  count,
  increment,
}: {
  count: number;
  increment: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-2xl font-bold">{count}</div>
      <button
        onClick={increment}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Increment
      </button>
    </div>
  );
}

const EnhancedCounter = withCounter(SimpleCounter);

function HOCDemo() {
  return (
    <div className="p-4 border rounded-md bg-gray-900 flex justify-center">
      <EnhancedCounter />
    </div>
  );
}

export function HOCSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Higher-Order Components (HOC) Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet de réutiliser la logique des composants en les
            enveloppant dans des fonctions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le pattern Higher-Order Component (HOC) est une technique avancée
            dans React pour réutiliser la logique des composants. Un HOC est une
            fonction qui prend un composant et retourne un nouveau composant
            avec des fonctionnalités supplémentaires.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Réutilisabilité</Badge>
            <Badge>Séparation des Préoccupations</Badge>
            <Badge>Composition</Badge>
            <Badge>Décoration</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="Implémentation du Pattern Higher-Order Component"
        description="Comment créer un HOC pour ajouter des fonctionnalités à un composant existant"
        code={`import React, { useState } from 'react';

// 1. Définition du HOC
function withCounter(WrappedComponent) {
  // 2. Création du composant amélioré
  function WithCounter(props) {
    // 3. Ajout d'un état local
    const [count, setCount] = useState(0);

    // 4. Ajout de fonctionnalités
    const increment = () => setCount(count + 1);

    // 5. Rendu du composant original avec les nouvelles props
    return (
      <WrappedComponent
        count={count}
        increment={increment}
        {...props} // Passer les props originales
      />
    );
  }

  // 6. Définir un nom d'affichage pour faciliter le débogage
  WithCounter.displayName = \`WithCounter(\${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })\`;

  // 7. Retourner le nouveau composant
  return WithCounter;
}

// 8. Composant de base
function Button({ count, increment, label }) {
  return (
    <button onClick={increment}>
      {label}: {count}
    </button>
  );
}

// 9. Utilisation du HOC
const ButtonWithCounter = withCounter(Button);

// 10. Utilisation du composant amélioré
function App() {
  return (
    <div>
      <ButtonWithCounter label="Clicks" />
      <ButtonWithCounter label="Taps" />
    </div>
  );
}

// 11. Avec TypeScript (version typée à utiliser À LA PLACE du withCounter
// ci-dessus : une fonction ne peut pas être déclarée deux fois)
interface WithCounterProps {
  count: number;
  increment: () => void;
}

function withCounter<P extends object>(
  WrappedComponent: React.ComponentType<P & WithCounterProps>
): React.FC<Omit<P, keyof WithCounterProps>> {
  function WithCounter(props: Omit<P, keyof WithCounterProps>) {
    const [count, setCount] = useState(0);
    const increment = () => setCount(count + 1);

    return (
      <WrappedComponent
        {...(props as P)}
        count={count}
        increment={increment}
      />
    );
  }

  WithCounter.displayName = \`WithCounter(\${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })\`;

  return WithCounter;
}`}
        demo={<HOCDemo />}
        explanation={
          <div>
            <p>
              Le pattern Higher-Order Component (HOC) est une technique avancée
              dans React pour réutiliser la logique des composants. Un HOC est
              une fonction qui prend un composant et retourne un nouveau
              composant avec des fonctionnalités supplémentaires.
            </p>
            <p className="mt-3">Les principes clés du pattern HOC sont:</p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Composition</strong>: Les HOCs utilisent la composition
                plutôt que l&apos;héritage pour étendre les fonctionnalités.
              </li>
              <li>
                <strong>Séparation des préoccupations</strong>: Les HOCs
                permettent de séparer la logique réutilisable de la logique de
                rendu.
              </li>
              <li>
                <strong>Convention de nommage</strong>: Par convention, les HOCs
                commencent par &quot;with&quot; (ex: withCounter, withData).
              </li>
              <li>
                <strong>Transparence des props</strong>: Un bon HOC transmet
                toutes les props non liées à sa fonctionnalité au composant
                enveloppé.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé un HOC{" "}
              <code>withCounter</code> qui:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Ajoute un état <code>count</code> et une fonction{" "}
                <code>increment</code> au composant
              </li>
              <li>Passe ces nouvelles props au composant enveloppé</li>
              <li>
                Transmet toutes les props originales avec <code>...props</code>
              </li>
              <li>
                Définit un nom d&apos;affichage pour faciliter le débogage
              </li>
            </ul>
            <p className="mt-3">
              Ce pattern était très populaire avant l&apos;introduction des
              Hooks dans React, mais reste utile dans certains cas, notamment
              pour envelopper des composants avec des fonctionnalités
              transversales comme l&apos;authentification, les permissions, ou
              la gestion des thèmes.
            </p>
          </div>
        }
        tips={[
          "Utilisez la composition de HOCs pour combiner plusieurs fonctionnalités",
          "Transmettez toujours les props non utilisées au composant enveloppé",
          "Définissez un displayName pour faciliter le débogage",
          "Avec TypeScript, utilisez des génériques pour préserver le typage des props",
        ]}
        interviewQuestions={[
          {
            question:
              "Quels sont les avantages et les inconvénients des HOCs par rapport aux Hooks?",
            answer:
              "Avantages des HOCs: 1) Permettent d'envelopper des composants entiers, y compris des composants de classe. 2) Peuvent modifier le comportement de rendu du composant. 3) Établissent une relation claire entre le conteneur et le contenu. 4) Peuvent intercepter et modifier les props. Inconvénients des HOCs: 1) Problèmes de collision de noms de props si plusieurs HOCs utilisent les mêmes noms. 2) Difficulté à suivre la provenance des props injectées (elles n'apparaissent pas là où le composant est utilisé). 3) Complexité accrue de l'arbre de composants (wrapper hell). 4) Difficulté à typer correctement avec TypeScript. Les Hooks offrent une alternative plus simple et plus directe pour la réutilisation de logique, sans modifier l'arbre de composants, mais sont limités aux composants fonctionnels et ne peuvent pas modifier le comportement de rendu de la même manière que les HOCs.",
            difficulty: "medium",
            tags: ["React", "Patterns", "Hooks"],
          },
          {
            question:
              "Comment résoudre le problème de collision de noms de props avec les HOCs?",
            answer:
              "Pour résoudre le problème de collision de noms de props avec les HOCs: 1) Préfixage des props: Ajoutez un préfixe spécifique à chaque HOC (ex: withCounter ajoute counterCount et counterIncrement). 2) Namespace des props: Regroupez les props liées dans un objet (ex: counter: { count, increment }). 3) Props Renaming: Permettez à l'utilisateur de renommer les props via des options (ex: withCounter({ propName: 'clickCount' })). 4) Composition avec Recompose: Des bibliothèques comme Recompose proposaient des utilitaires pour cela, mais elles ne sont plus maintenues. 5) Utilisation de Symbol comme clés de props pour garantir l'unicité (moins courant). 6) Documentation claire: Documentez bien les props ajoutées par chaque HOC. 7) Ordre de composition: Soyez attentif à l'ordre dans lequel vous composez les HOCs, car cela peut affecter quelles props sont écrasées. Ces techniques permettent d'éviter les collisions tout en maintenant la flexibilité des HOCs.",
            difficulty: "hard",
            tags: ["React", "Advanced", "Best Practices"],
          },
        ]}
      />

      <InterviewQuestions
        title="Questions d'Entretien sur le Pattern Higher-Order Component"
        questions={[
          {
            question:
              "Expliquez le pattern Higher-Order Component et quand l'utiliser.",
            answer:
              "Un Higher-Order Component (HOC) est une fonction qui prend un composant et retourne un nouveau composant avec des fonctionnalités supplémentaires. C'est un pattern basé sur la composition plutôt que l'héritage. Utilisez les HOCs quand: 1) Vous avez besoin de partager la même logique entre plusieurs composants. 2) Vous voulez ajouter des fonctionnalités transversales comme l'authentification, la journalisation, ou la gestion des permissions. 3) Vous devez manipuler les props avant qu'elles n'atteignent le composant. 4) Vous souhaitez abstraire l'accès à des API ou services externes. 5) Vous avez besoin de modifier le comportement de rendu d'un composant. Les exemples courants incluent connect() de React Redux, withRouter de React Router v5 (supprimé en v6), ou withStyles de Material-UI v4 (API legacy). Ce pattern est particulièrement utile pour les préoccupations transversales qui ne sont pas directement liées à la logique métier du composant.",
            difficulty: "medium",
            tags: ["React", "Design Patterns"],
          },
          {
            question:
              "Comment implémenteriez-vous un HOC withAuthentication qui redirige les utilisateurs non authentifiés?",
            answer:
              "Implémentation d'un HOC withAuthentication: 1) Créer une fonction qui prend un composant en paramètre: `function withAuthentication(WrappedComponent) {...}`. 2) À l'intérieur, créer un nouveau composant qui vérifie l'état d'authentification: `function WithAuthentication(props) {...}`. 3) Dans ce composant, vérifier si l'utilisateur est authentifié: `const isAuthenticated = checkAuthStatus();`. 4) Si l'utilisateur est authentifié, rendre le composant d'origine avec ses props: `return <WrappedComponent {...props} />;`. 5) Sinon, rediriger vers la page de connexion: `if (!isAuthenticated) { return <Navigate to='/login' />; }`. 6) Pour plus de flexibilité, accepter des options: `withAuthentication(Component, { redirectTo: '/custom-login' })`. 7) Ajouter des fonctionnalités supplémentaires comme l'injection des informations utilisateur: `return <WrappedComponent {...props} currentUser={user} />;`. 8) Définir un displayName pour le débogage: `WithAuthentication.displayName = `WithAuthentication(${getComponentName(WrappedComponent)})`;`. Cette implémentation protège les routes sensibles et évite la duplication de code de vérification d'authentification.",
            difficulty: "medium",
            tags: ["React", "Authentication", "Implementation"],
          },
          {
            question:
              "Comment les HOCs s'intègrent-ils avec les autres patterns React comme les Render Props et les Hooks?",
            answer:
              "Intégration des HOCs avec d'autres patterns React: 1) HOCs et Render Props: Ces patterns peuvent être combinés. Un HOC peut utiliser le pattern Render Props en interne, et inversement, un composant avec Render Props peut être enveloppé par un HOC. Par exemple: `const EnhancedDataFetcher = withErrorBoundary(DataFetcher)` où DataFetcher utilise des render props. 2) HOCs et Hooks: Les Hooks ont largement remplacé les HOCs pour la logique d'état simple, mais ils peuvent coexister. Un HOC peut utiliser des Hooks en interne (si c'est un composant fonctionnel). On peut aussi créer des HOCs à partir de Hooks: `const withCounter = Component => props => { const [count, increment] = useCounter(); return <Component {...props} count={count} increment={increment} />; }`. 3) Patterns hybrides: On peut créer des abstractions qui combinent ces patterns selon les besoins. 4) Migration: Les HOCs peuvent faciliter la migration progressive vers les Hooks en encapsulant la logique existante. Cette flexibilité permet de choisir le pattern le plus adapté à chaque situation tout en maintenant l'interopérabilité.",
            difficulty: "hard",
            tags: ["React", "Pattern Composition", "Advanced"],
          },
          {
            question:
              "Quels sont les pièges courants lors de l'utilisation des HOCs et comment les éviter?",
            answer:
              "Pièges courants des HOCs et solutions: 1) Collision de props: Plusieurs HOCs peuvent écraser les mêmes noms de props. Solution: Préfixer les props ou utiliser des namespaces. 2) Perte du displayName: Rend le débogage difficile. Solution: Définir explicitement WithHOC.displayName = `WithHOC(${WrappedComponent.displayName})`. 3) Wrapper Hell: Trop de HOCs créent un arbre de composants profond. Solution: Composer les HOCs avec compose() ou utiliser des Hooks quand possible. 4) Perte des refs: Les refs ne sont pas automatiquement transmises. Solution: Utiliser React.forwardRef. 5) Perte des méthodes statiques: Les méthodes statiques du composant original ne sont pas copiées. Solution: Copier manuellement les méthodes ou utiliser hoist-non-react-statics. 6) Problèmes avec les props immuables: Modification directe des props. Solution: Créer de nouvelles références pour les objets et tableaux. 7) Ordre de composition important: L'ordre d'application des HOCs peut affecter le comportement. Solution: Documenter les dépendances et l'ordre recommandé. 8) Difficulté de test: Les composants sont enveloppés dans plusieurs couches. Solution: Exporter aussi les composants non enveloppés pour les tests.",
            difficulty: "hard",
            tags: ["React", "Anti-patterns", "Debugging"],
          },
        ]}
      />
    </div>
  );
}
