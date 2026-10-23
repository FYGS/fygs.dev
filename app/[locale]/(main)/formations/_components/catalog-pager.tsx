import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogPagerProps {
  page: number;
  pageCount: number;
  /** Current filters, kept in every link. */
  params: Record<string, string | undefined>;
}

function href(params: Record<string, string | undefined>, page: number): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/formations?${qs}#courses` : "/formations#courses";
}

/** Previous / next with the numbers in between; plain links, so it works before the page is interactive. */
export function CatalogPager({ page, pageCount, params }: CatalogPagerProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Pagination du catalogue" className="flex flex-wrap items-center justify-center gap-2 pt-4">
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(params, page - 1)} rel="prev">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Précédent
          </Link>
        </Button>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden>…</span>}
          <Button asChild variant={p === page ? "default" : "outline"} size="sm">
            <Link href={href(params, p)} aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`}>
              {p}
            </Link>
          </Button>
        </span>
      ))}
      {page < pageCount ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(params, page + 1)} rel="next">
            Suivant <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      ) : null}
    </nav>
  );
}
