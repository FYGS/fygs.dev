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
import { useState } from "react";

// Demo components for Render Props pattern
function MouseTracker({ render }: { render: (state: { x: number; y: number }) => React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div 
      className="border rounded-md p-4 h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      onMouseMove={handleMouseMove}
    >
      {render(mousePosition)}
    </div>
  );
}

function MouseTrackerDemo() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">
        Déplacez votre souris dans la zone ci-dessous:
      </p>
      <MouseTracker
        render={({ x, y }) => (
          <div className="text-center">
            <div className="text-sm font-medium">Position de la souris:</div>
            <div className="text-sm">
              X: <span className="font-mono">{x}</span>, Y: <span className="font-mono">{y}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

// Toggle component using render props
function Toggle({ 
  render, 
  initialState = false 
}: { 
  render: (state: { on: boolean; toggle: () => void }) => React.ReactNode;
  initialState?: boolean;
}) {
  const [on, setOn] = useState(initialState);
  
  const toggle = () => setOn(!on);
  
  return render({ on, toggle });
}

function ToggleDemo() {
  return (
    <div className="space-y-4">
      <Toggle
        render={({ on, toggle }) => (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggle}
              className={`w-16 h-8 rounded-full p-1 transition-colors ${
                on ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                  on ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
            <div className="text-sm">
              État: <span className="font-medium">{on ? "Activé" : "Désactivé"}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export function RenderPropsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Render Props Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet de partager du code entre composants React en utilisant une prop dont la valeur est une fonction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le pattern Render Props est une technique pour partager du code entre composants React en utilisant une prop dont la valeur est une fonction qui retourne un élément React.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Réutilisabilité</Badge>
            <Badge>Composition</Badge>
            <Badge>Inversion de Contrôle</Badge>
            <Badge>Séparation des Préoccupations</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Implémentation du Pattern Render Props"
        description="Comment créer un composant avec le pattern Render Props"
        code={`import React, { useState } from 'react';

// 1. Composant qui utilise le pattern Render Props
function MouseTracker({ render }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  // 2. Appel de la fonction render avec l'état comme argument
  return (
    <div onMouseMove={handleMouseMove} style={{ height: '200px', border: '1px solid #ccc' }}>
      {render(mousePosition)}
    </div>
  );
}

// 3. Utilisation du composant avec une render prop
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          <h1>Déplacez votre souris!</h1>
          <p>Position actuelle: ({x}, {y})</p>
        </div>
      )}
    />
  );
}

// 4. Variante avec la prop "children" comme fonction
function MouseTracker2({ children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ height: '200px', border: '1px solid #ccc' }}>
      {children(mousePosition)}
    </div>
  );
}

// 5. Utilisation avec children comme fonction
function App2() {
  return (
    <MouseTracker2>
      {({ x, y }) => (
        <div>
          <h1>Déplacez votre souris!</h1>
          <p>Position actuelle: ({x}, {y})</p>
        </div>
      )}
    </MouseTracker2>
  );
}

