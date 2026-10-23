"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { SupportItem, SupportSlide } from "@/lib/curriculum/assessments";
import type { ModuleSummary } from "@/lib/curriculum/curriculum";
import { cn } from "@/lib/utils";
import { addSupport, removeSupport, reorderModuleSupports, saveSupport } from "../../_actions/assessment-actions";

interface Props {
  courseId: string;
  modules: ModuleSummary[];
  supports: SupportItem[];
  onSupports: (supports: SupportItem[]) => void;
  onModulesChanged: () => void;
}

/** Slides authored before the rich editor carry layout markup the editor would flatten: they open in HTML mode. */
const isAdvancedHtml = (html: string) => /<div\b|class=|style=/i.test(html);

export function SupportsPanel({ courseId, modules, supports, onSupports, onModulesChanged }: Props) {
  const [editing, setEditing] = useState<{ id: string | null; moduleId: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupportItem | null>(null);

  const changed = (list: SupportItem[]) => {
    onSupports(list);
    onModulesChanged();
  };

  async function move(mod: ModuleSummary, list: SupportItem[], index: number, delta: -1 | 1) {
    const next = [...list];
    const target = index + delta;
    [next[index], next[target]] = [next[target], next[index]];
    const result = await reorderModuleSupports(mod.id, next.map((s) => s.id), courseId);
    if (result.success) onSupports(result.supports);
    else toast.error(result.error);
  }

  return (
    <section aria-labelledby="supports-title" className="space-y-5">
      <div>
        <h2 id="supports-title" className="text-lg font-semibold">
          Supports visuels
        </h2>
        <p className="text-sm text-muted-foreground">Des diaporamas qui accompagnent un module : schémas, résumés, aide-mémoire. Les apprenants les consultent depuis la page de la formation.</p>
      </div>

      {modules.length === 0 && <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Créez d&apos;abord un module dans l&apos;onglet Programme.</p>}

      {modules.map((mod) => {
        const list = supports.filter((s) => s.moduleId === mod.id);
        return (
          <div key={mod.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">
                <span className="mr-2 text-muted-foreground">{mod.order}.</span>
                {mod.title}
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing({ id: null, moduleId: mod.id })}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Ajouter un support
              </Button>
            </div>
            {list.length === 0 && <p className="text-sm text-muted-foreground">Pas de support pour ce module.</p>}
            <ul className="space-y-2">
              {list.map((support, index) => (
                <li key={support.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{support.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {support.slides.length} diapositive{support.slides.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => void move(mod, list, index, -1)} aria-label={`Monter ${support.title}`}>
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === list.length - 1} onClick={() => void move(mod, list, index, 1)} aria-label={`Descendre ${support.title}`}>
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing({ id: support.id, moduleId: support.moduleId })}>
                    <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                    Modifier
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(support)} aria-label={`Supprimer ${support.title}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
            {editing && editing.moduleId === mod.id && (
              <SupportEditor
                key={editing.id ?? "new"}
                courseId={courseId}
                modules={modules}
                support={supports.find((s) => s.id === editing.id) ?? null}
                moduleId={editing.moduleId}
                onSaved={(list) => {
                  changed(list);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        );
      })}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {deleteTarget?.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>Le support et toutes ses diapositives sont supprimés.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (!target) return;
                const result = await removeSupport(target.id);
                if (result.success) changed(result.supports);
                else toast.error(result.error);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SupportEditor({
  courseId,
  modules,
  support,
  moduleId,
  onSaved,
  onCancel,
}: {
  courseId: string;
  modules: ModuleSummary[];
  support: SupportItem | null;
  moduleId: string;
  onSaved: (supports: SupportItem[]) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(support?.title ?? "");
  const [targetModule, setTargetModule] = useState(moduleId);
  const [slides, setSlides] = useState<SupportSlide[]>(support?.slides.length ? support.slides : [{ title: "Introduction", content: "" }]);
  const [current, setCurrent] = useState(0);
  const [html, setHtml] = useState(() => isAdvancedHtml(slides[0]?.content ?? ""));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const slide = slides[current];
  const problem = !title.trim() ? "Donnez un titre au support." : slides.some((s) => !s.title.trim()) ? "Chaque diapositive a besoin d'un titre." : null;

  const patchSlide = (patch: Partial<SupportSlide>) => setSlides((list) => list.map((s, i) => (i === current ? { ...s, ...patch } : s)));
  const select = (index: number) => {
    setCurrent(index);
    setHtml(isAdvancedHtml(slides[index]?.content ?? ""));
    setPreview(false);
  };
  const moveSlide = (delta: -1 | 1) => {
    const target = current + delta;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[current], next[target]] = [next[target], next[current]];
    setSlides(next);
    setCurrent(target);
  };

  async function save() {
    if (problem) return toast.error(problem);
    setSaving(true);
    const input = { title, slides };
    const result = support ? await saveSupport(support.id, { ...input, moduleId: targetModule }) : await addSupport(courseId, targetModule, input);
    setSaving(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Support enregistré.");
    onSaved(result.supports);
  }

  return (
    <div className="space-y-5 rounded-lg border-2 border-primary/30 bg-background p-4">
      <h4 className="font-medium">{support ? "Modifier le support" : "Nouveau support"}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="support-title">Titre</Label>
          <Input id="support-title" value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="support-module">Module</Label>
          <Select value={targetModule} onValueChange={setTargetModule}>
            <SelectTrigger id="support-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.order}. {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Diapositives" className="space-y-1.5">
          <ol className="space-y-1.5">
            {slides.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={i === current ? "true" : undefined}
                  className={cn("w-full truncate rounded-md border px-3 py-2 text-left text-sm", i === current ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted")}
                >
                  {i + 1}. {s.title || "Sans titre"}
                </button>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setSlides([...slides, { title: `Diapositive ${slides.length + 1}`, content: "" }]);
              setCurrent(slides.length);
              setHtml(false);
              setPreview(false);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Diapositive
          </Button>
        </nav>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="slide-title">Titre de la diapositive</Label>
            <Input id="slide-title" value={slide.title} maxLength={150} onChange={(e) => patchSlide({ title: e.target.value })} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch id="slide-html" checked={html} onCheckedChange={(checked) => { setHtml(checked); setPreview(false); }} />
              <Label htmlFor="slide-html" className="text-sm font-normal">
                Mode HTML
              </Label>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
              {preview ? <EyeOff className="mr-1.5 h-4 w-4" aria-hidden /> : <Eye className="mr-1.5 h-4 w-4" aria-hidden />}
              {preview ? "Retour à l'édition" : "Aperçu"}
            </Button>
          </div>

          {preview ? (
            <div className="prose prose-sm dark:prose-invert min-h-40 max-w-none rounded-md border bg-card p-4" dangerouslySetInnerHTML={{ __html: slide.content }} />
          ) : html ? (
            <div className="space-y-1.5">
              <Textarea aria-label="HTML de la diapositive" rows={12} className="font-mono text-sm" value={slide.content} onChange={(e) => patchSlide({ content: e.target.value })} />
              <p className="text-xs text-muted-foreground">Mise en forme libre. Repasser au mode visuel simplifie les mises en page avancées.</p>
            </div>
          ) : (
            <RichTextEditor key={current} content={slide.content} onChange={(content) => patchSlide({ content })} placeholder="Le contenu de la diapositive…" />
          )}

          <div className="flex justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" disabled={current === 0} onClick={() => moveSlide(-1)} aria-label="Monter la diapositive">
              <ArrowUp className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={current === slides.length - 1} onClick={() => moveSlide(1)} aria-label="Descendre la diapositive">
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={slides.length <= 1}
              onClick={() => {
                const next = slides.filter((_, i) => i !== current);
                setSlides(next);
                select(Math.min(current, next.length - 1));
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
              Supprimer la diapositive
            </Button>
          </div>
        </div>
      </div>

      {problem && <p className="text-sm text-amber-600 dark:text-amber-400">{problem}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving || Boolean(problem)}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          Enregistrer le support
        </Button>
      </div>
    </div>
  );
}
