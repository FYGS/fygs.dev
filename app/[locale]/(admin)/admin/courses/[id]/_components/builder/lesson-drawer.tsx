"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { VideoUpload } from "@/components/admin/video-upload";
import type { LessonDetail, LessonSummary, ResourceItem } from "@/lib/curriculum/curriculum";
import { LESSON_STATUS_LABELS, lessonStatus } from "@/lib/curriculum/publish";
import { formatSeconds } from "@/lib/format-duration";
import { isEmptyHtml } from "@/lib/curriculum/content";
import { looksLikeHtml } from "@/lib/curriculum/html-detect";
import { loadLesson, saveLesson } from "../../_actions/curriculum-actions";
import { CaptionsField } from "./captions-field";
import { ResourcesEditor } from "./resources-editor";
import { useAutosave } from "./use-autosave";

interface Props {
  courseId: string;
  courseSlug: string;
  /** The course is published: only then can a lesson be opened the way a learner sees it. */
  courseLive: boolean;
  lessonId: string | null;
  onClose: () => void;
  onLessonSaved: (summary: LessonUpdate) => void;
}

/** What changed in a lesson, merged into the outline. */
export type LessonUpdate = Partial<LessonSummary> & { id: string };

/** The lesson editor: opens beside the programme, saves as you type, never leaves the builder. */
export function LessonDrawer({ courseSlug, courseLive, lessonId, onClose, onLessonSaved }: Props) {
  const flushRef = useRef<(() => Promise<boolean>) | null>(null);

  async function requestClose() {
    const ok = flushRef.current ? await flushRef.current() : true;
    if (ok) onClose();
    else toast.error("Cette leçon n'a pas pu être enregistrée. Corrigez l'erreur indiquée ou réessayez avant de fermer.");
  }

  return (
    <Sheet open={lessonId !== null} onOpenChange={(open) => !open && void requestClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        {lessonId && (
          <LessonEditor
            key={lessonId}
            lessonId={lessonId}
            courseSlug={courseSlug}
            courseLive={courseLive}
            onLessonSaved={onLessonSaved}
            registerFlush={(flush) => {
              flushRef.current = flush;
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type Draft = Pick<LessonDetail, "title" | "description" | "content" | "videoUrl" | "duration" | "isPreview" | "captionsUrl" | "transcript">;

function LessonEditor({
  lessonId,
  courseSlug,
  courseLive,
  onLessonSaved,
  registerFlush,
}: {
  lessonId: string;
  courseSlug: string;
  courseLive: boolean;
  onLessonSaved: (summary: LessonUpdate) => void;
  registerFlush: (flush: () => Promise<boolean>) => void;
}) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await loadLesson(lessonId);
      if (cancelled) return;
      if (!result.success) return setLoadError(result.error);
      // Older lessons hold Markdown; the editor speaks HTML. The converter is only loaded when needed
      // (it renders React to a string, which a server action cannot import).
      let content = result.lesson.content;
      if (content?.trim() && !looksLikeHtml(content)) {
        const { lessonContentToEditorHtml } = await import("@/lib/curriculum/markdown");
        content = lessonContentToEditorHtml(content);
      }
      if (!cancelled) setLesson({ ...result.lesson, content });
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (loadError) {
    return (
      <SheetHeader>
        <SheetTitle>Leçon indisponible</SheetTitle>
        <SheetDescription role="alert">{loadError}</SheetDescription>
      </SheetHeader>
    );
  }
  if (!lesson) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>Chargement de la leçon…</SheetTitle>
          <SheetDescription className="sr-only">Les champs de la leçon se chargent.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-4" aria-hidden>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    );
  }
  return <LessonFields initial={lesson} courseSlug={courseSlug} courseLive={courseLive} onLessonSaved={onLessonSaved} registerFlush={registerFlush} />;
}

function LessonFields({
  initial,
  courseSlug,
  courseLive,
  onLessonSaved,
  registerFlush,
}: {
  initial: LessonDetail;
  courseSlug: string;
  courseLive: boolean;
  onLessonSaved: (summary: LessonUpdate) => void;
  registerFlush: (flush: () => Promise<boolean>) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    title: initial.title,
    description: initial.description,
    content: initial.content,
    videoUrl: initial.videoUrl,
    duration: initial.duration,
    isPreview: initial.isPreview,
    captionsUrl: initial.captionsUrl,
    transcript: initial.transcript,
  });
  const [published, setPublished] = useState(initial.published);
  const [resources, setResources] = useState<ResourceItem[]>(initial.resources);
  const [publishing, setPublishing] = useState(false);
  /** A duration read from the video that differs from the one already set: offered, never imposed. */
  const [detected, setDetected] = useState<number | null>(null);
  /** The duration came from the video file in this session (so a new file may replace it). */
  const durationFromVideo = useRef(false);
  const probeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(draft.duration);
  useEffect(() => {
    durationRef.current = draft.duration;
  }, [draft.duration]);
  useEffect(() => () => {
    if (probeTimer.current) clearTimeout(probeTimer.current);
  }, []);

  const { queue, flush, error, retry } = useAutosave<Draft>({
    name: `lesson:${initial.id}`,
    save: async (patch) => {
      // the editor yields "<p></p>" for an empty lesson: the server stores that as no content
      const result = await saveLesson(initial.id, patch);
      if (!result.success) return result;
      onLessonSaved(result.lesson);
      return { success: true };
    },
  });

  useEffect(() => {
    registerFlush(flush);
  }, [flush, registerFlush]);

  function edit(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    // a blank title is not saved (the server refuses it); the field shows why
    if ("title" in patch && !patch.title?.trim()) return;
    queue(patch);
  }

  function onVideoChange(url: string) {
    edit({ videoUrl: url });
    setDetected(null);
    // typed addresses are probed once the author stops typing, not at every key
    if (probeTimer.current) clearTimeout(probeTimer.current);
    if (url && /^https?:\/\/\S+\.\S+/i.test(url)) probeTimer.current = setTimeout(() => detectDuration(url), 800);
  }

  /**
   * Reads the length from the video file itself (platforms such as YouTube or Vimeo do not give it: the field stays
   * with the author). An empty duration, or one read from a previous file, is filled in; a duration the author
   * set is kept and the detected one is offered next to it.
   */
  function detectDuration(url: string) {
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) {
        const seconds = Math.round(probe.duration);
        const current = durationRef.current;
        if (current === null || durationFromVideo.current) {
          durationFromVideo.current = true;
          edit({ duration: seconds });
        } else if (current !== seconds) {
          setDetected(seconds);
        }
      }
      probe.removeAttribute("src");
      probe.load();
    };
    probe.onerror = () => probe.removeAttribute("src");
    probe.src = url;
  }

  async function togglePublished(next: boolean) {
    setPublishing(true);
    try {
      if (!(await flush())) return void toast.error("Corrigez l'erreur d'enregistrement avant de changer la publication.");
      const result = await saveLesson(initial.id, { published: next });
      if (!result.success) return void toast.error(result.error);
      setPublished(next);
      onLessonSaved(result.lesson);
    } finally {
      setPublishing(false);
    }
  }

  const hasVideo = draft.videoUrl.trim() !== "";
  const hasContent = !isEmptyHtml(draft.content);
  const status = lessonStatus({ published, hasVideo, hasContent });
  const minutes = draft.duration ? Math.floor(draft.duration / 60) : "";
  const seconds = draft.duration ? draft.duration % 60 : "";
  const setDuration = (m: number, s: number) => {
    durationFromVideo.current = false;
    setDetected(null);
    edit({ duration: m * 60 + s > 0 ? m * 60 + s : null });
  };
  const titleBlank = !draft.title.trim();

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2 pr-8">
          <SheetTitle className="min-w-0 flex-1 truncate">{draft.title || "Leçon sans titre"}</SheetTitle>
          <Badge variant={status === "ready" ? "default" : "outline"}>{LESSON_STATUS_LABELS[status]}</Badge>
        </div>
        <SheetDescription>
          Les modifications sont enregistrées automatiquement.{" "}
          <a href={`/learn/${courseSlug}/lessons/${initial.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
            Voir comme un apprenant
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          {(!published || !courseLive) &&
            ` ${!published ? "La leçon est en brouillon" : "La formation est en brouillon"} : vous seul la voyez, marquée « Brouillon ».`}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-8 px-4 pb-8">
        {error && (
          <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="text-destructive">{error}</p>
            <button type="button" className="mt-1 underline underline-offset-4" onClick={() => void retry()}>
              Réessayer
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="lesson-title">Titre</Label>
          <Input id="lesson-title" value={draft.title} maxLength={200} aria-invalid={titleBlank} onChange={(e) => edit({ title: e.target.value })} />
          {titleBlank && <p className="text-sm text-destructive">Le titre est requis. Tant qu&apos;il est vide, il n&apos;est pas enregistré.</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lesson-description">Résumé</Label>
          <Textarea id="lesson-description" rows={2} maxLength={500} value={draft.description} placeholder="Une ou deux phrases : ce que cette leçon apporte." onChange={(e) => edit({ description: e.target.value })} />
        </div>

        <section aria-labelledby="lesson-video" className="space-y-3">
          <h3 id="lesson-video" className="text-sm font-medium">
            Vidéo
          </h3>
          <VideoUpload value={draft.videoUrl} onChange={onVideoChange} />
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-minutes">Durée</Label>
              <div className="flex items-center gap-2">
                <Input id="lesson-minutes" type="number" min={0} max={1440} className="w-20" value={minutes} aria-label="Minutes" onChange={(e) => setDuration(Number(e.target.value) || 0, Number(seconds) || 0)} />
                <span className="text-sm text-muted-foreground">min</span>
                <Input type="number" min={0} max={59} className="w-20" value={seconds} aria-label="Secondes" onChange={(e) => setDuration(Number(minutes) || 0, Math.min(59, Number(e.target.value) || 0))} />
                <span className="text-sm text-muted-foreground">s</span>
              </div>
            </div>
            <p className="pb-2 text-xs text-muted-foreground">Lue dans le fichier vidéo quand c&apos;est possible ; à saisir pour YouTube ou Vimeo.</p>
          </div>
          {detected !== null && (
            <p className="text-sm text-muted-foreground" role="status">
              La vidéo dure {formatSeconds(detected)}.{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-4"
                onClick={() => {
                  durationFromVideo.current = true;
                  setDetected(null);
                  edit({ duration: detected });
                }}
              >
                Utiliser cette durée
              </button>
            </p>
          )}
          <CaptionsField
            captionsUrl={draft.captionsUrl}
            transcript={draft.transcript}
            hasVideo={hasVideo}
            onCaptionsChange={(captionsUrl) => edit({ captionsUrl })}
            onTranscriptChange={(transcript) => edit({ transcript })}
          />
        </section>

        <section aria-labelledby="lesson-content" className="space-y-3">
          <h3 id="lesson-content" className="text-sm font-medium">
            Contenu écrit
          </h3>
          <RichTextEditor content={draft.content} onChange={(content) => edit({ content })} placeholder="Expliquez, montrez du code, illustrez…" />
        </section>

        <section aria-labelledby="lesson-resources" className="space-y-3">
          <h3 id="lesson-resources" className="text-sm font-medium">
            Ressources à télécharger
          </h3>
          <ResourcesEditor
            lessonId={initial.id}
            resources={resources}
            onChange={(list) => {
              setResources(list);
              onLessonSaved({ id: initial.id, resourceCount: list.length });
            }}
          />
        </section>

        <section aria-labelledby="lesson-visibility" className="space-y-4 rounded-lg border p-4">
          <h3 id="lesson-visibility" className="text-sm font-medium">
            Visibilité
          </h3>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="lesson-published">Publiée</Label>
              <p className="text-sm text-muted-foreground">
                {!hasVideo && !hasContent
                  ? "Ajoutez une vidéo ou du contenu pour pouvoir publier cette leçon."
                  : "Visible des apprenants dès que la formation est publiée."}
              </p>
            </div>
            <Switch id="lesson-published" checked={published} disabled={publishing || (!published && !hasVideo && !hasContent)} onCheckedChange={(checked) => void togglePublished(checked)} />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="lesson-preview">Aperçu gratuit</Label>
              <p className="text-sm text-muted-foreground">Ouverte à tous, même sans compte, comme échantillon de la formation.</p>
              {draft.isPreview && !published && (
                <p className="text-sm text-amber-800 dark:text-amber-300">Cette leçon est en brouillon : elle ne servira d&apos;aperçu qu&apos;une fois publiée.</p>
              )}
            </div>
            <Switch id="lesson-preview" checked={draft.isPreview} onCheckedChange={(checked) => edit({ isPreview: checked })} />
          </div>
        </section>
      </div>
    </>
  );
}
