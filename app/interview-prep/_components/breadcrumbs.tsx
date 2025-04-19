"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routeNameMap: { [key: string]: string } = {
  "interview-prep": "Accueil",
  algorithms: "Algorithmes",
  complexity: "Complexité",
  sorting: "Tri",
  searching: "Recherche",
  "data-structures": "Structures de Données",
  arrays: "Tableaux & Chaînes",
  lists: "Listes & Files",
  trees: "Arbres & Graphes",
  "best-practices": "Bonnes Pratiques",
  communication: "Communication",
  negotiation: "Négociation",
  "design-patterns": "Design Patterns",
  "system-design": "System Design",
  "coding-challenges": "Défis de Code",
  qa: "Questions & Réponses",
  frontend: "Frontend",
  "component-patterns": "Component Patterns",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const name = routeNameMap[segment] || segment;
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
        href="/interview-prep"
        className={cn(
          "flex items-center text-muted-foreground transition-colors hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map(({ name, path, isLast }) => (
        <div key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
