"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleAlert, ExternalLink, GripVertical, Plus, Trash2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/text/slug";
import { LEVEL_LABELS, MAX_PATH_COURSES, MIN_PATH_COURSES, PATH_LEVELS, pathPublishIssues, type PathLevel } from "@/lib/paths/rules";
import { pathInputSchema } from "@/lib/paths/schema";
import {
  checkPathSlugAction,
  deletePathAction,
  savePathAction,
  setPathPublishedAction,
} from "../_actions/path-actions";

export interface CourseOption {
  id: string;
  title: string;
  level: PathLevel;
  thumbnail: string | null;
  accessTier: "FREE" | "PREMIUM";
  published: boolean;
  lessonsCount: number;
}

export interface PathEditorInitial {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: PathLevel;
  objectives: string[];
  featured: boolean;
  published: boolean;
  courses: { courseId: string; optional: boolean }[];
  enrollmentCount: number;
  certificateCount: number;
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: PathLevel;
  objectives: string[];
  featured: boolean;
  courses: { courseId: string; optional: boolean }[];
}

const toForm = (i: PathEditorInitial): FormState => ({
  title: i.title,
  slug: i.slug,
  description: i.description,
  thumbnail: i.thumbnail,
  level: i.level,
  objectives: i.objectives,
  featured: i.featured,
  courses: i.courses,
});

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

