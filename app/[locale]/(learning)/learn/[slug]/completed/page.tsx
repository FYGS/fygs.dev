import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PartyPopper, Star } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CertificateActions } from "@/components/learning/certificate-actions";
import { CertificateSheet } from "@/components/learning/certificate-view";
import { SITE_URL } from "@/app/_lib/constants";
import { itemHref } from "@/lib/learning/outline";
import { getLearningContext } from "@/lib/learning/page-context";
import { suggestNextCourses } from "@/lib/learning/recommendations";

interface CompletedPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Formation terminée | FYGS", robots: { index: false } };

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export default async function CompletedPage({ params }: CompletedPageProps) {
  const { slug } = await params;
  const ctx = await getLearningContext(slug);
  if (ctx.mode !== "full") redirect(`/formations/${ctx.course.slug}`);
  const { progress } = ctx.state;

  // Not finished: say what is left and where to go, instead of a celebration
  if (!progress.isComplete) {
    const left = progress.total - progress.done;
    return (
      <div className="space-y-4 rounded-lg border p-8 text-center">
        <h1 className="text-2xl font-bold">Il vous reste {left} étape{left > 1 ? "s" : ""}</h1>
        <p className="text-muted-foreground">
          Vous avez terminé {progress.done} étape{progress.done > 1 ? "s" : ""} sur {progress.total} ({progress.percent}%). Le certificat est délivré
          quand toutes les leçons, tous les quiz{progress.exam.required ? " et l’examen final" : ""} sont terminés.
        </p>
        {progress.next && (
          <Button asChild size="lg">
            <Link href={itemHref(ctx.course.slug, progress.next)}>
              Continuer : {progress.next.title} <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  const [certificate, nextCourses] = await Promise.all([
    db.certificate.findUnique({
      where: { userId_courseId: { userId: ctx.user.id, courseId: ctx.course.id } },
      select: { id: true, code: true, issuedAt: true },
    }),
    suggestNextCourses(ctx.user.id, ctx.course.id),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-2 text-center">
        <PartyPopper className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
        <h1 className="text-3xl font-bold">Formation terminée</h1>
        <p className="text-muted-foreground">Bravo, vous avez terminé « {ctx.course.title} ».</p>
      </header>

      {certificate ? (
        <section aria-label="Votre certificat" className="space-y-6">
          <CertificateSheet
            holder={ctx.user.name || ctx.user.email}
            courseTitle={ctx.course.title}
            issuedAt={certificate.issuedAt}
            code={certificate.code}
          />
          <CertificateActions
            courseId={ctx.course.id}
            courseTitle={ctx.course.title}
            code={certificate.code}
            issuedAt={certificate.issuedAt.toISOString()}
            verifyUrl={`${SITE_URL}/certificates/verify/${certificate.code}`}
          />
        </section>
      ) : (
        <p role="status" className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Le certificat n’a pas pu être délivré : il faut un accès actif à la formation. Dès que votre accès est rétabli, il vous est remis
          automatiquement. <Link href={`/formations/${ctx.course.slug}`} className="underline">Voir la formation</Link>
        </p>
      )}

      <section aria-labelledby="review-heading" className="rounded-lg border p-6 text-center">
        <h2 id="review-heading" className="font-semibold">Qu’avez-vous pensé de cette formation ?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Votre avis aide les prochains apprenants à choisir.</p>
        <Button asChild variant="outline" className="mt-3">
          <Link href={`/formations/${ctx.course.slug}#reviews`}>
            <Star className="mr-2 h-4 w-4" aria-hidden /> Donner mon avis
          </Link>
        </Button>
      </section>

      {nextCourses.length > 0 && (
        <section aria-labelledby="next-heading" className="space-y-4">
          <h2 id="next-heading" className="text-xl font-semibold">Pour aller plus loin</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {nextCourses.map((c) => (
              <li key={c.id} className="flex flex-col rounded-lg border p-4">
                <span className="text-xs text-muted-foreground">{LEVEL_LABEL[c.level] ?? c.level}</span>
                <Link href={`/formations/${c.slug}`} className="mt-1 font-medium hover:underline">
                  {c.title}
                </Link>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-sm">
        <Link href="/dashboard" className="underline">Retour au tableau de bord</Link>
      </p>
    </div>
  );
}
