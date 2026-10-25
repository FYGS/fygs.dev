"use client";

import { useCallback, useMemo, useState } from "react";
import { BarChart3, BookOpen, Eye, FileQuestion, Layers, Presentation, Radio, Settings, ShoppingBag, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExamDetail, QuizItem, SupportItem } from "@/lib/curriculum/assessments";
import type { CurriculumSnapshot } from "@/lib/curriculum/curriculum";
import { checkPublishReadiness } from "@/lib/curriculum/publish";
import { normalizeTrailerUrl } from "@/lib/curriculum/content";
import { allLessons } from "@/lib/curriculum/snapshot";
import { courseMinutesFromLessons } from "@/lib/format-duration";
import { cn } from "@/lib/utils";
import { updateCourse } from "../../../_actions/course-actions";
import { loadCurriculum } from "../../_actions/curriculum-actions";
import { AssessmentsPanel } from "./assessments-panel";
import { BuilderHeader } from "./builder-header";
import { CurriculumPanel } from "./curriculum-panel";
import { InfoPanel } from "./info-panel";
import { LearnersPanel } from "./learners-panel";
import { PreviewPanel } from "./preview-panel";
import { hasLosableChanges, SaveStatusProvider, useSaveStatus } from "./save-status";
import { SalesPanel } from "./sales-panel";
import { SettingsPanel } from "./settings-panel";
import { StatisticsPanel } from "./statistics-panel";
import { SupportsPanel } from "./supports-panel";
import type { CourseInfo, InstructorOption, SectionId, TagOption } from "./types";
import { useAutosave } from "./use-autosave";

type Editable = Exclude<keyof CourseInfo, "id" | "slug" | "published">;
type InfoPatch = Partial<Pick<CourseInfo, Editable>>;

interface Props {
  course: CourseInfo;
  curriculum: CurriculumSnapshot;
  quizzes: QuizItem[];
  supports: SupportItem[];
  exam: ExamDetail | null;
  tags: TagOption[];
  instructors: InstructorOption[];
  isAdmin: boolean;
  enrollments: number;
  initialSection: SectionId;
  initialLessonId?: string;
}

export function CourseBuilder(props: Props) {
  return (
    <SaveStatusProvider>
      <Builder {...props} />
    </SaveStatusProvider>
  );
}

/** Fields the builder shows but never sends through the autosave. */
const READ_ONLY = new Set(["id", "slug", "published"]);

type Dot = "ok" | "todo" | null;

