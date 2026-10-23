import { Award } from "lucide-react";

const longDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

/** The certificate itself: the same sheet on the learner's page and on the public verification page. */
export function PathCertificateSheet({
  holderName,
  pathTitle,
  courseTitles,
  issuedAt,
  code,
  verifyUrl,
}: {
  holderName: string;
  pathTitle: string;
  courseTitles: string[];
  issuedAt: Date;
  code: string;
  verifyUrl: string;
}) {
  return (
    <section
      aria-label="Certificat de parcours"
      className="rounded-2xl border-2 border-primary/30 bg-linear-to-br from-background via-background to-primary/5 p-8 shadow-xs sm:p-12 print:border-black print:shadow-none"
    >
      <div className="space-y-6 text-center">
        <Award className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Certificat de parcours</p>
        <p className="text-sm text-muted-foreground">Délivré à</p>
        <p className="text-3xl font-bold">{holderName}</p>
        <p className="mx-auto max-w-xl leading-relaxed">
          pour avoir mené à terme le parcours <span className="font-semibold">{pathTitle}</span>, en validant l&apos;ensemble de ses
          formations.
        </p>
        {courseTitles.length > 0 && (
          <ul className="mx-auto max-w-md space-y-1 text-sm text-muted-foreground">
            {courseTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}
        <p className="text-sm">Le {longDate.format(issuedAt)}</p>
        <div className="border-t pt-4 text-xs text-muted-foreground">
          <p>
            Code de vérification : <span className="font-mono">{code}</span>
          </p>
          <p className="break-all">Vérifiable sur {verifyUrl}</p>
        </div>
      </div>
    </section>
  );
}
