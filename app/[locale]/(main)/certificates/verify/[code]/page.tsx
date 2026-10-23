import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldX } from "lucide-react";
import { db } from "@/lib/db";
import { CertificateSheet } from "@/components/learning/certificate-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vérification d’un certificat | FYGS",
  robots: { index: false },
};

// A verification code is 32 hexadecimal characters; anything else cannot match a certificate
const CODE_PATTERN = /^[a-f0-9]{32}$/i;

/** Public: anyone given the code can check that a certificate is real, who holds it and for which course. */
export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const certificate = CODE_PATTERN.test(code)
    ? await db.certificate.findUnique({
        where: { code: code.toLowerCase() },
        select: {
          code: true,
          issuedAt: true,
          user: { select: { name: true } },
          course: { select: { title: true, slug: true } },
        },
      })
    : null;

  if (!certificate) {
    return (
      <div className="container mx-auto max-w-2xl space-y-4 py-16 text-center">
        <ShieldX className="mx-auto h-12 w-12 text-destructive" aria-hidden />
        <h1 className="text-2xl font-bold">Certificat introuvable</h1>
        <p className="text-muted-foreground">
          Aucun certificat ne correspond à ce code. Vérifiez le lien ou le code imprimé sur le certificat.
        </p>
        <Link href="/formations" className="underline">
          Voir les formations
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-12">
      <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
        <h1 className="text-xl font-bold">Certificat authentique</h1>
      </div>
      <CertificateSheet
        holder={certificate.user.name}
        courseTitle={certificate.course.title}
        issuedAt={certificate.issuedAt}
        code={certificate.code}
      />
      <p className="text-center text-sm">
        <Link href={`/formations/${certificate.course.slug}`} className="underline">
          Découvrir cette formation
        </Link>
      </p>
    </div>
  );
}
