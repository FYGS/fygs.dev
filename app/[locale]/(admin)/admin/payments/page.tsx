import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/admin-guard";
import { PAYMENT_KINDS, PAYMENT_STATUSES, listPayments } from "@/lib/services/admin-listings";
import { AdminListShell, Person, Td, Th, formatDateTime, formatMoney } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Paiements | Admin FYGS",
  description: "Les paiements reçus, en attente, échoués et remboursés",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Payé",
  PENDING: "En attente",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};
const KIND_LABEL: Record<string, string> = {
  COURSE: "Formation",
  SUBSCRIPTION: "Abonnement",
  REFUND: "Remboursement",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q), status: firstParam(raw.status), kind: firstParam(raw.kind) };
  const result = await listPayments({ ...params, page: Number(firstParam(raw.page)) || 1 });
  const currency = result.rows[0]?.currency ?? "eur";

  return (
    <AdminListShell
      title="Paiements"
      description="Les paiements reçus, en attente, échoués et remboursés. Les remboursements faits dans Stripe y apparaissent automatiquement."
      basePath="/admin/payments"
      params={params}
      searchLabel="Client"
      selects={[
        { name: "status", label: "Statut", options: PAYMENT_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] ?? value })) },
        { name: "kind", label: "Type", options: PAYMENT_KINDS.map((value) => ({ value, label: KIND_LABEL[value] ?? value })) },
      ]}
      pager={result}
      summary={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Encaissé", result.totals.collected],
            ["Remboursé", result.totals.refunded],
            ["En attente", result.totals.pending],
            ["Échoué", result.totals.failed],
          ].map(([label, amount]) => (
            <Card key={label as string}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{formatMoney(amount as number, currency)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Liste des paiements</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Date</Th>
            <Th>Client</Th>
            <Th>Type</Th>
            <Th>Formation</Th>
            <Th>Montant</Th>
            <Th>Statut</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.map((row) => (
            <tr key={row.id}>
              <Td className="whitespace-nowrap">{formatDateTime(row.createdAt)}</Td>
              <Td>
                <Person user={row.user} />
              </Td>
              <Td>{KIND_LABEL[row.kind] ?? row.kind}</Td>
              <Td>{row.courseTitle ?? "—"}</Td>
              <Td className="whitespace-nowrap font-medium">{formatMoney(row.amount, row.currency)}</Td>
              <Td>
                <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>{STATUS_LABEL[row.status] ?? row.status}</Badge>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListShell>
  );
}
