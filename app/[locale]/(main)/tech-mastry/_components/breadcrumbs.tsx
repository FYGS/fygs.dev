"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getArea, getTopic } from "../_catalog";

/** "git-mastery" -> "Git Mastery" for a segment the catalog does not know (the locale, a dynamic part). */
const humanize = (segment: string) => segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

/** The name of a page comes from the catalog; a landing page is named after its area. */
function labelFor(path: string, segment: string): string {
  if (path === "/tech-mastry") return "Accueil";
  const topic = getTopic(path);
  if (!topic) return humanize(segment);
  return topic.kind === "hub" ? (getArea(path)?.title ?? topic.title) : topic.title;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const name = labelFor(path, segment);
    const isLast = index === segments.length - 1;

    return {
      name,
      path,
      isLast,
    };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center space-x-1 text-sm"
    >
      <Link
        href="/tech-mastry"
        aria-label="Accueil TechMastery"
        className={cn(
          "flex items-center text-muted-foreground transition-colors hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4" aria-hidden="true" />
      </Link>
      {breadcrumbs.map(({ name, path, isLast }) => (
        <div key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Link
            href={path}
            className={cn(
              "px-2 py-1 rounded-md transition-colors",
              isLast
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isLast ? "page" : undefined}
          >
            {name}
          </Link>
        </div>
      ))}
    </nav>
  );
}
