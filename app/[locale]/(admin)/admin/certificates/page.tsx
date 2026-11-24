import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import { listCertificates } from "@/lib/services/admin-listings";
import { AdminListShell, Person, Td, Th, formatDateTime } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Certificats | Admin FYGS",
  description: "Les certificats délivrés",
};

export default async function CertificatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q) };
  const result = await listCertificates({ ...params, page: Number(firstParam(raw.page)) || 1 });

  return (
    <AdminListShell
      title="Certificats"
      description="Les certificats délivrés aux apprenants qui ont terminé une formation."
      basePath="/admin/certificates"
      params={params}
      searchLabel="Apprenant ou formation"
      pager={result}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Liste des certificats</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Apprenant</Th>
            <Th>Formation</Th>
            <Th>Délivré le</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.map((row) => (
            <tr key={row.id}>
              <Td>
                <Person user={row.user} />
              </Td>
              <Td>{row.courseTitle}</Td>
              <Td className="whitespace-nowrap">{formatDateTime(row.issuedAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListShell>
  );
}
