import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Clock, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";
import { LessonFooter } from "@/components/learning/lesson-footer";
import { LessonSession } from "@/components/learning/lesson-session";
import { LessonTabs } from "@/components/learning/lesson-tabs";
import { VideoPlayer } from "@/components/learning/video-player";
import { getLearningContext } from "@/lib/learning/page-context";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug } },
    select: { title: true, description: true, course: { select: { title: true } } },
  });
  if (!lesson) return { title: "Leçon introuvable" };
  return {
    title: `${lesson.title} | ${lesson.course.title} | FYGS`,
    description: lesson.description ?? `Leçon « ${lesson.title} » de la formation ${lesson.course.title}`,
    robots: { index: false },
  };
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;
  const ctx = await getLearningContext(slug);
  const staff = ctx.mode === "staff";

  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, courseId: ctx.course.id, ...(staff ? {} : { published: true }) },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      content: true,
      videoUrl: true,
      duration: true,
      published: true,
      moduleId: true,
      resources: { orderBy: { order: "asc" }, select: { id: true, title: true, url: true, kind: true, sizeBytes: true } },
    },
  });
  if (!lesson) notFound();

  const { outline } = ctx.state;
  const item = outline.items.find((i) => i.kind === "lesson" && i.id === lesson.id);
  // A published lesson of a previewed course that is not a sample: back to the course page
  if (item && !ctx.canOpen(item)) redirect(`/formations/${ctx.course.slug}?locked=1&reason=not_enrolled&lesson=${lesson.slug}`);

  const section = outline.sections.find((s) => s.items.some((i) => i.id === lesson.id));
  const lessonsInSection = section?.items.filter((i) => i.kind === "lesson") ?? [];
  const position = lessonsInSection.findIndex((i) => i.id === lesson.id) + 1;

  const [progress, notes, questions] = await Promise.all([
    db.progress.findUnique({
      where: { userId_lessonId: { userId: ctx.user.id, lessonId: lesson.id } },
      select: { completed: true, lastPosition: true },
    }),
    db.lessonNote.findMany({
      where: { userId: ctx.user.id, lessonId: lesson.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, timestamp: true, createdAt: true },
    }),
    db.discussion.findMany({
      where: { lessonId: lesson.id, status: "ACTIVE" },
      orderBy: { lastActivityAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        isSolved: true,
        createdAt: true,
        author: { select: { name: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);

  const completed = progress?.completed ?? false;

  return (
    <LessonSession lessonId={lesson.id} initialCompleted={completed} courseSlug={ctx.course.slug}>
      <article className="space-y-6">
        {staff && (
          <p role="note" className="rounded-md border border-dashed bg-muted/40 p-3 text-sm">
            Aperçu auteur{lesson.published ? "" : " (leçon non publiée)"} : vous voyez la leçon comme un apprenant, votre progression n’est pas enregistrée.
          </p>
        )}

        {lesson.videoUrl && (
          <VideoPlayer
            key={lesson.id}
            title={lesson.title}
            videoUrl={lesson.videoUrl}
            durationHint={lesson.duration}
            resumeAt={completed ? 0 : (progress?.lastPosition ?? 0)}
          />
        )}

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {section?.module && <span>{section.module.title}</span>}
            {position > 0 && (
              <span>
                · Leçon {position} sur {lessonsInSection.length}
              </span>
            )}
            {lesson.duration ? (
              <span className="flex items-center gap-1">
                · <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDuration(lesson.duration)}
              </span>
            ) : null}
            {item?.kind === "lesson" && item.isPreview && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" aria-hidden /> Aperçu gratuit
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{lesson.title}</h1>
          {lesson.description && <p className="max-w-3xl text-lg text-muted-foreground">{lesson.description}</p>}
        </header>

        {lesson.content ? (
          <div className="mdx-content prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-img:rounded-lg prose-pre:bg-transparent prose-pre:p-0">
            <LessonContentRenderer content={lesson.content} />
          </div>
        ) : (
          !lesson.videoUrl && (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Le contenu de cette leçon arrive bientôt.
            </p>
          )
        )}

        <LessonFooter lessonId={lesson.id} />

        <LessonTabs
          lessonId={lesson.id}
          hasVideo={!!lesson.videoUrl}
          notes={notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
          resources={lesson.resources}
          questions={questions.map((q) => ({
            id: q.id,
            title: q.title,
            authorName: q.author.name,
            replyCount: q._count.replies,
            isSolved: q.isSolved,
            createdAt: q.createdAt.toISOString(),
          }))}
          canAsk={ctx.mode === "full"}
        />
      </article>
    </LessonSession>
  );
}
