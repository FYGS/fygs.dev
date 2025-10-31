import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const cert = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { issuedAt: true } });
  if (!cert) notFound();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } });
  if (!course) notFound();

  const issuedDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(cert.issuedAt);

  return (
    <div className="container py-16 max-w-3xl mx-auto">
      <div className="border rounded-xl p-10 bg-linear-to-br from-background via-background to-primary/5 shadow-xs">
        <h1 className="text-2xl font-bold mb-2">Certificat de Complétion</h1>
        <p className="text-sm text-muted-foreground mb-6">Délivré à</p>
        <div className="text-xl font-semibold mb-4">{session.user.name || session.user.email}</div>
        <p className="mb-4 leading-relaxed">a complété avec succès le cours <span className="font-medium">{course.title}</span> le {issuedDate}.</p>
        <div className="mt-8 flex gap-4">
          <Link
            href={`/api/certificates/pdf?courseId=${courseId}`}
            className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium"
          >
            Télécharger PDF
          </Link>
          <Link href={`/formations/${course.slug}`} className="text-sm underline self-center">Voir le cours</Link>
        </div>
      </div>
    </div>
  );
}
