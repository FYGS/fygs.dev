"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { useAutoSave } from "@/hooks/use-auto-save";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, X, Trash2, Loader2, ExternalLink } from "lucide-react";
import { updateCourse, deleteCourse } from "../_actions/edit-course";
import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";

// Types for the props
type TagType = {
  id: string;
  name: string;
  color: string;
};

type CourseType = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  accessTier: CourseAccessTier;
  price: number | null;
  duration: number | null;
  published: boolean;
  featured: boolean;
  previewEnabled: boolean;
  thumbnail: string | null;
  publicStructure: string | null;
  publicResources: string | null;
  publicEvaluation: string | null;
  publicPrerequisites: string | null;
  trailerUrl: string | null;
  faq: Array<{ q: string; a: string }> | null;
  tags: { tag: TagType }[];
  modules: {
    id: string;
    title: string;
    slug: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      duration: number | null;
      order: number;
    }[];
  }[];
};

interface CourseEditFormProps {
  course: CourseType;
  tags: TagType[];
}

// Zod schema for validation
const courseEditSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  accessTier: z.nativeEnum(CourseAccessTier),
  price: z.number().min(0).nullable(),
  duration: z.number().min(1).nullable(),
  published: z.boolean(),
  featured: z.boolean(),
  previewEnabled: z.boolean(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
  trailerUrl: z.string().optional(),
  faq: z.string().optional(),
});

type CourseEditFormData = z.infer<typeof courseEditSchema>;

export function CourseEditForm({ course, tags }: CourseEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    course.tags.map((ct) => ct.tag.id),
  );

  const form = useForm<CourseEditFormData>({
    resolver: zodResolver(courseEditSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      level: course.level,
      accessTier: course.accessTier,
      price: course.price,
      duration: course.duration,
      published: course.published,
      featured: course.featured,
      previewEnabled: course.previewEnabled,
      thumbnail: course.thumbnail || "",
      tags: course.tags.map((ct) => ct.tag.id),
      publicStructure: course.publicStructure || "",
      publicResources: course.publicResources || "",
      publicEvaluation: course.publicEvaluation || "",
      publicPrerequisites: course.publicPrerequisites || "",
      trailerUrl: course.trailerUrl || "",
      faq: course.faq ? JSON.stringify(course.faq, null, 2) : "",
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  // Auto-save callback
  const handleAutoSave = useCallback(
    async (data: CourseEditFormData) => {
      try {
        const result = await updateCourse(course.id, {
          ...data,
          tags: selectedTags,
        });
        return { success: result.success, error: result.error };
      } catch {
        return { success: false, error: "Erreur réseau" };
      }
    },
    [course.id, selectedTags],
  );

  // Watch form values for auto-save
  const watchedValues = form.watch();
  const { status: autoSaveStatus, lastSaved } = useAutoSave({
    data: watchedValues,
    onSave: handleAutoSave,
    delay: 2000,
    enabled: true,
  });

  const onSubmit = (data: CourseEditFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCourse(course.id, {
          ...data,
          tags: selectedTags,
        });

        if (result.success) {
          toast.success("Formation mise à jour avec succès!");
          router.refresh();
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Course update error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCourse(course.id);
      if (result.success) {
        toast.success("Formation supprimée avec succès!");
        router.push("/admin/courses");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Course deletion error:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Modifiez les informations principales de votre formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de la formation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Introduction à React"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("slug", generateSlug(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="introduction-a-react" {...field} />
                      </FormControl>
                      <FormDescription>Généré automatiquement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez votre formation en détail..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <ImageUpload
                  onImageUploaded={(url) => form.setValue("thumbnail", url)}
                  currentImageUrl={form.watch("thumbnail")}
                  folder="courses"
                  prefix="cover"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Public Marketing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Section publique marketing</CardTitle>
              <CardDescription>
                Contenu marketing affiché publiquement avant inscription (MDX
                supporté)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="publicStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Structure du cours</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez la structure et l'organisation..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicResources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ressources incluses</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="PDFs, vidéos, templates..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicEvaluation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Évaluation et certification</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Quizzes, projets, certificat..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicPrerequisites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prérequis et public cible</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Niveau requis, outils nécessaires..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la bande-annonce</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://.../trailer.mp4"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vidéo hero affichée sur la landing publique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FAQ (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='[{"q":"Question ?","a":"Réponse"}]'
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tableau JSON d&apos;objets contenant `q` et `a`.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
            <CardHeader>
              <CardTitle>Catégorisation</CardTitle>
              <CardDescription>
                Définissez le niveau et la catégorie de votre formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                          <SelectItem value="TYPESCRIPT">TypeScript</SelectItem>
                          <SelectItem value="FRONTEND">Frontend</SelectItem>
                          <SelectItem value="BACKEND">Backend</SelectItem>
                          <SelectItem value="FULLSTACK">Fullstack</SelectItem>
                          <SelectItem value="CLOUD">Cloud</SelectItem>
                          <SelectItem value="AI">IA</SelectItem>
                          <SelectItem value="DEVOPS">DevOps</SelectItem>
                          <SelectItem value="PRODUCTIVITY">
                            Productivité
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Débutant</SelectItem>
                          <SelectItem value="INTERMEDIATE">
                            Intermédiaire
                          </SelectItem>
                          <SelectItem value="ADVANCED">Avancé</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accès</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FREE">Gratuit</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label>Tags associés</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return tag ? (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Tarification et durée</CardTitle>
              <CardDescription>
                Définissez le prix et la durée estimée de la formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Laissez vide pour une formation gratuite
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
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="120"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options de publication</CardTitle>
              <CardDescription>
                Configurez la visibilité et les options d&apos;affichage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Formation publiée
                      </FormLabel>
                      <FormDescription>
                        Visible sur la plateforme
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

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Formation en vedette
                      </FormLabel>
                      <FormDescription>
                        Mise en avant sur la page d&apos;accueil
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

              <FormField
                control={form.control}
                name="previewEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aperçu activé</FormLabel>
                      <FormDescription>
                        Permettre la prévisualisation gratuite
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/courses">Retour à la liste</Link>
              </Button>

              {form.watch("published") && (
                <Button variant="outline" asChild>
                  <Link href={`/formations/${course.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir en ligne
                  </Link>
                </Button>
              )}

              <AutoSaveIndicator
                status={autoSaveStatus}
                lastSaved={lastSaved}
              />
            </div>

            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isPending || isDeleting}
                  >
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
                    <AlertDialogTitle>
                      Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer cette formation ? Cette
                      action est irréversible et supprimera toutes les données
                      associées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                Sauvegarder
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
