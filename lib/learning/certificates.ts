import { db } from "@/lib/db";
import { SITE_URL } from "@/app/_lib/constants";

/**
 * Course and path certificates read the same way: one shape for the certificate page, the public
 * verification page, the PDF and the learner's list. Each certificate has a public code (32 hexadecimal
 * characters) that anyone can check at /certificates/verify/<code>.
 */

export type CertificateKind = "course" | "path";

export interface CertificateRecord {
  kind: CertificateKind;
  code: string;
  issuedAt: Date;
  holderId: string;
  holderName: string;
  /** Title of the course or of the path. */
  title: string;
  /** Page of the course (/formations/<slug>) or of the path (/parcours/<slug>). */
  href: string;
  /** The holder's page of this certificate (sheet, PDF, sharing). */
  holderHref: string;
  /** For a path: the required courses it certifies. */
  courseTitles: string[];
}

const CODE_PATTERN = /^[a-f0-9]{32}$/i;

export const isCertificateCode = (code: string) => CODE_PATTERN.test(code);
export const certificateVerifyPath = (code: string) => `/certificates/verify/${code}`;
export const certificateVerifyUrl = (code: string) => `${SITE_URL}${certificateVerifyPath(code)}`;
export const certificatePdfPath = (code: string) => `/api/certificates/pdf?code=${code}`;

/** The certificate with this code, course or path, or null. */
export async function findCertificateByCode(rawCode: string): Promise<CertificateRecord | null> {
  if (!isCertificateCode(rawCode)) return null;
  const code = rawCode.toLowerCase();

  const course = await db.certificate.findUnique({
    where: { code },
    select: {
      code: true,
      issuedAt: true,
      user: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
  if (course) {
    return {
      kind: "course",
      code: course.code,
      issuedAt: course.issuedAt,
      holderId: course.user.id,
      holderName: course.user.name,
      title: course.course.title,
      href: `/formations/${course.course.slug}`,
      holderHref: `/certificates/${course.course.id}`,
      courseTitles: [],
    };
  }

  const path = await db.pathCertificate.findUnique({
    where: { code },
    select: {
      code: true,
      issuedAt: true,
      user: { select: { id: true, name: true } },
      path: {
        select: {
          title: true,
          slug: true,
          courses: {
            where: { optional: false },
            orderBy: { order: "asc" },
            select: { course: { select: { title: true } } },
          },
        },
      },
    },
  });
  if (!path) return null;
  return {
    kind: "path",
    code: path.code,
    issuedAt: path.issuedAt,
    holderId: path.user.id,
    holderName: path.user.name,
    title: path.path.title,
    href: `/parcours/${path.path.slug}`,
    holderHref: `/parcours/${path.path.slug}/certificat`,
    courseTitles: path.path.courses.map((c) => c.course.title),
  };
}

/** Every certificate of a learner, newest first. */
export async function listUserCertificates(userId: string): Promise<CertificateRecord[]> {
  const [courses, paths, user] = await Promise.all([
    db.certificate.findMany({
      where: { userId },
      select: { code: true, issuedAt: true, course: { select: { id: true, title: true, slug: true } } },
    }),
    db.pathCertificate.findMany({
      where: { userId },
      select: {
        code: true,
        issuedAt: true,
        path: {
          select: {
            title: true,
            slug: true,
            courses: {
              where: { optional: false },
              orderBy: { order: "asc" },
              select: { course: { select: { title: true } } },
            },
          },
        },
      },
    }),
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);
  const holderName = user?.name ?? "";
  const records: CertificateRecord[] = [
    ...courses.map((c) => ({
      kind: "course" as const,
      code: c.code,
      issuedAt: c.issuedAt,
      holderId: userId,
      holderName,
      title: c.course.title,
      href: `/formations/${c.course.slug}`,
      holderHref: `/certificates/${c.course.id}`,
      courseTitles: [],
    })),
    ...paths.map((p) => ({
      kind: "path" as const,
      code: p.code,
      issuedAt: p.issuedAt,
      holderId: userId,
      holderName,
      title: p.path.title,
      href: `/parcours/${p.path.slug}`,
      holderHref: `/parcours/${p.path.slug}/certificat`,
      courseTitles: p.path.courses.map((c) => c.course.title),
    })),
  ];
  return records.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
}
