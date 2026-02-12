import { FeaturedCoursesClient } from "./FeaturedCoursesClient";
import { getCachedFeaturedCourses } from "@/lib/repositories/course-repository";
import { serializeFeatured } from "@/lib/serializers/course-serializer";

async function getFeaturedCourses() {
  try {
    const raw = await getCachedFeaturedCourses(6);
    return raw.map(serializeFeatured);
  } catch (error) {
    console.error("[FeaturedCourses] Failed to fetch featured courses:", error);
    return [];
  }
}

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses();
  return <FeaturedCoursesClient courses={courses} />;
}
