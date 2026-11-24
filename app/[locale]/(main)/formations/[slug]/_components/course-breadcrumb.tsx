import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Accueil > Formations > the course (current page). */
export function CourseBreadcrumb({ courseTitle }: { courseTitle: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-foreground hover:underline">
            Accueil
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <Link href="/formations" className="hover:text-foreground hover:underline">
            Formations
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </li>
        <li aria-current="page" className="max-w-[60vw] truncate font-medium text-foreground sm:max-w-none">
          {courseTitle}
        </li>
      </ol>
    </nav>
  );
}
