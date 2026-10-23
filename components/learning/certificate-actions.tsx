"use client";

import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Linkedin, Twitter } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";

interface CertificateActionsProps {
  courseId: string;
  courseTitle: string;
  code: string;
  issuedAt: string;
  /** Absolute URL of the public verification page. */
  verifyUrl: string;
}

/** Download, add to a LinkedIn profile, share, copy the verification link. */
export function CertificateActions({ courseId, courseTitle, code, issuedAt, verifyUrl }: CertificateActionsProps) {
  const issued = new Date(issuedAt);
  const linkedIn = new URL("https://www.linkedin.com/profile/add");
  linkedIn.searchParams.set("startTask", "CERTIFICATION_NAME");
  linkedIn.searchParams.set("name", courseTitle);
  linkedIn.searchParams.set("organizationName", "FYGS");
  linkedIn.searchParams.set("issueYear", String(issued.getFullYear()));
  linkedIn.searchParams.set("issueMonth", String(issued.getMonth() + 1));
  linkedIn.searchParams.set("certUrl", verifyUrl);
  linkedIn.searchParams.set("certId", code);

  const tweet = new URL("https://twitter.com/intent/tweet");
  tweet.searchParams.set("text", `J’ai obtenu mon certificat « ${courseTitle} » sur FYGS.`);
  tweet.searchParams.set("url", verifyUrl);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Lien copié");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien de la page de vérification.");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button asChild>
        <a href={`/api/certificates/pdf?courseId=${courseId}`} download>
          <Download className="mr-2 h-4 w-4" aria-hidden /> Télécharger le PDF
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={linkedIn.toString()} target="_blank" rel="noopener noreferrer">
          <Linkedin className="mr-2 h-4 w-4" aria-hidden /> Ajouter à LinkedIn
          <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={tweet.toString()} target="_blank" rel="noopener noreferrer">
          <Twitter className="mr-2 h-4 w-4" aria-hidden /> Partager
          <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
        </a>
      </Button>
      <Button variant="outline" onClick={() => void copy()}>
        <Link2 className="mr-2 h-4 w-4" aria-hidden /> Copier le lien
      </Button>
    </div>
  );
}
