"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface VisualSupportData {
  id: string;
  moduleId: number;
  title: string;
  order: number;
  content: {
    slides: Array<{
      title: string;
      content: string;
    }>;
  };
}

interface TrainingOverviewProps {
  course: {
    id: string;
    title: string;
    slug: string;
  };
  visualSupports: VisualSupportData[];
  defaultOpen?: boolean;
  hideVisualSupportsLink?: boolean;
}

export function TrainingOverview({
  course,
  visualSupports,
  defaultOpen = true,
  hideVisualSupportsLink = false,
}: TrainingOverviewProps) {
  // Filter out visual supports without valid content structure
  const validVisualSupports = visualSupports.filter(
    (vs) =>
      vs.content &&
      vs.content.slides &&
      Array.isArray(vs.content.slides) &&
      vs.content.slides.length > 0
  );

  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedModule, setSelectedModule] = useState<number | null>(
    validVisualSupports.length > 0 ? validVisualSupports[0].moduleId : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const hasInitialized = useRef(false);

  // Load visual supports data (only once)
  useEffect(() => {
    if (!hasInitialized.current && validVisualSupports.length > 0) {
      setSelectedModule(validVisualSupports[0].moduleId);
      hasInitialized.current = true;
    }
  }, [validVisualSupports]);

  const currentModule = validVisualSupports.find(
    (vs) => vs.moduleId === selectedModule
  );
  const totalSlides = currentModule?.content?.slides?.length || 0;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const resetSlides = () => {
    setCurrentSlide(0);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleContentVisibility = () => {
    setShowContent(!showContent);
  };

  // Auto-advance slides when playing
  useEffect(() => {
    if (isPlaying && totalSlides > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000); // 5 seconds per slide

      return () => clearInterval(interval);
    }
  }, [isPlaying, totalSlides]);

  // Reset slide when changing modules (derived during render, not in an effect)
  const [slideModule, setSlideModule] = useState(selectedModule);
  if (slideModule !== selectedModule) {
    setSlideModule(selectedModule);
    setCurrentSlide(0);
    setIsPlaying(false);
  }

  if (validVisualSupports.length === 0) {
    return null; // Don't show section if no valid visual supports
  }

  return (
    <Card className="overflow-hidden border shadow-sm bg-white/95 border-slate-200">
      <CardHeader
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Aperçu de la Formation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 border-emerald-300"
            >
              {validVisualSupports.length} module
              {validVisualSupports.length > 1 ? "s" : ""}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-600" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Summary and Link to Full Experience */}
          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              Découvrez les points clés de cette formation à travers des
              supports visuels interactifs. Cette section vous donne un aperçu
              des concepts essentiels qui seront abordés.
            </p>
            {!hideVisualSupportsLink && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Expérience Complète
                    </h4>
                    <p className="text-sm text-slate-500">
                      Accédez à tous les supports visuels en mode immersif
                    </p>
                  </div>
                </div>
                <Link href={`/formations/${course.slug}/visual-supports`}>
                  <Button
                    variant="outline"
                    className="bg-white border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                  >
                    Voir Tout
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <Separator className="bg-slate-200" />

          {/* Module Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validVisualSupports.map((vs) => (
              <Card
                key={vs.id}
                className={`cursor-pointer transition-all duration-200 border ${
                  selectedModule === vs.moduleId
                    ? "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400"
                    : "hover:shadow-md hover:bg-blue-50 border-slate-200 bg-white"
                }`}
                onClick={() => {
                  setSelectedModule(vs.moduleId);
                  setCurrentSlide(0);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-800">
                      {vs.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 text-slate-700"
                    >
                      Module {vs.moduleId}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{vs.content?.slides?.length || 0} slides</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visual Support Player */}
          {currentModule && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg text-slate-800">
                    📊 {currentModule.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleContentVisibility}
                    >
                      {showContent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {showContent ? "Masquer" : "Afficher"}
                    </Button>
                    <Badge variant="secondary">
                      {currentSlide + 1} / {totalSlides}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Slide Navigation Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Précédent</span>
                      <span className="sm:hidden">Préc</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSlide}
                      disabled={currentSlide === totalSlides - 1}
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Suivant</span>
                      <span className="sm:hidden">Suiv</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetSlides}
                      className="text-xs sm:text-sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Reprendre</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                    <Button
                      variant={isPlaying ? "destructive" : "default"}
                      size="sm"
                      onClick={toggleAutoplay}
                      className="text-xs sm:text-sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Lecture Auto</span>
                          <span className="sm:hidden">Auto</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Slide Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentSlide + 1) / totalSlides) * 100}%`,
                    }}
                  />
                </div>

                {/* Current Slide Content */}
                {showContent &&
                  currentModule?.content?.slides?.[currentSlide] && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">
                          {currentModule.content.slides[currentSlide].title}
                        </h3>
                        <Separator className="mb-6 bg-slate-200" />
                      </div>

                      {/* Slide Content with HTML rendering */}
                      <div
                        className="prose prose-slate prose-sm max-w-none text-center prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{
                          __html:
                            currentModule.content.slides[currentSlide].content,
                        }}
                      />
                    </div>
                  )}

                {/* Slide Thumbnails */}
                <div className="mt-8">
                  <h4 className="text-sm font-medium mb-3 text-slate-800">
                    Navigation rapide
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {currentModule?.content?.slides?.map((slide, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all duration-200 border ${
                          index === currentSlide
                            ? "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400"
                            : "hover:shadow-sm opacity-70 hover:opacity-100 hover:bg-blue-50 border-slate-200 bg-white"
                        }`}
                        onClick={() => setCurrentSlide(index)}
                      >
                        <CardContent className="p-2">
                          <div className="text-xs font-medium text-center truncate text-slate-700">
                            {slide.title}
                          </div>
                          <div className="text-xs text-muted-foreground text-center mt-1">
                            {index + 1}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      )}
    </Card>
  );
}
