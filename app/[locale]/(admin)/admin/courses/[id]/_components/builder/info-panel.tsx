"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/image-field";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { formatMinutes } from "@/lib/format-duration";
import { cn } from "@/lib/utils";
import { createQuickTag } from "../../../_actions/course-actions";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "@/lib/courses/labels";
import type { CourseInfo, TagOption } from "./types";

interface Props {
  info: CourseInfo;
  update: (patch: Partial<CourseInfo>) => void;
  tags: TagOption[];
  onTagCreated: (tag: TagOption) => void;
  /** Total of the published lessons' durations, in minutes (0 when none has a duration). */
  computedMinutes: number;
}

export function InfoPanel({ info, update, tags, onTagCreated, computedMinutes }: Props) {
  const [newTag, setNewTag] = useState("");
  const titleTooShort = info.title.trim().length < 3;
  const descriptionTooShort = info.description.trim().length < 10;

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;
    const result = await createQuickTag(name);
    if (!result.success) return toast.error(result.error);
    onTagCreated(result.tag);
    if (!info.tagIds.includes(result.tag.id)) update({ tagIds: [...info.tagIds, result.tag.id] });
    setNewTag("");
  }

  const toggleTag = (id: string) =>
    update({ tagIds: info.tagIds.includes(id) ? info.tagIds.filter((t) => t !== id) : [...info.tagIds, id] });

  return (
    <div className="space-y-10">
      <section aria-labelledby="info-basics" className="space-y-5">
        <h2 id="info-basics" className="text-lg font-semibold">
          L&apos;essentiel
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="course-title">Titre</Label>
          <Input
            id="course-title"
            value={info.title}
            maxLength={120}
            aria-invalid={titleTooShort}
            aria-describedby={titleTooShort ? "course-title-error" : undefined}
            onChange={(e) => update({ title: e.target.value })}
          />
          {titleTooShort && (
            <p id="course-title-error" className="text-sm text-destructive">
              Au moins 3 caractères. Tant que le titre est trop court, il n&apos;est pas enregistré.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="course-description">Description</Label>
          <Textarea
            id="course-description"
            rows={5}
            maxLength={2000}
            value={info.description}
            aria-describedby="course-description-help"
            onChange={(e) => update({ description: e.target.value })}
          />
          <p id="course-description-help" className={cn("text-sm", descriptionTooShort ? "text-amber-800 dark:text-amber-300" : "text-muted-foreground")}>
            {descriptionTooShort
              ? "Décrivez en quelques phrases ce que l'apprenant saura faire à la fin (10 caractères minimum pour publier)."
              : `${info.description.length} / 2000`}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="course-category">Catégorie</Label>
            <Select value={info.category} onValueChange={(value) => update({ category: value as CourseInfo["category"] })}>
              <SelectTrigger id="course-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course-level">Niveau</Label>
            <Select value={info.level} onValueChange={(value) => update({ level: value as CourseInfo["level"] })}>
              <SelectTrigger id="course-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium leading-none">Image de couverture</p>
          <ImageField
            label="Image de couverture de la formation"
            value={info.thumbnail}
            onChange={(url) => update({ thumbnail: url })}
          />
        </div>
      </section>

      <section aria-labelledby="info-learning" className="space-y-5">
        <div>
          <h2 id="info-learning" className="text-lg font-semibold">
            Ce que l&apos;on apprend
          </h2>
          <p className="text-sm text-muted-foreground">
            Des objectifs concrets, à l&apos;infinitif : « Écrire un test d&apos;intégration », pas « Les tests ».
          </p>
        </div>
        <StringListEditor
          label="Objectifs de la formation"
          items={info.objectives}
          onChange={(objectives) => update({ objectives })}
          placeholder="À la fin, je saurai…"
          emptyHint="Aucun objectif pour l'instant."
        />

        <div className="space-y-1.5">
          <Label htmlFor="course-prerequisites">Prérequis</Label>
          <Textarea
            id="course-prerequisites"
            rows={3}
            value={info.publicPrerequisites}
            placeholder="Ce qu'il faut savoir ou avoir avant de commencer."
            onChange={(e) => update({ publicPrerequisites: e.target.value })}
          />
        </div>

        {computedMinutes > 0 ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium leading-none">Durée totale</p>
            <p className="text-sm">
              <span className="font-medium">{formatMinutes(computedMinutes)}</span>
              <span className="text-muted-foreground"> — la somme des durées des leçons publiées, affichée aux apprenants.</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="course-duration">Durée totale estimée (minutes)</Label>
            <Input
              id="course-duration"
              type="number"
              min={0}
              className="max-w-40"
              aria-describedby="course-duration-help"
              value={info.duration ?? ""}
              onChange={(e) => update({ duration: e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value))) })}
            />
            <p id="course-duration-help" className="text-sm text-muted-foreground">
              Affichée tant qu&apos;aucune leçon publiée n&apos;a de durée ; ensuite, la somme des leçons la remplace.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="info-tags" className="space-y-4">
        <h2 id="info-tags" className="text-lg font-semibold">
          Tags
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tags de la formation">
          {tags.length === 0 && <p className="text-sm text-muted-foreground">Aucun tag. Créez le premier ci-dessous.</p>}
          {tags.map((tag) => {
            const selected = info.tagIds.includes(tag.id);
            return (
              <button key={tag.id} type="button" aria-pressed={selected} onClick={() => toggleTag(tag.id)} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Badge variant={selected ? "default" : "outline"} className="cursor-pointer">
                  {tag.name}
                </Badge>
              </button>
            );
          })}
        </div>
        <div className="flex max-w-sm gap-2">
          <Input
            value={newTag}
            maxLength={40}
            placeholder="Nouveau tag"
            aria-label="Nom du nouveau tag"
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => void addTag()} disabled={!newTag.trim()}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Créer
          </Button>
        </div>
      </section>
    </div>
  );
}
