"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { SerializedCourse } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VisualSupportSlide {
  title: string;
  content: React.ReactNode | string;
}

interface VisualSupportModule {
  title: string;
  slides: VisualSupportSlide[];
}

interface VisualSupportsProps {
  course: SerializedCourse;
  initialModules: VisualSupportModule[];
}

const VisualSupports: React.FC<VisualSupportsProps> = ({ course, initialModules }) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In a real implementation, this would come from the API
  const modules = initialModules;

  const currentModuleData = modules[currentModule];
  const currentSlideData = currentModuleData?.slides[currentSlide];

  // Auto-advance slides when playing
  React.useEffect(() => {
    if (isPlaying && currentModuleData?.slides.length) {
      const interval = setInterval(() => {
        if (currentSlide < currentModuleData.slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        } else if (currentModule < modules.length - 1) {
          setCurrentModule(currentModule + 1);
          setCurrentSlide(0);
        } else {
          setIsPlaying(false); // Stop at the end
        }
      }, 5000); // 5 seconds per slide

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSlide, currentModule, currentModuleData, modules.length]);

  const nextSlide = () => {
    if (currentSlide < currentModuleData.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setCurrentSlide(modules[currentModule - 1].slides.length - 1);
    }
  };

  const goToModule = (moduleIndex: number) => {
    setCurrentModule(moduleIndex);
    setCurrentSlide(0);
  };

  if (!modules || modules.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-700">Supports Visuels Interactifs</h3>
              <p className="text-slate-500">Les supports visuels seront bientôt disponibles pour cette formation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSlides = modules.reduce((acc, module) => acc + module.slides.length, 0);
  const currentSlideNumber = modules.slice(0, currentModule).reduce((acc, module) => acc + module.slides.length, 0) + currentSlide + 1;
  const progressPercentage = (currentSlideNumber / totalSlides) * 100;

  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
      {/* Futuristic Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{course.title}</CardTitle>
              <p className="text-blue-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Supports Visuels Interactifs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {currentSlideNumber} / {totalSlides}
              </Badge>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Plein écran
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Module Navigation */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
              {modules.map((module, index) => (
                <Button
                  key={index}
                  onClick={() => goToModule(index)}
                  variant={currentModule === index ? "default" : "outline"}
                  size="sm"
                  className={`shrink-0 transition-all duration-300 ${
                    currentModule === index
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                      : 'hover:bg-blue-50 hover:border-blue-300 hover:scale-105'
                  }`}
                >
                  Module {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span className="font-medium">Progression globale</span>
            <span className="font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-slate-200"
          />
        </div>

        {/* Slide Content */}
        <div className="p-8 min-h-[500px] bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
          {currentModuleData && currentSlideData ? (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {currentModuleData.title}
                </Badge>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentSlideData.title}
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
              </div>
              
              <div className="slide-content prose prose-lg max-w-none">
                {typeof currentSlideData.content === 'string'
                  ? <div dangerouslySetInnerHTML={{ __html: currentSlideData.content }} />
                  : currentSlideData.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">Aucun contenu disponible pour ce module.</p>
            </div>
          )}
        </div>

        {/* Modern Control Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={prevSlide}
              disabled={currentModule === 0 && currentSlide === 0}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Précédent
            </Button>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Lecture auto
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setCurrentModule(0);
                  setCurrentSlide(0);
                  setIsPlaying(false);
                }}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reprendre
              </Button>
              
              <span className="text-slate-300 font-medium px-4">
                Module {currentModule + 1} • Slide {currentSlide + 1} sur {currentModuleData?.slides.length || 0}
              </span>
            </div>

            <Button
              onClick={nextSlide}
              disabled={currentModule === modules.length - 1 && currentSlide === (currentModuleData?.slides.length || 1) - 1}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualSupports;