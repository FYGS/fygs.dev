import { CERTIFICATIONS } from "../data";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Award, ExternalLink } from "lucide-react";
import type { CvData, CvPage } from "../_data/cv-types";

export function CertificationsCard({ cv, cvData }: { cv: CvPage; cvData: CvData }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
        <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
          {cv.sections.certifications}
        </h2>
      </div>
      <div className="space-y-4">
        {CERTIFICATIONS.map((cert) => (
          <Link
            key={cert.title}
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg hover:bg-accent/50 transition-all duration-300 group/cert"
          >
            <div className="space-y-2">
              <div className="font-medium group-hover/cert:text-primary transition-colors duration-300 flex items-center justify-between">
                {cert.title}
                <ExternalLink className="h-4 w-4 opacity-0 group-hover/cert:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-sm space-y-1">
                <div className="text-muted-foreground flex items-center justify-between">
                  <span className="group-hover/cert:text-foreground transition-colors duration-300">
                    {cert.issuer}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs border border-transparent group-hover/cert:border-primary/30 group-hover/cert:bg-primary/5 transition-all duration-300">
                    {cert.date} - {cvData.certification.validUntil}
                  </span>
                </div>
                <div className="text-muted-foreground/80 group-hover/cert:text-muted-foreground transition-colors duration-300">
                  {cv.certifications.credentialId} {cert.credentialId}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
