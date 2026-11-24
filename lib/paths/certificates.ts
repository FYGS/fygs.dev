import { db } from "@/lib/db";
import { SITE_URL } from "@/app/_lib/constants";
import { emailService } from "@/lib/email-service";
import { getPublishedPath } from "./queries";
import { loadUserPath } from "./progress";

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

/**
 * Issues the certificate of every path the learner is enrolled in and has completed (every
 * required course complete). Idempotent: a path that already has its certificate is skipped, a
 * double call or two tabs cannot issue it twice. Call it after a course is completed and when a
 * path or the dashboard is shown.
 */
export async function syncPathCertificates(
  userId: string,
): Promise<{ issued: { pathId: string; slug: string; title: string; code: string }[] }> {
  const enrollments = await db.pathEnrollment.findMany({
    where: { userId, path: { published: true } },
    select: { path: { select: { id: true, slug: true, title: true } } },
  });
  if (enrollments.length === 0) return { issued: [] };

  const certified = new Set(
    (
      await db.pathCertificate.findMany({
        where: { userId, pathId: { in: enrollments.map((e) => e.path.id) } },
        select: { pathId: true },
      })
    ).map((c) => c.pathId),
  );

  const issued: { pathId: string; slug: string; title: string; code: string }[] = [];
  for (const { path } of enrollments) {
    if (certified.has(path.id)) continue;
    const detail = await getPublishedPath(path.slug);
    if (!detail) continue;
    const state = await loadUserPath(userId, detail);
    if (!state.progress.isComplete) continue;
    try {
      const certificate = await db.pathCertificate.create({
        data: { userId, pathId: path.id },
        select: { code: true },
      });
      issued.push({ pathId: path.id, slug: path.slug, title: path.title, code: certificate.code });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error; // issued by a concurrent call
      continue;
    }
    await announcePathCertificate(userId, path);
  }
  return { issued };
}

/**
 * The learner is told, as for a course certificate: a notification and an e-mail with the link to the
 * certificate. Best effort: neither can undo the certificate.
 */
async function announcePathCertificate(userId: string, path: { id: string; slug: string; title: string }) {
  try {
    await db.notification.create({
      data: {
        recipientId: userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Certificat de parcours obtenu",
        message: `Bravo, vous avez mené à terme le parcours « ${path.title} ». Votre certificat est disponible.`,
        data: { kind: "path_certificate", pathId: path.id, slug: path.slug },
      },
    });
  } catch (e) {
    console.warn("[paths] certificate notification failed", e);
  }
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (user) {
      const template = emailService.certificateEarnedEmail(user.name || user.email, path.title, `${SITE_URL}/parcours/${path.slug}/certificat`, "path");
      await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
    }
  } catch (e) {
    console.warn("[paths] certificate email failed", e);
  }
}