export function PathEditor({ initial, courseOptions }: { initial: PathEditorInitial; courseOptions: CourseOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(toForm(initial)));
  const [published, setPublished] = useState(initial.published);
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const [slugAnswer, setSlugAnswer] = useState<{ slug: string; state: SlugState } | null>(null);
  const [objectiveDraft, setObjectiveDraft] = useState("");
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = JSON.stringify(form) !== saved;
  const optionById = useMemo(() => new Map(courseOptions.map((c) => [c.id, c])), [courseOptions]);

  const patch = (changes: Partial<FormState>) => setForm((f) => ({ ...f, ...changes }));

  // Leaving with unsaved work asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Is the slug free? Asked 400 ms after typing stops; the answer is kept with the slug it was asked for.
  const needsCheck = form.slug.length > 0 && !(initial.id && form.slug === initial.slug);
  useEffect(() => {
    if (!needsCheck) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await checkPathSlugAction(form.slug, initial.id ?? undefined);
      if (!cancelled) setSlugAnswer({ slug: form.slug, state: !result.valid ? "invalid" : result.available ? "available" : "taken" });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.slug, initial.id, needsCheck]);
  const slugState: SlugState = !needsCheck ? "idle" : slugAnswer?.slug === form.slug ? slugAnswer.state : "checking";

  const onTitle = (title: string) => patch(slugTouched ? { title } : { title, slug: slugify(title, "").slice(0, 80) });

  const orderedCourses = form.courses.map((c) => ({ ...c, option: optionById.get(c.courseId) }));
  const issues = pathPublishIssues({
    description: form.description,
    thumbnail: form.thumbnail,
    courses: orderedCourses.map((c) => ({
      title: c.option?.title ?? "Formation supprimée",
      published: c.option?.published ?? false,
      optional: c.optional,
      lessonsCount: c.option?.lessonsCount ?? 0,
    })),
  });

  const pickable = courseOptions
    .filter((c) => c.published && !form.courses.some((x) => x.courseId === c.id))
    .filter((c) => c.title.toLowerCase().includes(search.trim().toLowerCase()));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = form.courses.findIndex((c) => c.courseId === active.id);
    const to = form.courses.findIndex((c) => c.courseId === over.id);
    patch({ courses: arrayMove(form.courses, from, to) });
  };
  const move = (index: number, delta: -1 | 1) => patch({ courses: arrayMove(form.courses, index, index + delta) });

  const addObjective = () => {
    const value = objectiveDraft.trim();
    if (!value || form.objectives.length >= 8) return;
    patch({ objectives: [...form.objectives, value] });
    setObjectiveDraft("");
  };

  const save = () => {
    const parsed = pathInputSchema.safeParse(form);
    if (!parsed.success) return setErrors(parsed.error.issues.map((i) => i.message));
    if (slugState === "taken") return setErrors(["Ce slug est déjà utilisé par un autre parcours"]);
    setErrors([]);
    startTransition(async () => {
      const result = await savePathAction(initial.id, form);
      if (!result.success) {
        setErrors([result.error, ...(result.issues ?? [])]);
        return;
      }
      setSaved(JSON.stringify(form));
      toast.success("Parcours enregistré");
      if (!initial.id) router.replace(`/admin/paths/${result.id}`);
      else router.refresh();
    });
  };

  const togglePublished = () => {
    if (!initial.id) return;
    setErrors([]);
    startTransition(async () => {
      const result = await setPathPublishedAction(initial.id!, !published);
      if (!result.success) {
        setErrors([result.error, ...(result.issues ?? [])]);
        return;
      }
      setPublished(!published);
      toast.success(published ? "Parcours dépublié" : "Parcours publié");
      router.refresh();
    });
  };

  const remove = () =>
    startTransition(async () => {
      const result = await deletePathAction(initial.id!);
      setConfirmDelete(false);
      if (!result.success) return setErrors([result.error ?? "Suppression impossible"]);
      toast.success("Parcours supprimé");
      router.replace("/admin/paths");
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/paths">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Parcours
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{initial.id ? "Modifier le parcours" : "Nouveau parcours"}</h1>
          {initial.id && <Badge variant={published ? "default" : "secondary"}>{published ? "Publié" : "Brouillon"}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {published && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/parcours/${initial.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir la page
              </Link>
            </Button>
          )}
          {initial.id && (
            <Button
              variant="outline"
              onClick={togglePublished}
              disabled={pending || dirty || (!published && issues.length > 0)}
              title={dirty ? "Enregistrez d'abord vos modifications" : undefined}
            >
              {published ? "Dépublier" : "Publier"}
            </Button>
          )}
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? "Enregistrement…" : dirty ? "Enregistrer" : "Enregistré"}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive" role="alert">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>{errors[0]}</AlertTitle>
          {errors.length > 1 && (
            <AlertDescription>
              <ul className="list-disc pl-5">
                {errors.slice(1).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Présentation</CardTitle>
              <CardDescription>Ce que l&apos;apprenant lit avant de commencer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="path-title">Titre</Label>
                <Input id="path-title" value={form.title} onChange={(e) => onTitle(e.target.value)} maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="path-slug">Adresse (slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/parcours/</span>
                  <Input
                    id="path-slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      patch({ slug: e.target.value.toLowerCase() });
                    }}
                    maxLength={80}
                    aria-describedby="path-slug-status"
                  />
                </div>
                <p id="path-slug-status" className="text-xs text-muted-foreground" aria-live="polite">
                  {slugState === "checking" && "Vérification…"}
                  {slugState === "available" && "Adresse disponible"}
                  {slugState === "taken" && "Cette adresse est déjà utilisée"}
                  {slugState === "invalid" && "Lettres minuscules, chiffres et tirets, 3 caractères minimum"}
                  {slugState === "idle" && "Générée depuis le titre, modifiable"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="path-description">Description</Label>
                <Textarea
                  id="path-description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">{form.description.length} / 2000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="path-level">Niveau</Label>
                <select
                  id="path-level"
                  value={form.level}
                  onChange={(e) => patch({ level: e.target.value as PathLevel })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {PATH_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {LEVEL_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="path-featured">Mettre à la une</Label>
                  <p className="text-xs text-muted-foreground">Affiché en premier dans le catalogue.</p>
                </div>
                <Switch id="path-featured" checked={form.featured} onCheckedChange={(featured) => patch({ featured })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Image de couverture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ImageUpload
                currentImageUrl={form.thumbnail ?? undefined}
                onImageUploaded={(url) => patch({ thumbnail: url })}
                folder="paths"
                prefix="path"
              />
              {form.thumbnail && (
                <Button type="button" variant="ghost" size="sm" onClick={() => patch({ thumbnail: null })}>
                  <X className="mr-2 h-4 w-4" />
                  Retirer l&apos;image
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Objectifs</CardTitle>
              <CardDescription>Ce que l&apos;apprenant saura faire à la fin ({form.objectives.length} / 8).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {form.objectives.map((objective, index) => (
                  <li key={`${objective}-${index}`} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span className="flex-1">{objective}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Retirer l'objectif : ${objective}`}
                      onClick={() => patch({ objectives: form.objectives.filter((_, i) => i !== index) })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  value={objectiveDraft}
                  onChange={(e) => setObjectiveDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                  placeholder="Ex. Déployer une application Next.js en production"
                  aria-label="Nouvel objectif"
                  maxLength={160}
                  disabled={form.objectives.length >= 8}
                />
                <Button type="button" variant="outline" onClick={addObjective} disabled={!objectiveDraft.trim() || form.objectives.length >= 8}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Formations du parcours ({form.courses.length})</CardTitle>
              <CardDescription>
                Dans l&apos;ordre où l&apos;apprenant les suit. Une formation facultative ne bloque pas le certificat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.courses.length === 0 ? (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Aucune formation. Ajoutez-en au moins {MIN_PATH_COURSES} depuis la liste ci-dessous.
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={form.courses.map((c) => c.courseId)} strategy={verticalListSortingStrategy}>
                    <ol className="space-y-2" aria-label="Formations du parcours">
                      {orderedCourses.map((course, index) => (
                        <CourseRow
                          key={course.courseId}
                          index={index}
                          last={index === orderedCourses.length - 1}
                          courseId={course.courseId}
                          option={course.option}
                          optional={course.optional}
                          onMove={(delta) => move(index, delta)}
                          onOptional={(optional) =>
                            patch({ courses: form.courses.map((c) => (c.courseId === course.courseId ? { ...c, optional } : c)) })
                          }
                          onRemove={() => patch({ courses: form.courses.filter((c) => c.courseId !== course.courseId) })}
                        />
                      ))}
                    </ol>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Ajouter une formation</CardTitle>
              <CardDescription>Seules les formations publiées peuvent être ajoutées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="course-search" className="sr-only">
                Rechercher une formation
              </Label>
              <Input id="course-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une formation…" />
              {form.courses.length >= MAX_PATH_COURSES ? (
                <p className="text-sm text-muted-foreground">Maximum de {MAX_PATH_COURSES} formations atteint.</p>
              ) : pickable.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {search ? "Aucune formation ne correspond." : "Toutes les formations publiées sont déjà dans le parcours."}
                </p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-y-auto" aria-label="Formations disponibles">
                  {pickable.map((course) => (
                    <li key={course.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {LEVEL_LABELS[course.level]} · {course.lessonsCount} leçon{course.lessonsCount > 1 ? "s" : ""} ·{" "}
                          {course.accessTier === "PREMIUM" ? "Premium" : "Gratuite"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={`Ajouter ${course.title}`}
                        onClick={() => patch({ courses: [...form.courses, { courseId: course.id, optional: false }] })}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Ajouter
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Avant de publier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {issues.length === 0 ? (
                <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" aria-hidden /> Le parcours peut être publié.
                </p>
              ) : (
                <ul className="space-y-1">
                  {issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
              {initial.id && (
                <p className="pt-2 text-xs text-muted-foreground">
                  {initial.enrollmentCount} inscrit{initial.enrollmentCount > 1 ? "s" : ""} · {initial.certificateCount} certificat
                  {initial.certificateCount > 1 ? "s" : ""} délivré{initial.certificateCount > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {initial.id && (
            <div className="flex justify-end">
              <Button variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(true)} disabled={pending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le parcours
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce parcours ?</AlertDialogTitle>
            <AlertDialogDescription>
              {initial.enrollmentCount > 0
                ? `Les ${initial.enrollmentCount} inscriptions au parcours seront supprimées (les inscriptions aux formations sont conservées). `
                : ""}
              Cette action est définitive. Un parcours dont des certificats ont été délivrés ne peut pas être supprimé : dépubliez-le.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CourseRow({
  index,
  last,
  courseId,
  option,
  optional,
  onMove,
  onOptional,
  onRemove,
}: {
  index: number;
  last: boolean;
  courseId: string;
  option: CourseOption | undefined;
  optional: boolean;
  onMove: (delta: -1 | 1) => void;
  onOptional: (optional: boolean) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: courseId });
  const title = option?.title ?? "Formation supprimée";
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Déplacer ${title} (position ${index + 1})`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {option ? `${LEVEL_LABELS[option.level]} · ${option.lessonsCount} leçon${option.lessonsCount > 1 ? "s" : ""}` : "À retirer"}
          {option && !option.published && <span className="ml-2 text-amber-600">Non publiée</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Switch id={`optional-${courseId}`} checked={optional} onCheckedChange={onOptional} aria-label={`${title} : facultative`} />
        <Label htmlFor={`optional-${courseId}`} className="text-xs">
          Facultative
        </Label>
      </div>
      <div className="flex items-center">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Monter ${title}`}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(1)} disabled={last} aria-label={`Descendre ${title}`}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label={`Retirer ${title} du parcours`}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
