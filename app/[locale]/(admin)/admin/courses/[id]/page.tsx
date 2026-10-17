import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { CourseEditForm } from "./_components/course-edit-form";
import { CurriculumTab } from "./_components/curriculum-tab";
import { QuizManagement } from "./_components/quizzes/quiz-management";
import { VisualSupportsManagement } from "./_components/visual-supports/visual-supports-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Role } from "@/lib/generated/prisma/browser";
import { BookOpen, Layers, Brain, Image, Eye, Settings } from "lucide-react";

interface CourseEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCourse(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
      modules: {
        orderBy: {
          order: "asc",
        },
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      quizzes: {
        include: {
          questions: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          moduleId: "asc",
        },
      },
      visualSupports: {
        orderBy: [{ moduleId: "asc" }, { order: "asc" }],
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },
  });

  return course;
}

async function getAllTags() {
  const tags = await db.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return tags;
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  // Vérifier l'authentification et les permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.INSTRUCTOR
  ) {
    redirect("/unauthorized");
  }

  // Récupérer les données
  const [course, tags] = await Promise.all([
    getCourse((await params).id),
    getAllTags(),
  ]);

  if (!course) {
    notFound();
  }

  // Permission check: ADMIN has almighty power, INSTRUCTOR can only edit their own courses
  if (session.user.role === Role.INSTRUCTOR) {
    if (!course.instructorId || course.instructorId !== session.user.id) {
      redirect("/unauthorized?error=course-access-denied");
    }
  }
  // ADMIN can edit any course (almighty power preserved)

  // Convert Prisma types to expected types for the form
  const courseForForm = {
    ...course,
    price: course.price ? Number(course.price) : null,
    duration: course.duration ? Number(course.duration) : null,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    modules: course.modules || [],
    faq: (course.faq as { q: string; a: string }[] | null) ?? null,
  };

  // Serialize quizzes for client components
  const serializedQuizzes = (course.quizzes || []).map((quiz) => ({
    ...quiz,
    createdAt: new Date(quiz.createdAt),
    updatedAt: new Date(quiz.updatedAt),
    questions: quiz.questions.map((q) => ({
      ...q,
      createdAt: new Date(q.createdAt),
      updatedAt: new Date(q.updatedAt),
    })),
  }));

  // Serialize visual supports for client components
  const serializedVisualSupports = (course.visualSupports || []).map((vs) => ({
    ...vs,
    createdAt: new Date(vs.createdAt),
    updatedAt: new Date(vs.updatedAt),
    content: vs.content as { slides: Array<{ title: string; content: any }> },
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Modifier la formation</h1>
            <p className="text-muted-foreground">
              Mettez à jour les informations de votre formation
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>ID: {course.id}</span>
            {course.published && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Publié
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course._count.enrollments}</div>
          <div className="text-sm text-muted-foreground">Inscrits</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course._count.lessons}</div>
          <div className="text-sm text-muted-foreground">Leçons</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course.duration || 0}h</div>
          <div className="text-sm text-muted-foreground">Durée</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">
            {course.price ? Number(course.price) : 0}€
          </div>
          <div className="text-sm text-muted-foreground">Prix</div>
        </div>
      </div>

      {/* Form */}
      <Tabs defaultValue="course" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="course" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Infos</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="visual-supports" className="gap-1.5">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Supports</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="space-y-6">
          <CourseEditForm course={courseForForm} tags={tags} />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <CurriculumTab courseId={course.id} modules={course.modules || []} />
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <QuizManagement
            course={courseForForm}
            modules={course.modules || []}
            initialQuizzes={serializedQuizzes}
          />
        </TabsContent>

        <TabsContent value="visual-supports" className="space-y-6">
          <VisualSupportsManagement
            course={courseForForm}
            modules={course.modules || []}
            initialVisualSupports={serializedVisualSupports}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-heading-3 text-foreground">
                  Aperçu de la formation
                </h3>
                <p className="text-body-sm text-muted-foreground">
                  Visualisez votre formation comme un apprenant la verrait
                </p>
              </div>
              {course.published && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/formations/${course.slug}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir la page publique
                  </Link>
                </Button>
              )}
              {!course.published && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/formations/${course.slug}?preview=true`}
                    target="_blank"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Prévisualiser
                  </Link>
                </Button>
              )}
            </div>
            <div className="rounded-lg border bg-muted/20 p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-heading-1 text-foreground">
                    {course.title}
                  </h2>
                  <p className="text-body text-muted-foreground mt-2">
                    {course.description}
                  </p>
                </div>
                {course.modules && course.modules.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-heading-3 text-foreground">
                      Programme
                    </h4>
                    {course.modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="p-3 rounded-md bg-card border"
                      >
                        <div className="font-medium text-foreground">
                          Module {mod.order}: {mod.title}
                        </div>
                        <div className="text-caption text-muted-foreground mt-1">
                          {mod.lessons.length} leçon
                          {mod.lessons.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-heading-3 text-foreground mb-4">
              Paramètres avancés
            </h3>
            <p className="text-body-sm text-muted-foreground">
              Gérez ici les options avancées de publication et
              d&apos;organisation de la formation.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
