import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificatePageBody } from "@/components/learning/certificate-page";
import { findCertificateByCode } from "@/lib/learning/certificates";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mon certificat | FYGS", robots: { index: false } };

/** The holder's page of a course certificate. Kept whatever happens to the access afterwards. */
export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/certificates/${courseId}`)}`);

  const cert = await db.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: { code: true },
  });
  const certificate = cert ? await findCertificateByCode(cert.code) : null;
  if (!certificate) notFound();

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-12">
      <h1 className="text-2xl font-bold print:hidden">Mon certificat</h1>
      <CertificatePageBody certificate={certificate} backHref={certificate.href} backLabel="Voir la formation" />
    </div>
  );
}
