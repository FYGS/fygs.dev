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
import { createContext, useContext, useState } from "react";

// Demo components for Compound Components pattern
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>({
  activeTab: "",
  setActiveTab: () => {},
});

function TabsDemo() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <Tabs activeTab={activeTab} onChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4 border rounded-md mt-2">
          <h3 className="font-medium">Account Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account information
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4 border rounded-md mt-2">
          <h3 className="font-medium">Password Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your password
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4 border rounded-md mt-2">
          <h3 className="font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your preferences
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function Tabs({
  children,
  activeTab,
  onChange,
}: {
  children: React.ReactNode;
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: onChange }}>
      <div className="space-y-2">{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex space-x-1 border-b">
      {children}
    </div>
  );
}

function TabsTrigger({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      className={`px-3 py-2 text-sm font-medium ${
        isActive
          ? "border-b-2 border-primary text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div>{children}</div>;
}

export function CompoundComponentsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Compound Components Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet de créer des composants avec une API flexible et intuitive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le pattern Compound Components permet de créer des composants qui travaillent ensemble pour former une interface cohérente, tout en offrant une grande flexibilité dans leur composition.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Flexibilité</Badge>
            <Badge>Composition</Badge>
            <Badge>API Intuitive</Badge>
            <Badge>Context API</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Implémentation du Pattern Compound Components"
        description="Comment créer un composant Tabs avec le pattern Compound Components"
        code={`import React, { createContext, useContext, useState } from 'react';

// 1. Créer un contexte pour partager l'état entre les composants
const TabsContext = createContext(null);

// 2. Composant parent qui fournit le contexte
function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Valeur partagée via le contexte
  const value = {
    activeTab,
    setActiveTab
  };
  
  return (
    <TabsContext.Provider value={value}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// 3. Composant pour la liste des onglets
function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

// 4. Composant pour un onglet individuel
function TabsTrigger({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      className={\`tab \${isActive ? 'active' : ''}\`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// 5. Composant pour le contenu d'un onglet
function TabsContent({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  // Ne rendre le contenu que si cet onglet est actif
  if (value !== activeTab) return null;
  
  return <div className="tab-content">{children}</div>;
}

// 6. Exporter les composants comme propriétés du composant principal
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

// 7. Utilisation du composant
function App() {
  return (
    <Tabs defaultTab="account">
      <Tabs.List>
        <Tabs.Trigger value="account">Mon compte</Tabs.Trigger>
        <Tabs.Trigger value="password">Mot de passe</Tabs.Trigger>
        <Tabs.Trigger value="settings">Paramètres</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="account">
        <h2>Paramètres du compte</h2>
        <p>Gérez vos informations personnelles</p>
      </Tabs.Content>
      
      <Tabs.Content value="password">
        <h2>Sécurité</h2>
        <p>Mettez à jour votre mot de passe</p>
      </Tabs.Content>
      
      <Tabs.Content value="settings">
        <h2>Préférences</h2>
        <p>Personnalisez votre expérience</p>
      </Tabs.Content>
    </Tabs>
  );
}

// 8. Avec TypeScript, vous pouvez typer le contexte et les props
// (version typée à utiliser À LA PLACE de la déclaration de l'étape 1 :
// TabsContext ne doit être déclaré qu'une seule fois)
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a Tabs component');
  }
  return context;
}`}
        demo={<TabsDemo />}
        explanation={
          <div>
            <p>
              Le pattern Compound Components est une technique puissante pour créer des composants React complexes avec une API intuitive et flexible. Ce pattern utilise la composition de composants et le Context API pour partager l&apos;état entre les sous-composants.
            </p>
            <p className="mt-3">
              Les principes clés du pattern Compound Components sont:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Composition</strong>: Les composants sont conçus pour être utilisés ensemble, formant une interface cohérente.
              </li>
              <li>
                <strong>État partagé</strong>: Les composants partagent un état commun via Context API, sans avoir à passer des props à travers plusieurs niveaux.
              </li>
              <li>
                <strong>API intuitive</strong>: L&apos;API ressemble à la structure HTML, ce qui la rend facile à comprendre et à utiliser.
              </li>
              <li>
                <strong>Encapsulation</strong>: La logique interne est encapsulée, mais l&apos;utilisateur garde le contrôle sur la structure et la composition.
              </li>
            </ol>
            <p className="mt-3">
              Dans l&apos;exemple ci-dessus, nous avons créé un composant Tabs qui utilise le pattern Compound Components:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Le composant <code>Tabs</code> gère l&apos;état et le fournit via Context</li>
              <li>Les sous-composants (<code>TabsList</code>, <code>TabsTrigger</code>, <code>TabsContent</code>) consomment ce contexte</li>
              <li>L&apos;utilisateur peut composer ces composants librement, tout en maintenant leur fonctionnalité coordonnée</li>
            </ul>
            <p className="mt-3">
              Ce pattern est particulièrement utile pour les composants d&apos;interface utilisateur complexes comme les onglets, les accordéons, les menus déroulants, et autres composants qui ont plusieurs parties interactives.
            </p>
          </div>
        }
        tips={[
          "Utilisez le Context API pour partager l'état entre les composants",
          "Exportez les sous-composants comme propriétés du composant principal pour une meilleure découvrabilité",
          "Créez un hook personnalisé pour accéder au contexte et vérifier qu'il est utilisé correctement",
          "Utilisez TypeScript pour typer le contexte et les props pour une meilleure sécurité de type"
        ]}
        interviewQuestions={[
          {
            question: "Quels sont les avantages du pattern Compound Components par rapport à l'utilisation de props?",
            answer: "Le pattern Compound Components offre plusieurs avantages par rapport à l'utilisation de props traditionnelles: 1) Flexibilité: L'utilisateur a un contrôle total sur la structure et l'ordre des composants. 2) API intuitive: L'API ressemble à la structure HTML, ce qui la rend plus facile à comprendre. 3) Moins de prop drilling: L'état est partagé via Context, évitant de passer des props à travers plusieurs niveaux. 4) Encapsulation: La logique interne reste encapsulée tout en offrant une grande flexibilité. 5) Extensibilité: Facile d'ajouter de nouveaux sous-composants sans modifier l'API existante. 6) Meilleure séparation des préoccupations: Chaque sous-composant a une responsabilité claire. Ce pattern est particulièrement utile pour les composants complexes avec plusieurs parties interactives.",
            difficulty: "medium",
            tags: ["React", "Patterns", "Context API"]
          },
          {
            question: "Comment implémenteriez-vous un composant Select avec le pattern Compound Components?",
            answer: "Pour implémenter un composant Select avec le pattern Compound Components: 1) Créer un contexte pour partager l'état: `const SelectContext = createContext()` qui contiendra la valeur sélectionnée, la fonction pour changer cette valeur, et l'état ouvert/fermé. 2) Créer le composant principal `Select` qui gère l'état et fournit le contexte. 3) Créer les sous-composants: `Select.Trigger` pour afficher la valeur sélectionnée et ouvrir/fermer le menu, `Select.Options` comme conteneur pour les options, et `Select.Option` pour chaque option individuelle. 4) Utiliser le contexte dans chaque sous-composant pour accéder à l'état partagé. 5) Exporter les sous-composants comme propriétés du composant principal: `Select.Trigger = SelectTrigger`. L'API ressemblerait à: `<Select value={value} onChange={setValue}><Select.Trigger /><Select.Options><Select.Option value=\"option1\">Option 1</Select.Option>...</Select.Options></Select>`.",
            difficulty: "hard",
            tags: ["React", "Implementation", "UI Components"]
          }
        ]}
      />
      
      <CodeExample
        title="Exemple Avancé: Composant Accordion"
        description="Implémentation d'un composant Accordion avec le pattern Compound Components"
        code={`import React, { createContext, useContext, useState } from 'react';

// Contexte pour l'Accordion
const AccordionContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordionContext must be used within an Accordion');
  }
  return context;
}

// Contexte pour chaque Item
const AccordionItemContext = createContext(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('useAccordionItemContext must be used within an AccordionItem');
  }
  return context;
}

// Composant principal
function Accordion({ children, type = 'single', defaultValue, onChange }) {
  const [expandedItems, setExpandedItems] = useState(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  );

  const toggleItem = (itemValue) => {
    if (type === 'single') {
      // Mode single: un seul item peut être ouvert à la fois
      const newExpandedItems = expandedItems[0] === itemValue ? [] : [itemValue];
      setExpandedItems(newExpandedItems);
      onChange?.(newExpandedItems[0] || null);
    } else {
      // Mode multiple: plusieurs items peuvent être ouverts
      const newExpandedItems = expandedItems.includes(itemValue)
        ? expandedItems.filter(value => value !== itemValue)
        : [...expandedItems, itemValue];
      setExpandedItems(newExpandedItems);
      onChange?.(newExpandedItems);
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// Composant Item
function AccordionItem({ children, value }) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <div className="accordion-item">{children}</div>
    </AccordionItemContext.Provider>
  );
}

// Composant Trigger (en-tête cliquable)
function AccordionTrigger({ children }) {
  const { toggleItem } = useAccordionContext();
  const { value, isExpanded } = useAccordionItemContext();

  return (
    <button
      className={\`accordion-trigger \${isExpanded ? 'expanded' : ''}\`}
      onClick={() => toggleItem(value)}
      aria-expanded={isExpanded}
    >
      {children}
      <ChevronIcon className={\`chevron \${isExpanded ? 'expanded' : ''}\`} />
    </button>
  );
}

// Composant Content (contenu de l'accordéon)
function AccordionContent({ children }) {
  const { isExpanded } = useAccordionItemContext();

  if (!isExpanded) return null;

  return <div className="accordion-content">{children}</div>;
}

// Icône Chevron
function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Attacher les sous-composants au composant principal
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

// Utilisation
function App() {
  return (
    <Accordion type="single" defaultValue="item-1">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Section 1</Accordion.Trigger>
        <Accordion.Content>
          <p>Contenu de la section 1</p>
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Section 2</Accordion.Trigger>
        <Accordion.Content>
          <p>Contenu de la section 2</p>
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Section 3</Accordion.Trigger>
        <Accordion.Content>
          <p>Contenu de la section 3</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}`}
        explanation={
          <div>
            <p>
              Cet exemple avancé montre comment implémenter un composant Accordion complet en utilisant le pattern Compound Components. L&apos;Accordion est un cas d&apos;utilisation parfait pour ce pattern car il a une structure hiérarchique claire avec plusieurs parties interactives.
            </p>
            <p className="mt-3">
              Points clés de cette implémentation:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Contextes imbriqués</strong>: Nous utilisons deux niveaux de contexte - un pour l&apos;Accordion global et un pour chaque AccordionItem.
              </li>
              <li>
                <strong>Hooks personnalisés</strong>: Des hooks comme <code>useAccordionContext</code> et <code>useAccordionItemContext</code> améliorent l&apos;expérience développeur et fournissent des messages d&apos;erreur utiles.
              </li>
              <li>
                <strong>Modes multiples</strong>: L&apos;Accordion supporte deux modes - &apos;single&apos; (un seul item ouvert à la fois) et &apos;multiple&apos; (plusieurs items peuvent être ouverts).
              </li>
              <li>
                <strong>Accessibilité</strong>: L&apos;implémentation inclut des attributs ARIA comme <code>aria-expanded</code> pour l&apos;accessibilité.
              </li>
              <li>
                <strong>API non contrôlée avec notification</strong>: l&apos;Accordion gère son état en interne à partir de <code>defaultValue</code> et notifie l&apos;utilisateur des changements via <code>onChange</code> (pour un mode réellement contrôlé, il faudrait ajouter une prop <code>value</code>).
              </li>
            </ol>
            <p className="mt-3">
              Cette implémentation offre une grande flexibilité tout en maintenant une API intuitive. L&apos;utilisateur peut:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Choisir entre les modes &apos;single&apos; et &apos;multiple&apos;</li>
              <li>Définir quels items sont ouverts par défaut</li>
              <li>Écouter les changements d&apos;état</li>
              <li>Personnaliser l&apos;apparence et le contenu de chaque partie</li>
              <li>Structurer les composants selon ses besoins</li>
            </ul>
          </div>
        }
        tips={[
          "Utilisez des contextes imbriqués pour les composants complexes avec plusieurs niveaux",
          "Créez des hooks personnalisés pour chaque contexte avec des messages d'erreur utiles",
          "Supportez à la fois les modes contrôlé et non contrôlé pour plus de flexibilité",
          "N'oubliez pas l'accessibilité en incluant les attributs ARIA appropriés"
        ]}
        interviewQuestions={[
          {
            question: "Quels sont les défis potentiels lors de l'utilisation du pattern Compound Components?",
            answer: "Le pattern Compound Components présente plusieurs défis: 1) Complexité accrue: L'implémentation est plus complexe que les composants traditionnels avec props. 2) Courbe d'apprentissage: Les développeurs peuvent ne pas être familiers avec ce pattern. 3) Typage TypeScript: Typer correctement les contextes imbriqués et les sous-composants peut être complexe. 4) Performance: L'utilisation excessive du Context API peut affecter les performances si mal implémentée. 5) Testabilité: Tester les sous-composants individuellement peut être plus difficile car ils dépendent du contexte. 6) Flexibilité vs Contraintes: Trouver le bon équilibre entre offrir de la flexibilité et imposer des contraintes nécessaires. 7) Réutilisation: Les sous-composants sont fortement couplés au composant parent, limitant leur réutilisation. Pour surmonter ces défis, utilisez des hooks personnalisés, documentez bien l'API, et créez des tests d'intégration complets.",
            difficulty: "hard",
            tags: ["React", "Patterns", "Challenges"]
          },
          {
            question: "Comment combiner le pattern Compound Components avec d'autres patterns comme Render Props ou Custom Hooks?",
            answer: "Vous pouvez combiner le pattern Compound Components avec d'autres patterns pour créer des composants encore plus puissants: 1) Avec Render Props: Utilisez render props dans vos sous-composants pour offrir plus de flexibilité. Par exemple: `<Tabs.Content renderContent={(isActive) => isActive ? <YourContent /> : null} />`. 2) Avec Custom Hooks: Exposez la logique interne via des hooks personnalisés que les utilisateurs peuvent utiliser pour créer leurs propres sous-composants. Par exemple: `const { activeTab, setActiveTab } = useTabs()` peut être utilisé en dehors de la structure Compound Components. 3) Avec HOCs: Enveloppez vos sous-composants dans des HOCs pour ajouter des fonctionnalités supplémentaires. 4) Avec State Reducer: Permettez aux utilisateurs de personnaliser la logique d'état en fournissant un reducer personnalisé. Cette combinaison de patterns offre une API très flexible et puissante, permettant aux utilisateurs de choisir le niveau d'abstraction qui leur convient.",
            difficulty: "hard",
            tags: ["React", "Advanced", "Pattern Composition"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur le Pattern Compound Components"
        questions={[
          {
            question: "Expliquez le pattern Compound Components et quand l'utiliser.",
            answer: "Le pattern Compound Components est une technique de conception React où plusieurs composants travaillent ensemble pour créer une fonctionnalité cohérente, tout en partageant un état implicite via Context API. Ce pattern est similaire à la façon dont les éléments HTML comme <select> et <option> fonctionnent ensemble. Les composants principaux sont: 1) Un composant parent qui gère l'état et le fournit via Context. 2) Des sous-composants qui consomment ce contexte et remplissent des rôles spécifiques. Ce pattern est idéal quand: 1) Vous avez un composant complexe avec plusieurs parties interactives (onglets, accordéons, menus déroulants). 2) Vous voulez offrir une API flexible et intuitive. 3) Vous souhaitez éviter le prop drilling. 4) Vous voulez donner aux utilisateurs un contrôle sur la structure tout en maintenant la fonctionnalité coordonnée. Des exemples courants sont les composants d'interface utilisateur comme Tabs, Accordion, Select, Menu, etc.",
            difficulty: "medium",
            tags: ["React", "Design Patterns"]
          },
          {
            question: "Comparez le pattern Compound Components avec d'autres patterns comme Render Props et HOCs.",
            answer: "Comparaison des patterns React: 1) Compound Components: Utilise Context pour partager l'état entre des composants liés. Avantages: API intuitive, structure déclarative, évite le prop drilling. Inconvénients: Moins flexible pour la personnalisation profonde, composants fortement couplés. 2) Render Props: Passe une fonction comme prop qui retourne un élément React. Avantages: Très flexible, séparation claire entre logique et UI, réutilisable. Inconvénients: Peut mener à l'enfer des callbacks imbriqués, moins intuitif. 3) HOCs: Fonctions qui prennent un composant et retournent un nouveau composant enrichi. Avantages: Réutilisables, composables, séparation des préoccupations. Inconvénients: Problèmes de nommage des props, difficulté de débogage, moins populaires avec les hooks. 4) Custom Hooks: Extraient la logique d'état dans des fonctions réutilisables. Avantages: Composables, faciles à tester, séparation claire. Inconvénients: Limités à la logique, ne gèrent pas directement le rendu. Choisissez Compound Components pour des composants d'UI complexes avec structure intuitive, Render Props/HOCs pour une personnalisation maximale, et Custom Hooks pour la réutilisation de logique d'état.",
            difficulty: "hard",
            tags: ["React", "Patterns", "Comparison"]
          },
          {
            question: "Comment gérer l'accessibilité dans un composant utilisant le pattern Compound Components?",
            answer: "Pour gérer l'accessibilité dans un composant utilisant le pattern Compound Components: 1) Attributs ARIA intégrés: Incluez les attributs ARIA appropriés dans vos sous-composants. Par exemple, pour un Accordion: `aria-expanded`, `aria-controls`, `aria-labelledby`. 2) Gestion du focus: Implémentez une gestion correcte du focus, particulièrement pour les composants interactifs comme les menus et les dialogues. 3) Support clavier: Assurez-vous que tous les composants sont utilisables au clavier. Par exemple, pour un menu déroulant: touches flèches pour naviguer, Entrée pour sélectionner, Échap pour fermer. 4) Contexte d'accessibilité: Créez un contexte dédié à l'accessibilité ou incluez des propriétés d'accessibilité dans votre contexte principal. 5) IDs générés: Générez automatiquement des IDs uniques pour les relations ARIA (useId hook). 6) Documentation: Documentez clairement les exigences d'accessibilité pour les utilisateurs de votre composant. 7) Tests: Utilisez des outils comme axe ou jest-axe pour tester l'accessibilité. 8) Composants spécialisés: Créez des sous-composants dédiés à l'accessibilité comme `VisuallyHidden` pour le texte accessible uniquement aux lecteurs d'écran.",
            difficulty: "hard",
            tags: ["Accessibility", "A11y", "ARIA"]
          },
          {
            question: "Comment tester un composant qui utilise le pattern Compound Components?",
            answer: "Pour tester efficacement un composant utilisant le pattern Compound Components: 1) Tests d'intégration: Testez le composant complet avec tous ses sous-composants pour vérifier leur interaction. Utilisez React Testing Library pour tester le comportement plutôt que l'implémentation. 2) Tests de sous-composants: Testez chaque sous-composant individuellement en mockant le contexte: `const mockContext = { value: 'test', onChange: jest.fn() }; <MyContext.Provider value={mockContext}><Component /></MyContext.Provider>`. 3) Tests d'accessibilité: Vérifiez que les attributs ARIA sont correctement appliqués et que le composant est utilisable au clavier. 4) Tests de snapshot: Capturez l'état du composant dans différentes configurations. 5) Tests de comportement: Vérifiez que le composant réagit correctement aux interactions utilisateur (clics, saisies, etc.). 6) Tests de cas limites: Testez des scénarios comme des données manquantes ou des utilisations incorrectes. 7) Tests de performance: Pour les composants complexes, vérifiez qu'ils ne causent pas de rendus inutiles. 8) Helpers de test: Créez des fonctions utilitaires pour simplifier la configuration des tests.",
            difficulty: "medium",
            tags: ["Testing", "React Testing Library", "Jest"]
          }
        ]}
      />
    </div>
  );
}
