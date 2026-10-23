import Link from "next/link";
import { ArrowRight, Award, BookOpen, Play, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CatalogStats {
  courses: number;
  learners: number;
  certificates: number;
  /** Average of all reviews, null while there is none. */
  rating: number | null;
}

const number = new Intl.NumberFormat("fr-FR");

/** Top of the catalogue. The figures are the platform's real ones, read from the database. */
export function CourseHero({ stats }: { stats: CatalogStats }) {
  const figures = [
    { icon: BookOpen, value: number.format(stats.courses), label: stats.courses > 1 ? "Formations" : "Formation" },
    { icon: Users, value: number.format(stats.learners), label: stats.learners > 1 ? "Apprenants" : "Apprenant" },
    { icon: Award, value: number.format(stats.certificates), label: stats.certificates > 1 ? "Certificats délivrés" : "Certificat délivré" },
    ...(stats.rating !== null
      ? [{ icon: Star, value: `${stats.rating.toFixed(1).replace(".", ",")}/5`, label: "Note moyenne des avis" }]
      : []),
  ].filter((figure) => figure.value !== "0");

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-background via-background to-muted/20 py-16 md:py-24">
      <div className="container relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Formations{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">modernes</span>
            <br />
            <span className="text-3xl text-muted-foreground md:text-4xl lg:text-5xl">pour développeurs</span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
            JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud : des formations pratiques, avec quiz, exercices et certificat à la fin.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg" className="px-8 py-6 text-lg" asChild>
              <Link href="#courses">
                <Play className="mr-2 h-5 w-5" aria-hidden />
                Découvrir les formations
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
              <Link href="/dashboard/my-courses">
                Mes formations
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>

          {figures.length > 0 && (
            <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-8 pt-12 md:grid-cols-4">
              {figures.map(({ icon: Icon, value, label }) => (
                <div key={label} className="space-y-2 text-center">
                  <Icon className="mx-auto h-8 w-8 text-primary" aria-hidden />
                  <dd className="order-first text-2xl font-bold">{value}</dd>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
