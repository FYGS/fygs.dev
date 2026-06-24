"use client";

import { useState, useTransition } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Eye, X, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { createCourse } from "../../_actions/create-course";
import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";

// Schema aligned with Prisma model
const courseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  accessTier: z.nativeEnum(CourseAccessTier),
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(), // Duration in minutes
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  previewEnabled: z.boolean().default(true),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
  trailerUrl: z.string().optional(),
  faq: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

// Types for props
type TagType = {
  id: string;
  name: string;
  color: string;
};

interface CourseCreateFormProps {
  tags: TagType[];
}

export function CourseCreateForm({ tags }: CourseCreateFormProps) {
  const router = useRouter();
  const [isSavingDraft, startDraftTransition] = useTransition();
  const [isPublishing, startPublishTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      category: CourseCategory.JAVASCRIPT,
      level: CourseLevel.BEGINNER,
      accessTier: CourseAccessTier.FREE,
      price: undefined,
      duration: undefined,
      published: false,
      featured: false,
      previewEnabled: true,
      thumbnail: "",
      tags: [],
      publicStructure: "",
      publicResources: "",
      publicEvaluation: "",
      publicPrerequisites: "",
      trailerUrl: "",
      faq: "",
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    form.setValue("tags", newSelectedTags);
  };

  // Handle image upload
  const handleImageUpload = (url: string) => {
    form.setValue("thumbnail", url);
    setThumbnailUrl(url);
  };

  // The original onSubmit function is no longer needed since we have distinct handlers
  // for draft and publish actions

  // Handle publish and save as draft
  const handlePublishAndSave = () => {
    form.setValue("published", true);
    startPublishTransition(async () => {
      try {
        const result = await createCourse({
          ...form.getValues(),
          tags: selectedTags,
          thumbnail: thumbnailUrl || undefined,
        });

        if (result.success) {
          toast.success("Formation créée et publiée avec succès!");
          router.push(`/admin/courses/${result.course?.id}`);
        } else {
          toast.error(result.error || "Erreur lors de la création");
        }
      } catch (error) {
        console.error("Course creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleSaveAsDraft = () => {
    form.setValue("published", false);
    startDraftTransition(async () => {
      try {
        const result = await createCourse({
          ...form.getValues(),
          tags: selectedTags,
          thumbnail: thumbnailUrl || undefined,
        });

        if (result.success) {
          toast.success(
            "Brouillon sauvegardé — ajoutez maintenant vos modules et leçons",
          );
          router.push(`/admin/courses/${result.course?.id}`);
        } else {
          toast.error(
            result.error || "Erreur lors de la sauvegarde du brouillon",
          );
        }
      } catch (error) {
        console.error("Draft saving error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        <form className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Définissez les informations principales de votre formation
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
                            // Auto-generate slug
                            const newSlug = generateSlug(e.target.value);
                            form.setValue("slug", newSlug);
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
                      <FormDescription>
                        URL de votre formation (généré automatiquement)
                      </FormDescription>
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
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Image de couverture</CardTitle>
              <CardDescription>
                Ajoutez une image attractive pour votre formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageUploaded={handleImageUpload}
                currentImageUrl={thumbnailUrl}
                folder="courses"
                prefix="cover"
                className="w-full"
              />
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                          <SelectItem value="TYPESCRIPT">TypeScript</SelectItem>
                          <SelectItem value="FRONTEND">Frontend</SelectItem>
                          <SelectItem value="BACKEND">Backend</SelectItem>
                          <SelectItem value="FULLSTACK">Fullstack</SelectItem>
                          <SelectItem value="CLOUD">Cloud</SelectItem>
                          <SelectItem value="AI">
                            Intelligence Artificielle
                          </SelectItem>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
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
                      <FormLabel>Niveau d&apos;accès</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'accès" />
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

              {/* Tags Selection */}
              <div className="space-y-3">
                <Label>Tags associés</Label>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      style={{
                        borderColor: selectedTags.includes(tag.id)
                          ? tag.color
                          : undefined,
                      }}
                    >
                      {tag.name}
                    </button>
                  )) || (
                    <p className="text-muted-foreground">
                      Aucun tag disponible
                    </p>
                  )}
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tagId) => {
                      const tag = tags?.find((t) => t.id === tagId);
                      return tag ? (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
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

          {/* Public Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Section publique marketing</CardTitle>
              <CardDescription>
                Contenu marketing affiché publiquement avant inscription.
                Utilisez MDX pour un formatage riche.
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
                          placeholder="Décrivez la structure et l'organisation de votre cours..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Format MDX supporté - utilisez **gras**, *italique*, -
                        listes, etc.
                      </FormDescription>
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
                          placeholder="Listez les ressources, outils et supports fournis..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Exemples : PDFs, vidéos, templates, accès communauté...
                      </FormDescription>
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
                          placeholder="Expliquez le système d'évaluation et les certifications..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Quizzes, projets, certificat de réussite...
                      </FormDescription>
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
                          placeholder="Définissez les prérequis et le public visé..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Niveau requis, outils nécessaires, profil idéal...
                      </FormDescription>
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
                        URL vidéo affichée dans le hero de la page publique.
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
                        Format attendu: tableau JSON d&apos;objets avec `q` et
                        `a`.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Durée totale estimée de la formation
                      </FormDescription>
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publier immédiatement
                        </FormLabel>
                        <FormDescription>
                          Rendre la formation visible sur la plateforme
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
                          Mettre en avant cette formation
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
                        <FormLabel className="text-base">
                          Aperçu activé
                        </FormLabel>
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
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button variant="outline" asChild>
              <Link href="/admin/courses">Annuler</Link>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Sauvegarder comme brouillon
              </Button>

              <Button
                type="button"
                onClick={handlePublishAndSave}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Créer et publier
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
