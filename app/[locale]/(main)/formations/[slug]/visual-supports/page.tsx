import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { CourseRepository } from "@/lib/repositories/course-repository";
import { CourseBreadcrumb } from "../_components/course-breadcrumb";
import { TrainingOverview } from "../_components/training-overview";
import { getVisualSupports } from "../_actions/visual-supports";
import { generateSampleVisualSupports } from "@/lib/loaders/visual-supports-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Target,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Lightbulb,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Users,
  Code,
} from "lucide-react";

interface VisualSupportsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: VisualSupportsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await CourseRepository.findBySlug(slug);

  if (!course) {
    return {
      title: "Formation non trouvée",
    };
  }

  return {
    title: `Supports Visuels - ${course.title} | FYGS`,
    description: `Supports visuels interactifs pour la formation ${course.title}`,
  };
}

export default async function VisualSupportsPage({
  params,
}: VisualSupportsPageProps) {
  const { slug } = await params;

  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const course = await CourseRepository.findBySlug(slug);

  if (!course || !course.published) {
    notFound();
  }

  // Check user access
  const userAccess = await AccessService.checkCourseAccess(
    session.user.id,
    course.id
  );

  if (!userAccess.canAccessCourse) {
    redirect(`/formations/${slug}`);
  }

  // Fetch visual supports
  let visualSupports;
  try {
    const fetchedVisualSupports = await getVisualSupports(course.slug);
    // Transform database data to match component interface
    visualSupports = fetchedVisualSupports.map((vs: any, index: number) => ({
      id: vs.id || `vs-${index}`,
      moduleId: vs.moduleId || index + 1,
      title: vs.title,
      order: vs.order || index,
      content: {
        slides: vs.content?.slides || vs.slides || [],
      },
    }));
  } catch (error) {
    console.error("Error fetching visual supports:", error);
    // Fallback to sample data
    const sampleData = generateSampleVisualSupports(course.title, course.slug);
    visualSupports = sampleData.map((vs: any, index: number) => ({
      id: vs.id || `sample-${index}`,
      moduleId: vs.moduleId || index + 1,
      title: vs.title,
      order: vs.order || index,
      content: {
        slides: vs.content?.slides || vs.slides || [],
      },
    }));
  }

  // Note: serializedCourse removed as TrainingOverview only needs visualSupports data

  return (
    <div className="min-h-screen bg-slate-800">
      <div className="container py-8 max-w-7xl mx-auto">
        <CourseBreadcrumb
          courseTitle={course.title}
          courseSlug={course.slug}
          currentPage="Supports Visuels"
        />

        {/* Page Header */}
        <div className="mt-8 mb-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
              Supports Visuels Immersifs
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Explorez en détail tous les concepts clés de la formation{" "}
              <span className="font-semibold text-emerald-600">
                {course.title}
              </span>{" "}
              à travers des supports visuels interactifs et des explications
              approfondies.
            </p>
          </div>
        </div>

        {/* Training Overview - Full Experience */}
        <div className="space-y-8">
          <TrainingOverview
            course={{
              id: course.id,
              title: course.title,
              slug: course.slug,
            }}
            visualSupports={visualSupports}
            defaultOpen={true}
            hideVisualSupportsLink={true}
          />

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  Objectifs de Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Maîtriser les concepts fondamentaux
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Appliquer les bonnes pratiques
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Développer une expertise pratique
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  Méthode d&apos;Apprentissage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    Théorie illustrée par l&apos;exemple
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    Exercices pratiques progressifs
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    Projets concrets d&apos;application
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                  </div>
                  Points Clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700"
                  >
                    {visualSupports.length} modules visuels
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    {visualSupports.reduce(
                      (acc, vs) => acc + (vs.content?.slides?.length || 0),
                      0
                    )}{" "}
                    slides total
                  </Badge>
                  <p className="text-xs text-slate-600 mt-2">
                    Chaque module contient des explications détaillées et des
                    exemples concrets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Tips */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                </div>
                Conseils d&apos;Étude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">
                    Comment bien utiliser les supports visuels :
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <Play className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Naviguez à votre rythme avec les contrôles
                    </li>
                    <li className="flex items-start gap-2">
                      <Pause className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Prenez des pauses pour assimiler
                    </li>
                    <li className="flex items-start gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Révisez les concepts difficiles
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">
                    Pour maximiser votre apprentissage :
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      Prenez des notes personnelles
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Discutez avec d&apos;autres apprenants
                    </li>
                    <li className="flex items-start gap-2">
                      <Code className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Pratiquez avec des exemples réels
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
