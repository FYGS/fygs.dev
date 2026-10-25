"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Award, Gift, Loader2, Search, UserMinus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseAccessTier } from "@/lib/generated/prisma/browser";
import type { AccessSource, LearnerPage, LearnerRow } from "@/lib/curriculum/insights";
import { grantCourseAccess, loadCourseLearners, revokeCourseAccess } from "../../_actions/insights-actions";

const SOURCE_LABELS: Record<AccessSource, string> = {
  free: "Inscription gratuite",
  purchase: "Achat",
  subscription: "Abonnement",
  grant: "Accès offert",
};

const LAPSED_LABELS = {
  subscription_ended: "Abonnement terminé",
  refunded: "Achat remboursé",
  premium_required: "Devenue premium",
} as const;

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Europe/Paris" });

interface Props {
  courseId: string;
  accessTier: CourseAccessTier;
  isAdmin: boolean;
}

/** The people enrolled in the course, their progress and what opens the course to them; administrators give or withdraw access. */
export function LearnersPanel({ courseId, accessTier, isAdmin }: Props) {
  const searchId = useId();
  const grantId = useId();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });
  const [data, setData] = useState<LearnerPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [email, setEmail] = useState("");
  const [granting, setGranting] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<LearnerRow | null>(null);

  // the search is sent once typing pauses
  useEffect(() => {
    const timer = setTimeout(() => setQuery((q) => (q.search === search.trim() ? q : { search: search.trim(), page: 1 })), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    void loadCourseLearners(courseId, query).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setData(result.learners);
        setError(null);
      } else setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId, query, reload]);

  async function grant() {
    setGranting(true);
    const result = await grantCourseAccess(courseId, email);
    setGranting(false);
    if (!result.success) return toast.error(result.error);
    toast.success(result.created ? `${result.name} est inscrit(e) et a accès à la formation.` : `${result.name} a maintenant un accès offert.`);
    setEmail("");
    setReload((n) => n + 1);
  }

  async function revoke(row: LearnerRow) {
    const result = await revokeCourseAccess(courseId, row.userId);
    if (!result.success) return toast.error(result.error);
    toast.success(result.removedEnrollment ? `${row.name} n'est plus inscrit(e).` : `L'accès offert à ${row.name} est retiré. Sa progression est conservée.`);
    setReload((n) => n + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Apprenants</h2>
        <p className="text-sm text-muted-foreground">
          Les personnes inscrites, leur progression et ce qui leur ouvre la formation.
          {accessTier === "PREMIUM" ? " Une formation premium s'ouvre par un achat, un abonnement actif ou un accès offert." : ""}
        </p>
      </div>

      {isAdmin && (
        <section aria-labelledby="learners-grant" className="space-y-3 rounded-lg border p-4">
          <h3 id="learners-grant" className="flex items-center gap-2 font-medium">
            <Gift className="h-4 w-4 text-muted-foreground" aria-hidden />
            Offrir l&apos;accès
          </h3>
          <p className="text-sm text-muted-foreground">
            À une personne qui a déjà un compte : elle est inscrite et suit la formation sans payer, jusqu&apos;à ce que vous retiriez cet accès. Elle en est avertie
            par une notification.
          </p>
          <form
            className="flex max-w-lg flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void grant();
            }}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor={grantId}>Adresse e-mail du compte</Label>
              <Input id={grantId} type="email" autoComplete="off" value={email} maxLength={320} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={granting || !email.trim()}>
              {granting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Offrir l&apos;accès
            </Button>
          </form>
        </section>
      )}

      <section aria-labelledby="learners-list" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 id="learners-list" className="font-medium">
            {data ? `${data.total} inscrit${data.total > 1 ? "s" : ""}` : "Inscrits"}
          </h3>
          <div className="relative w-full max-w-xs">
            <Label htmlFor={searchId} className="sr-only">
              Rechercher un apprenant
            </Label>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input id={searchId} type="search" placeholder="Nom ou e-mail" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!data && !error ? (
          <div className="space-y-2" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : data && data.rows.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {query.search ? "Aucun apprenant ne correspond à cette recherche." : "Personne n'est encore inscrit à cette formation."}
          </p>
        ) : data ? (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <caption className="sr-only">Apprenants inscrits à la formation</caption>
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Apprenant</th>
                  <th scope="col" className="px-3 py-2 font-medium">Progression</th>
                  <th scope="col" className="px-3 py-2 font-medium">Dernière activité</th>
                  <th scope="col" className="px-3 py-2 font-medium">Accès</th>
                  {isAdmin && (
                    <th scope="col" className="px-3 py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.userId} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.email} · inscrit(e) le {dateFormat.format(new Date(row.enrolledAt))}
                      </p>
                    </td>
                    <td className="min-w-40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Progress value={row.progress} className="h-2 w-24" aria-label={`Progression de ${row.name}`} />
                        <span className="tabular-nums">{row.progress} %</span>
                        {row.certificateCode && <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-label="Certificat obtenu" />}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.lastActivityAt ? dateFormat.format(new Date(row.lastActivityAt)) : "Pas encore commencé"}</td>
                    <td className="px-3 py-2">
                      {row.source ? (
                        <Badge variant={row.source === "grant" ? "default" : "outline"}>{SOURCE_LABELS[row.source]}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-900 dark:text-amber-200">
                          Sans accès{row.lapsed ? ` · ${LAPSED_LABELS[row.lapsed]}` : ""}
                        </Badge>
                      )}
                      {row.granted && row.grantedByName && <p className="mt-1 text-xs text-muted-foreground">par {row.grantedByName}</p>}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2 text-right">
                        {row.granted && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setRevokeTarget(row)}>
                            <UserMinus className="mr-1.5 h-4 w-4" aria-hidden />
                            Retirer l&apos;accès offert
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {data && data.pages > 1 && (
          <nav aria-label="Pages des apprenants" className="flex items-center justify-between gap-2 text-sm">
            <Button type="button" variant="outline" size="sm" disabled={data.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}>
              Précédents
            </Button>
            <span className="text-muted-foreground">
              Page {data.page} sur {data.pages}
            </span>
            <Button type="button" variant="outline" size="sm" disabled={data.page >= data.pages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}>
              Suivants
            </Button>
          </nav>
        )}
      </section>

      <AlertDialog open={revokeTarget !== null} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer l&apos;accès offert à {revokeTarget?.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {accessTier === "PREMIUM"
                ? "Sans achat ni abonnement, la personne ne pourra plus suivre la formation. Sa progression est conservée et reviendra avec un nouvel accès."
                : "La formation est gratuite : la personne garde la possibilité de s'y inscrire elle-même. Sa progression est conservée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = revokeTarget;
                setRevokeTarget(null);
                if (target) void revoke(target);
              }}
            >
              Retirer l&apos;accès
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
