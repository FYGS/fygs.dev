import { Section } from "@/app/_components/Section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { ProjectStats } from "../components/project-stats";
import { FEATURED_PROJECTS } from "../data";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = FEATURED_PROJECTS.find((p) => p.id === params.id);
  if (!project) return {};

  return {
    title: `${project.title} - Project Details | Fernand SOUALO`,
    description: project.description,
  };
}

export default function ProjectPage({ params }: Props) {
  const project = FEATURED_PROJECTS.find((p) => p.id === params.id);
  if (!project) {
    notFound();
  }

  return (
    <Section className="space-y-8">
      

        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-2 text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex gap-2">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Github className="mr-2 h-4 w-4" />
                View Source
              </Link>
            )}
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Project
            </Link>
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <FadeIn className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Project Overview</h2>
          <p className="text-muted-foreground">{project.description}</p>

          {project.detailImages && project.detailImages.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Project Gallery</h2>
              <Carousel
                images={project.detailImages}
                className="w-full max-w-4xl mx-auto"
              />
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
            <h2>Project Overview</h2>
            <p>{project.description}</p>

          <h2>Key Features</h2>
          <ul>
            {project.features?.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <h2>Technical Details</h2>
          <p>{project.technicalDetails}</p>

          <h2>Challenges & Solutions</h2>
          <p>{project.challenges}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6 sticky top-24">
          <div className="space-y-6">
            <ProjectStats stats={project.stats} />

            {project.testimonial && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Testimonial</h3>
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  &quot;{project.testimonial.text}&quot;
                  <footer className="mt-2 text-sm">
                    <strong>{project.testimonial.author}</strong>
                    <span className="text-muted-foreground">
                      {" "}
                      - {project.testimonial.role}
                    </span>
                  </footer>
                </blockquote>
              </div>
            )}

            {project.results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Results</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {project.results.map((result, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
      </FadeIn>
    </Section>
  );
}
