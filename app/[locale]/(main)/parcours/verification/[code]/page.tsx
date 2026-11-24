import { permanentRedirect } from "next/navigation";

/** Path certificates are verified on the same page as course certificates. */
export default async function VerifyPathCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  permanentRedirect(`/certificates/verify/${encodeURIComponent(code)}`);
}
