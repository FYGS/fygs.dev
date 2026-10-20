import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin-guard";
import { SUBSCRIPTION_STATUSES, listSubscriptions } from "@/lib/services/admin-listings";
import { AdminListShell, Person, Td, Th, formatDateTime } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Abonnements | Admin FYGS",
  description: "Les abonnements Premium et leur état",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Actif",
  TRIALING: "Essai",
  PAST_DUE: "Impayé",
  INCOMPLETE: "Incomplet",
  CANCELED: "Résilié",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  PAST_DUE: "destructive",
  INCOMPLETE: "outline",
  CANCELED: "outline",
};

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q), status: firstParam(raw.status) };
  const result = await listSubscriptions({ ...params, page: Number(firstParam(raw.page)) || 1 });

  return (
    <AdminListShell
      title="Abonnements"
      description="Un abonnement par utilisateur. Un abonnement « actif » avec fin programmée donne l'accès jusqu'à la fin de la période."
      basePath="/admin/subscriptions"
      params={params}
      searchLabel="Abonné"
      selects={[
        { name: "status", label: "Statut", options: SUBSCRIPTION_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] ?? value })) },
      ]}
      pager={result}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Liste des abonnements</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Abonné</Th>
            <Th>Formule</Th>
            <Th>Statut</Th>
            <Th>Fin de période</Th>
            <Th>Depuis</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.map((row) => (
            <tr key={row.id}>
              <Td>
                <Person user={row.user} />
              </Td>
              <Td>{row.plan}</Td>
              <Td>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>{STATUS_LABEL[row.status] ?? row.status}</Badge>
                  {row.cancelAtPeriodEnd && row.status === "ACTIVE" && <Badge variant="outline">Fin programmée</Badge>}
                </div>
              </Td>
              <Td className="whitespace-nowrap">{formatDateTime(row.currentPeriodEnd)}</Td>
              <Td className="whitespace-nowrap">{formatDateTime(row.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListShell>
  );
}
