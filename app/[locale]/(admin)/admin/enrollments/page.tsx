import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin-guard";
import { listEnrollments } from "@/lib/services/admin-listings";
import { AdminListShell, Person, Td, Th, formatDateTime } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Inscriptions | Admin FYGS",
  description: "Les inscriptions aux formations",
};

export default async function EnrollmentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q), completed: firstParam(raw.completed) };
  const result = await listEnrollments({ ...params, page: Number(firstParam(raw.page)) || 1 });

  return (
    <AdminListShell
      title="Inscriptions"
      description="Qui suit quelle formation, et qui l'a terminée."
      basePath="/admin/enrollments"
      params={params}
      searchLabel="Apprenant ou formation"
      selects={[
        {
          name: "completed",
          label: "Avancement",
          options: [
            { value: "yes", label: "Terminée" },
            { value: "no", label: "En cours" },
          ],
        },
      ]}
      pager={result}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Liste des inscriptions</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Apprenant</Th>
            <Th>Formation</Th>
            <Th>Accès</Th>
            <Th>Inscrit le</Th>
            <Th>Terminée le</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.map((row) => (
            <tr key={row.id}>
              <Td>
                <Person user={row.user} />
              </Td>
              <Td>{row.courseTitle}</Td>
              <Td>
                <Badge variant={row.accessTier === "PREMIUM" ? "default" : "secondary"}>
                  {row.accessTier === "PREMIUM" ? "Premium" : "Gratuite"}
                </Badge>
              </Td>
              <Td className="whitespace-nowrap">{formatDateTime(row.enrolledAt)}</Td>
              <Td className="whitespace-nowrap">{formatDateTime(row.completedAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListShell>
  );
}
