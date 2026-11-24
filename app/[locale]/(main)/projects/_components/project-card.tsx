"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "../types";
import { ProjectStats } from "./project-stats";

interface ProjectCardProps {
  project: Project;
  isPriority?: boolean;
}

export function ProjectCard({ project, isPriority = false }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden h-full flex flex-col group border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="relative h-52 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={isPriority}
            quality={85}
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent opacity-60" />
        {/* Tech badges floating over image */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="text-[10px] bg-background/80 backdrop-blur-sm border-border/30 px-2 py-0.5"
            >
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-background/80 backdrop-blur-sm border-border/30 px-2 py-0.5"
            >
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">
          {project.title}
        </h2>

        <p
          className={cn(
            "text-sm text-muted-foreground/80 leading-relaxed",
            !isExpanded && "line-clamp-3",
          )}
        >
          {project.description}
        </p>

        {!isExpanded && project.description.length > 150 && (
          <button
            type="button"
            aria-expanded={false}
            className="self-start text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            Read More
          </button>
        )}

        <ProjectStats stats={project.stats} />

        {project.testimonial && (
          <blockquote className="border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground/70 mt-1">
            &quot;{project.testimonial.text}&quot;
            <footer className="mt-1 text-xs not-italic">
              <strong className="text-foreground/80">
                {project.testimonial.author}
              </strong>
              <span className="text-muted-foreground/50">
                {" "}
                — {project.testimonial.role}
              </span>
            </footer>
          </blockquote>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-border/30">
          <Button size="sm" className="flex-1 gap-1.5 text-xs" asChild>
            <Link href={`/projects/${project.id}`}>
              View Details
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <div className="flex gap-1.5">
            {project.githubUrl && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} - source code (opens in a new tab)`}
                >
                  <Github className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} - live site (opens in a new tab)`}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
