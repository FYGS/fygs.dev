import { FeaturedCoursesClient } from "./FeaturedCoursesClient";
import { getCachedFeaturedCourses } from "@/lib/repositories/course-repository";
import { serializeFeatured } from "@/lib/serializers/course-serializer";
import { toCourseCards } from "@/lib/access/course-cards";

async function getFeaturedCourses() {
  try {
    const raw = await getCachedFeaturedCourses(6);
    // The home page is the same for everyone (cached): cards as a visitor sees them, the course page tells the rest
    return await toCourseCards(null, raw.map(serializeFeatured));
  } catch (error) {
    console.error("[FeaturedCourses] Failed to fetch featured courses:", error);
    return [];
  }
}

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses();
  return <FeaturedCoursesClient courses={courses} />;
}
