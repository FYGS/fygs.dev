"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Eye, EyeOff, Plus, Edit, Trash2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { generateSampleVisualSupports } from "@/lib/loaders/visual-supports-loader";
import { VisualSupportsEditor } from "./visual-supports-editor";
import { toast } from "sonner";
import { createVisualSupport, updateVisualSupport, deleteVisualSupport } from "../../_actions/visual-support-actions";

// Types for the props
type VisualSupportModule = {
  id: string;
  title: string;
  slug: string;
  order: number;
  courseId: string;
  lessons: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    duration: number | null;
    order: number;
    moduleId: string | null;
  }[];
};

type VisualSupport = {
  id: string;
  courseId: string;
  moduleId: number;
  title: string;
  content: {
    slides: Array<{
      title: string;
      content: any; // Can be React.ReactNode or string
    }>;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

interface VisualSupportsManagementProps {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  modules: VisualSupportModule[];
  initialVisualSupports: VisualSupport[];
}

interface Slide {
  title: string;
  content: string;
}

interface VisualSupportData {
  id: string;
  moduleId: number;
  title: string;
  order: number;
  content: {
    slides: Slide[];
  };
}

interface VisualSupportsManagementProps {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  modules: VisualSupportModule[];
  initialVisualSupports: VisualSupport[];
}

interface Slide {
  title: string;
  content: string;
}

interface VisualSupportData {
  id: string;
  moduleId: number;
  title: string;
  order: number;
  content: {
    slides: Slide[];
  };
}

export function VisualSupportsManagement({ 
  course,
  modules = [],
  initialVisualSupports = []
}: Pick<VisualSupportsManagementProps, 'course'> & { 
  modules?: VisualSupportModule[];
  initialVisualSupports?: VisualSupport[];
}) {
  const [visualSupports, setVisualSupports] = useState<VisualSupportData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSupport, setEditingSupport] = useState<VisualSupportData | null>(null);

  // Load visual supports data - prefer real data over samples
  useEffect(() => {
    if (initialVisualSupports.length > 0) {
      // Convert real database data to component format
      const realData = initialVisualSupports.map(vs => ({
        id: vs.id,
        moduleId: vs.moduleId,
        title: vs.title,
        order: vs.order,
        content: vs.content as { slides: Array<{ title: string; content: string }> }
      }));
      setVisualSupports(realData);
      if (realData.length > 0) {
        setSelectedModule(realData[0].moduleId);
      }
    } else {
      // Fallback to sample data for demonstration
      const sampleData = generateSampleVisualSupports(course.title, course.slug);
      setVisualSupports(sampleData);
      if (sampleData.length > 0) {
        setSelectedModule(sampleData[0].moduleId);
      }
    }
  }, [course.title, course.slug, initialVisualSupports]);

  const currentModule = visualSupports.find(vs => vs.moduleId === selectedModule);
  const totalSlides = currentModule?.content.slides.length || 0;

  // Helper functions for editor
  const handleCreateNew = () => {
    setEditingSupport(null);
    setShowEditor(true);
  };

  const handleEdit = (support: VisualSupportData) => {
    setEditingSupport(support);
    setShowEditor(true);
  };

  const handleDelete = async (supportId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce support visuel ?')) {
      try {
        const result = await deleteVisualSupport(supportId);
        if (result.success) {
          setVisualSupports(prev => prev.filter(vs => vs.id !== supportId));
          toast.success('Support visuel supprimé avec succès.');
        } else {
          toast.error(result.error || 'Erreur lors de la suppression.');
        }
      } catch {
        toast.error('Erreur lors de la suppression.');
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingSupport) {
        // Update existing
        const result = await updateVisualSupport(editingSupport.id, {
          title: data.title,
          order: data.order,
          content: { slides: data.slides }
        });
        
        if (result.success) {
          setVisualSupports(prev => prev.map(vs => 
            vs.id === editingSupport.id ? { ...data, id: vs.id, content: { slides: data.slides } } : vs
          ));
          toast.success('Support visuel mis à jour avec succès.');
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour.');
          return;
        }
      } else {
        // Create new
        const result = await createVisualSupport(course.id, {
          moduleId: data.moduleId,
          title: data.title,
          order: data.order,
          content: { slides: data.slides }
        });
        
        if (result.success && result.visualSupport) {
          const newSupport = {
            id: result.visualSupport.id,
            moduleId: data.moduleId,
            title: data.title,
            order: data.order,
            content: { slides: data.slides }
          };
          setVisualSupports(prev => [...prev, newSupport]);
          toast.success('Support visuel créé avec succès.');
        } else {
          toast.error(result.error || 'Erreur lors de la création.');
          return;
        }
      }
      setShowEditor(false);
      setEditingSupport(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde.');
      throw error;
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingSupport(null);
  };

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
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 5000); // 5 seconds per slide

      return () => clearInterval(interval);
    }
  }, [isPlaying, totalSlides]);

  // Reset slide when changing modules
  useEffect(() => {
    setCurrentSlide(0);
    setIsPlaying(false);
  }, [selectedModule]);

  if (showEditor) {
    return (
      <VisualSupportsEditor
        modules={modules.map(m => ({ id: m.id, title: m.title, order: m.order }))}
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={editingSupport ? {
          title: editingSupport.title,
          moduleId: editingSupport.moduleId,
          order: editingSupport.order,
          slides: editingSupport.content.slides
        } : undefined}
      />
    );
  }

  if (visualSupports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visual Supports</span>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un Support
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No visual supports available for this course.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎯 Course Overview - Visual Supports</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Support
              </Button>
              <Badge variant="secondary">{visualSupports.length} modules</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visualSupports.map((vs) => (
              <Card 
                key={vs.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedModule === vs.moduleId 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedModule(vs.moduleId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{vs.title}</h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vs);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <ConfirmationModal
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        }
                        title="Confirmer la suppression"
                        description={`Êtes-vous sûr de vouloir supprimer le support visuel "${vs.title}" ? Cette action est irréversible.`}
                        confirmText="Supprimer définitivement"
                        onConfirm={() => handleDelete(vs.id)}
                        isDestructive={true}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{vs.content.slides.length} slides</span>
                    <Badge variant="outline">Module {vs.moduleId}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Support Player */}
      {currentModule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📊 {currentModule.title}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleContentVisibility}
                >
                  {showContent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showContent ? 'Hide' : 'Show'} Content
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
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSlides}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button
                  variant={isPlaying ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleAutoplay}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Auto Play
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Slide Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              />
            </div>

            {/* Current Slide Content */}
            {showContent && currentModule.content.slides[currentSlide] && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    {currentModule.content.slides[currentSlide].title}
                  </h3>
                  <Separator className="mb-6" />
                </div>
                
                {/* Slide Content with HTML rendering */}
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: currentModule.content.slides[currentSlide].content 
                  }}
                />
              </div>
            )}

            {/* Slide Thumbnails */}
            <div className="mt-8">
              <h4 className="text-sm font-medium mb-3">Slide Overview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {currentModule.content.slides.map((slide, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-200 ${
                      index === currentSlide
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'hover:shadow-sm opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <CardContent className="p-2">
                      <div className="text-xs font-medium text-center truncate">
                        {slide.title}
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        Slide {index + 1}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Supports Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Visual Supports Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {visualSupports.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {visualSupports.reduce((total, vs) => total + vs.content.slides.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Slides</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentModule ? currentModule.content.slides.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Current Module Slides</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}