// 6. Avec TypeScript
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (position: MousePosition) => React.ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ height: '200px', border: '1px solid #ccc' }}>
      {render(mousePosition)}
    </div>
  );
}`}
        demo={<MouseTrackerDemo />}
        explanation={
          <div>
            <p>
              Le pattern Render Props est une technique puissante pour partager du code entre composants React. Il consiste à passer une fonction comme prop à un composant, qui l&apos;appellera avec ses données internes pour déterminer ce qu&apos;il doit rendre.
            </p>
            <p className="mt-3">
              Les principes clés du pattern Render Props sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Inversion de contrôle</strong>: Le composant délègue une partie de son rendu à la fonction fournie par l&apos;utilisateur.
              </li>
              <li>
                <strong>Séparation des préoccupations</strong>: La logique d&apos;état est séparée de la logique de rendu.
              </li>
              <li>
                <strong>Réutilisabilité</strong>: La même logique d&apos;état peut être utilisée avec différentes interfaces utilisateur.
              </li>
              <li>
                <strong>Composition</strong>: Permet de composer facilement des comportements complexes.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé un composant <code>MouseTracker</code> qui:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Suit la position de la souris et maintient cet état</li>
              <li>Expose ces données via une fonction <code>render</code></li>
              <li>Permet à l&apos;utilisateur de décider comment afficher ces données</li>
            </ul>
            <p className="mt-3">
              Il existe deux variantes principales du pattern Render Props:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Utiliser une prop nommée (généralement <code>render</code>)</li>
              <li>Utiliser la prop <code>children</code> comme fonction</li>
            </ul>
            <p className="mt-3">
              Ce pattern était très populaire avant l&apos;introduction des Hooks dans React, mais reste utile dans certains cas, notamment lorsque vous avez besoin de partager une logique complexe qui implique à la fois l&apos;état et le rendu.
            </p>
          </div>
        }
        tips={[
          "Utilisez des noms explicites pour vos props de rendu (render, children, etc.)",
          "Évitez de créer des fonctions anonymes dans le rendu pour éviter des rendus inutiles",
          "Combinez avec React.memo pour optimiser les performances",
          "Utilisez TypeScript pour typer correctement les arguments de la fonction de rendu"
        ]}
        interviewQuestions={[
          {
            question: "Quelle est la différence entre le pattern Render Props et les HOCs (Higher-Order Components)?",
            answer: "Les deux patterns permettent de partager du code entre composants, mais de manière différente: 1) Render Props: Utilise une fonction passée comme prop pour partager la logique. Le composant appelle cette fonction avec ses données internes. Avantages: Plus explicite, évite les collisions de noms de props, plus facile à déboguer. 2) HOCs: Fonction qui prend un composant et retourne un nouveau composant enrichi. Enveloppe le composant original. Avantages: Syntaxe plus concise pour l'utilisation, peut être appliqué plusieurs fois. Les Render Props sont généralement plus flexibles et transparents, tandis que les HOCs peuvent être plus concis mais peuvent causer des problèmes de collision de props et sont moins transparents dans le débogage. Avec l'introduction des Hooks, ces deux patterns sont moins nécessaires pour le partage de logique d'état simple.",
            difficulty: "medium",
            tags: ["React", "Patterns", "Comparison"]
          },
          {
            question: "Comment éviter les problèmes de performance avec le pattern Render Props?",
            answer: "Pour optimiser les performances avec le pattern Render Props: 1) Évitez de définir la fonction de rendu inline dans le JSX, car cela crée une nouvelle fonction à chaque rendu. Définissez-la en dehors du rendu ou mémorisez-la avec useCallback. 2) Utilisez React.memo pour éviter les rendus inutiles du composant qui reçoit la render prop. 3) Décomposez les composants complexes en plus petits composants pour limiter l'étendue des re-rendus. 4) Si la fonction de rendu accède à des props ou à un état qui change fréquemment, envisagez d'utiliser useMemo pour mémoriser le résultat. 5) Utilisez des outils comme React DevTools Profiler pour identifier les goulots d'étranglement. 6) Pour les listes, assurez-vous d'utiliser correctement les clés (keys). 7) Considérez l'utilisation de useRef pour les valeurs qui ne devraient pas déclencher de re-rendus lorsqu'elles changent.",
            difficulty: "hard",
            tags: ["React", "Performance", "Optimization"]
          }
        ]}
      />
      
      <CodeExample
        title="Exemple Avancé: Composant Toggle avec Render Props"
        description="Implémentation d'un composant Toggle réutilisable avec le pattern Render Props"
        code={`import React, { useState } from 'react';

// Interface pour les props du composant Toggle
interface ToggleProps {
  initialOn?: boolean;
  onToggle?: (on: boolean) => void;
  render: (state: { on: boolean; toggle: () => void }) => React.ReactNode;
}

// Composant Toggle avec le pattern Render Props
function Toggle({ initialOn = false, onToggle, render }: ToggleProps) {
  const [on, setOn] = useState(initialOn);
  
  const toggle = () => {
    const newState = !on;
    setOn(newState);
    onToggle?.(newState);
  };
  
  // Appel de la fonction render avec l'état et les actions
  return render({ on, toggle });
}

