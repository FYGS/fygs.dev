"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createVisualSupport } from "../../../_actions/visual-support-actions";

// Schema for visual support creation
const visualSupportSchema = z.object({
  moduleId: z.number().min(1, "Le module est requis"),
  title: z.string().min(1, "Le titre est requis"),
  order: z.number().min(1, "L'ordre est requis"),
  slides: z.array(z.object({
    title: z.string().min(1, "Le titre du slide est requis"),
    content: z.string().min(1, "Le contenu du slide est requis"),
  })).min(1, "Au moins un slide est requis"),
});

type VisualSupportFormData = z.infer<typeof visualSupportSchema>;

interface VisualSupportCreateFormProps {
  course: {
    id: string;
    title: string;
    modules: {
      id: string;
      title: string;
      order: number;
    }[];
  };
}

export function VisualSupportCreateForm({ course }: VisualSupportCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<VisualSupportFormData>({
    resolver: zodResolver(visualSupportSchema),
    defaultValues: {
      moduleId: 1,
      title: "",
      order: 1,
      slides: [
        {
          title: "",
          content: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slides",
  });

  // Handle form submission
  const onSubmit = async (data: VisualSupportFormData) => {
    startTransition(async () => {
      try {
        const processedData = {
          moduleId: data.moduleId,
          title: data.title,
          order: data.order,
          content: {
            slides: data.slides,
          },
        };

        const result = await createVisualSupport(course.id, processedData);

        if (result.success) {
          toast.success("Support visuel créé avec succès!");
          router.push(`/admin/courses/${course.id}?tab=visual-supports`);
        } else {
          toast.error(result.error || "Erreur lors de la création du support visuel");
        }
      } catch (error) {
        console.error("Visual support creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const addSlide = () => {
    append({
      title: "",
      content: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du support visuel</CardTitle>
            <CardDescription>
              Configurez les informations de base de votre support visuel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="moduleId">Module</Label>
                <Select
                  value={form.watch("moduleId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("moduleId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un module" />
                  </SelectTrigger>
                  <SelectContent>
                    {course.modules.map((module) => (
                      <SelectItem key={module.id} value={module.order.toString()}>
                        Module {module.order}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.moduleId && (
                  <p className="text-sm text-destructive">{form.formState.errors.moduleId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titre du support</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Ex: Architecture React"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
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
          </CardContent>
        </Card>

        {/* Slides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Slides du support visuel</span>
              <Button type="button" variant="outline" onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un slide
              </Button>
            </CardTitle>
            <CardDescription>
              Créez les slides de votre support visuel interactif
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, slideIndex) => (
              <div key={field.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Slide {slideIndex + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(slideIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`slides.${slideIndex}.title`}>
                    Titre du slide
                  </Label>
                  <Input
                    id={`slides.${slideIndex}.title`}
                    {...form.register(`slides.${slideIndex}.title`)}
                    placeholder="Titre du slide..."
                  />
                  {form.formState.errors.slides?.[slideIndex]?.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slides[slideIndex]?.title?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`slides.${slideIndex}.content`}>
                    Contenu du slide
                  </Label>
                  <Textarea
                    id={`slides.${slideIndex}.content`}
                    {...form.register(`slides.${slideIndex}.content`)}
                    placeholder="Contenu HTML ou texte du slide..."
                    rows={8}
                  />
                  {form.formState.errors.slides?.[slideIndex]?.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slides[slideIndex]?.content?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button variant="outline" asChild>
            <Link href={`/admin/courses/${course.id}?tab=visual-supports`}>
              Annuler
            </Link>
          </Button>
          
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Créer le support visuel
          </Button>
        </div>
      </form>
    </div>
  );
}