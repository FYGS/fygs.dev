"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Loader2, Trash2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SLUG_PATTERN } from "@/lib/curriculum/slug-pattern";
import { changeCourseSlug, checkCourseSlug, deleteCourse, duplicateCourse } from "../../../_actions/course-actions";
import type { CourseInfo, InstructorOption } from "./types";

interface Props {
  info: CourseInfo;
  update: (patch: Partial<CourseInfo>) => void;
  onSlugChanged: (slug: string) => void;
  isAdmin: boolean;
  instructors: InstructorOption[];
  enrollments: number;
  /** Writes pending edits before the page is left. */
  beforeLeave: () => Promise<void>;
}

const NO_INSTRUCTOR = "none";

export function SettingsPanel({ info, update, onSlugChanged, isAdmin, instructors, enrollments, beforeLeave }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(info.slug);
  const [availability, setAvailability] = useState<"idle" | "checking" | "free" | "taken" | "invalid">("idle");
  const [savingSlug, setSavingSlug] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const normalized = slug.trim().toLowerCase();
  const changed = normalized !== info.slug;

  useEffect(() => {
    if (!changed) return;
    if (!SLUG_PATTERN.test(normalized) || normalized.length < 3) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setAvailability("checking");
      void checkCourseSlug(info.id, normalized).then((r) => {
        if (!cancelled) setAvailability(r.available ? "free" : "taken");
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalized, changed, info.id]);

  const shape = SLUG_PATTERN.test(normalized) && normalized.length >= 3;
  const status = !changed ? "idle" : !shape ? "invalid" : availability;

  async function saveSlug() {
    setSavingSlug(true);
    const result = await changeCourseSlug(info.id, normalized);
    setSavingSlug(false);
    if (!result.success) return toast.error(result.error);
    onSlugChanged(result.slug);
    setSlug(result.slug);
    setAvailability("idle");
    toast.success("Adresse mise à jour.");
  }

  async function duplicate() {
    setDuplicating(true);
    await beforeLeave();
    const result = await duplicateCourse(info.id);
    setDuplicating(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Copie créée en brouillon.");
    router.push(`/admin/courses/${result.courseId}`);
  }

  async function remove() {
    const result = await deleteCourse(info.id);
    if (!result.success) return toast.error(result.error);
    toast.success("Formation supprimée.");
    router.push("/admin/courses");
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="settings-url" className="space-y-3">
        <h2 id="settings-url" className="text-lg font-semibold">
          Adresse de la formation
        </h2>
        <div className="flex max-w-xl flex-wrap items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="course-slug">/formations/…</Label>
            <Input id="course-slug" value={slug} maxLength={80} aria-describedby="course-slug-help" onChange={(e) => setSlug(e.target.value)} />
          </div>
          <Button type="button" className="mt-[1.625rem]" disabled={status !== "free" || savingSlug} onClick={() => void saveSlug()}>
            {savingSlug && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
            Enregistrer
          </Button>
        </div>
        <p id="course-slug-help" role="status" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {status === "checking" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Vérification…
            </>
          )}
          {status === "free" && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Adresse disponible.
            </>
          )}
          {status === "taken" && (
            <>
              <X className="h-3.5 w-3.5 text-destructive" aria-hidden /> Déjà utilisée par une autre formation.
            </>
          )}
          {status === "invalid" && "Lettres minuscules, chiffres et tirets, 3 caractères minimum."}
          {status === "idle" && (info.published ? "Changer l'adresse d'une formation publiée casse les liens déjà partagés." : "Générée à partir du titre ; modifiable tant que la formation n'est pas diffusée.")}
        </p>
      </section>

      {isAdmin && (
        <section aria-labelledby="settings-admin" className="space-y-5">
          <h2 id="settings-admin" className="text-lg font-semibold">
            Réservé aux administrateurs
          </h2>
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="course-featured">Mettre en avant</Label>
              <p className="text-sm text-muted-foreground">La formation apparaît dans les sélections de la page d&apos;accueil et du catalogue.</p>
            </div>
            <Switch id="course-featured" checked={info.featured} onCheckedChange={(featured) => update({ featured })} />
          </div>
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="course-instructor">Instructeur</Label>
            <Select value={info.instructorId ?? NO_INSTRUCTOR} onValueChange={(value) => update({ instructorId: value === NO_INSTRUCTOR ? null : value })}>
              <SelectTrigger id="course-instructor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_INSTRUCTOR}>Aucun instructeur assigné</SelectItem>
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} — {i.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Seuls l&apos;instructeur désigné et les administrateurs peuvent modifier cette formation.</p>
          </div>
        </section>
      )}

      <section aria-labelledby="settings-duplicate" className="space-y-3">
        <h2 id="settings-duplicate" className="text-lg font-semibold">
          Dupliquer
        </h2>
        <p className="text-sm text-muted-foreground">
          Crée une copie en brouillon avec le programme, les leçons, les ressources, les quiz, les supports, l&apos;examen et la page de vente. Les inscriptions, avis et certificats ne sont pas copiés.
        </p>
        <Button type="button" variant="outline" onClick={() => void duplicate()} disabled={duplicating}>
          {duplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Copy className="mr-2 h-4 w-4" aria-hidden />}
          Dupliquer la formation
        </Button>
      </section>

      <section aria-labelledby="settings-delete" className="space-y-3 rounded-lg border border-destructive/40 p-4">
        <h2 id="settings-delete" className="text-lg font-semibold text-destructive">
          Supprimer la formation
        </h2>
        {enrollments > 0 ? (
          <p className="text-sm text-muted-foreground">
            {enrollments} personne(s) sont inscrites : la formation ne peut pas être supprimée. Dépubliez-la pour la retirer du catalogue.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Supprime la formation, son programme, ses quiz et ses supports. Personne n&apos;y est inscrit. Cette action est définitive.</p>
            <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              Supprimer la formation
            </Button>
          </>
        )}
      </section>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {info.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>Tout son contenu est supprimé définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void remove()}>Supprimer définitivement</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
