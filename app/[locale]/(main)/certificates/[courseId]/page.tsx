import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CertificateSheet } from "@/components/learning/certificate-view";
import { CertificateActions } from "@/components/learning/certificate-actions";
import { SITE_URL } from "@/app/_lib/constants";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mon certificat | FYGS", robots: { index: false } };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/certificates/${courseId}`);
  }

  const cert = await db.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: { code: true, issuedAt: true, course: { select: { title: true, slug: true } } },
  });
  if (!cert) notFound();

  const verifyUrl = `${SITE_URL}/certificates/verify/${cert.code}`;

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-12">
      <h1 className="text-2xl font-bold">Mon certificat</h1>
      <CertificateSheet
        holder={session.user.name || session.user.email}
        courseTitle={cert.course.title}
        issuedAt={cert.issuedAt}
        code={cert.code}
      />
      <CertificateActions
        courseId={courseId}
        courseTitle={cert.course.title}
        code={cert.code}
        issuedAt={cert.issuedAt.toISOString()}
        verifyUrl={verifyUrl}
      />
      <p className="text-center text-sm text-muted-foreground">
        Toute personne qui a le lien de vérification peut contrôler l’authenticité de ce certificat :{" "}
        <Link href={`/certificates/verify/${cert.code}`} className="underline">
          page de vérification
        </Link>
        .
      </p>
      <p className="text-center text-sm">
        <Link href={`/formations/${cert.course.slug}`} className="underline">
          Voir la formation
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/certificates" className="underline">
          Tous mes certificats
        </Link>
      </p>
    </div>
  );
}
