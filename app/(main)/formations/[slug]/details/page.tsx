import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseRepository } from "@/lib/repositories/course-repository";
import { PublicContentPageClient } from "./_components/public-content-client";

interface PublicContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await CourseRepository.findBySlug(slug);

  if (!course) {
    return {
      title: "Formation non trouvée",
    };
  }

  return {
    title: `Détails Complets - ${course.title} | FYGS`,
    description: `Découvrez tous les détails de la formation ${course.title} : structure, ressources, évaluation et prérequis.`,
  };
}

export default async function PublicContentPage({ params }: PublicContentPageProps) {
  const { slug } = await params;
  
  const course = await CourseRepository.findBySlug(slug);

  if (!course || !course.published) {
    notFound();
  }

  return (
    <PublicContentPageClient course={{
      id: course.id,
      title: course.title,
      slug: course.slug,
      publicStructure: course.publicStructure,
      publicResources: course.publicResources,
      publicEvaluation: course.publicEvaluation,
      publicPrerequisites: course.publicPrerequisites,
    }} />
  );
}