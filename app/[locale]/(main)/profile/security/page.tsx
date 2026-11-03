import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStaffRole } from "@/lib/auth-policy";
import { TwoFactorCard } from "./_components/two-factor-card";
import { EmailChangeCard } from "./_components/email-change-card";
import { DeleteAccountCard } from "./_components/delete-account-card";

export const metadata: Metadata = {
  title: "Sécurité du compte | FYGS",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/auth/login?callbackUrl=${encodeURIComponent("/profile/security")}`);

  // The session reports a staff account without a second factor as a student: the real role comes from the database
  const [user, credential] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { role: true, email: true, twoFactorEnabled: true } }),
    db.account.findFirst({ where: { userId: session.user.id, providerId: "credential", password: { not: null } }, select: { id: true } }),
  ]);
  if (!user) redirect("/auth/login");

  const staffRole = isStaffRole(user.role) ? user.role : null;
  const pendingStaff = Boolean(session.user.pendingStaffRole);
  const enabled = Boolean(user.twoFactorEnabled);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-3xl space-y-6 py-8">
        <div>
          <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Mon profil
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Sécurité du compte</h1>
          <p className="text-muted-foreground">Double authentification, adresse e-mail et suppression du compte.</p>
        </div>

        {pendingStaff && (
          <div role="alert" className="flex gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">Activez la double authentification pour utiliser votre rôle</p>
              <p className="text-sm">
                Votre compte est {session.user.pendingStaffRole === "ADMIN" ? "administrateur" : "formateur"}. Tant que la double authentification
                n&apos;est pas activée, il fonctionne comme un compte apprenant. Cela prend deux minutes.
              </p>
            </div>
          </div>
        )}

        <TwoFactorCard enabled={enabled} hasPassword={Boolean(credential)} staffRole={staffRole} pendingStaff={pendingStaff} />
        <EmailChangeCard currentEmail={user.email} />
        <DeleteAccountCard hasPassword={Boolean(credential)} twoFactorEnabled={enabled} />
      </div>
    </div>
  );
}