// Utilisation du composant Toggle
function App() {
  return (
    <div>
      <h1>Exemple de Toggle avec Render Props</h1>
      
      {/* Exemple 1: Toggle basique */}
      <Toggle
        render={({ on, toggle }) => (
          <div>
            <button onClick={toggle}>
              {on ? 'ON' : 'OFF'}
            </button>
            <p>L'état est: {on ? 'activé' : 'désactivé'}</p>
          </div>
        )}
      />
      
      {/* Exemple 2: Toggle stylisé */}
      <Toggle
        initialOn={true}
        onToggle={(state) => console.log('Toggle changed to:', state)}
        render={({ on, toggle }) => (
          <div className="toggle-container">
            <div 
              className={\`toggle \${on ? 'toggle-on' : 'toggle-off'}\`}
              onClick={toggle}
            >
              <div className="toggle-button" />
            </div>
            <p>Cliquez sur le toggle pour changer son état</p>
          </div>
        )}
      />
      
      {/* Exemple 3: Réutilisation pour un cas différent */}
      <Toggle
        render={({ on, toggle }) => (
          <div>
            <button onClick={toggle}>
              {on ? 'Masquer' : 'Afficher'} les détails
            </button>
            {on && (
              <div className="details">
                <p>Voici les détails supplémentaires qui peuvent être affichés ou masqués.</p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

// Variante avec une API plus flexible
interface ToggleState {
  on: boolean;
  toggle: () => void;
}

interface FlexibleToggleProps {
  initialOn?: boolean;
  onToggle?: (on: boolean) => void;
  children: (state: ToggleState) => React.ReactNode;
}

function FlexibleToggle({ initialOn = false, onToggle, children }: FlexibleToggleProps) {
  const [on, setOn] = useState(initialOn);
  
  const toggle = () => {
    const newState = !on;
    setOn(newState);
    onToggle?.(newState);
  };
  
  return children({ on, toggle });
}

// Utilisation de la variante flexible
function FlexibleExample() {
  return (
    <FlexibleToggle>
      {({ on, toggle }) => (
        <button onClick={toggle}>
          {on ? 'ON' : 'OFF'}
        </button>
      )}
    </FlexibleToggle>
  );
}`}
        demo={<ToggleDemo />}
        explanation={
          <div>
            <p>
              Cet exemple avancé montre comment créer un composant <code>Toggle</code> réutilisable en utilisant le pattern Render Props. Ce composant encapsule la logique d&apos;état d&apos;un interrupteur (on/off) tout en laissant l&apos;utilisateur décider comment le représenter visuellement.
            </p>
            <p className="mt-3">
              Points clés de cette implémentation:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>API flexible</strong>: Le composant accepte des options comme <code>initialOn</code> et <code>onToggle</code> pour personnaliser son comportement.
              </li>
              <li>
                <strong>Séparation des préoccupations</strong>: La logique d&apos;état (le toggle) est séparée de la présentation (le rendu).
              </li>
              <li>
                <strong>Réutilisabilité</strong>: Le même composant peut être utilisé pour différents cas d&apos;utilisation (bouton simple, interrupteur stylisé, affichage/masquage de contenu).
              </li>
              <li>
                <strong>Contrôle inversé</strong>: L&apos;utilisateur du composant a un contrôle total sur le rendu, tandis que le composant gère l&apos;état.
              </li>
              <li>
                <strong>Variantes d&apos;API</strong>: Le composant peut être implémenté avec une prop <code>render</code> ou en utilisant <code>children</code> comme fonction.
              </li>
            </ol>
            <p className="mt-3">
              Avantages de cette approche:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Vous pouvez réutiliser la même logique d&apos;état avec différentes interfaces utilisateur</li>
              <li>Vous pouvez composer facilement plusieurs comportements</li>
              <li>L&apos;utilisateur a un contrôle total sur le rendu</li>
              <li>Le composant reste simple et concentré sur une seule responsabilité</li>
            </ul>
            <p className="mt-3">
              Ce pattern est particulièrement utile pour les composants d&apos;interface utilisateur qui ont un comportement complexe mais dont l&apos;apparence peut varier considérablement selon le contexte d&apos;utilisation.
            </p>
          </div>
        }
        tips={[
          "Utilisez des valeurs par défaut pour les props optionnelles",
          "Exposez des callbacks comme onToggle pour permettre aux composants parents de réagir aux changements",
          "Considérez l'utilisation de children comme fonction pour une API plus intuitive",
          "Documentez clairement la structure des données passées à la fonction de rendu"
        ]}
        interviewQuestions={[
          {
            question: "Comment combineriez-vous le pattern Render Props avec les Hooks React?",
            answer: "La combinaison des Render Props avec les Hooks offre une grande flexibilité: 1) Créez des hooks personnalisés pour encapsuler la logique d'état: Par exemple, un hook useToggle qui gère l'état on/off. 2) Utilisez ces hooks dans un composant avec Render Props: Le composant utilise le hook pour la logique et expose les données via une render prop. 3) Exemple concret: `function useToggle(initialState = false) { const [on, setOn] = useState(initialState); const toggle = () => setOn(!on); return { on, toggle }; }` puis `function Toggle({ render }) { const { on, toggle } = useToggle(); return render({ on, toggle }); }`. 4) Pour des cas plus complexes, vous pouvez utiliser useReducer pour gérer un état plus sophistiqué. 5) Les hooks comme useCallback sont utiles pour optimiser les fonctions passées à la render prop. Cette approche combine le meilleur des deux mondes: la réutilisabilité de la logique avec les hooks et la flexibilité de rendu avec les render props.",
            difficulty: "medium",
            tags: ["React", "Hooks", "Pattern Composition"]
          },
          {
            question: "Quels sont les cas d'utilisation où le pattern Render Props est préférable aux Hooks?",
            answer: "Bien que les Hooks aient remplacé de nombreux cas d'utilisation des Render Props, ces dernières restent préférables dans certains scénarios: 1) Lorsque la logique implique à la fois l'état ET le rendu: Les Hooks sont excellents pour partager la logique d'état, mais si vous avez besoin de contrôler également des aspects du rendu (comme avec un portail React ou un composant qui manipule le DOM directement), les Render Props peuvent être plus appropriées. 2) Pour les bibliothèques de composants: Les Render Props offrent une API plus stable et explicite pour les bibliothèques publiques. 3) Pour les composants qui nécessitent un accès au cycle de vie du rendu: Par exemple, mesurer des éléments DOM après le rendu. 4) Pour les patterns de composition complexes: Lorsque vous avez besoin de composer plusieurs comportements avec un contrôle précis sur leur ordre et leur interaction. 5) Pour les composants qui gèrent des ressources externes avec un cycle de vie complexe: Comme les connexions WebSocket ou les abonnements à des événements système. Les Render Props brillent particulièrement dans les situations où vous avez besoin d'un contrôle fin sur le processus de rendu tout en partageant une logique complexe.",
            difficulty: "hard",
            tags: ["React", "Architecture", "Design Decisions"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur le Pattern Render Props"
        questions={[
          {
            question: "Expliquez le pattern Render Props et ses avantages.",
            answer: "Le pattern Render Props est une technique de partage de code entre composants React où une prop (généralement nommée 'render' ou utilisant 'children') est une fonction qui retourne un élément React. Le composant appelle cette fonction avec ses données internes pour déterminer ce qu'il doit rendre. Avantages: 1) Réutilisabilité: Permet de réutiliser la même logique avec différentes interfaces utilisateur. 2) Séparation des préoccupations: Sépare la logique d'état de la logique de rendu. 3) Composition: Facilite la composition de comportements complexes. 4) Inversion de contrôle: Donne à l'utilisateur un contrôle total sur le rendu. 5) Transparence: Rend explicite le flux de données, facilitant le débogage. 6) Évite les problèmes de collision de props des HOCs. 7) Permet un accès direct aux props sans avoir à les faire passer à travers plusieurs niveaux. Ce pattern est particulièrement utile pour les composants qui encapsulent des comportements complexes comme la gestion de formulaires, le suivi de la souris, ou les animations.",
            difficulty: "medium",
            tags: ["React", "Design Patterns"]
          },
          {
            question: "Quelles sont les différentes façons d'implémenter le pattern Render Props?",
            answer: "Il existe plusieurs façons d'implémenter le pattern Render Props: 1) Prop 'render': La plus explicite, où une prop nommée 'render' est une fonction: `<DataProvider render={data => <div>{data.message}</div>} />`. 2) Prop 'children' comme fonction: Utilise la prop spéciale 'children' comme fonction: `<DataProvider>{data => <div>{data.message}</div>}</DataProvider>`. 3) Autres props nommées: N'importe quelle prop peut être une fonction de rendu: `<DataProvider content={data => <div>{data.message}</div>} />`. 4) Render Props partielles: Où seulement une partie du rendu est déléguée: `<List items={items} renderItem={item => <ListItem {...item} />} />`. 5) Render Props avec état: Où la fonction reçoit à la fois des données et des fonctions pour modifier l'état: `<Toggle render={({ on, toggle }) => <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>} />`. 6) Render Props composées: Composition de plusieurs composants avec render props: `<Mouse>{mouse => <Cat mouse={mouse} />}</Mouse>`. Chaque approche a ses avantages selon le contexte d'utilisation.",
            difficulty: "medium",
            tags: ["React", "Implementation", "API Design"]
          },
          {
            question: "Comment le pattern Render Props a-t-il évolué avec l'introduction des Hooks dans React?",
            answer: "L'évolution du pattern Render Props avec l'introduction des Hooks: 1) Diminution de l'utilisation: Les Hooks ont simplifié le partage de logique d'état, réduisant le besoin de Render Props pour de nombreux cas d'usage simples. Par exemple, `useMousePosition` remplace facilement un composant `<MouseTracker render={...} />`. 2) Coexistence: Les deux patterns peuvent coexister et se compléter. Les Hooks gèrent la logique d'état, tandis que les Render Props peuvent gérer les aspects de rendu complexes. 3) Hooks personnalisés avec Render Props: Des hooks peuvent retourner des fonctions de rendu ou être utilisés dans des composants avec Render Props. 4) Optimisation: Les Hooks comme useCallback aident à optimiser les fonctions passées aux Render Props. 5) Cas d'usage spécialisés: Les Render Props restent pertinentes pour des cas spécifiques comme les portails, les mesures DOM, ou les bibliothèques de composants. 6) Simplification: Les implémentations de Render Props sont souvent plus simples et plus ciblées qu'avant. 7) Composition: Les deux patterns peuvent être composés pour créer des APIs puissantes et flexibles. Cette évolution montre comment différents patterns peuvent coexister et se compléter plutôt que de se remplacer complètement.",
            difficulty: "hard",
            tags: ["React", "Hooks", "Evolution"]
          },
          {
            question: "Décrivez un cas concret où vous avez utilisé le pattern Render Props et pourquoi c'était la meilleure solution.",
            answer: "Cas concret d'utilisation du pattern Render Props: Pour un tableau de données complexe avec des fonctionnalités avancées (tri, filtrage, pagination, sélection de lignes), j'ai créé un composant `<DataTable>` qui utilisait le pattern Render Props. Pourquoi c'était la meilleure solution: 1) Flexibilité de rendu: Chaque projet avait des besoins de présentation différents, mais la même logique de gestion des données. 2) Complexité de l'état: Le tableau gérait un état complexe (données filtrées, triées, paginées, sélectionnées) que je ne voulais pas dupliquer. 3) Personnalisation fine: Les utilisateurs avaient besoin de personnaliser chaque aspect du tableau (cellules, en-têtes, pieds de page, actions). 4) Composition: Le composant devait s'intégrer avec d'autres composants comme des menus contextuels ou des formulaires d'édition. Implémentation: `<DataTable data={data} render={({ sortedData, sortBy, filter, page, selected, toggleSelection }) => (...)}/>`. Alternatives considérées: Les HOCs étaient trop rigides, les props standards trop limitées, et les Hooks seuls ne suffisaient pas pour la personnalisation du rendu. Cette approche a permis de créer une bibliothèque de tableaux hautement réutilisable et adaptable à différents projets.",
            difficulty: "medium",
            tags: ["React", "Real-world", "Case Study"]
          }
        ]}
      />
    </div>
  );
}
