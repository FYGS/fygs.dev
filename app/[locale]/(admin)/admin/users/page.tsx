import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-guard";
import { USER_PLANS, USER_ROLES, listUsers } from "@/lib/services/admin-listings";
import { Role } from "@/lib/generated/prisma/browser";
import { AdminListShell, Td, Th, formatDateTime, formatMoney } from "../_components/list-shell";
import { firstParam, type SearchParams } from "../_lib/search-params";
import { UsersStats } from "./_components/users-stats";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs | Admin FYGS",
  description: "Les comptes, leurs rôles et leur activité",
};

const ROLE_LABEL: Record<string, string> = { STUDENT: "Étudiant", INSTRUCTOR: "Instructeur", ADMIN: "Administrateur" };
const PLAN_LABEL: Record<string, string> = { premium: "Premium", free: "Sans abonnement" };
const DAY = 24 * 60 * 60 * 1000;

async function getStats() {
  const now = Date.now();
  const [total, students, instructors, admins, weeklyNew, monthlyNew] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: Role.STUDENT } }),
    db.user.count({ where: { role: Role.INSTRUCTOR } }),
    db.user.count({ where: { role: Role.ADMIN } }),
    db.user.count({ where: { createdAt: { gte: new Date(now - 7 * DAY) } } }),
    db.user.count({ where: { createdAt: { gte: new Date(now - 30 * DAY) } } }),
  ]);
  return { total, students, instructors, admins, weeklyNew, monthlyNew };
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const params = { q: firstParam(raw.q), role: firstParam(raw.role), plan: firstParam(raw.plan) };
  const [result, stats] = await Promise.all([listUsers({ ...params, page: Number(firstParam(raw.page)) || 1 }), getStats()]);

  return (
    <AdminListShell
      title="Gestion des Utilisateurs"
      description="Les comptes, leurs rôles et leur activité. Ouvrez un compte pour changer son rôle ou suspendre l'accès à la communauté."
      basePath="/admin/users"
      params={params}
      searchLabel="Nom ou e-mail"
      selects={[
        { name: "role", label: "Rôle", options: USER_ROLES.map((value) => ({ value, label: ROLE_LABEL[value] ?? value })) },
        { name: "plan", label: "Abonnement", options: USER_PLANS.map((value) => ({ value, label: PLAN_LABEL[value] })) },
      ]}
      pager={result}
      summary={<UsersStats stats={stats} />}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Liste des utilisateurs</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            <Th>Utilisateur</Th>
            <Th>Rôle</Th>
            <Th>Activité</Th>
            <Th>Dépenses</Th>
            <Th>Inscription</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-muted-foreground">Aucun utilisateur trouvé</Td>
            </tr>
          )}
          {result.rows.map((user) => (
            <tr key={user.id}>
              <Td>
                <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                  {user.name}
                </Link>
                <div className="text-xs text-muted-foreground break-all">{user.email}</div>
                <div className="mt-1 flex gap-1">
                  {user.premium && <Badge variant="outline">Premium</Badge>}
                  {user.isBanned && <Badge variant="destructive">Suspendu</Badge>}
                </div>
              </Td>
              <Td>{ROLE_LABEL[user.role] ?? user.role}</Td>
              <Td>
                {user.enrollments} cours
                <div className="text-xs text-muted-foreground">{user.completedLessons} leçons terminées</div>
              </Td>
              <Td className="whitespace-nowrap">{formatMoney(user.spent, "eur")}</Td>
              <Td className="whitespace-nowrap">{formatDateTime(user.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListShell>
  );
}
