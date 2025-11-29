import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CertificateService } from "@/lib/certificate-service";
import { logger, createLogger } from "@/lib/structured-logger";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CertificatesIndexPage() {
  const correlationId = logger.generateCorrelationId();
  const certificatesLogger = createLogger({
    operation: "certificates-page-view",
    correlationId,
    resourceType: "certificates",
  });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/certificates");
  }
  const userId = session.user.id;

  certificatesLogger.info("Certificates page accessed", {
    userId,
  });

  // Use certificate service instead of direct DB access
  const certificates = await CertificateService.getUserCertificates(userId);

  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Mes certificats
        </h1>
        <p className="text-sm text-muted-foreground">
          Certificats émis après complétion à 100% d&apos;un cours.
        </p>
      </div>
      {certificates.length === 0 && (
        <div className="text-sm text-muted-foreground">
          Aucun certificat obtenu pour le moment.
        </div>
      )}
      <div className="space-y-4">
        {certificates.map((cert) => {
          if (!cert.course) return null;
          const issued = new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
          }).format(cert.issuedAt);
          return (
            <div
              key={cert.courseId}
              className="flex items-center justify-between border rounded-lg p-4 bg-card"
            >
              <div className="space-y-1">
                <h2 className="font-medium text-sm sm:text-base">
                  {cert.course.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Délivré le {issued}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/certificates/${cert.courseId}`}
                  className="inline-flex items-center gap-1 text-xs underline"
                >
                  Voir <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href={`/api/certificates/pdf?courseId=${cert.courseId}`}
                  prefetch={false}
                  className="inline-flex items-center gap-1 text-xs underline"
                >
                  PDF <Download className="h-3 w-3" />
                </Link>
                <Link
                  href={`/formations/${cert.course.slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-xs underline text-muted-foreground"
                >
                  Cours
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
