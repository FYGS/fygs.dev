"use client";

import { generatePDF } from "@/app/_lib/pdf-generator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadCVButton() {
  const downloadCV = () => {
    const doc = generatePDF();
    doc.save("Fernand_SOUALO_CV.pdf");
  };

  return (
    <Button
      onClick={downloadCV}
      className="group flex items-center gap-2 hover:shadow-lg transition-all duration-300"
    >
      <Download className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
      Download CV
    </Button>
  );
}
