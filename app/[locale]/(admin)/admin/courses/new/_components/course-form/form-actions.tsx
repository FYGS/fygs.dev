import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Save, Eye, Loader2 } from "lucide-react";

/** Cancel / save as draft / publish buttons. */
export function FormActions({
  isSavingDraft,
  isPublishing,
  handleSaveAsDraft,
  handlePublishAndSave,
}: {
  isSavingDraft: boolean;
  isPublishing: boolean;
  handleSaveAsDraft: () => void;
  handlePublishAndSave: () => void;
}) {
  return (
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
  );
}
