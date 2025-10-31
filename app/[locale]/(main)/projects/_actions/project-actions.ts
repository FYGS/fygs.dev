"use server";

import { FEATURED_PROJECTS } from "../data";
import { Project } from "../types";
import { cache } from "react";

// Cache projects with React's cache
export const getProjects = cache(async (
  technologies?: string[]
): Promise<Project[]> => {
  // If no technologies are selected, return all projects
  if (!technologies || technologies.length === 0) {
    return FEATURED_PROJECTS;
  }
  
  // Filter projects by selected technologies
  return FEATURED_PROJECTS.filter((project) =>
    project.technologies.some((tech) => technologies.includes(tech))
  );
});

// Cache technologies with React's cache
export const getTechnologies = cache(async (): Promise<string[]> => {
  return Array.from(
    new Set(FEATURED_PROJECTS.flatMap((project) => project.technologies))
  ).sort();
});
