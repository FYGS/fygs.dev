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
import { ImageUpload } from "@/components/ui/image-upload";
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
  ExternalLink,
  Edit,
  BookOpen
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
  publicStructure: string | null;
  publicResources: string | null;
  publicEvaluation: string | null;
  publicPrerequisites: string | null;
  tags: {
    tag: TagType;
  }[];
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
  publicStructure: string;
  publicResources: string;
  publicEvaluation: string;
  publicPrerequisites: string;
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
    publicStructure: course.publicStructure || "",
    publicResources: course.publicResources || "",
    publicEvaluation: course.publicEvaluation || "",
    publicPrerequisites: course.publicPrerequisites || "",
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

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <ImageUpload
                onImageUploaded={(url) => handleFieldChange("thumbnail", url)}
                currentImageUrl={formData.thumbnail}
                folder="courses"
                prefix="cover"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Public Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>Section publique marketing</CardTitle>
            <CardDescription>
              Contenu marketing affiché publiquement avant inscription. Utilisez MDX pour un formatage riche.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="publicStructure">Structure du cours</Label>
                <Textarea
                  id="publicStructure"
                  value={formData.publicStructure}
                  onChange={(e) => handleFieldChange("publicStructure", e.target.value)}
                  placeholder="Décrivez la structure et l'organisation de votre cours..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Format MDX supporté - utilisez **gras**, *italique*, - listes, etc.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicResources">Ressources incluses</Label>
                <Textarea
                  id="publicResources"
                  value={formData.publicResources}
                  onChange={(e) => handleFieldChange("publicResources", e.target.value)}
                  placeholder="Listez les ressources, outils et supports fournis..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Exemples : PDFs, vidéos, templates, accès communauté...
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicEvaluation">Évaluation et certification</Label>
                <Textarea
                  id="publicEvaluation"
                  value={formData.publicEvaluation}
                  onChange={(e) => handleFieldChange("publicEvaluation", e.target.value)}
                  placeholder="Expliquez le système d'évaluation et les certifications..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Quizzes, projets, certificat de réussite...
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicPrerequisites">Prérequis et public cible</Label>
                <Textarea
                  id="publicPrerequisites"
                  value={formData.publicPrerequisites}
                  onChange={(e) => handleFieldChange("publicPrerequisites", e.target.value)}
                  placeholder="Définissez les prérequis et le public visé..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Niveau requis, outils nécessaires, profil idéal...
                </p>
              </div>
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

        {/* Module Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gestion des modules</span>
              <Badge variant="secondary">
                {course.modules.length} modules
              </Badge>
            </CardTitle>
            <CardDescription>
              Gérez les modules de votre formation. Les modules permettent d&apos;organiser vos leçons en sections logiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {course.modules.length > 0 ? (
              <div className="space-y-6">
                {course.modules.map((module) => (
                  <div key={module.id} className="group relative border border-slate-700 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-700">
                    {/* Decorative gradient bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Modern module number with glow effect */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                              {module.order}
                            </div>
                            <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-md animate-pulse"></div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-blue-400 transition-colors">
                              {module.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">{module.lessons.length} leçons</span>
                              </div>
                              {module.lessons.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span>{module.lessons.filter(l => l.duration).reduce((acc, l) => acc + (l.duration || 0), 0)} min total</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="hover:bg-blue-50 hover:border-blue-700 transition-all duration-200"
                          >
                            <Link href={`/admin/courses/${course.id}/modules/${module.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced lessons preview */}
                    {module.lessons.length > 0 && (
                      <div className="border-t border-slate-700 bg-slate-800/50 p-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                            Leçons du module
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {module.lessons.slice(0, 6).map((lesson) => (
                              <div 
                                key={lesson.id} 
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-blue-700 hover:shadow-sm transition-all duration-200 group/lesson"
                              >
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                  {lesson.order}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate group-hover/lesson:text-blue-400 transition-colors">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    {lesson.duration && (
                                      <span className="flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                        {Math.ceil(lesson.duration / 60)} min
                                      </span>
                                    )}
                                    {lesson.description && (
                                      <span className="flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                        Avec description
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {module.lessons.length > 6 && (
                              <div className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-all duration-200">
                                <span className="text-sm font-medium">
                                  +{module.lessons.length - 6} leçons supplémentaires
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Empty state for lessons */}
                    {module.lessons.length === 0 && (
                      <div className="border-t border-slate-700 bg-slate-800/50 p-6">
                        <div className="text-center py-4">
                          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="h-5 w-5 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-400 font-medium">
                            Aucune leçon dans ce module
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Ajoutez des leçons pour organiser votre contenu
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl mx-auto animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Aucun module créé
                </h3>
                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                  Créez votre premier module pour organiser vos leçons en sections logiques et structurées.
                </p>
                <Button variant="outline" asChild className="hover:bg-blue-50 hover:border-blue-700">
                  <Link href={`/admin/courses/${course.id}?tab=modules`}>
                    Créer un module
                  </Link>
                </Button>
              </div>
            )}
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
                <Link href={`/formations/${course.slug}`} target="_blank">
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