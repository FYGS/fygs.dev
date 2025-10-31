import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { CourseEditForm } from "./_components/course-edit-form";
import { ModuleCreateForm } from "./_components/module-create-form";
import { QuizManagement } from "./_components/quizzes/quiz-management";
import { VisualSupportsManagement } from "./_components/visual-supports/visual-supports-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Role } from "@prisma/client";

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
        orderBy: [
          { moduleId: "asc" },
          { order: "asc" }
        ],
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

  if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
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
    modules: course.modules || [],
  };

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
          <div className="text-2xl font-bold">{course.price ? Number(course.price) : 0}€</div>
          <div className="text-sm text-muted-foreground">Prix</div>
        </div>
      </div>

      {/* Form */}
      <Tabs defaultValue="course" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="course">Informations</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="visual-supports">Supports Visuels</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="course" className="space-y-6">
          <CourseEditForm course={courseForForm} tags={tags} />
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-6">
          <ModuleCreateForm courseId={course.id} />
          
          {/* Existing modules display */}
          {course.modules && course.modules.length > 0 && (
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Modules existants</h3>
              <div className="space-y-3">
                {course.modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                        {module.order}
                      </span>
                      <div>
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.lessons.length} leçons</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}/modules/${module.id}`}>
                        Modifier
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="quiz" className="space-y-6">
          <QuizManagement 
            course={course} 
            modules={course.modules || []} 
            initialQuizzes={(course.quizzes || []).map(quiz => ({
              ...quiz,
              questions: quiz.questions || []
            }))} 
          />
        </TabsContent>
        
        <TabsContent value="visual-supports" className="space-y-6">
          <VisualSupportsManagement 
            course={course} 
            modules={course.modules || []} 
            initialVisualSupports={(course.visualSupports || []).map(vs => ({
              ...vs,
              content: vs.content as { slides: Array<{ title: string; content: any }> }
            }))} 
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Paramètres avancés</h3>
            <p className="text-muted-foreground">Configuration avancée de la formation (à venir)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}