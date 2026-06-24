"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ChevronDown,
  GripVertical,
  FileText,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  createModule,
  deleteModule,
  reorderModules,
} from "../_actions/module-actions";
import {
  createLessonInline,
  updateLessonInline,
  deleteLessonInline,
  reorderLessons,
} from "../_actions/lesson-actions";
import Link from "next/link";

// Types
interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  published: boolean;
  duration: number | null;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: Lesson[];
}

interface CurriculumTabProps {
  courseId: string;
  modules: Module[];
}

// Schemas
const moduleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

export function CurriculumTab({ courseId, modules }: CurriculumTabProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id)),
  );
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [localModules, setLocalModules] = useState(modules);
  const [, startReorderTransition] = useTransition();

  // Sync local state when server data updates
  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localModules.findIndex((m) => m.id === active.id);
    const newIndex = localModules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(localModules, oldIndex, newIndex);
    setLocalModules(reordered);

    // Persist new order
    startReorderTransition(async () => {
      const orders = reordered.map((m, i) => ({ id: m.id, order: i + 1 }));
      const result = await reorderModules(courseId, orders);
      if (result.success) {
        toast.success("Modules réordonnés");
        router.refresh();
      } else {
        // Revert on failure
        setLocalModules(modules);
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleLessonDragEnd = (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const mod = localModules.find((m) => m.id === moduleId);
    if (!mod) return;

    const oldIndex = mod.lessons.findIndex((l) => l.id === active.id);
    const newIndex = mod.lessons.findIndex((l) => l.id === over.id);
    const reorderedLessons = arrayMove(mod.lessons, oldIndex, newIndex);

    // Update local state
    setLocalModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: reorderedLessons } : m,
      ),
    );

    // Persist
    startReorderTransition(async () => {
      const orders = reorderedLessons.map((l, i) => ({
        id: l.id,
        order: i + 1,
      }));
      const result = await reorderLessons(moduleId, orders);
      if (result.success) {
        router.refresh();
      } else {
        setLocalModules(modules);
        toast.error(result.error || "Erreur");
      }
    });
  };

  const totalLessons = localModules.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );
  const publishedLessons = localModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.published).length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {localModules.length}
          </div>
          <div className="text-body-sm text-muted-foreground">Modules</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {totalLessons}
          </div>
          <div className="text-body-sm text-muted-foreground">Leçons</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {publishedLessons}/{totalLessons}
          </div>
          <div className="text-body-sm text-muted-foreground">Publiées</div>
        </div>
      </div>

      {/* Modules List with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleModuleDragEnd}
      >
        <SortableContext
          items={localModules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {localModules.map((module) => (
              <SortableModuleCard
                key={module.id}
                module={module}
                courseId={courseId}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                isAddingLesson={addingLessonTo === module.id}
                onStartAddLesson={() => setAddingLessonTo(module.id)}
                onCancelAddLesson={() => setAddingLessonTo(null)}
                onLessonAdded={() => {
                  setAddingLessonTo(null);
                  router.refresh();
                }}
                onModuleDeleted={() => router.refresh()}
                onLessonDragEnd={(event) =>
                  handleLessonDragEnd(module.id, event)
                }
                sensors={sensors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Module */}
      {isAddingModule ? (
        <AddModuleForm
          courseId={courseId}
          nextOrder={modules.length + 1}
          onCancel={() => setIsAddingModule(false)}
          onCreated={() => {
            setIsAddingModule(false);
            router.refresh();
          }}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAddingModule(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un module
        </Button>
      )}

      {/* Empty state */}
      {modules.length === 0 && !isAddingModule && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-heading-3 text-foreground mb-2">
              Aucun module
            </h3>
            <p className="text-body-sm text-muted-foreground text-center max-w-sm">
              Commencez par créer des modules pour structurer votre formation.
              Chaque module contiendra des leçons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sortable Module Card Wrapper ---
interface SortableModuleCardProps extends ModuleCardProps {
  onLessonDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
}

function SortableModuleCard(props: SortableModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ModuleCard
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// --- Module Card ---
interface ModuleCardProps {
  module: Module;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isAddingLesson: boolean;
  onStartAddLesson: () => void;
  onCancelAddLesson: () => void;
  onLessonAdded: () => void;
  onModuleDeleted: () => void;
  onLessonDragEnd?: (event: DragEndEvent) => void;
  sensors?: ReturnType<typeof useSensors>;
  dragHandleProps?: Record<string, unknown>;
}

function ModuleCard({
  module,
  courseId,
  isExpanded,
  onToggle,
  isAddingLesson,
  onStartAddLesson,
  onCancelAddLesson,
  onLessonAdded,
  onModuleDeleted,
  onLessonDragEnd,
  sensors,
  dragHandleProps,
}: ModuleCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteModule(module.id);
      if (result.success) {
        toast.success("Module supprimé");
        onModuleDeleted();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    });
  };

  return (
    <Card className="transition-all duration-[var(--duration-normal)]">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
            <button
              className="cursor-grab active:cursor-grabbing touch-none"
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </button>
            <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              {module.order}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {module.title}
              </h4>
              <p className="text-caption text-muted-foreground">
                {module.lessons.length} leçon
                {module.lessons.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => e.stopPropagation()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le module ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera le module &ldquo;{module.title}
                      &rdquo; et toutes ses leçons. Cette action est
                      irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-[var(--duration-normal)] ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {/* Lessons list with Drag & Drop */}
            {onLessonDragEnd && sensors ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onLessonDragEnd}
              >
                <SortableContext
                  items={module.lessons.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {module.lessons.map((lesson) => (
                    <SortableLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      courseId={courseId}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              module.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  courseId={courseId}
                />
              ))
            )}

            {/* Inline lesson creation */}
            {isAddingLesson ? (
              <AddLessonInlineForm
                courseId={courseId}
                moduleId={module.id}
                nextOrder={module.lessons.length + 1}
                onCancel={onCancelAddLesson}
                onCreated={onLessonAdded}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full border border-dashed border-border/50 text-muted-foreground hover:text-foreground"
                onClick={onStartAddLesson}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Ajouter une leçon
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// --- Sortable Lesson Row Wrapper ---
function SortableLessonRow({ lesson, courseId }: LessonRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LessonRow
        lesson={lesson}
        courseId={courseId}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// --- Lesson Row ---
interface LessonRowProps {
  lesson: Lesson;
  courseId: string;
  dragHandleProps?: Record<string, unknown>;
}

function LessonRow({ lesson, dragHandleProps }: LessonRowProps) {
  const router = useRouter();
  const [isTogglingPublish, startToggleTransition] = useTransition();
  const [isDeletingLesson, startDeleteLessonTransition] = useTransition();

  const handleTogglePublish = () => {
    startToggleTransition(async () => {
      const result = await updateLessonInline(lesson.id, {
        published: !lesson.published,
      });
      if (result.success) {
        toast.success(lesson.published ? "Leçon dépubliée" : "Leçon publiée");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = () => {
    startDeleteLessonTransition(async () => {
      const result = await deleteLessonInline(lesson.id);
      if (result.success) {
        toast.success("Leçon supprimée");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group">
      <button
        className="cursor-grab active:cursor-grabbing touch-none shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
      </button>
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-body-sm text-foreground truncate block">
          {lesson.title}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge
          variant={lesson.published ? "default" : "secondary"}
          className="text-[10px] px-1.5 py-0"
        >
          {lesson.published ? "Publié" : "Brouillon"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleTogglePublish}
          disabled={isTogglingPublish}
          title={lesson.published ? "Dépublier" : "Publier"}
        >
          {isTogglingPublish ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : lesson.published ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={`/admin/lessons/${lesson.id}/edit`}>
            <Pencil className="h-3 w-3" />
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isDeletingLesson}
            >
              {isDeletingLesson ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la leçon ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La leçon &ldquo;{lesson.title}
                &rdquo; sera définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// --- Add Module Form ---
interface AddModuleFormProps {
  courseId: string;
  nextOrder: number;
  onCancel: () => void;
  onCreated: () => void;
}

function AddModuleForm({
  courseId,
  nextOrder,
  onCancel,
  onCreated,
}: AddModuleFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ title: string }>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (data: { title: string }) => {
    startTransition(async () => {
      const result = await createModule(courseId, {
        title: data.title,
        order: nextOrder,
      });
      if (result.success) {
        toast.success("Module créé");
        form.reset();
        onCreated();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    });
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-3"
        >
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <Input
            {...form.register("title")}
            placeholder="Nom du module..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        </form>
        {form.formState.errors.title && (
          <p className="text-caption text-destructive mt-2">
            {form.formState.errors.title.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Add Lesson Inline Form ---
interface AddLessonInlineFormProps {
  courseId: string;
  moduleId: string;
  nextOrder: number;
  onCancel: () => void;
  onCreated: () => void;
}

function AddLessonInlineForm({
  courseId,
  moduleId,
  nextOrder,
  onCancel,
  onCreated,
}: AddLessonInlineFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ title: string }>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (data: { title: string }) => {
    startTransition(async () => {
      const result = await createLessonInline({
        title: data.title,
        courseId,
        moduleId,
        order: nextOrder,
      });
      if (result.success) {
        toast.success("Leçon créée");
        form.reset();
        onCreated();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-center gap-2 p-2 rounded-md border border-primary/20 bg-primary/5"
    >
      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
      <Input
        {...form.register("title")}
        placeholder="Titre de la leçon..."
        className="flex-1 h-8 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button type="submit" size="sm" className="h-7 px-2" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={onCancel}
      >
        Annuler
      </Button>
    </form>
  );
}
