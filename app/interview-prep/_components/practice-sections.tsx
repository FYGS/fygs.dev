"use client";

import { Pagination } from "@/app/interview-prep/_components/pagination";
import { Card } from "@/components/ui/card";
import { usePagination } from "@/hooks/interview-prep/use-pagination";
import {
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Code,
  Code2,
  Database,
  DollarSign,
  Layout,
  LucideIcon,
  MessageSquare,
  Network,
  Shield,
  Target,
  Timer,
} from "lucide-react";
import Link from "next/link";

interface Subsection {
  title: string;
  href: string;
  description: string;
}

interface Section {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  subsections?: Subsection[];
}

const sections: Section[] = [
  {
    title: "Algorithmes & Structures de Données",
    description:
      "Exercices pratiques sur les algorithmes classiques, la complexité et les structures de données.",
    icon: Brain,
    href: "/interview-prep/algorithms",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "System Design",
    description:
      "Conception de systèmes distribués, scalabilité, et architecture de solutions.",
    icon: Network,
    href: "/interview-prep/system-design",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Frontend Development",
    description:
      "React, performance, accessibilité, et bonnes pratiques de développement frontend.",
    icon: Layout,
    href: "/interview-prep/frontend",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    subsections: [
      {
        title: "React Basics",
        href: "/interview-prep/frontend/react-basics",
        description: "Fondamentaux de React, composants, props, et state",
      },
      {
        title: "State Management",
        href: "/interview-prep/frontend/state-management",
        description:
          "Context API, Redux, et autres solutions de gestion d'état",
      },
      {
        title: "Accessibility",
        href: "/interview-prep/frontend/accessibility",
        description:
          "Bonnes pratiques ARIA, navigation au clavier, et lecteurs d'écran",
      },
      {
        title: "Performance",
        href: "/interview-prep/frontend/performance",
        description: "Optimisation, lazy loading, et meilleures pratiques",
      },
    ],
  },
  {
    title: "Backend Development",
    description:
      "API REST, bases de données, sécurité, et architecture backend.",
    icon: Database,
    href: "/interview-prep/backend",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Data Structures",
    description:
      "Implémentation et utilisation des structures de données fondamentales.",
    icon: BrainCircuit,
    href: "/interview-prep/data-structures",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    subsections: [
      {
        title: "Trees",
        href: "/interview-prep/data-structures/trees",
        description: "Arbres binaires, AVL, et parcours d'arbres",
      },
    ],
  },
  {
    title: "Coding Challenges",
    description:
      "Défis de programmation chronométrés pour simuler des conditions réelles.",
    icon: Timer,
    href: "/interview-prep/coding-challenges",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Bonnes Pratiques",
    description:
      "Clean code, patterns de conception, et meilleures pratiques de développement.",
    icon: Code,
    href: "/interview-prep/best-practices",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    title: "Q&A Préparation",
    description:
      "Questions & réponses courantes, stratégies de communication et retours d'expérience.",
    icon: MessageSquare,
    href: "/interview-prep/qa",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Préparation Stratégique",
    description:
      "Planning personnalisé, mock interviews, et techniques de gestion du stress.",
    icon: Target,
    href: "/interview-prep/preparation",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Architecture & Design Patterns",
    description:
      "Clean Architecture, SOLID, DDD, et patterns de conception modernes.",
    icon: BrainCircuit,
    href: "/interview-prep/architecture",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Sécurité & DevOps",
    description:
      "Sécurité applicative, CI/CD, Cloud Native, et pratiques DevSecOps.",
    icon: Shield,
    href: "/interview-prep/security-devops",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Négociation & Carrière",
    description:
      "Négociation salariale, progression de carrière, et développement personnel.",
    icon: DollarSign,
    href: "/interview-prep/career",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Ressources & Documentation",
    description:
      "Sélection de livres, cours, et ressources recommandées pour la préparation.",
    icon: BookOpen,
    href: "/interview-prep/resources",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  // Playground section
  {
    title: "Code Playground",
    description:
      "Interactive coding environment with real-time execution, collaboration, and interview simulation.",
    icon: Code2,
    href: "/interview-prep/playground",
    color: "text-lime-500",
    bgColor: "bg-lime-500/10",
  },
  // Dashboard section
  {
    title: "Learning Dashboard",
    description:
      "Track your progress, identify strengths and weaknesses, and plan your learning journey.",
    icon: BarChart3,
    href: "/interview-prep/dashboard",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

export function PracticeSections() {
  // Augmenter le nombre d'éléments par page pour afficher plus de cartes
  const ITEMS_PER_PAGE = 6;

  const {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    isFirstPage,
    isLastPage,
    isLoading,
  } = usePagination<Section>({
    totalItems: sections.length,
    itemsPerPage: ITEMS_PER_PAGE,
    shouldScrollToTop: true,
  });

  const currentSections = paginatedItems(sections);

  return (
    <section
      className="space-y-12 relative"
      aria-label="Sections de préparation aux entretiens"
    >
      {/* Section title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 inline-flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Explorez des domaines d&apos;expertise variés
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez une sélection de ressources et d&apos;exercices pour
          maîtriser les compétences techniques essentielles
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Card
              key={i}
              className="p-6 h-full animate-pulse bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            key={currentPage}
          >
            {currentSections.map((section) => (
              <div key={section.title} className="group">
                <Link
                  href={section.href}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl block h-full"
                >
                  <Card className="p-6 h-[200px] border border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative backdrop-blur-sm bg-background/80 group-hover:bg-gradient-to-br group-hover:from-background group-hover:to-primary/5">
                    {/* Background glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" />

                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        <div
                          className={`inline-flex p-3 rounded-xl ${section.bgColor} group-hover:scale-110 transition-transform duration-300`}
                          aria-hidden="true"
                        >
                          <section.icon
                            className={`w-6 h-6 ${section.color}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {section.title}
                          </h2>
                          <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground/80 transition-colors">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      {/* Subtle arrow indicator */}
                      <div className="self-end opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <div className="text-primary">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.16667 10H15.8333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.8333 5L15.8333 10L10.8333 15"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 mt-12 mb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                isLoading={isLoading}
              />
            </div>
          )}

          <div className="sr-only" role="status" aria-live="polite">
            Page {currentPage} sur {totalPages}
          </div>
        </>
      )}
    </section>
  );
}
