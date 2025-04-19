"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Binary,
  Book,
  BrainCircuit,
  ChevronRight,
  Code2,
  Database,
  DollarSign,
  GitMerge,
  HelpCircle,
  Layers,
  MessagesSquare,
  Search,
  Server,
  Swords,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const topics = [
  {
    title: "Playground",
    icon: Code2,
    items: [
      {
        title: "Code Playground",
        href: "/interview-prep/playground",
        icon: Code2,
        description: "Environnement interactif de codage",
        badge: "Interactif",
      },
    ],
  },
  {
    title: "Algorithmes",
    icon: Code2,
    items: [
      {
        title: "Complexité",
        href: "/interview-prep/algorithms/complexity",
        icon: Binary,
        description: "Analyse de la complexité temporelle et spatiale",
        badge: "Essentiel",
      },
      {
        title: "Tri",
        href: "/interview-prep/algorithms/sorting",
        icon: GitMerge,
        description: "Algorithmes de tri et leurs applications",
      },
      {
        title: "Recherche",
        href: "/interview-prep/algorithms/searching",
        icon: Search,
        description: "Techniques de recherche efficaces",
      },
      {
        title: "Structures de Données",
        href: "/interview-prep/algorithms/data-structures",
        icon: Database,
        description: "Implémentations algorithmiques fondamentales",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Structures de Données",
    icon: Database,
    items: [
      {
        title: "Vue d'ensemble",
        href: "/interview-prep/data-structures",
        icon: Database,
        description: "Introduction aux structures de données",
        badge: "Essentiel",
      },
      {
        title: "Tableaux & Chaînes",
        href: "/interview-prep/data-structures/arrays",
        icon: Code2,
        description: "Manipulation des tableaux et des chaînes",
      },
      {
        title: "Listes & Files",
        href: "/interview-prep/data-structures/lists",
        icon: Code2,
        description: "Structures de données linéaires",
      },
      {
        title: "Arbres & Graphes",
        href: "/interview-prep/data-structures/trees",
        icon: GitMerge,
        description: "Structures de données hiérarchiques",
        badge: "Avancé",
      },
    ],
  },
  {
    title: "Bonnes Pratiques",
    icon: BrainCircuit,
    items: [
      {
        title: "Communication",
        href: "/interview-prep/best-practices/communication",
        icon: MessagesSquare,
        description: "Communication efficace en entretien",
        badge: "Soft Skills",
      },
      {
        title: "Négociation",
        href: "/interview-prep/best-practices/negotiation",
        icon: DollarSign,
        description: "Techniques de négociation salariale",
      },
      {
        title: "Design Patterns",
        href: "/interview-prep/best-practices/design-patterns",
        icon: Workflow,
        description: "Modèles de conception courants",
        badge: "Avancé",
      },
      {
        title: "System Design",
        href: "/interview-prep/best-practices/system-design",
        icon: BrainCircuit,
        description: "Conception de systèmes distribués",
        badge: "Expert",
      },
    ],
  },
  {
    title: "Développement",
    icon: Code2,
    items: [
      {
        title: "Frontend",
        href: "/interview-prep/frontend",
        icon: Layers,
        description: "Technologies et frameworks frontend",
      },
      {
        title: "Component Patterns",
        href: "/interview-prep/frontend/component-patterns",
        icon: Code2,
        description: "Patterns de conception de composants React",
        badge: "Nouveau",
      },
      {
        title: "Performance",
        href: "/interview-prep/frontend/performance",
        icon: Code2,
        description: "Optimisation des performances React",
        badge: "Nouveau",
      },
      {
        title: "Accessibility",
        href: "/interview-prep/frontend/accessibility",
        icon: Code2,
        description: "Création d'interfaces accessibles",
        badge: "Nouveau",
      },
      {
        title: "Backend",
        href: "/interview-prep/backend",
        icon: Server,
        description: "Technologies et frameworks backend",
      },
      {
        title: "System Design",
        href: "/interview-prep/system-design",
        icon: BrainCircuit,
        description: "Conception de systèmes distribués",
        badge: "Avancé",
      },
    ],
  },
  {
    title: "Préparation",
    icon: Book,
    items: [
      {
        title: "Dashboard",
        href: "/interview-prep/dashboard",
        icon: Layers,
        description: "Tableau de bord de préparation",
      },
      {
        title: "Plan de préparation",
        href: "/interview-prep/preparation",
        icon: Workflow,
        description: "Guide étape par étape pour se préparer",
        badge: "Essentiel",
      },
    ],
  },
  {
    title: "Pratique",
    icon: Swords,
    items: [
      {
        title: "Défis de Code",
        href: "/interview-prep/coding-challenges",
        icon: Swords,
        description: "Exercices de programmation pratiques",
        badge: "Interactif",
      },
      {
        title: "Questions & Réponses",
        href: "/interview-prep/qa",
        icon: HelpCircle,
        description: "FAQ des entretiens techniques",
        badge: "Nouveau",
      },
    ],
  },
];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Nouveau":
      return "default";
    case "Essentiel":
      return "secondary";
    case "Avancé":
      return "outline";
    case "Expert":
      return "destructive";
    case "Soft Skills":
      return "blue";
    case "Interactif":
      return "green";
    default:
      return "secondary";
  }
};

export function TopicsNav() {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="px-3">
        <Link
          href="/interview-prep"
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
            pathname === "/interview-prep" ? "bg-accent" : "transparent"
          )}
        >
          <Book className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="flex-1">Introduction</span>
          {pathname === "/interview-prep" && (
            <motion.div
              layoutId="activeSection"
              className="h-1 w-1 rounded-full bg-primary"
            />
          )}
        </Link>
      </div>

      {topics.map((section) => (
        <div key={section.title} className="px-3">
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === section.title ? null : section.title
              )
            }
            className="group mb-2 flex w-full items-center justify-between px-3 text-left"
          >
            <div className="flex items-center gap-3">
              <section.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
                {section.title}
              </span>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-all group-hover:text-primary",
                expandedSection === section.title && "rotate-90"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === section.title && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 px-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={getBadgeVariant(item.badge)}
                            className="ml-auto"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {pathname === item.href && (
                          <motion.div
                            layoutId="activeItem"
                            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs opacity-80">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
