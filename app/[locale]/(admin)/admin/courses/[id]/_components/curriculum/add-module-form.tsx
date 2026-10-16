import { useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { createModule } from "../../_actions/module-actions";
import { moduleSchema } from "./schemas";

// --- Add Module Form ---
export interface AddModuleFormProps {
  courseId: string;
  nextOrder: number;
  onCancel: () => void;
  onCreated: () => void;
}

export function AddModuleForm({
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
