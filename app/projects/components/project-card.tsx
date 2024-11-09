"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHoverAnimation } from "@/hooks/use-hover-animation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "../types";
import { ProjectStats } from "./project-stats";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { x, y, scale } = useHoverAnimation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div style={{ x, y, scale }} whileHover="hover" className="h-full">
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative">
          <motion.div
            className="relative h-48"
            variants={{
              hover: { scale: 1.05 },
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <motion.h3
            className="text-2xl font-semibold mb-3"
            variants={{
              hover: { color: "var(--primary)" },
            }}
          >
            {project.title}
          </motion.h3>

          <motion.p
            className={cn(
              "text-muted-foreground mb-4",
              !isExpanded && "line-clamp-3"
            )}
          >
            {project.description}
          </motion.p>

          {!isExpanded && (
            <Button
              variant="link"
              className="self-start -mt-2 mb-4 text-primary"
              onClick={() => setIsExpanded(true)}
            >
              Read More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <ProjectStats stats={project.stats} />

          {project.testimonial && (
            <motion.blockquote
              className="border-l-4 border-primary pl-4 italic mt-4"
              variants={{
                hover: { x: 5 },
              }}
            >
              &quot;{project.testimonial.text}&quot;
              <footer className="mt-2 text-sm">
                <strong>{project.testimonial.author}</strong>
                <span className="text-muted-foreground">
                  {" "}
                  - {project.testimonial.role}
                </span>
              </footer>
            </motion.blockquote>
          )}

          <div className="flex gap-2 mt-6">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button className="w-full">View Details</Button>
            </Link>
            <div className="flex gap-2">
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="icon">
                    <Github className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
