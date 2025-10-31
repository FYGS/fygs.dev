import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Database,
  Network,
  Settings,
  Shield,
  Terminal,
  Wrench,
} from "lucide-react";

const categories = [
  {
    title: "Algorithmes & Structures de Données",
    icon: Brain,
    questions: [
      {
        q: "Quelle est la différence entre un tableau et une liste chaînée ?",
        a: "Un tableau offre un accès direct aux éléments (O(1)) mais une insertion/suppression coûteuse (O(n)), tandis qu'une liste chaînée permet une insertion/suppression efficace (O(1)) mais un accès séquentiel aux éléments (O(n)).",
        followUp: [
          "Quand préféreriez-vous utiliser l'un plutôt que l'autre ?",
          "Comment implémenteriez-vous une liste doublement chaînée ?",
        ],
      },
      {
        q: "Expliquez le fonctionnement du tri rapide (QuickSort)",
        a: "QuickSort est un algorithme de tri par division-et-conquête qui choisit un pivot, partitionne les éléments autour de ce pivot (plus petits à gauche, plus grands à droite), puis récursivement trie les sous-tableaux. Sa complexité moyenne est O(n log n).",
        followUp: [
          "Comment choisir un bon pivot ?",
          "Quelle est sa complexité dans le pire des cas ?",
        ],
      },
    ],
  },
  {
    title: "Conception Système",
    icon: Settings,
    questions: [
      {
        q: "Comment concevriez-vous un service de raccourcissement d'URL ?",
        a: "Un service de raccourcissement d'URL nécessite : 1) Un générateur d'ID unique (peut utiliser un compteur incrémental ou un hash), 2) Une base de données pour stocker les mappings URL, 3) Un service web pour gérer les redirections, 4) Un système de mise en cache pour les URLs fréquemment accédées.",
        followUp: [
          "Comment gérer la montée en charge ?",
          "Quelle stratégie de cache utiliseriez-vous ?",
        ],
      },
      {
        q: "Expliquez le concept de sharding",
        a: "Le sharding est une technique de partitionnement horizontal des données qui distribue différentes parties d'un dataset sur plusieurs serveurs. Cela permet d'améliorer la performance et la scalabilité en répartissant la charge.",
        followUp: [
          "Quels sont les défis du sharding ?",
          "Comment choisir une bonne clé de sharding ?",
        ],
      },
    ],
  },
  {
    title: "Base de Données",
    icon: Database,
    questions: [
      {
        q: "Quelle est la différence entre les index clustered et non-clustered ?",
        a: "Un index clustered détermine l'ordre physique des données dans une table (un seul par table), tandis qu'un index non-clustered crée une structure séparée qui pointe vers les données originales (plusieurs possibles par table).",
        followUp: [
          "Quand utiliser chaque type d'index ?",
          "Impact sur les performances ?",
        ],
      },
      {
        q: "Expliquez ACID dans le contexte des bases de données",
        a: "ACID représente : Atomicité (une transaction est tout ou rien), Cohérence (la BD reste dans un état valide), Isolation (les transactions sont indépendantes), Durabilité (les changements sont permanents).",
        followUp: [
          "Pourquoi certaines BD NoSQL sacrifient ACID ?",
          "Comment garantir la cohérence dans un système distribué ?",
        ],
      },
    ],
  },
  {
    title: "Sécurité",
    icon: Shield,
    questions: [
      {
        q: "Comment prévenir les attaques XSS ?",
        a: "Pour prévenir les XSS : 1) Échapper les données utilisateur, 2) Utiliser des en-têtes de sécurité comme Content-Security-Policy, 3) Valider les entrées côté serveur, 4) Utiliser des frameworks qui échappent automatiquement le contenu.",
        followUp: [
          "Différence entre XSS réfléchi et stocké ?",
          "Rôle des cookies HttpOnly ?",
        ],
      },
      {
        q: "Qu'est-ce que l'OWASP Top 10 ?",
        a: "L'OWASP Top 10 est une liste des vulnérabilités de sécurité web les plus critiques, mise à jour régulièrement. Elle inclut des risques comme l'injection, l'authentification cassée, l'exposition de données sensibles, etc.",
        followUp: [
          "Comment se protéger contre les injections SQL ?",
          "Importance de l'authentification à deux facteurs ?",
        ],
      },
    ],
  },
  {
    title: "DevOps & Cloud",
    icon: Network,
    questions: [
      {
        q: "Expliquez les microservices vs monolithe",
        a: "Une architecture monolithique regroupe toutes les fonctionnalités dans une seule application, tandis que les microservices divisent l'application en services indépendants et faiblement couplés, chacun gérant une fonction spécifique.",
        followUp: [
          "Avantages et inconvénients de chaque approche ?",
          "Comment gérer la communication entre microservices ?",
        ],
      },
      {
        q: "Qu'est-ce que le CI/CD ?",
        a: "CI/CD signifie Intégration Continue / Déploiement Continu. La CI automatise l'intégration du code (tests, build), tandis que le CD automatise le déploiement en production. Cela permet des livraisons plus rapides et plus fiables.",
        followUp: [
          "Outils populaires de CI/CD ?",
          "Meilleures pratiques pour le pipeline CI/CD ?",
        ],
      },
    ],
  },
];

export function QAGuide() {
  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category.title} className="space-y-6">
          <div className="flex items-center gap-3">
            <category.icon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{category.title}</h2>
          </div>

          <div className="grid gap-6">
            {category.questions.map((qa, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary">Question</Badge>
                      <h3 className="font-semibold">{qa.q}</h3>
                    </div>
                    <div className="pl-13">
                      <p className="text-muted-foreground">{qa.a}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium pl-13">
                      Questions de suivi :
                    </h4>
                    <ul className="space-y-2 pl-13">
                      {qa.followUp.map((q, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Conseils pour les Réponses</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Structure</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Commencez par une vue d&apos;ensemble
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Détaillez les points importants
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Donnez des exemples concrets
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Concluez avec les points clés
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Approche</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Écoutez attentivement la question
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Demandez des clarifications si nécessaire
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Pensez à voix haute
                </li>
                <li className="text-muted-foreground text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  Montrez votre expertise technique
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
