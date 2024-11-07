"use client";

import { Section } from "@/app/_components/Section";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { usePageMemoryContext } from "@/providers/page-memory-provider";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProjectCard } from "./components/project-card";
import { ProjectListItem } from "./components/project-list-item";
import { TechnologyFilter } from "./components/technology-filter";
import { ViewToggle } from "./components/view-toggle";
import { FEATURED_PROJECTS } from "./data";

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 6;

function ProjectsContent() {
  const { savePage, getPageScroll } = usePageMemoryContext();
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const hasScrolled = useRef(false);

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

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <Section className="space-y-8">
      <FadeIn>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Featured Projects</h1>
            <div className="flex items-center gap-4">
              <ViewToggle view={viewMode} onChange={handleViewModeChange} />
              <TechnologyFilter
                technologies={allTechnologies}
                selectedTechnologies={selectedTechnologies}
                onChange={handleTechnologiesChange}
              />
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
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
              {filteredProjects.map((project) => (
                <FadeIn key={project.id}>
                  {viewMode === "grid" ? (
                    <ProjectCard project={project} />
                  ) : (
                    <ProjectListItem project={project} />
                  )}
                </FadeIn>
              ))}
            </div>

            <Pagination
              totalItems={filteredProjects.length}
              pageSize={ITEMS_PER_PAGE}
              baseUrl="/projects"
              className="mt-8"
            />
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
