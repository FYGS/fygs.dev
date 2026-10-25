"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CurriculumSnapshot } from "@/lib/curriculum/curriculum";
import { allLessons } from "@/lib/curriculum/snapshot";
import { normalizeTrailerUrl } from "@/lib/curriculum/content";
import type { Readiness } from "@/lib/curriculum/publish";
import { formatSeconds } from "@/lib/format-duration";
import type { CourseInfo, SectionId } from "./types";

interface Props {
  info: CourseInfo;
  readiness: Readiness;
  snapshot: CurriculumSnapshot;
  quizCount: number;
  hasExam: boolean;
  onGoToSection: (section: SectionId) => void;
}

const SECTION_OF_ITEM = {
  title: "infos",
  description: "infos",
  thumbnail: "infos",
  lessons: "programme",
  materials: "programme",
  price: "vente",
} as const;

export function PreviewPanel({ info, readiness, snapshot, quizCount, hasExam, onGoToSection }: Props) {
  const lessons = allLessons(snapshot);
  const ready = lessons.filter((l) => l.status === "ready");
  const seconds = lessons.filter((l) => l.published).reduce((n, l) => n + (l.duration ?? 0), 0);

  const facts = [
    ["Modules", snapshot.modules.length],
    ["Leçons prêtes", `${ready.length} / ${lessons.length}`],
    ["Durée des leçons publiées", seconds > 0 ? formatSeconds(seconds) : "—"],
    ["Quiz", quizCount],
    ["Examen final", hasExam ? "Oui" : "Non"],
    ["Objectifs", info.objectives.length],
    ["Questions fréquentes", info.faq.filter((f) => f.q.trim() && f.a.trim()).length],
    ["Bande-annonce", normalizeTrailerUrl(info.trailerUrl) ? "Oui" : "Non"],
  ] as const;

  return (
    <div className="space-y-10">
      <section aria-labelledby="preview-view" className="space-y-3">
        <h2 id="preview-view" className="text-lg font-semibold">
          Voir la formation
        </h2>
        <p className="text-sm text-muted-foreground">
          La page que verront les visiteurs, avec votre contenu actuel, même tant que la formation est en brouillon. Depuis
          cette page, vous ouvrez aussi les leçons comme un apprenant.
        </p>
        <Button asChild>
          <Link href={`/formations/${info.slug}?preview=true`} target="_blank" rel="noopener noreferrer">
            Ouvrir la page de la formation
            <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
        {!info.published && (
          <p className="text-sm text-muted-foreground">Tant qu&apos;elle est en brouillon, vous seul et les administrateurs la voyez.</p>
        )}
      </section>

      <section aria-labelledby="preview-checklist" className="space-y-3">
        <h2 id="preview-checklist" className="text-lg font-semibold">
          Avant de publier
        </h2>
        <ul className="space-y-3">
          {readiness.items.map((item) => (
            <li key={item.key} className="flex gap-3">
              {item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-label="Fait" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-label="À faire" />}
              <div className="text-sm">
                <p className={item.ok ? "text-muted-foreground" : "font-medium"}>{item.label}</p>
                {!item.ok && item.hint && <p className="text-muted-foreground">{item.hint}</p>}
                {!item.ok && (
                  <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => onGoToSection(SECTION_OF_ITEM[item.key])}>
                    Compléter
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          {readiness.ready ? (info.published ? "La formation est publiée." : "Tout est prêt : utilisez « Publier » en haut de la page.") : `${readiness.missing.length} point(s) à compléter avant de publier.`}
        </p>
      </section>

      <section aria-labelledby="preview-facts" className="space-y-3">
        <h2 id="preview-facts" className="text-lg font-semibold">
          En un coup d&apos;œil
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-card p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
