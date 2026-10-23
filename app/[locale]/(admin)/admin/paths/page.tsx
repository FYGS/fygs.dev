import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/admin-guard";
import { LEVEL_LABELS, type PathLevel } from "@/lib/paths/rules";
import { listAdminPaths } from "@/lib/paths/admin-list";
import { AdminListShell, Td, Th, formatDateTime } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Parcours | Admin FYGS",
  description: "Les parcours d'apprentissage : des formations enchaînées vers un objectif, avec leur certificat",
};

export default async function PathsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q), status: firstParam(raw.status) };
  const result = await listAdminPaths({ ...params, page: Number(firstParam(raw.page)) || 1 });

  return (
    <div className="space-y-6">
      <AdminListShell
        title="Parcours"
        description={`${result.total} parcours : des formations enchaînées vers un objectif, avec une progression et un certificat propres.`}
        actions={
          <Button asChild>
            <Link href="/admin/paths/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau parcours
            </Link>
          </Button>
        }
        basePath="/admin/paths"
        params={params}
        searchLabel="Titre ou adresse"
        selects={[
          {
            name: "status",
            label: "Statut",
            options: [
              { value: "published", label: "Publiés" },
              { value: "draft", label: "Brouillons" },
            ],
          },
        ]}
        pager={result}
      >
        {result.rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {params.q || params.status ? "Aucun parcours ne correspond à ces filtres." : "Aucun parcours pour le moment. Créez le premier."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Liste des parcours</caption>
            <thead className="border-b bg-muted/40">
              <tr>
                <Th>Parcours</Th>
                <Th>Niveau</Th>
                <Th>Statut</Th>
                <Th>Formations</Th>
                <Th>Inscrits</Th>
                <Th>Certificats</Th>
                <Th>Modifié le</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.rows.map((row) => (
                <tr key={row.id}>
                  <Td>
                    <Link href={`/admin/paths/${row.id}`} className="font-medium hover:underline">
                      {row.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">/parcours/{row.slug}</div>
                  </Td>
                  <Td>{LEVEL_LABELS[row.level as PathLevel] ?? row.level}</Td>
                  <Td>
                    <Badge variant={row.published ? "default" : "secondary"}>{row.published ? "Publié" : "Brouillon"}</Badge>
                    {row.featured && (
                      <Badge variant="outline" className="ml-1">
                        À la une
                      </Badge>
                    )}
                  </Td>
                  <Td>{row.courseCount}</Td>
                  <Td>{row.enrollmentCount}</Td>
                  <Td>{row.certificateCount}</Td>
                  <Td className="whitespace-nowrap">{formatDateTime(row.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminListShell>
    </div>
  );
}
