"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Star,
  Users,
  BookOpen,
  Clock,
  Copy,
  EyeOff,
  Plus,
  Rocket,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteCourse, duplicateCourse, publishCourse, unpublishCourse } from "../_actions/course-actions";
import { formatMinutes } from "@/lib/format-duration";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/price-format";
import { MIN_PREMIUM_PRICE } from "@/lib/curriculum/publish";
import { LEVEL_BADGE_CLASSES, levelLabel } from "@/lib/courses/labels";
import type { CourseLevel } from "@/lib/generated/prisma/browser";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number | null;
  accessTier: string;
  category: string;
  level: string;
  published: boolean;
  featured: boolean;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  lessonsCount: number;
  publishedLessonsCount: number;
  /** Minutes shown to learners (lessons' total, else the estimate). */
  displayMinutes: number | null;
  enrollmentsCount: number;
  averageRating: number;
  tags: Array<{
    name: string;
    color: string;
  }>;
}

interface CoursesTableProps {
  courses: Course[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function CoursesTable({ courses, pagination }: CoursesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsDeleting(courseId);
    try {
      const result = await deleteCourse(courseId);
      
      if (result.success) {
        toast.success("Formation supprimée avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsDeleting(null);
    }
  };



  const formatDuration = (minutes: number | null): string => formatMinutes(minutes) || "—";

  const [busyId, setBusyId] = useState<string | null>(null);

  const duplicate = async (course: Course) => {
    setBusyId(course.id);
    const result = await duplicateCourse(course.id);
    setBusyId(null);
    if (!result.success) return toast.error(result.error);
    toast.success("Copie créée en brouillon.");
    router.push(`/admin/courses/${result.courseId}`);
  };

  const togglePublished = async (course: Course) => {
    setBusyId(course.id);
    const result = course.published ? await unpublishCourse(course.id) : await publishCourse(course.id);
    setBusyId(null);
    if (result.success) {
      toast.success(course.published ? "Formation retirée du catalogue." : "Formation publiée.");
      router.refresh();
    } else {
      toast.error(result.error, { action: { label: "Ouvrir l'éditeur", onClick: () => router.push(`/admin/courses/${course.id}?section=apercu`) } });
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cours</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Leçons</TableHead>
              <TableHead>Inscrits</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <BookOpen className="h-8 w-8 opacity-50" aria-hidden />
                    <p>Aucune formation à afficher. Ajustez les filtres ou créez-en une.</p>
                    <Button asChild size="sm">
                      <Link href="/admin/courses/new">
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                        Créer une formation
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id} className="group hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-12 h-8 overflow-hidden rounded bg-muted flex items-center justify-center shrink-0">
                          {course.thumbnail ? (
                            <Image src={course.thumbnail} alt="" fill sizes="48px" className="object-cover" unoptimized />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                          )}
                        </div>
                        
                        {/* Course info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/courses/${course.id}`}
                              className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                            >
                              {course.title}
                            </Link>
                            {course.featured && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {course.description}
                          </p>
                          
                          {/* Tags */}
                          {course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {course.tags.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index}
                                  variant="outline" 
                                  className="text-xs h-5"
                                  style={{ 
                                    borderColor: tag.color + '40', 
                                    color: `color-mix(in srgb, ${tag.color} 35%, hsl(var(--foreground)))` 
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {course.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs h-5">
                                  +{course.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={course.published ? "default" : "secondary"}
                        className="w-fit"
                      >
                        {course.published ? "Publiée" : "Brouillon"}
                      </Badge>
                      {course.featured && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Mis en avant
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={LEVEL_BADGE_CLASSES[course.level as CourseLevel] ?? ""}>
                      {levelLabel(course.level)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {course.publishedLessonsCount}/{course.lessonsCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course.publishedLessonsCount} publiées
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{course.enrollmentsCount}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {course.accessTier === "FREE" ? (
                      <span className="text-sm font-medium">Gratuit</span>
                    ) : course.price !== null && course.price >= MIN_PREMIUM_PRICE ? (
                      <span className="text-sm font-medium">{formatPrice(course.price, { freeLabel: false })}</span>
                    ) : (
                      <span className="text-sm text-amber-800 dark:text-amber-300">Prix à fixer</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(course.displayMinutes)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Actions pour ${course.title}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={course.published ? `/formations/${course.slug}` : `/formations/${course.slug}?preview=true`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            {course.published ? "Voir la page publique" : "Prévisualiser"}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={busyId === course.id} onSelect={() => void togglePublished(course)}>
                          {course.published ? <EyeOff className="h-4 w-4 mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                          {course.published ? "Dépublier" : "Publier"}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={busyId === course.id} onSelect={() => void duplicate(course)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmationModal
                          trigger={
                            <DropdownMenuItem
                              className="text-red-600"
                              disabled={isDeleting === course.id || course.enrollmentsCount > 0}
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isDeleting === course.id
                                ? "Suppression..."
                                : course.enrollmentsCount > 0
                                  ? `Supprimer (impossible : ${course.enrollmentsCount} inscrit${course.enrollmentsCount > 1 ? "s" : ""})`
                                  : "Supprimer"}
                            </DropdownMenuItem>
                          }
                          title="Confirmer la suppression"
                          description={`Êtes-vous sûr de vouloir supprimer la formation "${course.title}" ? Cette action est irréversible et supprimera son programme, ses quiz et ses supports. Une formation avec des inscrits ne peut pas être supprimée.`}
                          confirmText="Supprimer définitivement"
                          onConfirm={() => handleDeleteCourse(course.id)}
                          isDestructive={true}
                          disabled={isDeleting === course.id || course.enrollmentsCount > 0}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} à{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} sur {pagination.totalItems} formations
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => router.push(pageHref(pagination.currentPage - 1))}>
                Précédent
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              
              <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => router.push(pageHref(pagination.currentPage + 1))}>
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
