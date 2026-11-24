import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { NewCourseForm } from "./_components/new-course-form";

export const metadata: Metadata = {
  title: "Nouvelle formation | Admin FYGS",
  description: "Créer une formation : un titre suffit pour commencer",
};

export default async function NewCoursePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/admin/courses/new");
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/courses">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          Formations
        </Link>
      </Button>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Nouvelle formation</h1>
        <p className="text-muted-foreground">Un titre suffit pour commencer. Le programme, les leçons, les évaluations et la page de vente se complètent ensuite, au même endroit, avec enregistrement automatique.</p>
      </div>
      <NewCourseForm />
    </div>
  );
}
