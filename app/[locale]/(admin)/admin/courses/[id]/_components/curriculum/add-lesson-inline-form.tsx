import { useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Loader2 } from "lucide-react";
import { createLessonInline } from "../../_actions/lesson-actions";
import { lessonSchema } from "./schemas";

// --- Add Lesson Inline Form ---
export interface AddLessonInlineFormProps {
  courseId: string;
  moduleId: string;
  nextOrder: number;
  onCancel: () => void;
  onCreated: () => void;
}

export function AddLessonInlineForm({
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
