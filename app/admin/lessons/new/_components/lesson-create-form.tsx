"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, 
  Eye, 
  X,
  Loader2,
  BookOpen
} from "lucide-react";
import { createLesson } from "../../_actions/create-lesson";

// Validation schema
const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255, "Le titre est trop long"),
  slug: z.string().min(1, "Le slug est requis").max(255, "Le slug est trop long"),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url("URL vidéo invalide").optional().or(z.literal("")),
  duration: z.number().int().min(0, "La durée doit être positive").optional(),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
  published: z.boolean().default(false),
  courseId: z.string().cuid("ID de formation invalide"),
});

type LessonFormData = z.infer<typeof lessonSchema>;

// Types for props
interface Course {
  id: string;
  title: string;
  slug: string;
}

interface LessonCreateFormProps {
  courses: Course[];
  selectedCourseId?: string;
}

export function LessonCreateForm({ courses, selectedCourseId }: LessonCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: undefined,
      order: 1,
      published: false,
      courseId: selectedCourseId || "",
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  const onSubmit = async (data: LessonFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        
        formData.append("title", data.title);
        formData.append("slug", data.slug);
        if (data.description) formData.append("description", data.description);
        if (data.content) formData.append("content", data.content);
        if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
        if (data.duration) formData.append("duration", data.duration.toString());
        formData.append("order", data.order.toString());
        formData.append("published", data.published.toString());
        formData.append("courseId", data.courseId);

        const result = await createLesson(formData);
        
        if (result.success) {
          toast.success("Leçon créée avec succès !");
          router.push(`/admin/lessons/${result.lessonId}`);
        } else {
          throw new Error("Erreur lors de la création de la leçon");
        }
      } catch (error) {
        console.error("Error creating lesson:", error);
        toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
      }
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Course Selection */}
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formation *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une formation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {course.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choisissez la formation à laquelle cette leçon appartient
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Titre de la leçon"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleTitleChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Le titre principal de votre leçon
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="slug-de-la-lecon"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL de la leçon (généré automatiquement)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description courte de la leçon..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Description courte affichée dans la liste des leçons
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video URL and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de la vidéo</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Lien vers la vidéo de la leçon
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (secondes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="300"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Durée de la vidéo en secondes
                  {field.value && ` (${formatDuration(field.value)})`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Order */}
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordre *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Position de la leçon dans la formation (1 = première leçon)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu (MDX)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="# Contenu de la leçon

## Introduction
Votre contenu en Markdown/MDX..."
                  className="min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Contenu principal de la leçon en format MDX (Markdown avec composants React)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publication Status */}
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Publier la leçon
                </FormLabel>
                <FormDescription>
                  La leçon sera visible par les étudiants si elle est publiée
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? "Création..." : "Créer la leçon"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>

          {form.watch("published") && (
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2"
              disabled={!form.watch("courseId") || !form.watch("slug")}
            >
              <Eye className="h-4 w-4" />
              Prévisualiser
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}