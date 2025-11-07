"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComparisonTable } from "../ui/comparison-table";
import { InterviewQuestions } from "../ui/interview-questions";

export function ComparisonSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des Solutions de Gestion d&apos;État</CardTitle>
          <CardDescription>
            Analyse comparative des différentes approches de gestion d&apos;état dans React
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Chaque solution de gestion d&apos;état a ses forces et faiblesses. Le choix dépend des besoins spécifiques de votre application et de votre équipe.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Comparaison</Badge>
            <Badge>Cas d&apos;utilisation</Badge>
            <Badge>Performance</Badge>
            <Badge>Complexité</Badge>
          </div>
        </CardContent>
      </Card>
      
      <ComparisonTable
        title="Comparaison des fonctionnalités"
        libraries={["Context API", "Redux", "Zustand", "React Query"]}
        items={[
          {
            feature: "Complexité d'implémentation",
            description: "Niveau d'effort et de code nécessaire pour l'implémentation de base",
            ratings: {
              "Context API": "good",
              "Redux": "poor",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Boilerplate",
            description: "Quantité de code répétitif nécessaire",
            ratings: {
              "Context API": "good",
              "Redux": "poor",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Performance",
            description: "Efficacité pour les mises à jour fréquentes et les grands états",
            ratings: {
              "Context API": "poor",
              "Redux": "good",
              "Zustand": "excellent",
              "React Query": "excellent"
            }
          },
          {
            feature: "Écosystème",
            description: "Outils, extensions et support communautaire",
            ratings: {
              "Context API": "good",
              "Redux": "excellent",
              "Zustand": "average",
              "React Query": "good"
            }
          },
          {
            feature: "DevTools",
            description: "Outils de débogage et de développement",
            ratings: {
              "Context API": "poor",
              "Redux": "excellent",
              "Zustand": "good",
              "React Query": "excellent"
            }
          },
          {
            feature: "Gestion des effets secondaires",
            description: "Support pour les opérations asynchrones et effets",
            ratings: {
              "Context API": "poor",
              "Redux": "good",
              "Zustand": "good",
              "React Query": "excellent"
            }
          },
          {
            feature: "Courbe d'apprentissage",
            description: "Facilité d'apprentissage pour les nouveaux développeurs",
            ratings: {
              "Context API": "excellent",
              "Redux": "poor",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Typage TypeScript",
            description: "Qualité du support TypeScript natif",
            ratings: {
              "Context API": "average",
              "Redux": "average",
              "Zustand": "excellent",
              "React Query": "excellent"
            }
          },
          {
            feature: "Taille du bundle",
            description: "Impact sur la taille du bundle JavaScript",
            ratings: {
              "Context API": "excellent",
              "Redux": "average",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Mise en cache et revalidation",
            description: "Capacités de mise en cache et de revalidation des données",
            ratings: {
              "Context API": "poor",
              "Redux": "average",
              "Zustand": "average",
              "React Query": "excellent"
            }
          }
        ]}
      />
      
      <ComparisonTable
        title="Cas d'utilisation recommandés"
        libraries={["Context API", "Redux", "Zustand", "React Query"]}
        items={[
          {
            feature: "Petites applications",
            description: "Applications simples avec peu d'état global",
            ratings: {
              "Context API": "excellent",
              "Redux": "poor",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Applications moyennes",
            description: "Applications avec une complexité modérée",
            ratings: {
              "Context API": "average",
              "Redux": "good",
              "Zustand": "excellent",
              "React Query": "good"
            }
          },
          {
            feature: "Grandes applications",
            description: "Applications complexes avec beaucoup d'état partagé",
            ratings: {
              "Context API": "poor",
              "Redux": "excellent",
              "Zustand": "good",
              "React Query": "good"
            }
          },
          {
            feature: "Applications axées sur les données",
            description: "Applications avec beaucoup d'interactions API",
            ratings: {
              "Context API": "poor",
              "Redux": "average",
              "Zustand": "average",
              "React Query": "excellent"
            }
          },
          {
            feature: "État UI complexe",
            description: "Gestion d'états UI complexes et interdépendants",
            ratings: {
              "Context API": "average",
              "Redux": "excellent",
              "Zustand": "good",
              "React Query": "poor"
            }
          },
          {
            feature: "Prototypage rapide",
            description: "Développement rapide de prototypes et MVPs",
            ratings: {
              "Context API": "good",
              "Redux": "poor",
              "Zustand": "excellent",
              "React Query": "good"
            }
          }
        ]}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Quand utiliser quelle solution?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Context API</h3>
              <p className="text-muted-foreground">
                Idéal pour les petites applications ou pour partager des données qui ne changent pas fréquemment, comme les thèmes, les préférences utilisateur ou l&apos;état d&apos;authentification.
              </p>
              <div className="mt-2">
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Intégré à React
                </Badge>
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Simple à mettre en place
                </Badge>
                <Badge className="mr-2 bg-red-900/30 text-red-400">
                  Performances limitées
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Redux</h3>
              <p className="text-muted-foreground">
                Adapté aux grandes applications avec un état complexe et de nombreux développeurs. Excellent lorsque vous avez besoin d&apos;un flux de données prévisible, d&apos;outils de débogage avancés et d&apos;un écosystème mature.
              </p>
              <div className="mt-2">
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Écosystème riche
                </Badge>
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  DevTools puissants
                </Badge>
                <Badge className="mr-2 bg-red-900/30 text-red-400">
                  Beaucoup de boilerplate
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Zustand</h3>
              <p className="text-muted-foreground">
                Excellent pour les applications de petite à moyenne taille qui nécessitent une solution de gestion d&apos;état simple mais puissante. Idéal lorsque vous voulez éviter le boilerplate de Redux tout en conservant de bonnes performances.
              </p>
              <div className="mt-2">
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  API minimaliste
                </Badge>
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Excellentes performances
                </Badge>
                <Badge className="mr-2 bg-yellow-900/30 text-yellow-400">
                  Écosystème plus petit
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">React Query</h3>
              <p className="text-muted-foreground">
                Parfait pour les applications axées sur les données avec de nombreuses interactions API. Idéal lorsque votre état est principalement dérivé de données serveur et que vous avez besoin de fonctionnalités avancées comme la mise en cache, la revalidation et la gestion des erreurs.
              </p>
              <div className="mt-2">
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Gestion des données serveur
                </Badge>
                <Badge className="mr-2 bg-green-900/30 text-green-400">
                  Mise en cache intelligente
                </Badge>
                <Badge className="mr-2 bg-yellow-900/30 text-yellow-400">
                  Moins adapté à l&apos;état UI pur
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Approches hybrides</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Dans de nombreuses applications modernes, il est courant d&apos;utiliser plusieurs solutions de gestion d&apos;état ensemble, chacune pour ses points forts.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Context + useReducer pour l&apos;état UI</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez Context API avec useReducer pour gérer l&apos;état UI local qui ne nécessite pas les performances optimales ou les fonctionnalités avancées de Redux.
              </p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">React Query + Zustand</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez React Query pour gérer les données serveur et Zustand pour l&apos;état client. Cette combinaison offre d&apos;excellentes performances et une API simple pour les deux types d&apos;état.
              </p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Redux + React Query</h3>
              <p className="text-sm text-muted-foreground">
                Pour les grandes applications, utilisez Redux pour l&apos;état global de l&apos;application et React Query pour les données serveur. Cela permet de bénéficier des outils de débogage de Redux tout en simplifiant la gestion des données API.
              </p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">État local + Context pour des fonctionnalités isolées</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez useState et useReducer pour l&apos;état local des composants, et Context pour partager l&apos;état entre des groupes de composants liés, tout en utilisant une solution plus robuste pour l&apos;état global.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <InterviewQuestions
        title="Questions d'Entretien sur le Choix de Solution de Gestion d'État"
        questions={[
          {
            question: "Comment choisiriez-vous une solution de gestion d'état pour un nouveau projet React?",
            answer: "Pour choisir une solution de gestion d'état, j'évaluerais: 1) Taille et complexité du projet: Pour les petites applications, useState/useReducer avec Context peut suffire. Pour les moyennes, Zustand offre un bon équilibre. Pour les grandes applications complexes, Redux ou une combinaison de solutions. 2) Type de données: Si l'application est principalement axée sur les données serveur, React Query est excellent. Pour l'état UI complexe, Redux ou Zustand. 3) Fréquence des mises à jour: Pour des mises à jour fréquentes, évitez Context API pur. 4) Expérience de l'équipe: Considérez les connaissances existantes de l'équipe. 5) Besoins de débogage: Si des outils de débogage avancés sont nécessaires, Redux a l'avantage. 6) Contraintes de bundle size: Zustand est plus léger que Redux. 7) Besoins de mise en cache: React Query excelle dans ce domaine. Je recommande souvent une approche hybride: React Query pour les données serveur, et une autre solution pour l'état client.",
            difficulty: "medium",
            tags: ["Architecture", "Decision Making"]
          },
          {
            question: "Quels sont les pièges courants à éviter lors de l'utilisation de plusieurs solutions de gestion d'état dans une même application?",
            answer: "Lors de l'utilisation de plusieurs solutions de gestion d'état, évitez ces pièges: 1) Duplication des données: Définissez clairement quelle solution est la source de vérité pour chaque type de données. 2) Incohérence des données: Assurez-vous que les données partagées entre solutions restent synchronisées. 3) Complexité excessive: Établissez des règles claires sur quand utiliser quelle solution. 4) Surcharge cognitive: Documentez l'architecture pour que les nouveaux développeurs comprennent le flux de données. 5) Problèmes de performance: Évitez les cascades de mises à jour entre différentes solutions. 6) Difficulté de débogage: Utilisez des outils comme Redux DevTools même avec d'autres solutions quand c'est possible. 7) Couplage serré: Évitez de créer des dépendances directes entre différentes solutions. 8) Inconsistance des patterns: Standardisez les patterns d'utilisation pour chaque solution. Une bonne pratique est de créer des hooks personnalisés qui encapsulent l'interaction avec chaque solution, offrant une API cohérente à vos composants.",
            difficulty: "hard",
            tags: ["Architecture", "Best Practices"]
          },
          {
            question: "Comment optimiseriez-vous les performances d'une application React avec un état global complexe?",
            answer: "Pour optimiser les performances avec un état global complexe: 1) Normalisation des données: Structurez l'état comme une base de données pour éviter la duplication et faciliter les mises à jour. 2) Sélecteurs mémoïsés: Utilisez Reselect ou des hooks comme useSelector avec égalité personnalisée pour éviter les re-rendus inutiles. 3) Granularité des composants: Divisez les composants pour minimiser l'impact des re-rendus. 4) Memoization: Utilisez React.memo, useMemo et useCallback stratégiquement. 5) Mise à jour par lots: Regroupez les mises à jour d'état multiples. 6) État local quand c'est possible: N'utilisez pas l'état global pour tout. 7) Lazy loading: Chargez les parties de l'état à la demande. 8) Virtualisation: Pour les grandes listes, utilisez react-window ou react-virtualized. 9) Débounce/Throttle: Limitez la fréquence des mises à jour pour les actions utilisateur fréquentes. 10) Profiling: Utilisez React DevTools Profiler et Performance pour identifier les goulots d'étranglement. 11) Immutabilité structurelle: Utilisez des bibliothèques comme Immer pour des mises à jour efficaces. 12) Considérez des alternatives comme Zustand ou Jotai pour des cas spécifiques nécessitant des performances optimales.",
            difficulty: "hard",
            tags: ["Performance", "Optimisation"]
          },
          {
            question: "Comment gérez-vous la persistance et la synchronisation de l'état entre les sessions utilisateur?",
            answer: "Pour gérer la persistance et la synchronisation de l'état: 1) Persistance locale: Utilisez localStorage/sessionStorage avec des middlewares comme redux-persist pour Zustand/Redux. Considérez IndexedDB pour de grandes quantités de données. 2) Sélectivité: Ne persistez que les données nécessaires (préférences utilisateur, panier d'achat) et non les données temporaires ou sensibles. 3) Migrations: Implémentez des stratégies de migration pour gérer les changements de structure d'état entre les versions. 4) Synchronisation entre onglets: Utilisez BroadcastChannel API ou localStorage events pour synchroniser l'état entre onglets. React Query et redux-persist supportent cette fonctionnalité. 5) Synchronisation serveur: Utilisez des WebSockets ou des requêtes périodiques pour synchroniser avec le serveur. 6) Gestion des conflits: Implémentez des stratégies de résolution de conflits pour les mises à jour concurrentes. 7) Optimistic UI: Mettez à jour l'UI immédiatement tout en synchronisant en arrière-plan. 8) État de connexion: Détectez et gérez les états hors ligne avec des files d'attente de synchronisation. 9) Sécurité: Chiffrez les données sensibles stockées localement. 10) Nettoyage: Implémentez des mécanismes pour éviter que le stockage ne grandisse indéfiniment.",
            difficulty: "medium",
            tags: ["Persistence", "Synchronization"]
          }
        ]}
      />
    </div>
  );
}
