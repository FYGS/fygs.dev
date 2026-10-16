import type { ComponentProps } from "react";
import { type CourseEditFormApi } from "./schema";
import type { CourseType } from "./types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Trash2, Loader2, ExternalLink } from "lucide-react";

/** Navigation, auto-save indicator, delete and save buttons. */
export function FormActions({ form, course, autoSaveStatus, lastSaved, isPending, isDeleting, handleDelete }: {
  form: CourseEditFormApi;
  course: CourseType;
  autoSaveStatus: ComponentProps<typeof AutoSaveIndicator>["status"];
  lastSaved: ComponentProps<typeof AutoSaveIndicator>["lastSaved"];
  isPending: boolean;
  isDeleting: boolean;
  handleDelete: () => Promise<void>;
}) {
  return (
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
  );
}
