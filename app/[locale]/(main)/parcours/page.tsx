import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Route } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { FormationsCta } from "@/components/formations/formations-cta";
import { Input } from "@/components/ui/input";
import { PathCard, type PathCardProgress } from "@/components/paths/path-card";
import { listPublishedPaths } from "@/lib/paths/queries";
import { loadUserPath } from "@/lib/paths/progress";
import { LEVEL_LABELS } from "@/lib/courses/labels";
import {
  PATH_LEVELS,
  PATH_SORTS,
  parsePathLevel,
  parsePathSort,
} from "@/lib/paths/rules";

export const metadata: Metadata = {
  title: "Parcours d'apprentissage | FYGS",
  description:
    "Des parcours qui enchaînent plusieurs formations vers un objectif précis, avec une progression d'ensemble et un certificat à la clé.",
  alternates: { canonical: "/parcours" },
};

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function PathsCatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = first(raw.q)?.slice(0, 100) ?? "";
  const level = parsePathLevel(first(raw.level));
  const sort = parsePathSort(first(raw.sort));
  const filtered = Boolean(q || level || first(raw.sort));

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const paths = await listPublishedPaths({ q, level, sort });

  // progress only for the paths the learner is enrolled in
  const progressByPath = new Map<string, PathCardProgress>();
  if (userId && paths.length > 0) {
    const enrolled = await db.pathEnrollment.findMany({
      where: { userId, pathId: { in: paths.map((p) => p.id) } },
      select: { pathId: true },
    });
    const enrolledIds = new Set(enrolled.map((e) => e.pathId));
    await Promise.all(
      paths
        .filter((p) => enrolledIds.has(p.id))
        .map(async (path) => {
          const state = await loadUserPath(userId, path);
          progressByPath.set(path.id, { percent: state.progress.percent, isComplete: state.progress.isComplete });
        }),
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-10">
      <header className="max-w-3xl space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Route className="h-4 w-4" aria-hidden /> Parcours
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Apprendre dans le bon ordre</h1>
        <p className="text-lg text-muted-foreground">
          Un parcours enchaîne plusieurs formations vers un objectif précis. Votre progression est suivie d&apos;un bout à l&apos;autre
          et un certificat vérifiable récompense le parcours complet.
        </p>
      </header>

      <form method="get" action="/parcours" role="search" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Rechercher</span>
          <Input name="q" defaultValue={q} placeholder="Un sujet, un métier…" className="w-64" maxLength={100} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Niveau</span>
          <select
            name="level"
            defaultValue={level ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Tous les niveaux</option>
            {PATH_LEVELS.map((value) => (
              <option key={value} value={value}>
                {LEVEL_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Trier par</span>
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {PATH_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Filtrer</Button>
        {filtered && (
          <Button variant="ghost" asChild>
            <Link href="/parcours">Réinitialiser</Link>
          </Button>
        )}
      </form>

      <h2 className="text-sm font-normal text-muted-foreground" aria-live="polite">
        {paths.length} parcours
      </h2>

      {paths.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="text-lg font-semibold">{filtered ? "Aucun parcours ne correspond" : "Les parcours arrivent bientôt"}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {filtered
              ? "Essayez un autre mot-clé ou retirez un filtre."
              : "En attendant, toutes les formations sont disponibles séparément."}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={filtered ? "/parcours" : "/formations"}>{filtered ? "Voir tous les parcours" : "Voir les formations"}</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <li key={path.id}>
              <PathCard path={path} progress={progressByPath.get(path.id) ?? null} />
            </li>
          ))}
        </ul>
      )}
      <FormationsCta other="formations" />
    </div>
  );
}
