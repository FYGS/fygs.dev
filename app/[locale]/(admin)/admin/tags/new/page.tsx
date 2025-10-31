import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { TagCreateForm } from "./_components/tag-create-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewTagPage() {
  // Vérifier l'authentification et les permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tags">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux tags
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer un nouveau tag</h1>
          <p className="text-muted-foreground">
            Ajoutez un tag pour organiser vos formations
          </p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      }>
        <TagCreateForm />
      </Suspense>
    </div>
  );
}