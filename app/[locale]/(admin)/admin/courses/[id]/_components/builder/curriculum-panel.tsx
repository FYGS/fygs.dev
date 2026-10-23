"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  FolderInput,
  GripVertical,
  Layers,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { CurriculumSnapshot, LessonSummary, ModuleImpact, ModuleSummary } from "@/lib/curriculum/curriculum";
import { moveLessonInSnapshot, moveModuleInSnapshot } from "@/lib/curriculum/snapshot";
import { formatSeconds } from "@/lib/format-duration";
import { cn } from "@/lib/utils";
import {
  addLesson,
  addModule,
  getModuleImpact,
  moveLesson,
  removeLesson,
  removeModule,
  renameModule,
  reorderModules,
  setModulePublished,
} from "../../_actions/curriculum-actions";
import { LessonDrawer } from "./lesson-drawer";
import type { SectionId } from "./types";

interface Props {
  courseId: string;
  courseSlug: string;
  coursePublished: boolean;
  snapshot: CurriculumSnapshot;
  onSnapshot: Dispatch<SetStateAction<CurriculumSnapshot>>;
  onGoToSection: (section: SectionId) => void;
  /** The lesson to open on arrival (from a link). */
  initialLessonId?: string;
}

const STATUS = {
  draft: { label: "Brouillon", className: "border-border text-muted-foreground" },
  incomplete: { label: "À compléter", className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  ready: { label: "Prête", className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
} as const;

export function CurriculumPanel({ courseId, courseSlug, coursePublished, snapshot, onSnapshot, onGoToSection, initialLessonId }: Props) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(initialLessonId ?? null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [newModule, setNewModule] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<ModuleSummary | null>(null);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<LessonSummary | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Runs a server change that answers with the new outline; applies `optimistic` first and rolls back on failure. */
  async function mutate(
    run: () => Promise<{ success: true; snapshot: CurriculumSnapshot } | { success: false; error: string }>,
    optimistic?: CurriculumSnapshot,
  ) {
    const before = snapshot;
    if (optimistic) onSnapshot(optimistic);
    setBusy(true);
    try {
      const result = await run();
      if (result.success) onSnapshot(result.snapshot);
      else {
        onSnapshot(before);
        toast.error(result.error);
      }
      return result.success;
    } finally {
      setBusy(false);
    }
  }

  async function createModuleNamed() {
    const title = newModule.trim();
    if (!title) return;
    setAdding(true);
    const result = await addModule(courseId, title);
    setAdding(false);
    if (!result.success) return toast.error(result.error);
    onSnapshot(result.snapshot);
    setNewModule("");
  }

  async function createLessonIn(moduleId: string, title: string) {
    const result = await addLesson(courseId, moduleId, title);
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    onSnapshot(result.snapshot);
    if (result.lessonId) setOpenLessonId(result.lessonId);
    return true;
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("module:")) {
      // dropped on a lesson or a module body: the target is the module that holds it
      const overModuleId = overId.startsWith("lesson:")
        ? snapshot.modules.find((m) => m.lessons.some((l) => l.id === overId.slice("lesson:".length)))?.id
        : overId.slice(overId.indexOf(":") + 1);
      const toIndex = snapshot.modules.findIndex((m) => m.id === overModuleId);
      const moduleId = activeId.slice("module:".length);
      if (toIndex === -1 || moduleId === overModuleId) return;
      const next = moveModuleInSnapshot(snapshot, moduleId, toIndex);
      void mutate(() => reorderModules(courseId, next.modules.map((m) => m.id)), next);
      return;
    }

    const lessonId = activeId.slice("lesson:".length);
    let toModuleId: string | null = null;
    let index = 0;
    if (overId.startsWith("lesson:")) {
      const overLesson = overId.slice("lesson:".length);
      const mod = snapshot.modules.find((m) => m.lessons.some((l) => l.id === overLesson));
      if (!mod) return;
      toModuleId = mod.id;
      index = mod.lessons.findIndex((l) => l.id === overLesson);
    } else if (overId.startsWith("drop:") || overId.startsWith("module:")) {
      toModuleId = overId.slice(overId.indexOf(":") + 1);
      index = snapshot.modules.find((m) => m.id === toModuleId)?.lessons.length ?? 0;
    }
    if (!toModuleId) return;
    void moveTo(lessonId, toModuleId, index);
  }

  function moveTo(lessonId: string, toModuleId: string, index: number) {
    const next = moveLessonInSnapshot(snapshot, lessonId, toModuleId, index);
    if (next === snapshot) return;
    return mutate(() => moveLesson(lessonId, toModuleId, index), next);
  }

  async function publishModule(mod: ModuleSummary, published: boolean) {
    setBusy(true);
    const result = await setModulePublished(mod.id, published);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    onSnapshot(result.snapshot);
    if (published) {
      toast.success(
        result.skipped
          ? `${result.changed} leçon(s) publiée(s). ${result.skipped} sans vidéo ni contenu restent en brouillon.`
          : `${result.changed} leçon(s) publiée(s).`,
      );
    } else {
      toast.success(`${result.changed} leçon(s) repassée(s) en brouillon.`);
    }
  }

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalLessons = snapshot.modules.reduce((n, m) => n + m.lessons.length, 0) + snapshot.looseLessons.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Programme</h2>
          <p className="text-sm text-muted-foreground">
            {snapshot.modules.length} module{snapshot.modules.length > 1 ? "s" : ""} · {totalLessons} leçon{totalLessons > 1 ? "s" : ""}. Glissez pour réorganiser, ou utilisez les flèches.
          </p>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Enregistrement en cours" />}
      </div>

      {snapshot.modules.length === 0 && snapshot.looseLessons.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Commencez par un premier module</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Un module regroupe des leçons autour d&apos;une idée : « Les bases », « Premier projet »…
          </p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={snapshot.modules.map((m) => `module:${m.id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {snapshot.modules.map((mod, index) => (
              <ModuleBlock
                key={mod.id}
                mod={mod}
                position={index}
                total={snapshot.modules.length}
                expanded={!collapsed.has(mod.id)}
                modules={snapshot.modules}
                onToggle={() => toggle(mod.id)}
                onMoveModule={(delta) => {
                  const next = moveModuleInSnapshot(snapshot, mod.id, index + delta);
                  void mutate(() => reorderModules(courseId, next.modules.map((m) => m.id)), next);
                }}
                onRename={(title) => mutate(() => renameModule(mod.id, title))}
                onDelete={() => setDeleteModuleTarget(mod)}
                onPublish={(published) => publishModule(mod, published)}
                onAddLesson={(title) => createLessonIn(mod.id, title)}
                onOpenLesson={setOpenLessonId}
                onMoveLesson={(lessonId, delta) => {
                  const at = mod.lessons.findIndex((l) => l.id === lessonId);
                  void moveTo(lessonId, mod.id, at + delta);
                }}
                onMoveLessonToModule={(lessonId, toModuleId) => {
                  const target = snapshot.modules.find((m) => m.id === toModuleId);
                  void moveTo(lessonId, toModuleId, target?.lessons.length ?? 0);
                }}
                onDeleteLesson={setDeleteLessonTarget}
                onGoToSection={onGoToSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {snapshot.looseLessons.length > 0 && (
        <section className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4" aria-labelledby="loose-lessons">
          <h3 id="loose-lessons" className="font-medium">
            Leçons sans module
          </h3>
          <p className="text-sm text-muted-foreground">
            Ces leçons ne sont rattachées à aucun module. Rangez-les dans un module pour qu&apos;elles s&apos;affichent dans le bon ordre.
          </p>
          <ul className="space-y-2">
            {snapshot.looseLessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonLine
                  lesson={lesson}
                  modules={snapshot.modules}
                  onOpen={() => setOpenLessonId(lesson.id)}
                  onMoveToModule={(toModuleId) => {
                    const target = snapshot.modules.find((m) => m.id === toModuleId);
                    void moveTo(lesson.id, toModuleId, target?.lessons.length ?? 0);
                  }}
                  onDelete={() => setDeleteLessonTarget(lesson)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <form
        className="flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void createModuleNamed();
        }}
      >
        <Input
          value={newModule}
          maxLength={150}
          placeholder={snapshot.modules.length === 0 ? "Titre du premier module" : "Titre du nouveau module"}
          aria-label="Titre du nouveau module"
          onChange={(e) => setNewModule(e.target.value)}
        />
        <Button type="submit" disabled={adding || !newModule.trim()}>
          {adding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Plus className="mr-1.5 h-4 w-4" aria-hidden />}
          Ajouter un module
        </Button>
      </form>

      <LessonDrawer
        courseId={courseId}
        courseSlug={courseSlug}
        courseLive={coursePublished}
        lessonId={openLessonId}
        onClose={() => setOpenLessonId(null)}
        onLessonSaved={(summary) => {
          const swap = (lessons: LessonSummary[]) => lessons.map((l) => (l.id === summary.id ? { ...l, ...summary, order: l.order } : l));
          onSnapshot((current) => ({
            modules: current.modules.map((m) => ({ ...m, lessons: swap(m.lessons) })),
            looseLessons: swap(current.looseLessons),
          }));
        }}
      />

      <DeleteModuleDialog
        target={deleteModuleTarget}
        onCancel={() => setDeleteModuleTarget(null)}
        onConfirm={async () => {
          const target = deleteModuleTarget;
          setDeleteModuleTarget(null);
          if (target && (await mutate(() => removeModule(target.id)))) toast.success(`Module « ${target.title} » supprimé.`);
        }}
      />

      <AlertDialog open={deleteLessonTarget !== null} onOpenChange={(open) => !open && setDeleteLessonTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la leçon « {deleteLessonTarget?.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Son contenu, ses ressources, les notes des apprenants et leur progression sur cette leçon sont supprimés. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const target = deleteLessonTarget;
                setDeleteLessonTarget(null);
                if (target) await mutate(() => removeLesson(target.id));
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ------------------------------------------------------------------ module

interface ModuleBlockProps {
  mod: ModuleSummary;
  position: number;
  total: number;
  expanded: boolean;
  modules: ModuleSummary[];
  onToggle: () => void;
  onMoveModule: (delta: -1 | 1) => void;
  onRename: (title: string) => Promise<boolean>;
  onDelete: () => void;
  onPublish: (published: boolean) => void;
  onAddLesson: (title: string) => Promise<boolean>;
  onOpenLesson: (id: string) => void;
  onMoveLesson: (lessonId: string, delta: -1 | 1) => void;
  onMoveLessonToModule: (lessonId: string, toModuleId: string) => void;
  onDeleteLesson: (lesson: LessonSummary) => void;
  onGoToSection: (section: SectionId) => void;
}

function ModuleBlock({
  mod,
  position,
  total,
  expanded,
  modules,
  onToggle,
  onMoveModule,
  onRename,
  onDelete,
  onPublish,
  onAddLesson,
  onOpenLesson,
  onMoveLesson,
  onMoveLessonToModule,
  onDeleteLesson,
  onGoToSection,
}: ModuleBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `module:${mod.id}`,
    data: { type: "module" },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `drop:${mod.id}` });
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [newLesson, setNewLesson] = useState("");
  const [adding, setAdding] = useState(false);

  const seconds = mod.lessons.reduce((n, l) => n + (l.duration ?? 0), 0);
  const published = mod.lessons.filter((l) => l.published).length;

  async function commitRename() {
    const next = title.trim();
    setRenaming(false);
    if (next && next !== mod.title) {
      if (!(await onRename(next))) setTitle(mod.title);
    } else setTitle(mod.title);
  }

  async function submitLesson() {
    const value = newLesson.trim();
    if (!value) return;
    setAdding(true);
    const ok = await onAddLesson(value);
    setAdding(false);
    if (ok) setNewLesson("");
  }

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-lg border bg-card", isDragging && "relative z-10 opacity-80 shadow-lg")}
      aria-label={`Module ${position + 1} : ${mod.title}`}
    >
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Déplacer le module ${mod.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle} aria-expanded={expanded} aria-label={expanded ? "Replier le module" : "Déplier le module"}>
          {expanded ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
        </Button>

        <div className="min-w-0 flex-1">
          {renaming ? (
            <Input
              autoFocus
              value={title}
              maxLength={150}
              aria-label="Titre du module"
              className="h-8"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitRename();
                if (e.key === "Escape") {
                  setTitle(mod.title);
                  setRenaming(false);
                }
              }}
            />
          ) : (
            <button type="button" className="max-w-full truncate rounded text-left font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setRenaming(true)} title="Renommer le module">
              <span className="mr-2 text-muted-foreground">{position + 1}.</span>
              {mod.title}
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            {mod.lessons.length} leçon{mod.lessons.length > 1 ? "s" : ""} · {published} publiée{published > 1 ? "s" : ""}
            {seconds > 0 && ` · ${formatSeconds(seconds)}`}
            {mod.quizCount > 0 && ` · ${mod.quizCount} quiz`}
            {mod.supportCount > 0 && ` · ${mod.supportCount} support${mod.supportCount > 1 ? "s" : ""}`}
          </p>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={position === 0} onClick={() => onMoveModule(-1)} aria-label={`Monter le module ${mod.title}`}>
          <ArrowUp className="h-4 w-4" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={position === total - 1} onClick={() => onMoveModule(1)} aria-label={`Descendre le module ${mod.title}`}>
          <ArrowDown className="h-4 w-4" aria-hidden />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions du module ${mod.title}`}>
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>Renommer</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onPublish(true)} disabled={mod.lessons.length === 0}>
              Publier toutes les leçons prêtes
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onPublish(false)} disabled={published === 0}>
              Repasser toutes les leçons en brouillon
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              Supprimer le module…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && (
        <div className="space-y-3 border-t p-3" ref={setDropRef}>
          <SortableContext items={mod.lessons.map((l) => `lesson:${l.id}`)} strategy={verticalListSortingStrategy}>
            <ul className={cn("min-h-10 space-y-2 rounded-md", isOver && mod.lessons.length === 0 && "bg-primary/5 ring-2 ring-primary/30")}>
              {mod.lessons.length === 0 && <li className="px-2 py-3 text-sm text-muted-foreground">Aucune leçon. Ajoutez la première ci-dessous.</li>}
              {mod.lessons.map((lesson, i) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={mod.id}
                  modules={modules}
                  isFirst={i === 0}
                  isLast={i === mod.lessons.length - 1}
                  onOpen={() => onOpenLesson(lesson.id)}
                  onMove={(delta) => onMoveLesson(lesson.id, delta)}
                  onMoveToModule={(toModuleId) => onMoveLessonToModule(lesson.id, toModuleId)}
                  onDelete={() => onDeleteLesson(lesson)}
                />
              ))}
            </ul>
          </SortableContext>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void submitLesson();
            }}
          >
            <Input
              value={newLesson}
              maxLength={200}
              placeholder="Titre de la nouvelle leçon"
              aria-label={`Titre de la nouvelle leçon du module ${mod.title}`}
              onChange={(e) => setNewLesson(e.target.value)}
            />
            <Button type="submit" variant="outline" disabled={adding || !newLesson.trim()}>
              {adding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Plus className="mr-1.5 h-4 w-4" aria-hidden />}
              Ajouter
            </Button>
          </form>

          {(mod.quizCount > 0 || mod.supportCount > 0) && (
            <p className="text-xs text-muted-foreground">
              Ce module a aussi {mod.quizCount > 0 && `${mod.quizCount} quiz`}
              {mod.quizCount > 0 && mod.supportCount > 0 && " et "}
              {mod.supportCount > 0 && `${mod.supportCount} support${mod.supportCount > 1 ? "s" : ""} visuel${mod.supportCount > 1 ? "s" : ""}`}.{" "}
              <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => onGoToSection(mod.quizCount > 0 ? "evaluations" : "supports")}>
                Les gérer
              </button>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ lessons

interface LessonLineProps {
  lesson: LessonSummary;
  modules: ModuleSummary[];
  onOpen: () => void;
  onMoveToModule: (moduleId: string) => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onMove?: (delta: -1 | 1) => void;
  handle?: React.ReactNode;
}

function LessonLine({ lesson, modules, onOpen, onMoveToModule, onDelete, isFirst, isLast, onMove, handle }: LessonLineProps) {
  const status = STATUS[lesson.status];
  const otherModules = modules.filter((m) => m.id !== lesson.moduleId);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-2 py-1.5">
      {handle}
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {lesson.title}
      </button>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {lesson.hasVideo && <Video className="h-3.5 w-3.5" aria-label="Contient une vidéo" />}
        {lesson.hasContent && <FileText className="h-3.5 w-3.5" aria-label="Contient du texte" />}
        {lesson.resourceCount > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
            <span aria-label={`${lesson.resourceCount} ressource(s)`}>{lesson.resourceCount}</span>
          </span>
        )}
        {lesson.duration ? <span>{formatSeconds(lesson.duration)}</span> : null}
        {lesson.isPreview && (
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" aria-hidden />
            Aperçu gratuit
          </Badge>
        )}
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      {onMove && (
        <>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isFirst} onClick={() => onMove(-1)} aria-label={`Monter la leçon ${lesson.title}`}>
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLast} onClick={() => onMove(1)} aria-label={`Descendre la leçon ${lesson.title}`}>
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions de la leçon ${lesson.title}`}>
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onOpen}>Modifier</DropdownMenuItem>
          {otherModules.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <FolderInput className="h-3.5 w-3.5" aria-hidden />
                Déplacer vers
              </DropdownMenuLabel>
              {otherModules.map((m) => (
                <DropdownMenuItem key={m.id} onSelect={() => onMoveToModule(m.id)}>
                  {m.title}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
            Supprimer…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SortableLesson({
  lesson,
  moduleId,
  ...rest
}: Omit<LessonLineProps, "handle"> & { moduleId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `lesson:${lesson.id}`,
    data: { type: "lesson", moduleId },
  });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "relative z-10 opacity-80 shadow-lg")}>
      <LessonLine
        lesson={lesson}
        {...rest}
        handle={
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Déplacer la leçon ${lesson.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        }
      />
    </li>
  );
}

// ------------------------------------------------------------------ delete module

function DeleteModuleDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: ModuleSummary | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [loaded, setLoaded] = useState<{ id: string; impact: ModuleImpact } | null>(null);
  const targetId = target?.id;

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;
    void getModuleImpact(targetId).then((r) => {
      if (!cancelled && r.success) setLoaded({ id: targetId, impact: r });
    });
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  const impact = loaded && loaded.id === targetId ? loaded.impact : null;

  return (
    <AlertDialog open={target !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le module « {target?.title} » ?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {impact ? (
                <>
                  <p>Seront supprimés définitivement :</p>
                  <ul className="list-inside list-disc">
                    <li>
                      {impact.lessons} leçon{impact.lessons > 1 ? "s" : ""} (contenu, ressources, notes)
                    </li>
                    <li>
                      {impact.quizzes} quiz et {impact.supports} support{impact.supports > 1 ? "s" : ""} visuel{impact.supports > 1 ? "s" : ""}
                    </li>
                  </ul>
                  {impact.learnersWithProgress > 0 && (
                    <p className="font-medium text-destructive">
                      {impact.learnersWithProgress} apprenant{impact.learnersWithProgress > 1 ? "s" : ""} perdr{impact.learnersWithProgress > 1 ? "ont" : "a"} sa progression sur ces leçons.
                    </p>
                  )}
                </>
              ) : (
                <p>Calcul de ce qui sera supprimé…</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!impact}>
            Supprimer le module
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
