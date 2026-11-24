"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "@/lib/courses/labels";

const ALL = "all";

const ACCESS = [
  { value: "free", label: "Gratuites" },
  { value: "premium", label: "Premium" },
];

const SORTS = [
  { value: "relevance", label: "Pertinence" },
  { value: "recent", label: "Plus récentes" },
  { value: "popular", label: "Plus suivies" },
  { value: "title", label: "Ordre alphabétique" },
];

/** Catalogue filters. Everything lives in the URL (shareable, back button works); typing waits for a pause before searching. */
export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const urlSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(urlSearch);
  // The URL changed by another way (clear button, back button): the field follows
  const lastUrlSearch = useRef(urlSearch);
  useEffect(() => {
    if (lastUrlSearch.current !== urlSearch) {
      lastUrlSearch.current = urlSearch;
      setQuery(urlSearch);
    }
  }, [urlSearch]);

  const update = (changes: Record<string, string | null>, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(changes)) {
      if (value) params.set(name, value);
      else params.delete(name);
    }
    params.delete("page"); // a new filter starts on the first page
    const qs = params.toString();
    startTransition(() => {
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    });
  };

  // Search while typing, but only once the typing pauses, and without filling the history
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlSearch) return;
    const timer = setTimeout(() => {
      lastUrlSearch.current = trimmed;
      update({ search: trimmed || null }, true);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlSearch]);

  const category = searchParams.get("category") ?? ALL;
  const level = searchParams.get("level") ?? ALL;
  const access = searchParams.get("access") ?? ALL;
  const sort = searchParams.get("sort") ?? "relevance";
  const filtered = !!urlSearch || category !== ALL || level !== ALL || access !== ALL || sort !== "relevance";

  return (
    <div role="search" aria-label="Rechercher et filtrer les formations" className="mx-auto w-full max-w-5xl space-y-4" aria-busy={pending}>
      <form
        className="mx-auto w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: query.trim() || null }, true);
        }}
      >
        <Label htmlFor="catalog-search" className="sr-only">
          Rechercher une formation
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="catalog-search"
            type="search"
            placeholder="Rechercher une formation…"
            className="h-11 pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <div className="w-full sm:w-48">
          <Label htmlFor="catalog-category" className="sr-only">
            Catégorie
          </Label>
          <Select value={category} onValueChange={(v) => update({ category: v === ALL ? null : v })}>
            <SelectTrigger id="catalog-category" className="h-11 w-full">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les catégories</SelectItem>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="catalog-level" className="sr-only">
            Niveau
          </Label>
          <Select value={level} onValueChange={(v) => update({ level: v === ALL ? null : v })}>
            <SelectTrigger id="catalog-level" className="h-11 w-full">
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les niveaux</SelectItem>
              {LEVEL_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-44">
          <Label htmlFor="catalog-access" className="sr-only">
            Accès
          </Label>
          <Select value={access} onValueChange={(v) => update({ access: v === ALL ? null : v })}>
            <SelectTrigger id="catalog-access" className="h-11 w-full">
              <SelectValue placeholder="Tous les accès" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Gratuites et Premium</SelectItem>
              {ACCESS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="catalog-sort" className="sr-only">
            Trier par
          </Label>
          <Select value={sort} onValueChange={(v) => update({ sort: v === "relevance" ? null : v })}>
            <SelectTrigger id="catalog-sort" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered && (
          <Button variant="outline" className="h-11 w-full px-4 sm:w-auto" onClick={() => router.push(pathname, { scroll: false })}>
            <X className="mr-1 h-4 w-4" aria-hidden /> Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
