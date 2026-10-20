"use client";

import { useState } from "react";
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
  Euro
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteCourse } from "../[id]/_actions/edit-course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  level: string;
  published: boolean;
  featured: boolean;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  lessonsCount: number;
  publishedLessonsCount: number;
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

  const formatLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé',
      'EXPERT': 'Expert',
    };
    return levelMap[level] || level;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-900 text-green-300';
      case 'INTERMEDIATE':
        return 'bg-blue-900 text-blue-300';
      case 'ADVANCED':
        return 'bg-orange-900 text-orange-300';
      case 'EXPERT':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
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
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-8 w-8 opacity-50" />
                    <p>Aucun cours trouvé</p>
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
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
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
                                    color: tag.color 
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
                        {course.published ? "Publié" : "Brouillon"}
                      </Badge>
                      {course.featured && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Mis en avant
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getLevelColor(course.level)}>
                      {formatLevel(course.level)}
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
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Euro className="h-3 w-3 text-muted-foreground" />
                      <span>{course.price}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString('fr-FR')}
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
                          <Link href={`/formations/${course.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le cours
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmationModal
                          trigger={
                            <DropdownMenuItem 
                              className="text-red-600"
                              disabled={isDeleting === course.id}
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isDeleting === course.id ? "Suppression..." : "Supprimer"}
                            </DropdownMenuItem>
                          }
                          title="Confirmer la suppression"
                          description={`Êtes-vous sûr de vouloir supprimer la formation "${course.title}" ? Cette action est irréversible et supprimera toutes les données associées (leçons, inscriptions, progrès).`}
                          confirmText="Supprimer définitivement"
                          onConfirm={() => handleDeleteCourse(course.id)}
                          isDestructive={true}
                          disabled={isDeleting === course.id}
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
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} sur {pagination.totalItems} cours
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.currentPage - 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Précédent
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.currentPage + 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
