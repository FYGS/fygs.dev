import { Card } from "@/components/ui/card";
import { DownloadCVButton } from "@/components/ui/download-cv-button";
import { Mail, MapPin } from "lucide-react";
import type { CvPage } from "../_data/cv-types";

export function ResumeHeader({ cv }: { cv: CvPage }) {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-heading">
            Fernand SOUALO
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 rounded-full bg-primary" />
            <p className="text-lg sm:text-xl text-primary font-medium">
              {cv.role}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Paris, France
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> fygs.dev@gmail.com
            </span>
          </div>
        </div>
        <DownloadCVButton />
      </div>
    </Card>
  );
}
