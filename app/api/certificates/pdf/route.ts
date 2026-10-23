import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import jsPDF from 'jspdf';
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from '@/app/_lib/constants';

// Needs Node runtime because auth/email service transitively pulls in nodemailer (depends on 'stream').
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "pdf", {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  let courseId = url.searchParams.get('courseId');
  if (!courseId) {
    // Fallback: allow /api/certificates/pdf/<courseId>
    const parts = url.pathname.split('/');
    const maybeId = parts[parts.length - 1];
    if (maybeId && maybeId !== 'pdf') courseId = maybeId;
  }
  if (!courseId) return NextResponse.json({ ok: false, error: 'MISSING_COURSE_ID' }, { status: 400 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  const userId = session.user.id;

  const cert = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { issuedAt: true, code: true } });
  if (!cert) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) return NextResponse.json({ ok: false, error: 'COURSE_NOT_FOUND' }, { status: 404 });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const center = (text: string, y: number, size: number, style: string = 'normal') => {
    doc.setFont('helvetica', style as any);
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (w - textWidth) / 2, y);
  };
  // Border frame
  doc.setDrawColor('#444');
  doc.setLineWidth(3);
  doc.rect(28, 28, w - 56, h - 56, 'S');
  doc.setDrawColor('#999');
  doc.setLineWidth(1);
  doc.rect(46, 46, w - 92, h - 92, 'S');
  center('FYGS DEV', 120, 28, 'bold');
  center('CERTIFICAT DE COMPLÉTION', 170, 36, 'bold');
  center('Décerné à', 220, 16);
  center(session.user.name || session.user.email, 260, 30, 'bold');
  center('Pour avoir complété la formation', 300, 14);
  center(course.title, 338, 24, 'bold');
  center(`Délivré le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(cert.issuedAt)}`, 378, 14);
  // Signature lines
  doc.setFontSize(12);
  doc.text('__________________________', 140, h - 170);
  doc.text('Responsable Pédagogique', 150, h - 150);
  doc.text('__________________________', w - 340, h - 170);
  doc.text('Fernand SOUALO', w - 300, h - 150);
  doc.setFontSize(9);
  if (cert.code) {
    center(`Code de vérification : ${cert.code}`, h - 110, 10);
    center(`${SITE_URL}/certificates/verify/${cert.code}`, h - 96, 9);
  }
  center('Ce certificat confirme la complétion réussie conformément aux standards de qualité FYGS DEV.', h - 80, 10);
  const pdfBytes = doc.output('arraybuffer');

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificat-${courseId}.pdf`
    }
  });
}
