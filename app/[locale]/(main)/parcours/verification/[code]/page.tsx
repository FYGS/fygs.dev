import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathCertificateSheet } from "@/components/paths/path-certificate-sheet";
import { SITE_URL } from "@/app/_lib/constants";
import { verifyPathCertificate } from "@/lib/paths/certificates";

export const metadata: Metadata = {
  title: "Vérification d'un certificat de parcours | FYGS",
  robots: { index: false, follow: false },
};

/** Public: anyone holding a certificate code can check that FYGS issued it. */
export default async function VerifyPathCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await verifyPathCertificate(decodeURIComponent(code));

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-10">
      {certificate ? (
        <>
          <p role="status" className="flex items-center justify-center gap-2 text-lg font-medium text-emerald-700 dark:text-emerald-400">
            <CircleCheck className="h-6 w-6" aria-hidden /> Ce certificat est authentique
          </p>
          <PathCertificateSheet
            holderName={certificate.holderName}
            pathTitle={certificate.pathTitle}
            courseTitles={certificate.courseTitles}
            issuedAt={certificate.issuedAt}
            code={certificate.code}
            verifyUrl={`${SITE_URL}/fr/parcours/verification/${certificate.code}`}
          />
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href={`/parcours/${certificate.pathSlug}`}>Voir le parcours</Link>
            </Button>
          </div>
        </>
      ) : (
        <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-10 text-center">
          <CircleX className="mx-auto h-10 w-10 text-destructive" aria-hidden />
          <h1 className="text-2xl font-bold">Certificat introuvable</h1>
          <p className="text-muted-foreground">
            Aucun certificat de parcours ne correspond à ce code. Vérifiez qu&apos;il est recopié en entier, sans espace.
          </p>
          <Button asChild variant="outline">
            <Link href="/parcours">Voir les parcours</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
