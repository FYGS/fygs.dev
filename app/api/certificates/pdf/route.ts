import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jsPDF from "jspdf";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { certificateVerifyUrl, findCertificateByCode, type CertificateRecord } from "@/lib/learning/certificates";

// Needs Node runtime because auth/email service transitively pulls in nodemailer (depends on 'stream').
export const runtime = "nodejs";

const longDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

/**
 * The PDF of a course or path certificate: `?code=<verification code>`. Only its holder may download it
 * (anyone can check it on the verification page). `?courseId=` is still answered for links made before codes.
 */
export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "pdf", { limit: 20, windowSeconds: 60 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
  const userId = session.user.id;

  const url = new URL(request.url);
  let code = url.searchParams.get("code");
  const courseId = url.searchParams.get("courseId");
  if (!code && courseId) {
    const cert = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { code: true } });
    code = cert?.code ?? null;
  }
  if (!code) return NextResponse.json({ ok: false, error: "MISSING_CODE" }, { status: 400 });

  const certificate = await findCertificateByCode(code);
  if (!certificate || certificate.holderId !== userId) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  return new NextResponse(renderCertificatePdf(certificate), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=certificat-fygs-${certificate.code.slice(0, 8)}.pdf`,
      "Cache-Control": "private, no-store",
    },
  });
}

function renderCertificatePdf(certificate: CertificateRecord): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const center = (text: string, y: number, size: number, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    // long titles are wrapped rather than running off the page
    const lines = doc.splitTextToSize(text, w - 160) as string[];
    lines.forEach((line, i) => doc.text(line, (w - doc.getTextWidth(line)) / 2, y + i * size * 1.15));
    return lines.length;
  };

  doc.setDrawColor("#444");
  doc.setLineWidth(3);
  doc.rect(28, 28, w - 56, h - 56, "S");
  doc.setDrawColor("#999");
  doc.setLineWidth(1);
  doc.rect(46, 46, w - 92, h - 92, "S");

  const isPath = certificate.kind === "path";
  center("FYGS", 110, 26, "bold");
  center(isPath ? "CERTIFICAT DE PARCOURS" : "CERTIFICAT DE RÉUSSITE", 155, 32, "bold");
  center("Décerné à", 200, 15);
  center(certificate.holderName, 238, 28, "bold");
  center(isPath ? "pour avoir mené à terme le parcours" : "pour avoir terminé la formation", 274, 14);
  const titleLines = center(certificate.title, 308, 22, "bold");
  let y = 308 + titleLines * 26 + 8;
  if (isPath && certificate.courseTitles.length > 0) {
    center(certificate.courseTitles.join(" · "), y, 11);
    y += 22;
  }
  center(`Délivré le ${longDate.format(certificate.issuedAt)}`, y + 10, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("__________________________", w - 340, h - 170);
  doc.text("Fernand SOUALO, formateur", w - 330, h - 150);

  center(`Code de vérification : ${certificate.code}`, h - 110, 10);
  center(certificateVerifyUrl(certificate.code), h - 94, 9);
  return doc.output("arraybuffer");
}
