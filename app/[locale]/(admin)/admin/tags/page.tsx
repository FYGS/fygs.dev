import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";
import Link from "next/link";
import { TagsHeader } from "./_components/tags-header";
import { TagCard } from "./_components/tag-card";
import { Role } from "@/lib/generated/prisma/browser";

async function getTagsWithStats() {
  const tags = await db.tag.findMany({
    include: {
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              published: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return tags.map(tag => ({
    ...tag,
    courseCount: tag.courses.length,
    publishedCourseCount: tag.courses.filter(ct => ct.course.published).length,
    courses: tag.courses.map(ct => ct.course),
  }));
}

async function TagsContent({ canManage }: { canManage: boolean }) {
  const tags = await getTagsWithStats();
  const totalCourses = await db.course.count();

  return (
    <div className="space-y-6">
      {/* Header */}
      <TagsHeader />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total tags
            </CardTitle>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tags utilisés
            </CardTitle>
            <div className="text-2xl font-bold">
              {tags.filter(tag => tag.courseCount > 0).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tags inutilisés
            </CardTitle>
            <div className="text-2xl font-bold">
              {tags.filter(tag => tag.courseCount === 0).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Formations totales
            </CardTitle>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Tags Grid */}
      {tags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} canManage={canManage} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun tag trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par créer des tags pour organiser vos formations.
            </p>
            <Button asChild>
              <Link href="/admin/tags/new">
                <Plus className="h-4 w-4 mr-2" />
                Créer un tag
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function TagsPage() {
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
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <TagsContent canManage={session.user.role === Role.ADMIN} />
    </Suspense>
  );
}