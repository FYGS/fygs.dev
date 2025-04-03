"use client";

import { Section } from "@/app/_components/Section";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { usePageMemoryContext } from "@/providers/page-memory-provider";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const dynamicSearchParams = useSearchParams();

  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const hasScrolled = useRef(false);

  // Initialize state from URL parameters using useEffect
  useEffect(() => {
    const technologies =
      dynamicSearchParams.get("technologies")?.split(",") || [];
    const view = (dynamicSearchParams.get("view") as ViewMode) || "grid";

    setSelectedTechnologies(technologies);
    setViewMode(view);
  }, [dynamicSearchParams]);

  const currentPage = Number(dynamicSearchParams.get("page")) || 1;
  const pageSize = Number(dynamicSearchParams.get("size")) || ITEMS_PER_PAGE;

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
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    // Ensure we don't exceed array bounds
    return filteredProjects.slice(
      startIndex,
      Math.min(endIndex, filteredProjects.length)
    );
  }, [filteredProjects, currentPage, pageSize]); // Add pageSize dependency

  // Scroll position management
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

  useEffect(() => {
    return () => {
      savePage("/projects");
    };
  }, [savePage]);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(
        dynamicSearchParams.toString()
      );

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) {
          newSearchParams.set(key, String(value));
        } else {
          newSearchParams.delete(key);
        }
      });

      return newSearchParams.toString() ? `?${newSearchParams}` : "";
    },
    [dynamicSearchParams]
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      const query = createQueryString({
        view: mode === "grid" ? null : mode,
        page: currentPage === 1 ? null : currentPage,
      });
      router.push(`/projects${query}`);
      setViewMode(mode);
    },
    [createQueryString, currentPage, router]
  );

  const handleTechnologiesChange = useCallback(
    (technologies: string[]) => {
      const query = createQueryString({
        technologies: technologies.length > 0 ? technologies.join(",") : null,
        page: null, // Reset to first page when changing filters
        size: pageSize === ITEMS_PER_PAGE ? null : pageSize, // Preserve page size
        view: viewMode === "grid" ? null : viewMode,
      });
      router.push(`/projects${query}`);
      setSelectedTechnologies(technologies);
    },
    [createQueryString, pageSize, viewMode, router]
  );

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
                pageSize={pageSize}
                baseUrl="/projects"
                searchParams={Object.fromEntries(dynamicSearchParams.entries())}
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
