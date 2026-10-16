import { CVPreview } from "@/app/_components/CVPreview";
import { Card } from "@/components/ui/card";
import { DownloadCVButton } from "@/components/ui/download-cv-button";
import type { CvPage } from "../_data/cv-types";

export function CvPreviewSection({ cv }: { cv: CvPage }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{cv.preview.title}</h2>
          <DownloadCVButton />
        </div>
        <CVPreview />
      </div>
    </Card>
  );
}
