import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getExam, listQuizzes, listSupports } from "@/lib/curriculum/assessments";
import { normalizeFaq } from "@/lib/curriculum/content";
import { getCurriculum } from "@/lib/curriculum/curriculum";
import { canEditCourse } from "@/lib/curriculum/guard";
import { CourseBuilder } from "./_components/builder/course-builder";
import type { CourseInfo, SectionId } from "./_components/builder/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const course = await db.course.findUnique({ where: { id }, select: { title: true } });
  return { title: `${course?.title ?? "Formation"} · Éditeur | Admin FYGS` };
}

const SECTIONS: readonly SectionId[] = ["infos", "programme", "evaluations", "supports", "vente", "apercu", "statistiques", "apprenants", "parametres"];

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string; lesson?: string }>;
}

export default async function CourseBuilderPage({ params, searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") redirect("/unauthorized");

  const { id } = await params;
  const { section, lesson } = await searchParams;

  const course = await db.course.findUnique({
    where: { id },
    include: { tags: { select: { tagId: true } }, _count: { select: { enrollments: true } } },
  });
  if (!course) notFound();
  if (!canEditCourse({ id: session.user.id, role }, course)) redirect("/unauthorized?error=course-access-denied");

  const isAdmin = role === "ADMIN";
  const [curriculum, quizzes, supports, exam, tags, instructors] = await Promise.all([
    getCurriculum(course.id),
    listQuizzes(course.id),
    listSupports(course.id),
    getExam(course.id),
    db.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, color: true } }),
    isAdmin
      ? db.user.findMany({
          where: { role: { in: ["INSTRUCTOR", "ADMIN"] } },
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true },
        })
      : Promise.resolve([]),
  ]);

  const info: CourseInfo = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    category: course.category,
    level: course.level,
    accessTier: course.accessTier,
    price: course.price === null ? null : Number(course.price),
    duration: course.duration,
    previewEnabled: course.previewEnabled,
    featured: course.featured,
    published: course.published,
    instructorId: course.instructorId,
    objectives: course.objectives,
    faq: normalizeFaq(course.faq),
    trailerUrl: course.trailerUrl ?? "",
    publicPrerequisites: course.publicPrerequisites ?? "",
    publicStructure: course.publicStructure ?? "",
    publicResources: course.publicResources ?? "",
    publicEvaluation: course.publicEvaluation ?? "",
    tagIds: course.tags.map((t) => t.tagId),
  };

  const initialSection = SECTIONS.find((s) => s === section) ?? (lesson ? "programme" : "infos");

  return (
    <CourseBuilder
      course={info}
      curriculum={curriculum}
      quizzes={quizzes}
      supports={supports}
      exam={exam}
      tags={tags}
      instructors={instructors.map((u) => ({ id: u.id, name: u.name ?? u.email, email: u.email }))}
      isAdmin={isAdmin}
      enrollments={course._count.enrollments}
      initialSection={initialSection}
      initialLessonId={lesson}
    />
  );
}
