import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { EmbeddedVideo } from "@/components/learning/embedded-video";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";
import { LessonFooter } from "@/components/learning/lesson-footer";
import { LessonSession } from "@/components/learning/lesson-session";
import { LessonTabs } from "@/components/learning/lesson-tabs";
import { VideoPlayer } from "@/components/learning/video-player";
import { formatSeconds } from "@/lib/format-duration";
import { lessonCaptionsPath } from "@/lib/learning/captions";
import { getLearningContext, learnLoginHref, leaveStep } from "@/lib/learning/page-context";
import { parseVideoSource } from "@/lib/learning/video-source";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug } },
    select: { title: true, description: true, course: { select: { title: true } } },
  });
  if (!lesson) return { title: "Leçon introuvable | FYGS" };
  return {
    title: `${lesson.title} | ${lesson.course.title} | FYGS`,
    description: lesson.description ?? `Leçon « ${lesson.title} » de la formation ${lesson.course.title}`,
    robots: { index: false },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;
  const ctx = await getLearningContext(slug);
  const staff = ctx.mode === "staff";
  const here = `/learn/${ctx.course.slug}/lessons/${lessonSlug}`;

  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, courseId: ctx.course.id, ...(staff ? {} : { published: true }) },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      content: true,
      videoUrl: true,
      captionsUrl: true,
      transcript: true,
      duration: true,
      published: true,
      resources: { orderBy: { order: "asc" }, select: { id: true, title: true, url: true, kind: true, sizeBytes: true } },
    },
  });
  if (!lesson) notFound();

  const { outline } = ctx.state;
  const item = outline.items.find((i) => i.kind === "lesson" && i.id === lesson.id);
  // A lesson that is not a free sample: a visitor signs in first, a signed-in learner sees what opens the course
  if (item && !ctx.canOpen(item)) {
    leaveStep(ctx, here);
  }

  const section = outline.sections.find((s) => s.items.some((i) => i.id === lesson.id));
  const lessonsInSection = section?.items.filter((i) => i.kind === "lesson") ?? [];
  const position = lessonsInSection.findIndex((i) => i.id === lesson.id) + 1;
  const userId = ctx.user?.id;

  const [progress, notes, questions] = await Promise.all([
    userId
      ? db.progress.findUnique({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
          select: { completed: true, lastPosition: true },
        })
      : null,
    userId
      ? db.lessonNote.findMany({
          where: { userId, lessonId: lesson.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, timestamp: true, createdAt: true },
        })
      : [],
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
  const video = lesson.videoUrl ? parseVideoSource(lesson.videoUrl) : null;
  const captionsSrc = lesson.captionsUrl ? lessonCaptionsPath(lesson.id) : null;

  return (
    <LessonSession lessonId={lesson.id} initialCompleted={completed} courseSlug={ctx.course.slug}>
      <article className="space-y-6" aria-labelledby="lesson-title">
        {staff && (
          <p role="note" className="rounded-md border border-dashed bg-muted/40 p-3 text-sm">
            Aperçu auteur{lesson.published ? "" : " (leçon non publiée)"} : vous voyez la leçon comme un apprenant, votre progression n’est pas
            enregistrée.
          </p>
        )}
        {ctx.mode === "preview" && (
          <p role="note" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed p-3 text-sm">
            <span>Leçon d’aperçu gratuite : rien n’est enregistré.</span>
            <Link href={`/formations/${ctx.course.slug}`} className="font-medium underline underline-offset-2">
              Voir comment suivre toute la formation
            </Link>
          </p>
        )}

        {video?.kind === "file" && (
          <VideoPlayer
            key={lesson.id}
            title={lesson.title}
            videoUrl={video.src}
            durationHint={lesson.duration}
            resumeAt={completed ? 0 : (progress?.lastPosition ?? 0)}
            captionsSrc={captionsSrc}
          />
        )}
        {video && video.kind !== "file" && <EmbeddedVideo key={lesson.id} title={lesson.title} source={video} />}

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
                · <Clock className="h-3.5 w-3.5" aria-hidden /> {formatSeconds(lesson.duration)}
              </span>
            ) : null}
            {!lesson.published && (
              <Badge variant="outline" title="Visible par vous seul tant qu'elle n'est pas publiée">
                Brouillon
              </Badge>
            )}
            {ctx.previewLessonIds.includes(lesson.id) && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" aria-hidden /> Aperçu gratuit
              </Badge>
            )}
          </div>
          <h1 id="lesson-title" tabIndex={-1} className="text-2xl font-bold leading-tight outline-none md:text-3xl">
            {lesson.title}
          </h1>
          {lesson.description && <p className="max-w-[70ch] text-lg text-muted-foreground">{lesson.description}</p>}
        </header>

        {!lesson.content && !lesson.videoUrl && lesson.resources.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Le contenu de cette leçon arrive bientôt.</p>
        )}

        <LessonTabs
          lessonId={lesson.id}
          content={lesson.content ? <LessonContentRenderer content={lesson.content} /> : null}
          transcript={lesson.transcript}
          captionsDownload={captionsSrc}
          timedVideo={video?.kind === "file"}
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
          cannotAskReason={
            staff
              ? "Vous êtes le formateur de cette formation : répondez aux questions depuis le back-office."
              : "Inscrivez-vous à la formation pour poser une question au formateur et aux autres apprenants."
          }
          signedIn={!!ctx.user}
          loginHref={learnLoginHref(here)}
        />

        <LessonFooter lessonId={lesson.id} />
      </article>
    </LessonSession>
  );
}
