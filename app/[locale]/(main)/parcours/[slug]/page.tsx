import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Award, BookOpen, Check, Clock, Layers } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CourseThumbnail } from "@/components/marketing/course-thumbnail";
import { PathCourseTimeline } from "@/components/paths/path-course-timeline";
import { PathEnrollButton } from "@/components/paths/path-enroll-button";
import { PathStructuredData } from "@/components/paths/path-structured-data";
import { getPublishedPath } from "@/lib/paths/queries";
import { loadUserPath } from "@/lib/paths/progress";
import { syncPathCertificates } from "@/lib/paths/certificates";
import { LEVEL_LABELS } from "@/lib/courses/labels";
import { formatMinutes } from "@/lib/format-duration";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = await getPublishedPath(slug);
  if (!path) notFound(); // before the page streams, so the response is a real 404
  const title = `${path.title} | Parcours FYGS`;
  const image = path.thumbnail ?? `/api/og/parcours?title=${encodeURIComponent(path.title.slice(0, 80))}&courses=${path.courseCount}`;
  return {
    title,
    description: path.description.slice(0, 200),
    alternates: { canonical: `/parcours/${slug}` },
    openGraph: {
      title,
      description: path.description.slice(0, 200),
      type: "website",
      url: `/parcours/${slug}`,
      siteName: "FYGS Learning Platform",
      images: [{ url: image, width: 1200, height: 630, alt: path.title }],
    },
    twitter: { card: "summary_large_image", title, description: path.description.slice(0, 200), images: [image] },
  };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const path = await getPublishedPath(slug);
  if (!path) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (userId) await syncPathCertificates(userId); // a path completed since the last visit gets its certificate now
  const state = userId ? await loadUserPath(userId, path) : null;

  const progress = state?.progress;
  const continueHref = state?.next?.href ?? null;
  const lessonsTotal = path.courses.filter((c) => c.available).reduce((sum, c) => sum + c.lessonsCount, 0);
  // Premium courses the learner cannot take yet (all of them for a visitor): said plainly, with where to get them
  const lockedPremium = state
    ? state.courses.filter((c) => c.status === "needs_access").length
    : path.courses.filter((c) => c.available && c.accessTier === "PREMIUM").length;

  return (
    <div className="container mx-auto max-w-6xl space-y-10 py-10">
      <PathStructuredData path={path} />

      <nav aria-label="Fil d'Ariane" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/parcours" className="hover:underline">
              Parcours
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {path.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{LEVEL_LABELS[path.level]}</Badge>
            {path.featured && <Badge>À la une</Badge>}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{path.title}</h1>
          <p className="whitespace-pre-line text-lg text-muted-foreground">{path.description}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" aria-hidden />
              {path.courseCount} formation{path.courseCount > 1 ? "s" : ""}
              {path.requiredCount < path.courseCount && (
                <span className="text-muted-foreground">({path.courseCount - path.requiredCount} facultative{path.courseCount - path.requiredCount > 1 ? "s" : ""})</span>
              )}
            </li>
            <li className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden />
              {lessonsTotal} leçon{lessonsTotal > 1 ? "s" : ""}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden />
              {formatMinutes(path.minutes) || "—"}
            </li>
            <li className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" aria-hidden />
              Certificat à la fin
            </li>
          </ul>
        </header>

        <aside className="space-y-4 lg:row-span-2 lg:sticky lg:top-24 lg:self-start" aria-label="Votre parcours">
          <Card className="overflow-hidden">
            <CourseThumbnail src={path.thumbnail} alt="" className="aspect-video w-full rounded-none" />
            <CardContent className="space-y-4 p-5">
              {progress && state?.enrolled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Votre progression</span>
                    <span>{progress.percent} %</span>
                  </div>
                  <Progress value={progress.percent} aria-label="Progression dans le parcours" />
                  <p className="text-xs text-muted-foreground">
                    {progress.requiredDone} formation{progress.requiredDone > 1 ? "s" : ""} sur {progress.requiredTotal} terminée
                    {progress.requiredDone > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {state?.certificate ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <Award className="h-4 w-4" aria-hidden /> Parcours terminé
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/parcours/${slug}/certificat`}>Voir mon certificat</Link>
                  </Button>
                </div>
              ) : (
                <PathEnrollButton
                  pathId={path.id}
                  slug={slug}
                  signedIn={Boolean(userId)}
                  enrolled={state?.enrolled ?? false}
                  continueHref={continueHref}
                />
              )}

              <p className="text-xs text-muted-foreground">
                En vous inscrivant au parcours, les formations qui vous sont ouvertes s&apos;ajoutent à votre apprentissage.
                {lockedPremium > 0 ? (
                  <>
                    {" "}
                    {lockedPremium} formation{lockedPremium > 1 ? "s" : ""} Premium {lockedPremium > 1 ? "sont incluses" : "est incluse"} dans
                    l&apos;abonnement ou {lockedPremium > 1 ? "achetables" : "achetable"} à l&apos;unité.{" "}
                    <Link href="/pricing" className="underline underline-offset-2">
                      Voir les formules
                    </Link>
                  </>
                ) : state ? (
                  " Toutes ses formations vous sont ouvertes."
                ) : (
                  " Toutes ses formations sont gratuites, avec un compte."
                )}
              </p>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-10">
          {path.objectives.length > 0 && (
            <section aria-labelledby="objectives-title" className="space-y-3">
              <h2 id="objectives-title" className="text-2xl font-semibold">
                Ce que vous saurez faire
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {path.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {objective}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="programme-title" className="space-y-4">
            <h2 id="programme-title" className="text-2xl font-semibold">
              Le programme
            </h2>
            <PathCourseTimeline
              courses={state?.courses ?? path.courses.filter((c) => c.available)}
              signedIn={Boolean(userId)}
              nextCourseId={state?.enrolled ? progress?.nextCourseId : null}
            />
          </section>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Le certificat du parcours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Il est délivré automatiquement quand toutes les formations obligatoires sont terminées (leçons, quiz et examen final
                compris). Les formations facultatives ne sont pas nécessaires.
              </p>
              <p>Chaque certificat porte un code que n&apos;importe qui peut vérifier en ligne.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
