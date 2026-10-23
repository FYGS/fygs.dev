import { permanentRedirect } from "next/navigation";

/** The quiz lives in the learning area; this address is kept for old links and bookmarks. */
export default async function LegacyQuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  permanentRedirect(`/learn/${slug}/quizzes/${quizId}`);
}
