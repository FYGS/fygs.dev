"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";
import { createCourse } from "../../_actions/course-actions";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "../../[id]/_components/builder/labels";

export function NewCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CourseCategory>("JAVASCRIPT");
  const [level, setLevel] = useState<CourseLevel>("BEGINNER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await createCourse({ title, category, level });
    if (result.success) {
      router.push(`/admin/courses/${result.courseId}?section=programme`);
      return;
    }
    setPending(false);
    setError(result.error);
  }

  const tooShort = title.trim().length < 3;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="new-title">Titre de la formation</Label>
        <Input id="new-title" autoFocus value={title} maxLength={120} placeholder="Ex. : Maîtriser TypeScript de zéro à la production" aria-describedby={error ? "new-error" : undefined} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-category">Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CourseCategory)}>
            <SelectTrigger id="new-category">
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
          <Label htmlFor="new-level">Niveau</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel)}>
            <SelectTrigger id="new-level">
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

      {error && (
        <p id="new-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || tooShort}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
        Créer et commencer
      </Button>
    </form>
  );
}
