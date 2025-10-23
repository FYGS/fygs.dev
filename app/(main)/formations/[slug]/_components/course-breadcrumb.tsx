"use client";

import { ChevronRight, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CourseBreadcrumbProps {
  courseTitle: string;
  courseSlug: string;
}

export function CourseBreadcrumb({ courseTitle }: CourseBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Button variant="ghost" size="sm" asChild className="h-auto p-1 hover:text-primary">
        <Link href="/" className="flex items-center gap-1">
          <Home className="h-4 w-4" />
          Accueil
        </Link>
      </Button>
      
      <ChevronRight className="h-4 w-4" />
      
      <Button variant="ghost" size="sm" asChild className="h-auto p-1 hover:text-primary">
        <Link href="/formations" className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          Formations
        </Link>
      </Button>
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
        {courseTitle}
      </span>
    </nav>
  );
}
