import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLearningContext } from "@/lib/learning/page-context";
import { itemHref } from "@/lib/learning/outline";

interface LearnIndexProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { robots: { index: false } };

/** "Continue": straight to where the learner left off, or to the start. */
export default async function LearnIndexPage({ params }: LearnIndexProps) {
  const { slug } = await params;
  const ctx = await getLearningContext(slug);
  const { outline, progress } = ctx.state;

  if (progress.next) {
    const target = ctx.mode === "preview" ? outline.items.find(ctx.canOpen) : progress.next;
    if (target) redirect(itemHref(ctx.course.slug, target));
  }
  if (ctx.mode === "full" && progress.isComplete) redirect(`/learn/${ctx.course.slug}/completed`);
  const first = outline.items.find(ctx.canOpen);
  if (first) redirect(itemHref(ctx.course.slug, first));

  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h1 className="text-xl font-semibold">Le contenu arrive bientôt</h1>
      <p className="mt-2 text-muted-foreground">Cette formation n’a pas encore de leçon publiée.</p>
      <Button asChild className="mt-4" variant="outline">
        <Link href={`/formations/${ctx.course.slug}`}>Retour à la formation</Link>
      </Button>
    </div>
  );
}
