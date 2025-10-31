import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CourseCreateForm } from "./_components/course-create-form";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

export const metadata: Metadata = {
  title: "Créer une Formation | Admin FYGS",
  description: "Interface de création d'une nouvelle formation",
};

async function getFormData() {
  // Récupérer les tags existants pour le formulaire
  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' }
  });

  return { tags };
}

export default async function CreateCoursePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérification des permissions
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/courses/new");
  }

  if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
    redirect("/dashboard");
  }

  const { tags } = await getFormData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux formations
          </Link>
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Créer une nouvelle formation
          </h1>
          <p className="text-muted-foreground mt-1">
            Remplissez les informations ci-dessous pour créer votre formation
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la formation</CardTitle>
          <CardDescription>
            Configurez les détails de base de votre formation. Vous pourrez ajouter les leçons après la création.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseCreateForm 
            tags={tags}
          />
        </CardContent>
      </Card>
    </div>
  );
}