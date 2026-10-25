import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CertificateKind } from "@/lib/learning/certificates";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

interface CertificateSheetProps {
  kind: CertificateKind;
  holder: string;
  /** Title of the course or of the path. */
  title: string;
  issuedAt: Date | string;
  code: string;
  /** Absolute address of the public verification page, printed on the sheet. */
  verifyUrl: string;
  /** For a path: the courses it certifies. */
  courseTitles?: string[];
  className?: string;
}

/**
 * The certificate as shown on screen and printed: the same sheet for a course and a path, on the
 * learner's page and on the public verification page (the PDF carries the same facts).
 */
export function CertificateSheet({ kind, holder, title, issuedAt, code, verifyUrl, courseTitles = [], className }: CertificateSheetProps) {
  return (
    <figure
      aria-label={`Certificat de ${holder} pour ${kind === "path" ? "le parcours" : "la formation"} ${title}`}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-amber-500/50 bg-card p-8 text-center sm:p-10 print:border-black print:shadow-none",
        className,
      )}
    >
      <Award className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" aria-hidden />
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {kind === "path" ? "Certificat de parcours" : "Certificat de réussite"}
      </p>
      <p className="mt-6 text-sm text-muted-foreground">Décerné à</p>
      <p className="mt-1 text-2xl font-bold">{holder}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        {kind === "path" ? "pour avoir mené à terme le parcours" : "pour avoir terminé la formation"}
      </p>
      <p className="mt-1 text-xl font-semibold">{title}</p>
      {courseTitles.length > 0 && (
        <ul aria-label="Formations validées" className="mx-auto mt-4 max-w-md space-y-1 text-sm text-muted-foreground">
          {courseTitles.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-sm text-muted-foreground">Délivré le {dateFormat.format(new Date(issuedAt))}</p>
      <figcaption className="mt-6 space-y-1 border-t pt-4 text-xs text-muted-foreground">
        <p>
          Code de vérification : <span className="font-mono">{code}</span>
        </p>
        <p className="break-all">Vérifiable sur {verifyUrl}</p>
      </figcaption>
    </figure>
  );
}
