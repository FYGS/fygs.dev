import { permanentRedirect } from "next/navigation";

/** The lesson lives in the learning area; this address is kept for old links and bookmarks. */
export default async function LegacyLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  permanentRedirect(`/learn/${slug}/lessons/${lessonSlug}`);
}