const SECTIONS: { id: SectionId; label: string; icon: typeof BookOpen }[] = [
  { id: "infos", label: "Infos", icon: BookOpen },
  { id: "programme", label: "Programme", icon: Layers },
  { id: "evaluations", label: "Évaluations", icon: FileQuestion },
  { id: "supports", label: "Supports visuels", icon: Presentation },
  { id: "vente", label: "Page de vente", icon: ShoppingBag },
  { id: "apercu", label: "Aperçu et publication", icon: Eye },
  { id: "statistiques", label: "Statistiques", icon: BarChart3 },
  { id: "apprenants", label: "Apprenants", icon: Users },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

function Builder({ course, curriculum, quizzes: initialQuizzes, supports: initialSupports, exam: initialExam, tags: initialTags, instructors, isAdmin, enrollments, initialSection, initialLessonId }: Props) {
  const [info, setInfo] = useState<CourseInfo>(course);
  const [snapshot, setSnapshot] = useState(curriculum);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [supports, setSupports] = useState(initialSupports);
  const [exam, setExam] = useState(initialExam);
  const [tags, setTags] = useState(initialTags);
  const [section, setSection] = useState<SectionId>(initialSection);
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null);
  const { entries } = useSaveStatus();

  const { queue, flush } = useAutosave<InfoPatch>({ name: "course", save: (patch) => updateCourse(info.id, patch) });

  const update = useCallback(
    (patch: Partial<CourseInfo>) => {
      setInfo((current) => ({ ...current, ...patch }));
      // a field that cannot be saved yet (title too short, malformed trailer) stays on screen with its message but is not sent
      const sendable = Object.fromEntries(Object.entries(patch).filter(([key]) => !READ_ONLY.has(key))) as InfoPatch;
      if (sendable.title !== undefined && sendable.title.trim().length < 3) delete sendable.title;
      if (sendable.trailerUrl !== undefined && normalizeTrailerUrl(sendable.trailerUrl) === undefined) delete sendable.trailerUrl;
      if (sendable.price !== undefined && sendable.price !== null && !Number.isFinite(sendable.price)) delete sendable.price;
      if (Object.keys(sendable).length > 0) queue(sendable);
    },
    [queue],
  );

  const lessons = useMemo(() => allLessons(snapshot), [snapshot]);
  const readiness = useMemo(
    () =>
      checkPublishReadiness({
        title: info.title,
        description: info.description,
        thumbnail: info.thumbnail,
        accessTier: info.accessTier,
        price: info.price,
        lessons: lessons.map((l) => ({ title: l.title, published: l.published, hasVideo: l.hasVideo, hasContent: l.hasContent })),
      }),
    [info.title, info.description, info.thumbnail, info.accessTier, info.price, lessons],
  );
  const computedMinutes = useMemo(() => courseMinutesFromLessons(lessons.filter((l) => l.published).map((l) => l.duration)), [lessons]);

  const refreshCurriculum = useCallback(async () => {
    const result = await loadCurriculum(info.id);
    if (result.success) setSnapshot(result.snapshot);
  }, [info.id]);

  const show = useCallback((next: SectionId) => {
    setSection(next);
    window.history.replaceState(null, "", `?section=${next}`);
    document.getElementById("builder-section")?.scrollIntoView({ block: "start" });
  }, []);

  /** Leaving a section closes its editors: a quiz, an exam or slides not saved yet would be lost, so ask first. */
  const goTo = useCallback(
    (next: SectionId) => {
      if (next === section) return;
      if (hasLosableChanges(entries)) setPendingSection(next);
      else show(next);
    },
    [entries, section, show],
  );

  const dots: Partial<Record<SectionId, Dot>> = {
    infos: readiness.items.filter((i) => ["title", "description", "thumbnail"].includes(i.key)).every((i) => i.ok) ? "ok" : "todo",
    programme: readiness.items.filter((i) => ["lessons", "materials"].includes(i.key)).every((i) => i.ok) ? "ok" : "todo",
    vente: readiness.items.find((i) => i.key === "price")?.ok === false ? "todo" : null,
    apercu: readiness.ready ? "ok" : "todo",
  };
  const counts: Partial<Record<SectionId, number>> = {
    evaluations: quizzes.length + (exam ? 1 : 0),
    supports: supports.length,
  };

  return (
    <div className="space-y-6">
      <BuilderHeader
        courseId={info.id}
        slug={info.slug}
        title={info.title}
        published={info.published}
        enrollments={enrollments}
        readiness={readiness}
        beforePublish={flush}
        onPublishedChange={(published) => setInfo((i) => ({ ...i, published }))}
        onGoToSection={goTo}
      />

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Sections de la formation" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const dot = dots[id];
              const count = counts[id];
              return (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(id)}
                    aria-current={section === id ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      section === id ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1 whitespace-nowrap">{label}</span>
                    {dot && (
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", dot === "ok" ? "bg-emerald-500" : "bg-amber-500")}
                        role="img"
                        aria-label={dot === "ok" ? "Complet" : "À compléter"}
                      />
                    )}
                    {count ? <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{count}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section id="builder-section" aria-label={SECTIONS.find((s) => s.id === section)?.label} className="min-w-0 max-w-4xl scroll-mt-24 space-y-6">
          {info.published && (
            <p className="flex items-start gap-2 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
              <Radio className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>Formation en ligne : vos modifications sont visibles immédiatement par les apprenants.</span>
            </p>
          )}
          {section === "infos" && <InfoPanel info={info} update={update} tags={tags} onTagCreated={(tag) => setTags((list) => (list.some((t) => t.id === tag.id) ? list : [...list, tag]))} computedMinutes={computedMinutes} />}
          {section === "programme" && (
            <CurriculumPanel courseId={info.id} courseSlug={info.slug} coursePublished={info.published} snapshot={snapshot} onSnapshot={setSnapshot} onGoToSection={goTo} initialLessonId={initialLessonId} />
          )}
          {section === "evaluations" && (
            <AssessmentsPanel courseId={info.id} modules={snapshot.modules} quizzes={quizzes} onQuizzes={setQuizzes} exam={exam} onExam={setExam} onModulesChanged={() => void refreshCurriculum()} />
          )}
          {section === "supports" && <SupportsPanel courseId={info.id} modules={snapshot.modules} supports={supports} onSupports={setSupports} onModulesChanged={() => void refreshCurriculum()} />}
          {section === "vente" && <SalesPanel info={info} update={update} snapshot={snapshot} onGoToSection={goTo} />}
          {section === "apercu" && <PreviewPanel info={info} readiness={readiness} snapshot={snapshot} quizCount={quizzes.length} hasExam={exam !== null} onGoToSection={goTo} />}
          {section === "parametres" && (
            <SettingsPanel
              info={info}
              update={update}
              onSlugChanged={(slug) => setInfo((i) => ({ ...i, slug }))}
              isAdmin={isAdmin}
              instructors={instructors}
              enrollments={enrollments}
              beforeLeave={flush}
            />
          )}
          {section === "statistiques" && <StatisticsPanel courseId={info.id} />}
          {section === "apprenants" && <LearnersPanel courseId={info.id} accessTier={info.accessTier} isAdmin={isAdmin} />}
        </section>
      </div>

      <AlertDialog open={pendingSection !== null} onOpenChange={(open) => !open && setPendingSection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.values(entries).find((e) => e.state === "unsaved" || e.state === "error")?.message ?? "Des modifications ne sont pas enregistrées"}. Si vous
              changez de section maintenant, elles seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rester et enregistrer</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const next = pendingSection;
                setPendingSection(null);
                if (next) show(next);
              }}
            >
              Quitter sans enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
