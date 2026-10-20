"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  Trash2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { updateModule, deleteModule } from "../../../_actions/module-actions";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schema for module editing
const moduleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleEditFormProps {
  module: {
    id: string;
    title: string;
    slug: string;
    order: number;
    courseId: string;
  };
  course: {
    id: string;
    slug: string;
    title: string;
  };
}

export function ModuleEditForm({ module, course }: ModuleEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module.title,
      order: module.order,
    },
  });

//   // Generate slug from title
//   const generateSlug = (title: string) => {
//     return title
//       .toLowerCase()
//       .replace(/[^a-z0-9\s-]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//       .trim();
//   };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    // We don't store the slug separately, but we'll generate it on submission
  };

  // Handle form submission
  const onSubmit = async (data: ModuleFormData) => {
    startTransition(async () => {
      try {
        const result = await updateModule(module.id, {
          title: data.title,
          order: data.order,
        });

        if (result.success) {
          toast.success("Module mis à jour avec succès!");
          router.refresh();
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Module update error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  // Handle module deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteModule(module.id);
      
      if (result.success) {
        toast.success("Module supprimé avec succès!");
        router.push(`/admin/courses/${course.id}`);
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Module deletion error:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Modifier le module</CardTitle>
            <CardDescription>
              Modifiez les informations de votre module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du module</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Ex: Introduction à React"
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
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
                  required
                />
                {form.formState.errors.order && (
                  <p className="text-sm text-destructive">{form.formState.errors.order.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href={`/admin/courses/${course.id}`}>
                Retour à la formation
              </Link>
            </Button>
            
            {module && (
              <Button variant="outline" asChild>
                <Link href={`/formations/${course.slug}#${module.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir en ligne
                </Link>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending || isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible
                    et supprimera toutes les données associées (leçons, progrès).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive-solid text-destructive-foreground hover:bg-destructive-solid/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button type="submit" disabled={isPending || isDeleting}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}