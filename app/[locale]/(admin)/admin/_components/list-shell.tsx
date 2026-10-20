import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * The frame of a read-only back-office listing: a title, a GET form for the filters (it works
 * without JavaScript and keeps the URL shareable) and the pager. Server component.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelect {
  name: string;
  label: string;
  options: FilterOption[];
}

type Params = Record<string, string | undefined>;

export function hrefWith(basePath: string, params: Params, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminListShell({
  title,
  description,
  basePath,
  params,
  searchLabel,
  selects = [],
  summary,
  pager,
  children,
}: {
  title: string;
  description: string;
  basePath: string;
  /** The filters currently applied (from the URL) */
  params: Params;
  searchLabel: string;
  selects?: FilterSelect[];
  summary?: ReactNode;
  pager: { page: number; pages: number; total: number; pageSize: number };
  children: ReactNode;
}) {
  const { page, pages, total, pageSize } = pager;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const filtered = Object.values(params).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {summary}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="sr-only">Filtres</CardTitle>
          <form method="get" action={basePath} className="flex flex-wrap items-end gap-3" role="search">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{searchLabel}</span>
              <Input name="q" defaultValue={params.q ?? ""} placeholder="Rechercher…" className="w-64" maxLength={100} />
            </label>
            {selects.map((select) => (
              <label key={select.name} className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{select.label}</span>
                <select
                  name={select.name}
                  defaultValue={params[select.name] ?? ""}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Tous</option>
                  {select.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <Button type="submit">Filtrer</Button>
            {filtered && (
              <Button variant="ghost" asChild>
                <Link href={basePath}>Réinitialiser</Link>
              </Button>
            )}
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-md border">{children}</div>

          <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground" aria-live="polite">
              {total === 0 ? "Aucun résultat" : `${first}–${last} sur ${total}`}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefWith(basePath, params, page - 1)} rel="prev">
                    Précédent
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Précédent
                </Button>
              )}
              <span>
                Page {page} / {pages}
              </span>
              {page < pages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefWith(basePath, params, page + 1)} rel="next">
                    Suivant
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Suivant
                </Button>
              )}
            </div>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });
export const formatDateTime = (date: Date | null) => (date ? dateFormat.format(date) : "—");

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export const Th = ({ children }: { children: ReactNode }) => (
  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
    {children}
  </th>
);
export const Td = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <td className={`px-3 py-2 align-top ${className}`}>{children}</td>
);
export const Person = ({ user }: { user: { name: string; email: string } }) => (
  <div>
    <div className="font-medium">{user.name}</div>
    <div className="text-xs text-muted-foreground break-all">{user.email}</div>
  </div>
);
