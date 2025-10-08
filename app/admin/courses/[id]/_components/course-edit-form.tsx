"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Save, 
  X,
  Trash2,
  Loader2,
  ExternalLink
} from "lucide-react";
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
  price: number | null; // Using number | null to handle Prisma Decimal
  duration: number | null; // Using number | null to handle Prisma Decimal
  published: boolean;
  featured: boolean;
  previewEnabled: boolean;
  thumbnail: string | null;
  tags: {
    tag: TagType;
  }[];
};

interface CourseEditFormProps {
  course: CourseType;
  tags: TagType[];
}

// Form data interface
interface FormData {
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  accessTier: CourseAccessTier;
  price: string;
  duration: string;
  published: boolean;
  featured: boolean;
  previewEnabled: boolean;
  thumbnail: string;
  tags: string[];
}

export function CourseEditForm({ course, tags }: CourseEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize form state with course data
  const [formData, setFormData] = useState<FormData>({
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    level: course.level,
    accessTier: course.accessTier,
    price: course.price ? Number(course.price).toString() : "",
    duration: course.duration ? Number(course.duration).toString() : "",
    published: course.published,
    featured: course.featured,
    previewEnabled: course.previewEnabled,
    thumbnail: course.thumbnail || "",
    tags: course.tags.map(ct => ct.tag.id),
  });

  // Selected tags for UI
  const [selectedTags, setSelectedTags] = useState<string[]>(
    course.tags.map(ct => ct.tag.id)
  );

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: string | boolean | CourseCategory | CourseLevel | CourseAccessTier) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tag selection
  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newSelectedTags);
    setFormData(prev => ({
      ...prev,
      tags: newSelectedTags
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error("La description est requise");
      return;
    }

    startTransition(async () => {
      try {
        const submissionData = {
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          duration: formData.duration ? parseFloat(formData.duration) : null,
          tags: selectedTags,
        };

        const result = await updateCourse(course.id, submissionData);

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

  // Handle course deletion
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
      <form onSubmit={handleSubmit} className="space-y-8">
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
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la formation</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Introduction à React"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  placeholder="introduction-a-react"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Décrivez votre formation en détail..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card>
          <CardHeader>
            <CardTitle>Catégorisation</CardTitle>
            <CardDescription>
              Modifiez le niveau et la catégorie de votre formation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleFieldChange("category", value as CourseCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROGRAMMING">Programmation</SelectItem>
                    <SelectItem value="DESIGN">Design</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PERSONAL_DEVELOPMENT">Développement personnel</SelectItem>
                    <SelectItem value="TECHNOLOGY">Technologie</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleFieldChange("level", value as CourseLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Débutant</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                    <SelectItem value="ADVANCED">Avancé</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Accès</Label>
                <Select
                  value={formData.accessTier}
                  onValueChange={(value) => handleFieldChange("accessTier", value as CourseAccessTier)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Gratuit</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    const tag = tags.find(t => t.id === tagId);
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
              Modifiez le prix et la durée estimée de la formation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (heures)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => handleFieldChange("duration", e.target.value)}
                  placeholder="10"
                />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Formation publiée</Label>
                  <p className="text-sm text-muted-foreground">
                    Formation visible sur la plateforme
                  </p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => handleFieldChange("published", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Formation en vedette</Label>
                  <p className="text-sm text-muted-foreground">
                    Mettre en avant cette formation
                  </p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleFieldChange("featured", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aperçu activé</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre la prévisualisation gratuite
                  </p>
                </div>
                <Switch
                  checked={formData.previewEnabled}
                  onCheckedChange={(checked) => handleFieldChange("previewEnabled", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/courses">
                Retour à la liste
              </Link>
            </Button>
            
            {formData.published && (
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.slug}`} target="_blank">
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
                    Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible
                    et supprimera toutes les données associées (leçons, inscriptions, progrès).
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
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}