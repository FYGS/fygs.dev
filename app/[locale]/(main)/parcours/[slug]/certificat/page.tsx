import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PathCertificateSheet } from "@/components/paths/path-certificate-sheet";
import { PrintButton } from "@/components/paths/print-button";
import { SITE_URL } from "@/app/_lib/constants";
import { getPublishedPath } from "@/lib/paths/queries";
import { syncPathCertificates, verifyPathCertificate } from "@/lib/paths/certificates";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon certificat de parcours | FYGS", robots: { index: false } };

export default async function PathCertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/parcours/${slug}/certificat`)}`);
  const userId = session.user.id;

  const path = await getPublishedPath(slug);
  if (!path) notFound();

  await syncPathCertificates(userId);
  const certificate = await db.pathCertificate.findUnique({
    where: { userId_pathId: { userId, pathId: path.id } },
    select: { code: true },
  });
  // Not earned (yet): back to the path, which shows what is left.
  if (!certificate) redirect(`/parcours/${slug}`);

  const verified = await verifyPathCertificate(certificate.code);
  if (!verified) notFound();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-10">
      {/* the site header and footer are not part of the certificate */}
      <style>{`@media print { header, footer, nav { display: none !important; } }`}</style>
      <PathCertificateSheet
        holderName={verified.holderName}
        pathTitle={verified.pathTitle}
        courseTitles={verified.courseTitles}
        issuedAt={verified.issuedAt}
        code={verified.code}
        verifyUrl={`${SITE_URL}/fr/parcours/verification/${verified.code}`}
      />
      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <PrintButton />
        <Button variant="outline" asChild>
          <Link href={`/parcours/verification/${verified.code}`}>Page de vérification publique</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href={`/parcours/${slug}`}>Retour au parcours</Link>
        </Button>
      </div>
    </div>
  );
}
