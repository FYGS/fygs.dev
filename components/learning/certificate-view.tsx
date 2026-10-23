import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

interface CertificateSheetProps {
  holder: string;
  courseTitle: string;
  issuedAt: Date | string;
  code: string;
  className?: string;
}

/** The certificate as shown on screen (the PDF carries the same facts). */
export function CertificateSheet({ holder, courseTitle, issuedAt, code, className }: CertificateSheetProps) {
  return (
    <figure
      aria-label={`Certificat de réussite de ${holder} pour ${courseTitle}`}
      className={cn("relative overflow-hidden rounded-xl border-2 border-amber-500/50 bg-card p-8 text-center sm:p-10", className)}
    >
      <Award className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Certificat de réussite</p>
      <p className="mt-6 text-sm text-muted-foreground">Décerné à</p>
      <p className="mt-1 text-2xl font-bold">{holder}</p>
      <p className="mt-4 text-sm text-muted-foreground">pour avoir terminé la formation</p>
      <h2 className="mt-1 text-xl font-semibold">{courseTitle}</h2>
      <p className="mt-5 text-sm text-muted-foreground">Délivré le {dateFormat.format(new Date(issuedAt))}</p>
      <p className="mt-6 font-mono text-xs text-muted-foreground">Code de vérification : {code}</p>
    </figure>
  );
}
