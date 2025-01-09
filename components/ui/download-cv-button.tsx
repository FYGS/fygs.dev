"use client";

import { generatePDF } from "@/app/_lib/pdf-generator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export function DownloadCVButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadCV = async () => {
    try {
      setIsGenerating(true);
      const doc = generatePDF();
      doc.save("Fernand_SOUALO_CV.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={downloadCV}
      disabled={isGenerating}
      className="group flex items-center gap-2 hover:shadow-lg transition-all duration-300"
    >
      <Download
        className={`h-5 w-5 transition-all duration-300 ${
          isGenerating ? "animate-bounce" : "group-hover:-translate-y-1"
        }`}
      />
      {isGenerating ? "Generating..." : "Download CV"}
    </Button>
  );
}
