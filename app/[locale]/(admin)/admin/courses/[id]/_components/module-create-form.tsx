"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus } from "lucide-react";
import { createModule } from "../_actions/module-actions";

// Schema for module creation
const moduleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleCreateFormProps {
  courseId: string;
  onModuleCreated?: () => void;
}

export function ModuleCreateForm({ courseId, onModuleCreated }: ModuleCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      order: 1,
    },
  });

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    // We don't have a slug field in the form, but we'll generate it on submission
  };

  // Handle form submission
  const onSubmit = async (data: ModuleFormData) => {
    startTransition(async () => {
      try {
        const result = await createModule(courseId, {
          title: data.title,
          order: data.order,
        });

        if (result.success) {
          toast.success("Module créé avec succès!");
          form.reset();
          router.refresh();
          onModuleCreated?.();
        } else {
          toast.error(result.error || "Erreur lors de la création du module");
        }
      } catch (error) {
        console.error("Module creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer un nouveau module
        </CardTitle>
        <CardDescription>
          Ajoutez un nouveau module à votre formation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du module</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Ex: Introduction à React"
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Ordre dans la formation</Label>
              <Input
                id="order"
                type="number"
                min="1"
                {...form.register("order", { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.order && (
                <p className="text-sm text-destructive">{form.formState.errors.order.message}</p>
              )}
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Créer le module
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}