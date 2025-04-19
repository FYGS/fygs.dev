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

// Demo components for Controlled Components pattern
function ControlledInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border rounded-md w-full"
    />
  );
}

function UncontrolledInput({ defaultValue, onChange }: { defaultValue?: string; onChange?: (value: string) => void }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="px-3 py-2 border rounded-md w-full"
    />
  );
}

function ControlledComponentsDemo() {
  const [controlledValue, setControlledValue] = useState("");
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Composant Contrôlé</h3>
        <ControlledInput value={controlledValue} onChange={setControlledValue} />
        <p className="text-sm text-muted-foreground">
          Valeur actuelle: <span className="font-mono">{controlledValue || '""'}</span>
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Composant Non-Contrôlé</h3>
        <UncontrolledInput 
          defaultValue="Valeur initiale" 
          onChange={(value) => console.log("Valeur changée:", value)} 
        />
        <p className="text-sm text-muted-foreground">
          La valeur est gérée par le DOM, pas par React
        </p>
      </div>
    </div>
  );
}

export function ControlledComponentsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Controlled Components Pattern</CardTitle>
          <CardDescription>
            Un pattern qui permet de contrôler l&apos;état d&apos;un composant depuis son parent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Le pattern Controlled Components est une technique où l&apos;état d&apos;un composant est entièrement contrôlé par son parent via les props, plutôt que géré en interne par le composant lui-même.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Contrôle</Badge>
            <Badge>Prévisibilité</Badge>
            <Badge>Synchronisation</Badge>
            <Badge>Validation</Badge>
          </div>
        </CardContent>
      </Card>
      
      <CodeExample
        title="Implémentation du Pattern Controlled Components"
        description="Comment créer et utiliser des composants contrôlés et non contrôlés"
        code={`import React, { useState } from 'react';

// 1. Composant contrôlé
function ControlledInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value} // La valeur est fournie par le parent
      onChange={(e) => onChange(e.target.value)} // Les changements sont remontés au parent
    />
  );
}

// 2. Utilisation d'un composant contrôlé
function ParentComponent() {
  const [inputValue, setInputValue] = useState('');
  
  // Le parent a un contrôle total sur la valeur
  const handleChange = (newValue) => {
    // Possibilité de valider ou transformer la valeur
    if (newValue.length <= 10) {
      setInputValue(newValue);
    }
  };
  
  return (
    <div>
      <ControlledInput value={inputValue} onChange={handleChange} />
      <p>Vous avez saisi: {inputValue}</p>
    </div>
  );
}

// 3. Composant non contrôlé
function UncontrolledInput({ defaultValue, onChange }) {
  // La valeur est gérée par le DOM, pas par React
  return (
    <input
      type="text"
      defaultValue={defaultValue} // Valeur initiale seulement
      onChange={(e) => onChange?.(e.target.value)} // Notification des changements (optionnel)
    />
  );
}

// 4. Utilisation d'un composant non contrôlé
function AnotherParentComponent() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Accès à la valeur via une référence au DOM
    const form = e.target;
    const inputValue = form.elements.uncontrolledInput.value;
    console.log('Valeur soumise:', inputValue);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <UncontrolledInput 
        name="uncontrolledInput"
        defaultValue="Valeur initiale" 
        onChange={(value) => console.log('Changement:', value)} 
      />
      <button type="submit">Soumettre</button>
    </form>
  );
}

// 5. Composant qui supporte les deux modes
function FlexibleInput({ 
  value, 
  defaultValue, 
  onChange 
}) {
  const isControlled = value !== undefined;
  
  return (
    <input
      type="text"
      {...(isControlled 
        ? { value, onChange: (e) => onChange(e.target.value) }
        : { defaultValue, onChange: (e) => onChange?.(e.target.value) }
      )}
    />
  );
}`}
        demo={<ControlledComponentsDemo />}
        explanation={
          <div>
            <p>
              Le pattern Controlled Components est une technique fondamentale dans React qui détermine comment l&apos;état d&apos;un composant est géré. Il existe deux approches principales:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Composants Contrôlés</strong>: L&apos;état est entièrement géré par le composant parent via les props.
              </li>
              <li>
                <strong>Composants Non Contrôlés</strong>: L&apos;état est géré en interne par le composant lui-même ou par le DOM.
              </li>
            </ol>
            <p className="mt-3">
              Les caractéristiques des composants contrôlés sont:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>La valeur actuelle est passée via une prop (généralement <code>value</code>)</li>
              <li>Les changements sont notifiés au parent via un callback (généralement <code>onChange</code>)</li>
              <li>Le parent a un contrôle total sur la valeur et peut la valider, la transformer ou la rejeter</li>
              <li>L&apos;état est toujours synchronisé entre le parent et l&apos;enfant</li>
            </ul>
            <p className="mt-3">
              Les caractéristiques des composants non contrôlés sont:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>La valeur initiale peut être définie via une prop (généralement <code>defaultValue</code>)</li>
              <li>L&apos;état est géré par le DOM ou en interne par le composant</li>
              <li>Le parent peut être notifié des changements mais ne peut pas les contrôler directement</li>
              <li>L&apos;accès à la valeur actuelle se fait généralement via des références (refs) au DOM</li>
            </ul>
            <p className="mt-3">
              Chaque approche a ses avantages:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Contrôlé</strong>: Plus prévisible, facilite la validation, permet la synchronisation avec d&apos;autres parties de l&apos;UI</li>
              <li><strong>Non contrôlé</strong>: Plus simple pour des cas basiques, moins de code, meilleures performances dans certains cas</li>
            </ul>
            <p className="mt-3">
              Dans la pratique, les composants de formulaire comme les inputs, selects, et textareas sont souvent implémentés pour supporter les deux modes, offrant ainsi une flexibilité maximale.
            </p>
          </div>
        }
        tips={[
          "Préférez les composants contrôlés pour les formulaires complexes nécessitant validation et synchronisation",
          "Utilisez des composants non contrôlés pour les cas simples où la performance est critique",
          "Documentez clairement si votre composant est contrôlé, non contrôlé, ou supporte les deux modes",
          "Pour les composants flexibles, vérifiez si value est undefined pour déterminer le mode"
        ]}
        interviewQuestions={[
          {
            question: "Quelle est la différence entre un composant contrôlé et un composant non contrôlé?",
            answer: "Différences entre composants contrôlés et non contrôlés: 1) Gestion de l'état: Les composants contrôlés sont pilotés par l'état React du parent via les props (value + onChange), tandis que les composants non contrôlés gèrent leur état en interne ou via le DOM. 2) Flux de données: Les composants contrôlés suivent un flux de données unidirectionnel (parent → enfant → notification → parent), alors que les non contrôlés ont un flux plus direct (DOM → composant). 3) Contrôle: Les composants contrôlés permettent au parent de valider, transformer ou rejeter les changements, ce qui n'est pas possible avec les non contrôlés. 4) Accès à la valeur: Pour les contrôlés, la valeur est toujours disponible dans l'état du parent; pour les non contrôlés, il faut utiliser des refs ou attendre un événement comme submit. 5) Performance: Les non contrôlés peuvent être plus performants car ils génèrent moins de rendus React. 6) Complexité: Les contrôlés nécessitent plus de code mais offrent plus de contrôle; les non contrôlés sont plus simples mais moins flexibles. 7) Cas d'usage: Contrôlés pour les formulaires complexes avec validation, non contrôlés pour les cas simples ou les intégrations avec des bibliothèques tierces.",
            difficulty: "medium",
            tags: ["React", "Forms", "Fundamentals"]
          },
          {
            question: "Comment implémenteriez-vous un composant de formulaire qui supporte à la fois le mode contrôlé et non contrôlé?",
            answer: "Pour implémenter un composant supportant les deux modes: 1) Détection du mode: `const isControlled = props.value !== undefined;` 2) Gestion de l'état interne pour le mode non contrôlé: `const [internalValue, setInternalValue] = useState(props.defaultValue || '');` 3) Utilisation conditionnelle des props: `const value = isControlled ? props.value : internalValue;` 4) Gestion des changements: `const handleChange = (e) => { const newValue = e.target.value; if (!isControlled) setInternalValue(newValue); props.onChange?.(newValue); };` 5) Rendu du composant: `<input value={value} onChange={handleChange} />` 6) Gestion des refs: `const inputRef = useRef(null); useImperativeHandle(ref, () => ({ get value() { return value; }, set value(newValue) { if (!isControlled) setInternalValue(newValue); }, focus: () => inputRef.current?.focus() }));` 7) Documentation claire: Documenter les props supportées dans chaque mode. 8) Validation des props: Avertir si des props incompatibles sont utilisées ensemble. Cette approche permet aux utilisateurs de choisir le mode qui convient le mieux à leur cas d'utilisation tout en maintenant une API cohérente.",
            difficulty: "hard",
            tags: ["React", "Implementation", "API Design"]
          }
        ]}
      />
      
      <InterviewQuestions
        title="Questions d'Entretien sur les Controlled Components"
        questions={[
          {
            question: "Pourquoi les composants contrôlés sont-ils généralement préférés pour les formulaires React?",
            answer: "Les composants contrôlés sont généralement préférés pour les formulaires React pour plusieurs raisons: 1) Validation instantanée: Ils permettent de valider les entrées à chaque frappe et d'afficher immédiatement des messages d'erreur. 2) Conditionnement des champs: Facilite l'activation/désactivation ou l'affichage conditionnel de champs basés sur d'autres valeurs. 3) Formatage à la volée: Permet de formater les entrées pendant la saisie (ex: formatage de numéros de téléphone). 4) Soumission contrôlée: Donne un contrôle total sur le processus de soumission sans avoir à interroger le DOM. 5) État centralisé: Toutes les valeurs du formulaire sont disponibles dans un seul endroit, facilitant la gestion et le débogage. 6) Réinitialisation facile: Permet de réinitialiser facilement le formulaire en modifiant l'état. 7) Tests simplifiés: Plus faciles à tester car l'état est explicite et prévisible. 8) Intégration avec les gestionnaires d'état: S'intègre naturellement avec Redux, MobX ou d'autres bibliothèques de gestion d'état. 9) Synchronisation multi-UI: Permet de synchroniser plusieurs éléments d'interface utilisateur avec la même valeur. Ces avantages font des composants contrôlés le choix privilégié pour les formulaires complexes dans les applications React professionnelles.",
            difficulty: "medium",
            tags: ["React", "Forms", "Best Practices"]
          },
          {
            question: "Quels sont les défis de performance liés aux composants contrôlés et comment les surmonter?",
            answer: "Défis de performance des composants contrôlés et solutions: 1) Rendus fréquents: Chaque frappe déclenche un rendu. Solution: Utiliser React.memo pour éviter les rendus inutiles des composants enfants. 2) Propagation des rendus: Les changements peuvent provoquer des rendus en cascade. Solution: Décomposer les formulaires en sous-composants plus petits et utiliser React.memo ou useMemo. 3) Latence perceptible: Pour les entrées rapides comme la frappe. Solution: Utiliser debounce/throttle pour les validations coûteuses ou les effets secondaires. 4) Formulaires volumineux: Nombreux champs dans un seul état. Solution: Diviser l'état en morceaux logiques ou utiliser useReducer pour des mises à jour plus efficaces. 5) Animations saccadées: Pendant la frappe. Solution: Utiliser des composants non contrôlés pour les animations ou CSS transitions. 6) Intégrations tierces: Bibliothèques qui manipulent directement le DOM. Solution: Utiliser des refs et des composants non contrôlés pour ces cas spécifiques. 7) Saisie dans des listes: Rendus en cascade dans les listes. Solution: Utiliser des clés stables et virtualiser les listes longues. 8) Approche hybride: Pour les cas critiques, considérer une approche où l'état est synchronisé périodiquement plutôt qu'à chaque frappe. Ces techniques permettent d'obtenir à la fois les avantages des composants contrôlés et de bonnes performances.",
            difficulty: "hard",
            tags: ["React", "Performance", "Optimization"]
          },
          {
            question: "Comment gérer des formulaires complexes avec des champs interdépendants en utilisant des composants contrôlés?",
            answer: "Gestion de formulaires complexes avec champs interdépendants: 1) État centralisé: Utiliser un seul objet d'état pour toutes les valeurs du formulaire: `const [formValues, setFormValues] = useState({ type: 'personal', name: '', email: '', company: '' });` 2) Mises à jour partielles: Utiliser le spread operator pour les mises à jour: `setFormValues({...formValues, [name]: value});` 3) Validation conditionnelle: Créer des fonctions de validation qui prennent en compte les dépendances: `validateField(name, value, formValues)` 4) Affichage conditionnel: Rendre les champs en fonction d'autres valeurs: `{formValues.type === 'business' && <BusinessFields />}` 5) Effets pour la synchronisation: Utiliser useEffect pour synchroniser les champs dépendants: `useEffect(() => { if (formValues.type === 'personal') setFormValues(v => ({...v, company: ''})); }, [formValues.type]);` 6) Gestion d'état avec useReducer: Pour les logiques complexes: `const [state, dispatch] = useReducer(formReducer, initialState);` 7) Extraction de la logique dans des hooks: Créer des hooks personnalisés pour réutiliser la logique: `useFormWithDependencies()` 8) Bibliothèques spécialisées: Considérer Formik ou React Hook Form pour les cas très complexes. 9) Décomposition en sous-formulaires: Diviser le formulaire en sections logiques tout en maintenant un état global. Cette approche permet de gérer efficacement les interdépendances tout en maintenant un code lisible et maintenable.",
            difficulty: "hard",
            tags: ["React", "Forms", "State Management"]
          },
          {
            question: "Dans quels cas devriez-vous préférer les composants non contrôlés aux composants contrôlés?",
            answer: "Cas où préférer les composants non contrôlés: 1) Intégrations avec des bibliothèques tierces: Lorsque vous travaillez avec des bibliothèques qui manipulent directement le DOM (éditeurs riches, datepickers complexes). 2) Formulaires simples sans validation: Pour des formulaires basiques où la validation à la soumission est suffisante. 3) Chargement de fichiers: Les inputs de type file sont généralement utilisés en mode non contrôlé. 4) Performance critique: Pour les interfaces où la performance de saisie est primordiale (éditeurs de texte, applications de dessin). 5) Formulaires très volumineux: Quand vous avez des dizaines ou centaines de champs où la gestion d'état deviendrait lourde. 6) Initialisation à partir de données externes: Quand vous voulez initialiser un formulaire mais pas le contrôler ensuite. 7) Réduction du boilerplate: Pour simplifier le code quand le contrôle total n'est pas nécessaire. 8) Compatibilité avec du code existant: Pour s'intégrer avec des systèmes existants qui attendent un comportement DOM standard. 9) Formulaires progressifs: Où les utilisateurs peuvent naviguer sans JavaScript. Dans ces cas, les avantages de simplicité et de performance des composants non contrôlés l'emportent sur les avantages de contrôle des composants contrôlés.",
            difficulty: "medium",
            tags: ["React", "Decision Making", "Trade-offs"]
          }
        ]}
      />
    </div>
  );
}
