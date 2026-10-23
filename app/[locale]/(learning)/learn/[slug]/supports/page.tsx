import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SlidesViewer, type SlideDeck } from "@/components/learning/slides-viewer";
import { getLearningContext } from "@/lib/learning/page-context";
import { slideContentToHtml } from "@/lib/visual-support-slide";

interface SupportsPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Supports visuels | FYGS", robots: { index: false } };

export default async function SupportsPage({ params }: SupportsPageProps) {
  const { slug } = await params;
  const ctx = await getLearningContext(slug);
  if (ctx.mode === "preview") redirect(`/formations/${ctx.course.slug}?locked=1&reason=not_enrolled`);

  const supports = await db.visualSupport.findMany({
    where: { courseId: ctx.course.id },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, content: true, module: { select: { title: true } } },
  });

  const decks: SlideDeck[] = supports
    .map((s) => {
      const raw = (s.content as { slides?: { title?: unknown; content?: unknown }[] } | null)?.slides;
      const slides = Array.isArray(raw)
        ? raw.map((slide, i) => ({
            title: typeof slide.title === "string" && slide.title ? slide.title : `Diapositive ${i + 1}`,
            html: slideContentToHtml(slide.content),
          }))
        : [];
      return { id: s.id, title: s.title, moduleTitle: s.module.title, slides };
    })
    .filter((deck) => deck.slides.length > 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">Supports visuels</h1>
        <p className="text-muted-foreground">Les schémas et diapositives de la formation, module par module.</p>
      </header>
      {decks.length > 0 ? (
        <SlidesViewer decks={decks} />
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Cette formation n’a pas encore de support visuel.{" "}
          <Link href={`/learn/${ctx.course.slug}`} className="underline">
            Continuer la formation
          </Link>
        </p>
      )}
    </div>
  );
}
