import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificatePageBody } from "@/components/learning/certificate-page";
import { findCertificateByCode } from "@/lib/learning/certificates";
import { syncPathCertificates } from "@/lib/paths/certificates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon certificat de parcours | FYGS", robots: { index: false } };

/** The holder's page of a path certificate: same sheet, PDF and sharing as a course certificate. */
export default async function PathCertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/parcours/${slug}/certificat`)}`);
  const userId = session.user.id;

  // A certificate stays reachable even if the path was unpublished after it was delivered
  const path = await db.path.findUnique({ where: { slug }, select: { id: true, published: true } });
  if (!path) notFound();

  if (path.published) await syncPathCertificates(userId);
  const issued = await db.pathCertificate.findUnique({
    where: { userId_pathId: { userId, pathId: path.id } },
    select: { code: true },
  });
  // Not earned (yet): back to the path, which shows what is left.
  if (!issued) redirect(`/parcours/${slug}`);

  const certificate = await findCertificateByCode(issued.code);
  if (!certificate) notFound();

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-10">
      <h1 className="text-2xl font-bold print:hidden">Mon certificat de parcours</h1>
      <CertificatePageBody certificate={certificate} backHref={`/parcours/${slug}`} backLabel="Retour au parcours" />
    </div>
  );
}
