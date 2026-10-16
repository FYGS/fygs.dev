import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GripVertical, FileText, Trash2, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { updateLessonInline, deleteLessonInline } from "../../_actions/lesson-actions";
import Link from "next/link";
import type { Lesson } from "./types";

// --- Sortable Lesson Row Wrapper ---
export function SortableLessonRow({ lesson, courseId }: LessonRowProps) {
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
export interface LessonRowProps {
  lesson: Lesson;
  courseId: string;
  dragHandleProps?: Record<string, unknown>;
}

export function LessonRow({ lesson, dragHandleProps }: LessonRowProps) {
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
