"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface CoursePublicContentProps {
  course: {
    id: string;
    title: string;
    slug: string;
    publicStructure?: string | null;
    publicResources?: string | null;
    publicEvaluation?: string | null;
    publicPrerequisites?: string | null;
  };
}

interface ContentSection {
  id: string;
  title: string;
  content: string | null | undefined;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  shortPreview: string;
}

export function CoursePublicContent({ course }: CoursePublicContentProps) {
  const sections: ContentSection[] = [
    {
      id: "structure",
      title: "Structure du cours",
      content: course.publicStructure,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      description: "Organisation et progression du contenu",
      shortPreview:
        "Découvrez comment la formation est organisée, module par module, pour une progression optimale.",
    },
    {
      id: "resources",
      title: "Ressources incluses",
      content: course.publicResources,
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      description: "Supports et outils fournis",
      shortPreview:
        "Accédez à une bibliothèque complète de ressources : supports visuels, exercices et projets.",
    },
    {
      id: "evaluation",
      title: "Évaluation & Certification",
      content: course.publicEvaluation,
      icon: Award,
      color: "from-amber-500 to-orange-500",
      description: "Méthodes d'évaluation et reconnaissance",
      shortPreview:
        "Comprenez comment vos compétences seront évaluées et certifiées à la fin du parcours.",
    },
    {
      id: "prerequisites",
      title: "Prérequis & Public cible",
      content: course.publicPrerequisites,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      description: "Niveau requis et profil idéal",
      shortPreview:
        "Vérifiez si cette formation correspond à votre niveau et découvrez le profil type.",
    },
  ];

  const sectionsWithContent = sections.filter((section) => section.content);

  if (sectionsWithContent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
        <Card className="relative border-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Informations de la Formation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Découvrez ce qui vous attend dans cette formation
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Overview Cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {sectionsWithContent.map((section) => {
                const Icon = section.icon;

                return (
                  <Card
                    key={section.id}
                    className="group hover:shadow-md transition-all duration-300 border-slate-200/80 bg-white/90 backdrop-blur-sm hover:scale-[1.02] transform hover:border-blue-300"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs sm:text-sm group-hover:text-blue-600 transition-colors mb-1 line-clamp-1 text-slate-800">
                            {section.title}
                          </h3>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                        {section.shortPreview}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-300 text-blue-700"
                        >
                          Détails disponibles
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Call to Action - Mobile responsive */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-indigo-100/80 border border-blue-300/50 shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-3">
                <ExternalLink className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                  Explorez Tous les Détails
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mb-4 max-w-lg mx-auto px-2">
                Accédez à une vue complète et détaillée de tous les aspects de
                cette formation : contenu approfondi, ressources exhaustives, et
                informations pratiques.
              </p>
              <Link href={`/formations/${course.slug}/details`}>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                  size="lg"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    Voir Tous les Détails
                  </span>
                  <span className="sm:hidden">Voir Détails</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Informations complètes et transparentes</span>
              <span>•</span>
              <span>Mis à jour régulièrement</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
