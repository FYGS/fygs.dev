"use client";

import { Card } from "@/components/ui/card";
import { Pagination } from "@/app/interview-prep/components/pagination";
import { usePagination } from "@/app/interview-prep/hooks/use-pagination";
import {
  BookOpen,
  Brain,
  BrainCircuit,
  Code,
  Database,
  DollarSign,
  Layout,
  MessageSquare,
  Network,
  Shield,
  Target,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Section {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
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
];

export function PracticeSections() {
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
      className="space-y-8"
      aria-label="Sections de préparation aux entretiens"
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            key={currentPage}
          >
            {currentSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 space-y-4 group">
                  <div
                    className={`inline-flex p-3 rounded-xl ${section.bgColor}`}
                    aria-hidden="true"
                  >
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2">
                      {section.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
