import { FeaturedCoursesClient } from "./FeaturedCoursesClient";
import { getCachedFeaturedCourses } from "@/lib/repositories/course-repository";
import { serializeFeatured } from "@/lib/serializers/course-serializer";

async function getFeaturedCourses() {
  const raw = await getCachedFeaturedCourses(6);
  return raw.map(serializeFeatured);
}

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses();
  return <FeaturedCoursesClient courses={courses} />;
}
