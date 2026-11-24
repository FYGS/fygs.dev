"use client";

import { useState } from "react";
import { readableTextColor } from "@/lib/color-contrast";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BookOpen} from "lucide-react";
import Link from "next/link";
import { deleteTag, updateTag } from "../_actions/tag-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface TagCardProps {
  tag: {
    id: string;
    name: string;
    color: string;
    courseCount: number;
    publishedCourseCount: number;
    courses: Array<{
      id: string;
      title: string;
      published: boolean;
    }>;
  };
  /** Renaming and deleting a tag change every course that uses it: administrators only. */
  canManage: boolean;
}

export function TagCard({ tag, canManage }: TagCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.color);
  const router = useRouter();

  const handleEdit = () => {
    setEditName(tag.name);
    setEditColor(tag.color);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error("Le nom du tag est requis");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateTag(tag.id, {
        name: editName.trim(),
        color: editColor,
      });

      if (result.success) {
        toast.success("Tag mis à jour avec succès");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (tag.courseCount > 0) {
      toast.error(`Impossible de supprimer ce tag car il est utilisé par ${tag.courseCount} formation(s)`);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteTag(tag.id);
      
      if (result.success) {
        toast.success("Tag supprimé avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ backgroundColor: tag.color, borderColor: tag.color }}
            />
            <CardTitle className="text-lg">{tag.name}</CardTitle>
          </div>

          {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Actions pour ${tag.name}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmationModal
                trigger={
                  <DropdownMenuItem 
                    className="text-red-600"
                    disabled={isDeleting || tag.courseCount > 0}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Suppression..." : "Supprimer"}
                  </DropdownMenuItem>
                }
                title="Confirmer la suppression"
                description={
                  tag.courseCount > 0 
                    ? `Impossible de supprimer ce tag car il est utilisé par ${tag.courseCount} formation(s).`
                    : `Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ? Cette action est irréversible.`
                }
                confirmText="Supprimer définitivement"
                onConfirm={handleDelete}
                isDestructive={true}
                disabled={isDeleting || tag.courseCount > 0}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          )}
          
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{tag.courseCount}</div>
            <div className="text-muted-foreground">Formations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{tag.publishedCourseCount}</div>
            <div className="text-muted-foreground">Publiées</div>
          </div>
        </div>

        {/* Course List */}
        {tag.courses.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Formations associées:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tag.courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Link 
                    href={`/admin/courses/${course.id}`}
                    className="truncate hover:text-blue-600 transition-colors"
                  >
                    {course.title}
                  </Link>
                  {course.published && (
                    <Badge variant="secondary" className="h-4 text-xs">
                      Publié
                    </Badge>
                  )}
                </div>
              ))}
              {tag.courses.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{tag.courses.length - 3} autres...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucune formation associée
          </div>
        )}

        {/* Usage Indicator */}
        <div className="flex items-center justify-center">
          <Badge 
            variant={tag.courseCount > 0 ? "default" : "secondary"}
            style={{ 
              backgroundColor: tag.courseCount > 0 ? tag.color : undefined,
              color: tag.courseCount > 0 ? readableTextColor(tag.color) : undefined 
            }}
          >
            {tag.courseCount > 0 ? "En usage" : "Inutilisé"}
          </Badge>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="tag-name">Nom du tag</Label>
              <Input
                id="tag-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nom du tag"
              />
            </div>
            <div>
              <Label htmlFor="tag-color">Couleur</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? "Mise à jour..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden color input for quick color change */}
      {canManage && (
      <input
        id={`color-${tag.id}`}
        type="color"
        value={editColor}
        onChange={(e) => {
          setEditColor(e.target.value);
          // Auto-save color change
          updateTag(tag.id, { color: e.target.value }).then((result) => {
            if (result.success) {
              toast.success("Couleur mise à jour");
              router.refresh();
            } else {
              toast.error("Erreur lors de la mise à jour de la couleur");
            }
          });
        }}
        className="hidden"
      />
      )}
    </Card>
  );
}