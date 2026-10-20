"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Eye, BookOpen, Clock, PlayCircle, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { deleteLesson } from "../_actions/delete-lesson";

interface LessonWithCourse {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  order: number;
  duration: number | null;
  videoUrl: string | null;
  published: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
  };
  _count: {
    progress: number;
  };
}

interface LessonsTableProps {
  lessons: LessonWithCourse[];
}

export function LessonsTable({ lessons }: LessonsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<LessonWithCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteLesson(lessonToDelete.id);
      
      if (result.success) {
        toast.success("Leçon supprimée avec succès !");
        // Refresh the page to update the table
        window.location.reload();
      } else {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    }
  };
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      JAVASCRIPT: "bg-yellow-100 text-yellow-800",
      TYPESCRIPT: "bg-blue-100 text-blue-800",
      FRONTEND: "bg-green-100 text-green-800",
      BACKEND: "bg-purple-100 text-purple-800",
      FULLSTACK: "bg-indigo-100 text-indigo-800",
      CLOUD: "bg-sky-100 text-sky-800",
      AI: "bg-pink-100 text-pink-800",
      DEVOPS: "bg-orange-100 text-orange-800",
      PRODUCTIVITY: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.PRODUCTIVITY;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      BEGINNER: "bg-green-50 text-green-700 border-green-200",
      INTERMEDIATE: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ADVANCED: "bg-red-50 text-red-700 border-red-200",
      EXPERT: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[level] || colors.BEGINNER;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Non définie";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune leçon trouvée</h3>
          <p className="text-muted-foreground text-center mb-4">
            Commencez par créer votre première leçon pour développer votre contenu.
          </p>
          <Button asChild>
            <Link href="/admin/lessons/new">
              <BookOpen className="h-4 w-4 mr-2" />
              Créer une leçon
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Toutes les leçons ({lessons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leçon</TableHead>
              <TableHead>Formation</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Progrès</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{lesson.title}</div>
                      {lesson.videoUrl && (
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    {lesson.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </div>
                    )}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {lesson.slug}
                    </code>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Link 
                      href={`/admin/courses/${lesson.course.id}`}
                      className="font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      {lesson.course.title}
                    </Link>
                    <div className="flex gap-1">
                      <Badge className={getCategoryColor(lesson.course.category)}>
                        {lesson.course.category}
                      </Badge>
                      <Badge variant="outline" className={getLevelColor(lesson.course.level)}>
                        {lesson.course.level}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">#{lesson.order}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {formatDuration(lesson.duration)}
                  </div>
                </TableCell>
                <TableCell>
                  {lesson.published ? (
                    <Badge className="bg-green-100 text-green-800">Publié</Badge>
                  ) : (
                    <Badge variant="outline">Brouillon</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{lesson._count.progress}</span>
                    <span className="text-muted-foreground ml-1">étudiants</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Actions pour ${lesson.title}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      {lesson.published && (
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/formations/${lesson.course.slug}/lessons/${lesson.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir en ligne
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${lesson.course.id}`}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Voir la formation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setLessonToDelete(lesson);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la leçon</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la leçon &quot;{lessonToDelete?.title}&quot; ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDeleteLesson}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}