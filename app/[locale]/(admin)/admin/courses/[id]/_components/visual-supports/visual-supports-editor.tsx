"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Eye, EyeOff, Save, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ModuleSelector } from "@/components/ui/module-selector";

interface Slide {
  title: string;
  content: string;
}

interface VisualSupportData {
  title: string;
  moduleId: number | null;
  order: number;
  slides: Slide[];
}

interface Module {
  id: string;
  title: string;
  order: number;
}

interface VisualSupportsEditorProps {
  modules: Module[];
  onSave: (data: VisualSupportData) => Promise<void>;
  onCancel: () => void;
  initialData?: VisualSupportData;
}

export function VisualSupportsEditor({
  modules,
  onSave,
  onCancel,
  initialData
}: VisualSupportsEditorProps) {
  
  const [formData, setFormData] = useState<VisualSupportData>(initialData || {
    title: "",
    moduleId: null,
    order: 1,
    slides: [{
      title: "Introduction",
      content: `<div class="space-y-6">
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-6">
    <h4 class="font-bold text-blue-900 text-lg mb-3">🚀 Titre de votre slide</h4>
    <p class="text-gray-700">Contenu de votre slide ici. Vous pouvez utiliser du HTML et des classes Tailwind.</p>
  </div>
</div>`
    }]
  });
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentSlide = formData.slides[currentSlideIndex];

  const updateFormData = (field: keyof VisualSupportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const updatedSlides = [...formData.slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setFormData(prev => ({ ...prev, slides: updatedSlides }));
  };

  const addSlide = () => {
    const newSlide: Slide = {
      title: `Slide ${formData.slides.length + 1}`,
      content: `<div class="space-y-6">
  <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 rounded-lg p-6">
    <h4 class="font-bold text-purple-900 text-lg mb-3">✨ Nouveau contenu</h4>
    <p class="text-gray-700">Ajoutez votre contenu ici...</p>
  </div>
</div>`
    };
    setFormData(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
    setCurrentSlideIndex(formData.slides.length);
  };

  const removeSlide = (index: number) => {
    if (formData.slides.length <= 1) {
      toast.error("Vous devez avoir au moins une slide.");
      return;
    }
    
    const updatedSlides = formData.slides.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, slides: updatedSlides }));
    
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.slides.length) return;

    const updatedSlides = [...formData.slides];
    [updatedSlides[index], updatedSlides[newIndex]] = [updatedSlides[newIndex], updatedSlides[index]];
    setFormData(prev => ({ ...prev, slides: updatedSlides }));
    setCurrentSlideIndex(newIndex);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }

    if (!formData.moduleId) {
      toast.error("Veuillez sélectionner un module.");
      return;
    }

    if (formData.slides.length === 0) {
      toast.error("Au moins une slide est requise.");
      return;
    }

    // Check that all slides have titles
    const emptyTitleSlides = formData.slides.filter(slide => !slide.title.trim());
    if (emptyTitleSlides.length > 0) {
      toast.error("Toutes les slides doivent avoir un titre.");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success("Support visuel sauvegardé avec succès.");
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Éditeur de Support Visuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Titre du Support</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Ex: Module 1 : Fondations & Écosystème"
              />
            </div>
            
            <ModuleSelector
              modules={modules}
              value={formData.moduleId}
              onValueChange={(value) => updateFormData('moduleId', value)}
              label="Module"
              placeholder="Sélectionner un module"
              required
            />
            
            <div>
              <Label htmlFor="order">Ordre</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => updateFormData('order', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slides Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slides List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📄 Slides ({formData.slides.length})</span>
              <Button onClick={addSlide} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.slides.map((slide, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    currentSlideIndex === index
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm truncate">
                        {slide.title || `Slide ${index + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Slide {index + 1}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, 'up');
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, 'down');
                        }}
                        disabled={index === formData.slides.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(index);
                        }}
                        disabled={formData.slides.length <= 1}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slide Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>✏️ Édition - Slide {currentSlideIndex + 1}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Édition' : 'Aperçu'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPreview ? (
              // Edit Mode
              <>
                <div>
                  <Label htmlFor={`slide-title-${currentSlideIndex}`}>Titre de la Slide</Label>
                  <Input
                    id={`slide-title-${currentSlideIndex}`}
                    value={currentSlide?.title || ''}
                    onChange={(e) => updateSlide(currentSlideIndex, 'title', e.target.value)}
                    placeholder="Titre de votre slide"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`slide-content-${currentSlideIndex}`}>Contenu HTML</Label>
                  <Textarea
                    id={`slide-content-${currentSlideIndex}`}
                    value={currentSlide?.content || ''}
                    onChange={(e) => updateSlide(currentSlideIndex, 'content', e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Contenu HTML de votre slide..."
                  />
                </div>
                
                {/* HTML Helper */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Templates disponibles :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSlide(currentSlideIndex, 'content', `<div class="grid grid-cols-3 gap-4">
  <div class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
    <h4 class="font-bold text-red-700 mb-2">🚫 Problème</h4>
    <p class="text-sm">Description du problème</p>
  </div>
  <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
    <h4 class="font-bold text-blue-700 mb-2">💡 Solution</h4>
    <p class="text-sm">Description de la solution</p>
  </div>
  <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
    <h4 class="font-bold text-green-700 mb-2">✅ Résultat</h4>
    <p class="text-sm">Description du résultat</p>
  </div>
</div>`)}
                    >
                      3 Colonnes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSlide(currentSlideIndex, 'content', `<div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 rounded-lg p-6">
  <h4 class="font-bold text-purple-900 text-lg mb-3">🚀 Titre Important</h4>
  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p class="font-semibold mb-1">✨ Point clé 1</p>
      <p class="text-gray-700">Description</p>
    </div>
    <div>
      <p class="font-semibold mb-1">⚡ Point clé 2</p>
      <p class="text-gray-700">Description</p>
    </div>
  </div>
</div>`)}
                    >
                      Encadré Important
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSlide(currentSlideIndex, 'content', `<div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
  <div class="mb-2 text-white">📁 Structure de projet</div>
  <div class="ml-4 space-y-1">
    <div>├── app/</div>
    <div class="ml-4">
      <div>├── layout.tsx <span class="text-gray-500"># Layout racine</span></div>
      <div>├── page.tsx <span class="text-gray-500"># Page d'accueil</span></div>
    </div>
  </div>
</div>`)}
                    >
                      Code Terminal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSlide(currentSlideIndex, 'content', `<div class="grid grid-cols-2 gap-4">
  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
    <h5 class="font-bold text-blue-900 mb-2">Avantages ✅</h5>
    <ul class="text-sm space-y-1 text-gray-700">
      <li>• Point positif 1</li>
      <li>• Point positif 2</li>
      <li>• Point positif 3</li>
    </ul>
  </div>
  <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
    <h5 class="font-bold text-yellow-900 mb-2">Inconvénients ⚠️</h5>
    <ul class="text-sm space-y-1 text-gray-700">
      <li>• Point à améliorer 1</li>
      <li>• Point à améliorer 2</li>
      <li>• Point à améliorer 3</li>
    </ul>
  </div>
</div>`)}
                    >
                      Avantages/Inconvénients
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Preview Mode
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    {currentSlide?.title}
                  </h3>
                  <Separator className="mb-6" />
                </div>
                
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: currentSlide?.content || '' 
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="text-sm text-muted-foreground">
            {formData.slides.length} slide(s) • Module sélectionné: {
              formData.moduleId ? 
                modules.find(m => m.order === formData.moduleId)?.title || 'Non trouvé'
                : 'Aucun'
            }
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}