import { useTransition } from "react";
import { toast } from "sonner";
import { DndContext, closestCenter, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, ChevronDown, GripVertical, Trash2, Loader2 } from "lucide-react";
import { deleteModule } from "../../_actions/module-actions";
import type { Module } from "./types";
import { SortableLessonRow, LessonRow } from "./lesson-row";
import { AddLessonInlineForm } from "./add-lesson-inline-form";

// --- Module Card ---
export interface ModuleCardProps {
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

export function ModuleCard({
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
