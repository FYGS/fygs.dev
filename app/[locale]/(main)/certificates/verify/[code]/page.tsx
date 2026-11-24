import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateSheet } from "@/components/learning/certificate-view";
import { certificateVerifyUrl, findCertificateByCode } from "@/lib/learning/certificates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vérification d’un certificat | FYGS",
  robots: { index: false },
};

/** Public: anyone given the code can check that a course or path certificate is real, who holds it and for what. */
export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await findCertificateByCode(decodeURIComponent(code).trim());

  if (!certificate) {
    return (
      <div className="container mx-auto max-w-2xl space-y-4 py-16 text-center">
        <ShieldX className="mx-auto h-12 w-12 text-destructive" aria-hidden />
        <h1 className="text-2xl font-bold">Certificat introuvable</h1>
        <p className="text-muted-foreground">
          Aucun certificat ne correspond à ce code. Vérifiez qu’il est recopié en entier, sans espace, ou suivez le lien imprimé sur le certificat.
        </p>
        <Button asChild variant="outline">
          <Link href="/formations">Voir les formations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-12">
      <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
        <h1 className="text-xl font-bold">Ce certificat est authentique</h1>
      </div>
      <CertificateSheet
        kind={certificate.kind}
        holder={certificate.holderName}
        title={certificate.title}
        courseTitles={certificate.courseTitles}
        issuedAt={certificate.issuedAt}
        code={certificate.code}
        verifyUrl={certificateVerifyUrl(certificate.code)}
      />
      <p className="text-center text-sm">
        <Link href={certificate.href} className="underline">
          {certificate.kind === "path" ? "Découvrir ce parcours" : "Découvrir cette formation"}
        </Link>
      </p>
    </div>
  );
}
