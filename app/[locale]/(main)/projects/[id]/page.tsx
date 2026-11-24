import { Section } from "@/app/_components/Section";
import { SITE_URL } from "@/app/_lib/constants";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectStats } from "../_components/project-stats";
import { FEATURED_PROJECTS } from "../data";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: projectId } = await params;
  const project = FEATURED_PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const { title, description, technologies } = project;

  return {
    title: `${title} - Project Details | Fernand SOUALO`,
    description,
    keywords: [
      "Software Project",
      "Web Development",
      "Portfolio",
      ...technologies,
    ],
    openGraph: {
      title: `${title} - Full Project Details`,
      description,
      type: "article",
      url: `${SITE_URL}/projects/${projectId}`,
      images: [
        {
          url: `/api/og/project/${projectId}`,
          width: 1200,
          height: 630,
          alt: `${title} Project Details`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Project Details`,
      description,
      images: [`/api/og/project/${projectId}`],
      creator: "@FernandSOUALO",
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = FEATURED_PROJECTS.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <Section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/projects"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-2 text-muted-foreground hover:text-foreground w-fit"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-wrap gap-2">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0"
              )}
            >
              <Github className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">View Source</span>
            </Link>
          )}
          <Link
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Visit Project</span>
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
