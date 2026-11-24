import Link from "next/link";
import { Award, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { syncPathCertificates } from "@/lib/paths/certificates";
import { getPublishedPath } from "@/lib/paths/queries";
import { loadUserPath } from "@/lib/paths/progress";

/**
 * « Mes parcours » for the dashboard: the paths the learner is enrolled in, their progress, the next
 * course to take, and the certificate once earned. Server component. Also issues the certificate
 * of a path completed since the last visit.
 */
export async function MyPaths({ userId }: { userId: string }) {
  await syncPathCertificates(userId);

  const enrollments = await db.pathEnrollment.findMany({
    where: { userId, path: { published: true } },
    orderBy: { enrolledAt: "desc" },
    select: { path: { select: { slug: true } } },
  });

  const paths = (
    await Promise.all(
      enrollments.map(async ({ path }) => {
        const detail = await getPublishedPath(path.slug);
        return detail ? { detail, state: await loadUserPath(userId, detail) } : null;
      }),
    )
  ).filter((entry) => entry !== null);

  if (paths.length === 0) {
    const available = await db.path.count({ where: { published: true } });
    if (available === 0) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-lg">
            <Route className="h-5 w-5" aria-hidden /> Parcours
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>Enchaînez plusieurs formations vers un objectif, avec un certificat à la clé.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/parcours">Découvrir les parcours</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-labelledby="my-paths-title" className="space-y-4">
      <h2 id="my-paths-title" className="flex items-center gap-2 text-xl font-semibold">
        <Route className="h-5 w-5" aria-hidden /> Mes parcours
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {paths.map(({ detail, state }) => (
          <li key={detail.id}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <h3 className="font-semibold leading-snug">
                  <Link href={`/parcours/${detail.slug}`} className="hover:underline">
                    {detail.title}
                  </Link>
                </h3>
                <div className="space-y-1">
                  <Progress value={state.progress.percent} aria-label={`Progression dans le parcours ${detail.title}`} />
                  <p className="text-xs text-muted-foreground">
                    {state.progress.requiredDone} / {state.progress.requiredTotal} formations terminées · {state.progress.percent} %
                  </p>
                </div>
                <div className="mt-auto pt-1">
                  {state.certificate ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/parcours/${detail.slug}/certificat`}>
                        <Award className="mr-2 h-4 w-4" aria-hidden /> Voir le certificat
                      </Link>
                    </Button>
                  ) : state.next ? (
                    <Button asChild size="sm">
                      <Link href={state.next.href}>
                        Continuer : {state.next.title}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
