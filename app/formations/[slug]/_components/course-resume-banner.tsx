"use client";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseResumeBannerProps {
  courseSlug: string;
  lastPosition?: { lessonId: string; slug: string } | null;
  nextLesson?: { lessonId: string; slug: string } | null;
  isEnrolled: boolean;
}

export function CourseResumeBanner({ courseSlug, lastPosition, nextLesson, isEnrolled }: CourseResumeBannerProps) {
  if (!isEnrolled) return null;
  const target = lastPosition || nextLesson;
  if (!target) return null;
  const href = `/formations/${courseSlug}/lessons/${target.slug}`;
  const label = lastPosition ? 'Reprendre la leçon' : 'Commencer la prochaine leçon';
  return (
    <div className={cn("mb-6 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 flex items-center justify-between gap-4")}>      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">Progression</Badge>
          <span className="text-sm text-muted-foreground">Optimisez votre apprentissage</span>
        </div>
        <h4 className="font-semibold text-base">
          {label}
        </h4>
        <p className="text-xs text-muted-foreground">Nous avons sauvegardé votre progression.</p>
      </div>
      <Link href={href} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">
        <Play className="h-4 w-4" />
        <span>{lastPosition ? 'Reprendre' : 'Commencer'}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
