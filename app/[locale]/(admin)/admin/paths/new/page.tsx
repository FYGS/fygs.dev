import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import { PathEditor } from "../_components/path-editor";
import { loadCourseOptions } from "../_lib/course-options";

export const metadata: Metadata = { title: "Nouveau parcours | Admin FYGS" };

export default async function NewPathPage() {
  await requireAdminPage();
  return (
    <PathEditor
      courseOptions={await loadCourseOptions()}
      initial={{
        id: null,
        title: "",
        slug: "",
        description: "",
        thumbnail: null,
        level: "BEGINNER",
        objectives: [],
        featured: false,
        published: false,
        courses: [],
        enrollmentCount: 0,
        certificateCount: 0,
      }}
    />
  );
}
