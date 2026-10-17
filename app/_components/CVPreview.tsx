"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

export function CVPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Nettoyer l'ancien URL si existant
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // jsPDF + the CV data are only needed once the user asks for the preview.
      const { generatePDF } = await import("@/app/_lib/pdf-generator");
      const doc = generatePDF();
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF preview");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pdfUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">CV Preview</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePreview}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Preview
        </Button>
      </div>

      <Card className="overflow-hidden bg-accent/50 relative min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-[700px]"
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>
                Unable to display PDF.{" "}
                <a
                  href={pdfUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download instead
                </a>
              </p>
            </div>
          </object>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Click &quot;Generate Preview&quot; to view the CV
          </div>
        )}
      </Card>
    </div>
  );
}
