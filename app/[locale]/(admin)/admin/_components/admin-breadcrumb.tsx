"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveAdminCrumb } from "../_actions/breadcrumb";

const pathNameMap: Record<string, string> = {
  "/admin": "Vue d'ensemble",
  "/admin/courses": "Formations",
  "/admin/courses/new": "Nouvelle formation",
  "/admin/questions": "Questions des apprenants",
  "/admin/tags": "Tags",
  "/admin/tags/new": "Nouveau tag",
  "/admin/paths": "Parcours",
  "/admin/paths/new": "Nouveau parcours",
  "/admin/certificates": "Certificats",
  "/admin/users": "Utilisateurs",
  "/admin/enrollments": "Inscriptions",
  "/admin/payments": "Paiements",
  "/admin/subscriptions": "Abonnements",
  "/admin/analytics": "Analytics",
  "/admin/reviews": "Avis",
  "/admin/reviews/moderation": "Modération",
  "/admin/reviews/analytics": "Analytics des avis",
  "/admin/community": "Communauté",
  "/admin/community/users": "Membres",
  "/admin/community/moderation": "Modération",
  "/admin/community/analytics": "Analytics",
};

/** Lists whose children are records: the segment after them is an id, named by the server. */
const RECORD_LISTS = { courses: "Formation", paths: "Parcours", users: "Utilisateur", reviews: "Avis" } as const;
type RecordList = keyof typeof RECORD_LISTS;

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const record =
    segments.length >= 3 && segments[0] === "admin" && segments[1] in RECORD_LISTS && !pathNameMap[`/${segments.slice(0, 3).join("/")}`]
      ? { kind: segments[1] as RecordList, id: segments[2] }
      : null;

  const [names, setNames] = useState<Record<string, string>>({});
  const recordKey = record ? `${record.kind}/${record.id}` : null;

  useEffect(() => {
    if (!record || !recordKey || names[recordKey] !== undefined) return;
    let cancelled = false;
    void resolveAdminCrumb(record.kind, record.id).then((name) => {
      if (!cancelled) setNames((prev) => ({ ...prev, [recordKey]: name ?? RECORD_LISTS[record.kind] }));
    });
    return () => {
      cancelled = true;
    };
    // the record is derived from the address
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordKey]);

  if (pathname === "/admin") return null;

  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const isRecord = record !== null && index === 2;
    const name = isRecord ? (names[recordKey!] ?? "…") : (pathNameMap[path] ?? segment.charAt(0).toUpperCase() + segment.slice(1));
    return { name, path, isLast: index === segments.length - 1 };
  });

  return (
    <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-3">
      <nav aria-label="Fil d'Ariane" className="flex items-center space-x-2 text-sm">
        <Link href="/admin" className="flex items-center text-muted-foreground transition-colors hover:text-foreground" aria-label="Accueil de l'administration">
          <Home className="h-4 w-4" aria-hidden="true" />
        </Link>

        {breadcrumbs.map((breadcrumb) => (
          <div key={breadcrumb.path} className="flex min-w-0 items-center space-x-2">
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {breadcrumb.isLast ? (
              <span className="truncate font-medium text-foreground" aria-current="page">
                {breadcrumb.name}
              </span>
            ) : (
              <Link href={breadcrumb.path} className={cn("truncate text-muted-foreground transition-colors hover:text-foreground", "hover:underline")}>
                {breadcrumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
