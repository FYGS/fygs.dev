"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/mdx/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseBreadcrumb } from "../../_components/course-breadcrumb";
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Lightbulb, 
  ArrowLeft, 
  Sparkles,
  FileText,
  Users,
  Award,
  Rocket,
  Zap,
  Heart,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from "lucide-react";
import Link from "next/link";

interface PublicContentPageClientProps {
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

export function PublicContentPageClient({ course }: PublicContentPageClientProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const sections = [
    {
      id: "structure",
      title: "Structure de la Formation",
      subtitle: "Organisation et progression pédagogique",
      content: course.publicStructure,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-950/20 via-cyan-950/20 to-blue-950/20",
      borderColor: "border-blue-800",
      description: "Découvrez comment notre formation est structurée pour maximiser votre apprentissage, avec une progression logique et des étapes claires.",
    },
    {
      id: "resources",
      title: "Ressources Disponibles",
      subtitle: "Outils et supports d'apprentissage",
      content: course.publicResources,
      icon: Target,
      color: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-950/20 via-teal-950/20 to-emerald-950/20",
      borderColor: "border-emerald-800",
      description: "Accédez à une bibliothèque complète de ressources : documents, vidéos, exercices pratiques et projets concrets.",
    },
    {
      id: "evaluation",
      title: "Modalités d'Évaluation",
      subtitle: "Critères et méthodes d'évaluation",
      content: course.publicEvaluation,
      icon: CheckCircle,
      color: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-950/20 via-violet-950/20 to-purple-950/20",
      borderColor: "border-purple-800",
      description: "Comprenez comment vos compétences seront évaluées avec transparence et bienveillance pour garantir votre réussite.",
    },
    {
      id: "prerequisites",
      title: "Prérequis & Public Cible",
      subtitle: "Connaissances requises et profil idéal",
      content: course.publicPrerequisites,
      icon: Lightbulb,
      color: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-950/20 via-orange-950/20 to-amber-950/20",
      borderColor: "border-amber-800",
      description: "Vérifiez si cette formation correspond à votre niveau actuel et découvrez le profil type des participants.",
    },
  ].filter(section => section.content);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleAllSections = () => {
    if (allExpanded) {
      setExpandedSections(new Set());
      setAllExpanded(false);
    } else {
      setExpandedSections(new Set(sections.map(s => s.id)));
      setAllExpanded(true);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="container py-8 max-w-7xl mx-auto">
          <CourseBreadcrumb 
            courseTitle={course.title} 
            courseSlug={course.slug}
            currentPage="Détails de la Formation"
          />
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-white mb-4">
              Aucun contenu disponible
            </h1>
            <p className="text-slate-400 mb-8">
              Les détails de cette formation ne sont pas encore disponibles.
            </p>
            <Link href={`/formations/${course.slug}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la formation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-repeat bg-[length:60px_60px]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='0.02'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />
      </div>
      
      <div className="relative container py-8 max-w-7xl mx-auto">
        <CourseBreadcrumb 
          courseTitle={course.title} 
          courseSlug={course.slug}
          currentPage="Détails de la Formation"
        />
        
        {/* Page Header */}
        <div className="mt-8 mb-12">
          <div className="text-center space-y-6">
            {/* Back Button */}
            <div className="flex justify-center mb-6">
              <Link href={`/formations/${course.slug}`}>
                <Button variant="outline" className="group hover:bg-blue-950/20 border-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Retour à la formation
                </Button>
              </Link>
            </div>

            {/* Hero Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <Card className="relative border-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm shadow-2xl">
                <CardHeader className="pb-6">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <CardTitle className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Détails Complets
                        </span>
                      </CardTitle>
                      <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 mb-4">
                        {course.title}
                      </h2>
                      <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Plongez dans tous les aspects de cette formation exceptionnelle. 
                        Découvrez en détail ce qui vous attend, les ressources mises à votre disposition, 
                        et comment votre parcours d&apos;apprentissage sera organisé pour votre réussite.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-950/30 to-cyan-950/30">
                      <FileText className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="font-bold text-lg text-white">{sections.length}</div>
                      <div className="text-xs text-slate-400">Sections</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-teal-950/30">
                      <Users className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                      <div className="font-bold text-lg text-white">∞</div>
                      <div className="text-xs text-slate-400">Accès</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-violet-950/30">
                      <Award className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="font-bold text-lg text-white">💯</div>
                      <div className="text-xs text-slate-400">Qualité</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-950/30 to-orange-950/30">
                      <Heart className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                      <div className="font-bold text-lg text-white">🎯</div>
                      <div className="text-xs text-slate-400">Passion</div>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse All Button */}
                  <div className="text-center">
                    <Button 
                      onClick={toggleAllSections}
                      variant="outline"
                      className="group hover:bg-blue-950/20 border-blue-700"
                    >
                      {allExpanded ? (
                        <>
                          <Minimize2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          Réduire tout
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          Développer tout
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="relative">
                {/* Section Number */}
                <div className="absolute -left-4 top-8 z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                </div>

                {/* Section Content */}
                <Card className={`
                  ${section.borderColor} border-2 shadow-xl hover:shadow-2xl transition-all duration-500
                  bg-gradient-to-br ${section.bgGradient} backdrop-blur-sm
                  group hover:scale-[1.01] transform ml-8
                `}>
                  <CardHeader 
                    className="pb-6 cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${section.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          {section.title}
                        </CardTitle>
                        <p className="text-slate-400 text-lg mb-4">
                          {section.subtitle}
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`bg-gradient-to-r ${section.color} text-white border-0 shadow-sm`}
                        >
                          <Rocket className="w-3 h-3 mr-1" />
                          Détaillé
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="border-slate-600"
                        >
                          Section {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-800"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <>
                      <Separator className="mx-6 bg-gradient-to-r from-transparent to-transparent via-slate-600" />

                      <CardContent className="pt-6 pb-8">
                        <ScrollArea className="h-auto max-h-[80vh] w-full">
                          <div className="space-y-2 pr-4">
                            <MarkdownRenderer 
                              content={section.content || ""} 
                              className="prose-lg max-w-none"
                            />
                          </div>
                        </ScrollArea>
                        
                        {/* Bottom accent */}
                        <div className="mt-8 pt-6 border-t border-slate-700">
                          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                            <Zap className="w-4 h-4" />
                            <span>Informations mises à jour régulièrement</span>
                            <Zap className="w-4 h-4" />
                          </div>
                        </div>
                      </CardContent>
                    </>
                  )}
                  
                  {!isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-400 mb-2">
                          Cliquez pour voir le contenu détaillé
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                          <ChevronDown className="h-3 w-3" />
                          <span>Développer</span>
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">
                  Prêt(e) à commencer votre apprentissage ?
                </h3>
                <p className="text-xl text-blue-100 mb-8">
                  Rejoignez des milliers d&apos;apprenants qui ont transformé leur carrière grâce à nos formations de qualité.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={`/formations/${course.slug}`}>
                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Découvrir la formation
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Users className="w-5 h-5 mr-2" />
                      Poser une question
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}