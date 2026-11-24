import type { SearchIndexItem } from "./types";

/** Search index entries: System Design additions & Resources. */
export const resourcesItems: SearchIndexItem[] = [
  // System Design additions
  {
    title: "Sécurité en System Design",
    description:
      "Defense in depth, authentification, chiffrement et sécurité des systèmes distribués.",
    href: "/tech-mastry/system-design/security",
    category: "System Design",
    subcategory: "Sécurité",
    keywords: [
      "sécurité",
      "security",
      "authentification",
      "chiffrement",
      "encryption",
      "TLS",
      "OAuth",
      "JWT",
      "RBAC",
      "defense in depth",
    ],
    importance: "high",
  },
  {
    title: "Monitoring & Fiabilité",
    description:
      "Observabilité, alerting, SLO/SLI/SLA et métriques pour des systèmes fiables.",
    href: "/tech-mastry/system-design/monitoring",
    category: "System Design",
    subcategory: "Opérations",
    keywords: [
      "monitoring",
      "observabilité",
      "observability",
      "SLO",
      "SLI",
      "SLA",
      "alerting",
      "Prometheus",
      "Grafana",
      "logs",
      "traces",
      "metrics",
    ],
    importance: "high",
  },

  // Resources
  {
    title: "Ressources & Documentation",
    description:
      "Livres, cours, podcasts et communautés recommandés pour la préparation.",
    href: "/tech-mastry/resources",
    category: "Ressources",
    subcategory: "Documentation",
    keywords: [
      "livres",
      "books",
      "cours",
      "courses",
      "podcasts",
      "YouTube",
      "communautés",
      "communities",
      "ressources",
      "resources",
      "documentation",
    ],
    importance: "medium",
  },
];
