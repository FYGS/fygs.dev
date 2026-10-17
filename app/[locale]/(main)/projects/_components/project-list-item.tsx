"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHoverAnimation } from "@/hooks/use-hover-animation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "../types";
import { ProjectStats } from "./project-stats";

interface ProjectListItemProps {
  project: Project;
  isPriority?: boolean;
}

export function ProjectListItem({
  project,
  isPriority = false,
}: ProjectListItemProps) {
  const { x, y, scale } = useHoverAnimation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div style={{ x, y, scale }} whileHover="hover">
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-64 h-48">
            <motion.div
              className="relative h-full"
              variants={{
                hover: { scale: 1.05 },
              }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={isPriority}
                quality={85}
              />
            </motion.div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start gap-4 mb-3">
                <motion.h2
                  className="text-2xl font-semibold"
                  variants={{
                    hover: { color: "var(--primary)" },
                  }}
                >
                  {project.title}
                </motion.h2>
                <div className="flex gap-2 shrink-0">
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

              <motion.p
                className={cn(
                  "text-muted-foreground mb-4",
                  !isExpanded && "line-clamp-2"
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

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto">
                <ProjectStats stats={project.stats} />
              </div>

              <Link href={`/projects/${project.id}`} className="mt-4">
                <Button className="w-full">View Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
