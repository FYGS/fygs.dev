import Link from "next/link";
import { ArrowRight, Award, GraduationCap, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * "Transform your developer career": the pitch that used to sit on the home page, now at the bottom of /formations
 * and /parcours, where the visitor is already looking at courses. Only what the catalog itself states (practical
 * courses, exercises and quizzes, a certificate at the end): no figure, no guarantee, no limited offer.
 */
const FEATURES = [
  { icon: GraduationCap, label: "Apprentissage par projet", text: "Des formations pratiques, pas de théorie seule." },
  { icon: ListChecks, label: "Exercices et quiz", text: "Vous vérifiez ce que vous avez compris, à chaque étape." },
  { icon: Award, label: "Certificat à la fin", text: "Un certificat quand vous terminez une formation ou un parcours." },
] as const;

export function FormationsCta({ other }: { other: "formations" | "parcours" }) {
  const next =
    other === "parcours"
      ? { href: "/parcours", label: "Voir les parcours" }
      : { href: "/formations#courses", label: "Voir les formations" };

  return (
    <section aria-labelledby="formations-cta-title" className="mt-16 rounded-2xl border bg-linear-to-br from-primary/5 via-background to-primary/5 p-8 lg:p-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="formations-cta-title" className="text-3xl font-bold lg:text-4xl">
          Transformez votre carrière de développeur
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Avancez à votre rythme, un cours à la fois ou en suivant un parcours complet.
        </p>
      </div>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, label, text }) => (
          <li key={label} className="rounded-xl border bg-card p-5 text-center shadow-sm">
            <Icon className="mx-auto h-6 w-6 text-primary" aria-hidden />
            <p className="mt-3 font-semibold">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link href={next.href}>
            {next.label}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/#contact">Une question ? Me contacter</Link>
        </Button>
      </div>
    </section>
  );
}
