import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Play, CheckCircle, Crown, Users } from "lucide-react";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import Link from "next/link";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Mes Formations | FYGS Learning Platform",
  description: "Suivez vos progrès et continuez votre apprentissage avec vos formations personnalisées.",
};

function calculateProgress(lessons: any[], progress: any[]): number {
  if (lessons.length === 0) return 0;
  const completedLessons = progress.filter((p: any) => p.completed);
  return Math.round((completedLessons.length / lessons.length) * 100);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

const CATEGORY_LABELS: Record<string, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
  CLOUD: "Cloud",
  AI: "IA",
  DEVOPS: "DevOps",
  PRODUCTIVITY: "Productivité",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800 border-green-200",
  INTERMEDIATE: "bg-blue-100 text-blue-800 border-blue-200", 
  ADVANCED: "bg-orange-100 text-orange-800 border-orange-200",
  EXPERT: "bg-red-100 text-red-800 border-red-200",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire", 
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export default async function MyCoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Récupérer les formations de l'utilisateur
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  duration: true,
                  order: true,
                },
                orderBy: { order: 'asc' },
              },
              _count: {
                select: { lessons: true },
              },
            },
          },
        },
      },
      progress: {
        include: {
          lesson: {
            select: {
              id: true,
              courseId: true,
            },
          },
        },
      },
      subscriptions: {
        select: {
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
        take: 1,
      },
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
          description: {
            contains: 'Course:', // Assuming lifetime purchases are marked this way
          },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Helper function to determine if a course was purchased as lifetime
  const isLifetimePurchase = (courseId: string): boolean => {
    return user.payments?.some((payment: any) => 
      payment.description?.includes(`Course:${courseId}`) || 
      payment.description?.includes(courseId)
    ) || false;
  };

  const enrolledCourses = user.enrollments?.map((enrollment: any) => ({
    ...enrollment.course,
    enrolledAt: enrollment.createdAt,
    isLifetime: isLifetimePurchase(enrollment.course.id),
    progress: user.progress?.filter(
      (p: any) => p.lesson.courseId === enrollment.course.id
    ) || [],
  })) || [];

  // Group courses by lifetime status
  const lifetimeCourses = enrolledCourses.filter(course => course.isLifetime);
  const subscriptionCourses = enrolledCourses.filter(course => !course.isLifetime);

  const hasActiveSubscription = user.subscriptions?.[0]?.status === SubscriptionStatus.ACTIVE && !user.subscriptions?.[0]?.cancelAtPeriodEnd;
  const completedLessonsCount = user.progress?.filter((p: any) => p.completed).length || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mes Formations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Continuez votre parcours d&apos;apprentissage et suivez vos progrès en temps réel.
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20 bg-linear-to-br from-card to-card/50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                <div className="text-sm text-muted-foreground">Formation{enrolledCourses.length > 1 ? 's' : ''} inscrite{enrolledCourses.length > 1 ? 's' : ''}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/20 bg-linear-to-br from-card to-card/50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{completedLessonsCount}</div>
                <div className="text-sm text-muted-foreground">Leçon{completedLessonsCount > 1 ? 's' : ''} terminée{completedLessonsCount > 1 ? 's' : ''}</div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${hasActiveSubscription ? 'border-amber-500/20 bg-linear-to-br from-card to-card/50' : 'border-border bg-linear-to-br from-card to-card/50'}`}>
              <CardContent className="p-6 text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3 ${hasActiveSubscription ? 'bg-amber-500/10' : 'bg-muted/50'}`}>
                  {hasActiveSubscription ? (
                    <Crown className="h-6 w-6 text-amber-600" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-lg font-bold">
                  {hasActiveSubscription ? 'Premium' : 'Gratuit'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Statut actuel
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Courses Sections */}
        {enrolledCourses.length > 0 ? (
          <div className="space-y-12">
            {/* Lifetime Courses Section */}
            {lifetimeCourses.length > 0 && (
              <FadeInStagger>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-yellow-500">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Formations à vie</h2>
                      <p className="text-muted-foreground">Formations achetées définitivement, accessibles à vie</p>
                    </div>
                    <Badge className="bg-linear-to-r from-amber-500 to-yellow-500 text-white border-none ml-auto">
                      {lifetimeCourses.length} formation{lifetimeCourses.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lifetimeCourses.map((course: any) => {
                      const progress = calculateProgress(course.lessons, course.progress);
                      const totalDuration = course.lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration || 0), 0);
                      const nextLesson = course.lessons.find(
                        (lesson: any) => !course.progress.some((p: any) => p.lesson.id === lesson.id && p.completed)
                      ) || course.lessons[0];

                      return (
                        <FadeIn key={`lifetime-${course.id}`}>
                          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-amber-200 bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden relative">
                            {/* Lifetime Badge */}
                            <div className="absolute top-3 right-3 z-10">
                              <Badge className="bg-linear-to-r from-amber-500 to-yellow-500 text-white border-none shadow-lg">
                                <Crown className="h-3 w-3 mr-1" />
                                À vie
                              </Badge>
                            </div>
                            
                            <div className="relative h-48 overflow-hidden">
                              <div className="absolute inset-0 bg-linear-to-br from-amber-600/20 via-orange-600/20 to-yellow-600/20" />
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-100 to-orange-100">
                                <div className="text-center space-y-2">
                                  <BookOpen className="h-12 w-12 text-amber-600 mx-auto" />
                                  <Badge className={LEVEL_COLORS[course.level]}>
                                    {LEVEL_LABELS[course.level]}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <CardContent className="p-6 space-y-4">
                              <div className="space-y-2">
                                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                  {CATEGORY_LABELS[course.category] || course.category}
                                </Badge>
                                <h3 className="font-bold text-lg text-amber-900 group-hover:text-amber-800 transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-amber-700 text-sm line-clamp-2">
                                  {course.description}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-amber-700">Progression</span>
                                  <span className="font-medium text-amber-800">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2 bg-amber-100" />
                              </div>

                              <div className="flex items-center justify-between text-xs text-amber-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{course.lessons.length} leçons</span>
                                </div>
                              </div>

                              <div className="pt-2">
                                <Button asChild className="w-full bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0">
                                  <Link href={nextLesson ? `/formations/${course.slug}/lessons/${nextLesson.slug}` : `/formations/${course.slug}`}>
                                    {progress === 100 ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Revoir
                                      </>
                                    ) : progress > 0 ? (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Continuer
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Commencer
                                      </>
                                    )}
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </FadeIn>
                      );
                    })}
                  </div>
                </div>
              </FadeInStagger>
            )}

            {/* Subscription Courses Section */}
            {subscriptionCourses.length > 0 && (
              <FadeInStagger>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-primary to-blue-600">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Formations par abonnement</h2>
                      <p className="text-muted-foreground">Formations incluses dans votre abonnement Premium</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {subscriptionCourses.length} formation{subscriptionCourses.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptionCourses.map((course: any) => {
                      const progress = calculateProgress(course.lessons, course.progress);
                      const totalDuration = course.lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration || 0), 0);
                      const nextLesson = course.lessons.find(
                        (lesson: any) => !course.progress.some((p: any) => p.lesson.id === lesson.id && p.completed)
                      ) || course.lessons[0];

                      return (
                        <FadeIn key={`subscription-${course.id}`}>
                          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-border overflow-hidden">
                            <div className="relative h-48 overflow-hidden">
                              <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-blue-600/20 to-purple-600/20" />
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-blue-100">
                                <div className="text-center space-y-2">
                                  <BookOpen className="h-12 w-12 text-primary mx-auto" />
                                  <Badge className={LEVEL_COLORS[course.level]}>
                                    {LEVEL_LABELS[course.level]}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <CardContent className="p-6 space-y-4">
                              <div className="space-y-2">
                                <Badge variant="outline" className="text-xs">
                                  {CATEGORY_LABELS[course.category] || course.category}
                                </Badge>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                  {course.description}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progression</span>
                                  <span className="font-medium">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{course.lessons.length} leçons</span>
                                </div>
                              </div>

                              <div className="pt-2">
                                <Button asChild className="w-full">
                                  <Link href={nextLesson ? `/formations/${course.slug}/lessons/${nextLesson.slug}` : `/formations/${course.slug}`}>
                                    {progress === 100 ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Revoir
                                      </>
                                    ) : progress > 0 ? (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Continuer
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Commencer
                                      </>
                                    )}
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </FadeIn>
                      );
                    })}
                  </div>
                </div>
              </FadeInStagger>
            )}
          </div>
        ) : (
          <FadeIn>
            <Card className="text-center p-12 border-2 border-dashed">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Aucune formation</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Vous n&apos;êtes inscrit à aucune formation pour le moment. Explorez notre catalogue et commencez votre apprentissage !
                </p>
                <div className="pt-4">
                  <Button asChild>
                    <Link href="/formations">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Découvrir les formations
                    </Link>
                  </Button>
                  {!hasActiveSubscription && (
                    <Button asChild variant="outline">
                      <Link href="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        Devenir Premium
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}