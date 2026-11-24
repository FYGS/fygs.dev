import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-guard";
import type { PathLevel } from "@/lib/paths/rules";
import { PathEditor } from "../_components/path-editor";
import { loadCourseOptions } from "../_lib/course-options";

export const metadata: Metadata = { title: "Modifier le parcours | Admin FYGS" };

export default async function EditPathPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const path = await db.path.findUnique({
    where: { id },
    include: {
      courses: { orderBy: { order: "asc" }, select: { courseId: true, optional: true } },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
  if (!path) notFound();

  return (
    <PathEditor
      courseOptions={await loadCourseOptions()}
      initial={{
        id: path.id,
        title: path.title,
        slug: path.slug,
        description: path.description,
        thumbnail: path.thumbnail,
        level: path.level as PathLevel,
        objectives: path.objectives ?? [],
        featured: path.featured,
        published: path.published,
        courses: path.courses,
        enrollmentCount: path._count.enrollments,
        certificateCount: path._count.certificates,
      }}
    />
  );
}
