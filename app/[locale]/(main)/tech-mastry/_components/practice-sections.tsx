"use client";

import { Card } from "@/components/ui/card";
import { usePagination } from "@/hooks/tech-mastry/use-pagination";
import { Pagination } from "./pagination";
import { sections } from "./practice-sections/data";
import { SectionCard } from "./practice-sections/section-card";
import type { Section } from "./practice-sections/types";

export function PracticeSections() {
  // Augmenter le nombre d'éléments par page pour afficher plus de cartes
  const ITEMS_PER_PAGE = 12;

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
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
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
              <SectionCard key={section.title} section={section} />
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
