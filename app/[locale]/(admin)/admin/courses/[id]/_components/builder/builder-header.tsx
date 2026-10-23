"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Readiness } from "@/lib/curriculum/publish";
import { publishCourse, unpublishCourse } from "../../../_actions/course-actions";
import { SaveIndicator } from "./save-status";

interface Props {
  courseId: string;
  slug: string;
  title: string;
  published: boolean;
  enrollments: number;
  readiness: Readiness;
  /** Flushes pending edits so the server checks what the author sees. */
  beforePublish: () => Promise<void>;
  onPublishedChange: (published: boolean) => void;
  onGoToSection: (section: "infos" | "programme" | "vente") => void;
}

const SECTION_OF_ITEM = {
  title: "infos",
  description: "infos",
  thumbnail: "infos",
  lessons: "programme",
  materials: "programme",
  price: "vente",
} as const;

export function BuilderHeader({
  courseId,
  slug,
  title,
  published,
  enrollments,
  readiness,
  beforePublish,
  onPublishedChange,
  onGoToSection,
}: Props) {
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const publish = () =>
    startTransition(async () => {
      await beforePublish();
      const result = await publishCourse(courseId);
      if (result.success) {
        onPublishedChange(true);
        setPublishOpen(false);
        toast.success("Formation publiée. Elle est visible dans le catalogue.");
      } else {
        toast.error(result.error);
      }
    });

  const unpublish = () =>
    startTransition(async () => {
      await beforePublish();
      const result = await unpublishCourse(courseId);
      if (result.success) {
        onPublishedChange(false);
        setUnpublishOpen(false);
        toast.success("Formation retirée du catalogue.");
      } else {
        toast.error(result.error);
      }
    });

  const previewHref = `/formations/${slug}?preview=true`;

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 shrink-0">
          <Link href="/admin/courses">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            Formations
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title || "Formation sans titre"}</h1>
          <SaveIndicator />
        </div>

        <Badge variant={published ? "default" : "secondary"} className="shrink-0">
          {published ? "Publiée" : "Brouillon"}
        </Badge>

        <Button variant="outline" size="sm" asChild>
          <Link href={previewHref} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-1.5 h-4 w-4" aria-hidden />
            Aperçu
          </Link>
        </Button>

        {published ? (
          <Button variant="outline" size="sm" onClick={() => setUnpublishOpen(true)} disabled={pending}>
            Dépublier
          </Button>
        ) : (
          <Button size="sm" onClick={() => setPublishOpen(true)} disabled={pending}>
            Publier
            {!readiness.ready && <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">{readiness.missing.length}</span>}
          </Button>
        )}
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{readiness.ready ? "Publier la formation" : "Il reste à compléter"}</DialogTitle>
            <DialogDescription>
              {readiness.ready
                ? "Tout est en place. La formation apparaîtra dans le catalogue dès maintenant."
                : "Une formation n'est publiée que lorsqu'un apprenant peut la suivre de bout en bout."}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-3" aria-label="Contrôles avant publication">
            {readiness.items.map((item) => (
              <li key={item.key} className="flex gap-3">
                {item.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Fait" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-label="À faire" />
                )}
                <div className="min-w-0 flex-1 text-sm">
                  <p className={item.ok ? "text-muted-foreground" : "font-medium"}>{item.label}</p>
                  {!item.ok && item.hint && <p className="mt-0.5 text-muted-foreground">{item.hint}</p>}
                  {!item.ok && (
                    <button
                      type="button"
                      className="mt-1 text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setPublishOpen(false);
                        onGoToSection(SECTION_OF_ITEM[item.key]);
                      }}
                    >
                      Compléter
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Plus tard
            </Button>
            <Button onClick={publish} disabled={!readiness.ready || pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Publier maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer la formation du catalogue ?</AlertDialogTitle>
            <AlertDialogDescription>
              {enrollments > 0
                ? `Les ${enrollments} personne(s) déjà inscrites perdront l'accès tant que la formation n'est pas republiée. Leur progression est conservée.`
                : "Elle ne sera plus visible des apprenants. Vous pourrez la republier à tout moment."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={unpublish}>Dépublier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
