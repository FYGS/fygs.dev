"use client";

import { Section } from "@/app/_components/Section";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useIntlayer } from "next-intlayer";
import { ProjectCard } from "./_components/project-card";
import { ProjectListItem } from "./_components/project-list-item";
import { TechnologyFilter } from "./_components/technology-filter";
import { ViewToggle } from "./_components/view-toggle";
import { FEATURED_PROJECTS } from "./data";

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 6;

function LoadingSkeleton() {
  return (
    <Section className="space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-10 w-48" /> {/* Title */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <Skeleton className="h-9 w-20" /> {/* View toggle */}
            <Skeleton className="h-9 w-36" /> {/* Technology filter */}
          </div>
        </div>
        <Skeleton className="h-12 max-w-2xl" /> {/* Description */}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />{" "}
            {/* Image */}
            <div className="space-y-3">
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16" /> // Tech badges
                ))}
              </div>
              <Skeleton className="h-7 w-3/4" /> {/* Title */}
              <Skeleton className="h-20 w-full" /> {/* Description */}
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-5 w-24" /> {/* Status */}
                <Skeleton className="h-9 w-24" /> {/* Link button */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Skeleton className="h-10 w-72" />
      </div>
    </Section>
  );
}

function ProjectsContent() {
  const { savePage, getPageScroll } = usePageMemoryContext();
  const router = useRouter();
  const dynamicSearchParams = useSearchParams();
  const { title, description, noResults } = useIntlayer("projects-page");

  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    [],
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
      new Set(FEATURED_PROJECTS.flatMap((project) => project.technologies)),
    );
  }, []);

  // Mémoriser les projets filtrés
  const filteredProjects = useMemo(() => {
    if (selectedTechnologies.length === 0) return FEATURED_PROJECTS;
    return FEATURED_PROJECTS.filter((project) =>
      project.technologies.some((tech) => selectedTechnologies.includes(tech)),
    );
  }, [selectedTechnologies]);

  // Memorize paginated projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    // Ensure we don't exceed array bounds
    return filteredProjects.slice(
      startIndex,
      Math.min(endIndex, filteredProjects.length),
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
        dynamicSearchParams.toString(),
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
    [dynamicSearchParams],
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
    [createQueryString, currentPage, router],
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
    [createQueryString, pageSize, viewMode, router],
  );

  return (
    <Section className="space-y-8 px-4 sm:px-6">
      <FadeIn>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient-heading">
              {title}
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
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </FadeIn>

      <FadeInStagger>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{noResults}</p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              {paginatedProjects.map((project, index) => (
                <FadeIn key={project.id}>
                  {viewMode === "grid" ? (
                    <ProjectCard
                      project={project}
                      isPriority={index === 0 && currentPage === 1}
                    />
                  ) : (
                    <ProjectListItem
                      project={project}
                      isPriority={index === 0 && currentPage === 1}
                    />
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
    <Suspense fallback={<LoadingSkeleton />}>
      <ProjectsContent />
    </Suspense>
  );
}
