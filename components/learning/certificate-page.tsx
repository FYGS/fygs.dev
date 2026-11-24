import Link from "next/link";
import { CertificateActions } from "./certificate-actions";
import { CertificateSheet } from "./certificate-view";
import {
  certificatePdfPath,
  certificateVerifyPath,
  certificateVerifyUrl,
  type CertificateRecord,
} from "@/lib/learning/certificates";

/** The holder's view of one certificate (course or path): the sheet, what to do with it, where it is checked. */
export function CertificatePageBody({ certificate, backHref, backLabel }: { certificate: CertificateRecord; backHref: string; backLabel: string }) {
  const verifyUrl = certificateVerifyUrl(certificate.code);
  return (
    <div className="space-y-8">
      <CertificateSheet
        kind={certificate.kind}
        holder={certificate.holderName}
        title={certificate.title}
        courseTitles={certificate.courseTitles}
        issuedAt={certificate.issuedAt}
        code={certificate.code}
        verifyUrl={verifyUrl}
      />
      <CertificateActions
        title={certificate.title}
        code={certificate.code}
        issuedAt={certificate.issuedAt.toISOString()}
        verifyUrl={verifyUrl}
        pdfUrl={certificatePdfPath(certificate.code)}
      />
      <p className="text-center text-sm text-muted-foreground print:hidden">
        Toute personne qui a le lien peut contrôler l’authenticité de ce certificat sur la{" "}
        <Link href={certificateVerifyPath(certificate.code)} className="underline">
          page de vérification
        </Link>
        .
      </p>
      <p className="text-center text-sm print:hidden">
        <Link href={backHref} className="underline">
          {backLabel}
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/my-courses?tab=certificats" className="underline">
          Tous mes certificats
        </Link>
      </p>
    </div>
  );
}
