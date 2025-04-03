"use client";

import { Section } from "@/app/_components/Section";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { usePageMemoryContext } from "@/providers/page-memory-provider";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProjectCard } from "./components/project-card";
import { ProjectListItem } from "./components/project-list-item";
import { TechnologyFilter } from "./components/technology-filter";
import { ViewToggle } from "./components/view-toggle";
import { FEATURED_PROJECTS } from "./data";

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 6;

function ProjectsContent() {
  const { savePage, getPageScroll } = usePageMemoryContext();
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const hasScrolled = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Mémoriser les technologies uniques
  const allTechnologies = useMemo(() => {
    return Array.from(
      new Set(FEATURED_PROJECTS.flatMap((project) => project.technologies))
    );
  }, []);

  // Mémoriser les projets filtrés
  const filteredProjects = useMemo(() => {
    if (selectedTechnologies.length === 0) return FEATURED_PROJECTS;
    return FEATURED_PROJECTS.filter((project) =>
      project.technologies.some((tech) => selectedTechnologies.includes(tech))
    );
  }, [selectedTechnologies]);

  // Memorize paginated projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    // Ensure we don't exceed array bounds
    return filteredProjects.slice(
      startIndex,
      Math.min(endIndex, filteredProjects.length)
    );
  }, [filteredProjects, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTechnologies]);

  // Add validation for current page
  useEffect(() => {
    const maxPage = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    if (currentPage > maxPage) {
      setCurrentPage(Math.max(1, maxPage));
    }
  }, [filteredProjects.length, currentPage]);

  // Restaurer la position de défilement une seule fois
  useEffect(() => {
    if (!hasScrolled.current) {
      const scroll = getPageScroll("/projects");
      if (scroll > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scroll, behavior: "instant" });
        });
      }
      hasScrolled.current = true;
    }
  }, [getPageScroll]);

  // Sauvegarder la position au démontage
  useEffect(() => {
    return () => {
      savePage("/projects");
    };
  }, [savePage]);

  const handleTechnologiesChange = useCallback((technologies: string[]) => {
    setSelectedTechnologies(technologies);
  }, []);

  // Update view mode handler to maintain current page
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    // Don't reset page when changing view
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Section className="space-y-8 px-4 sm:px-6">
      <FadeIn>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Featured Projects
            </h1>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <ViewToggle view={viewMode} onChange={handleViewModeChange} />
              <TechnologyFilter
                technologies={allTechnologies}
                selectedTechnologies={selectedTechnologies}
                onChange={handleTechnologiesChange}
              />
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Each project is crafted with attention to detail, focusing on
            performance, scalability, and user experience.
          </p>
        </div>
      </FadeIn>

      <FadeInStagger>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No projects found with the selected technologies.
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              )}
            >
              {paginatedProjects.map((project) => (
                <FadeIn key={project.id}>
                  {viewMode === "grid" ? (
                    <ProjectCard project={project} />
                  ) : (
                    <ProjectListItem project={project} />
                  )}
                </FadeIn>
              ))}
            </div>

            {filteredProjects.length > ITEMS_PER_PAGE && (
              <Pagination
                totalItems={filteredProjects.length}
                pageSize={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                baseUrl="/projects"
                className="mt-8"
              />
            )}
          </>
        )}
      </FadeInStagger>
    </Section>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsContent />
    </Suspense>
  );
}
