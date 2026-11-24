import { permanentRedirect } from "next/navigation";

/** Certificates (course and path) are listed in « Mon apprentissage ». */
export default function CertificatesIndexPage() {
  permanentRedirect("/dashboard/my-courses?tab=certificats");
}
