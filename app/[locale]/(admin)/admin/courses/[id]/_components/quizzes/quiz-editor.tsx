"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, EyeOff, Save, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ModuleSelector } from "@/components/ui/module-selector";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  order: number;
}

interface QuizData {
  title: string;
  moduleId: number | null;
  questions: QuizQuestion[];
}

interface Module {
  id: string;
  title: string;
  order: number;
}

interface QuizEditorProps {
  modules: Module[];
  onSave: (data: QuizData) => Promise<void>;
  onCancel: () => void;
  initialData?: QuizData;
}

export function QuizEditor({
  modules,
  onSave,
  onCancel,
  initialData
}: QuizEditorProps) {
  const [formData, setFormData] = useState<QuizData>(initialData || {
    title: "",
    moduleId: null,
    questions: [{
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
      order: 1
    }]
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = formData.questions[currentQuestionIndex];

  const updateFormData = (field: keyof QuizData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = { 
      ...updatedQuestions[questionIndex], 
      options: updatedOptions 
    };
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
      order: formData.questions.length + 1
    };
    setFormData(prev => ({ 
      ...prev, 
      questions: [...prev.questions, newQuestion] 
    }));
    setCurrentQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) {
      toast.error("Vous devez avoir au moins une question.");
      return;
    }
    
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Update order for remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({ ...q, order: i + 1 }));
    setFormData(prev => ({ ...prev, questions: reorderedQuestions }));
    
    if (currentQuestionIndex >= reorderedQuestions.length) {
      setCurrentQuestionIndex(reorderedQuestions.length - 1);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.questions.length) return;

    const updatedQuestions = [...formData.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    
    // Update order
    updatedQuestions[index].order = index + 1;
    updatedQuestions[newIndex].order = newIndex + 1;
    
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    setCurrentQuestionIndex(newIndex);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Le titre du quiz est requis.");
      return;
    }

    if (!formData.moduleId) {
      toast.error("Veuillez sélectionner un module.");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Au moins une question est requise.");
      return;
    }

    // Validate each question
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      if (!question.question.trim()) {
        toast.error(`La question ${i + 1} est requise.`);
        return;
      }

      // Check if all options are filled
      const emptyOptions = question.options.filter(option => !option.trim());
      if (emptyOptions.length > 0) {
        toast.error(`Toutes les options de la question ${i + 1} doivent être remplies.`);
        return;
      }

      // Check if explanation is provided
      if (!question.explanation.trim()) {
        toast.error(`L'explication de la question ${i + 1} est requise.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success("Quiz sauvegardé avec succès.");
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = (questionIndex: number) => {
    if (formData.questions[questionIndex].options.length >= 6) {
      toast.error("Maximum 6 options par question.");
      return;
    }
    
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push("");
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (formData.questions[questionIndex].options.length <= 2) {
      toast.error("Minimum 2 options par question.");
      return;
    }
    
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    
    // Remove the option
    question.options.splice(optionIndex, 1);
    
    // Adjust correct answer index if necessary
    if (question.correct >= optionIndex && question.correct > 0) {
      question.correct = Math.max(0, question.correct - 1);
    }
    
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Éditeur de Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiz-title">Titre du Quiz</Label>
              <Input
                id="quiz-title"
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
          </div>
        </CardContent>
      </Card>

      {/* Questions Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>❓ Questions ({formData.questions.length})</span>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    currentQuestionIndex === index
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm truncate">
                        {question.question || `Question ${index + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {question.options.length} options • Réponse: {question.correct + 1}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveQuestion(index, 'up');
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
                          moveQuestion(index, 'down');
                        }}
                        disabled={index === formData.questions.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(index);
                        }}
                        disabled={formData.questions.length <= 1}
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

        {/* Question Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>✏️ Édition - Question {currentQuestionIndex + 1}</span>
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
                {/* Question Text */}
                <div>
                  <Label htmlFor="question-text">Question</Label>
                  <Textarea
                    id="question-text"
                    value={currentQuestion?.question || ''}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    rows={3}
                    placeholder="Quelle est votre question ?"
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Options de réponse</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(currentQuestionIndex)}
                      disabled={currentQuestion?.options.length >= 6}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {currentQuestion?.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="radio"
                            name="correct-answer"
                            checked={currentQuestion.correct === optionIndex}
                            onChange={() => updateQuestion(currentQuestionIndex, 'correct', optionIndex)}
                            className="text-primary"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateQuestionOption(currentQuestionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className={currentQuestion.correct === optionIndex ? 'border-green-500 bg-green-50' : ''}
                          />
                        </div>
                        {currentQuestion.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(currentQuestionIndex, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    ✅ Sélectionnez la bonne réponse en cliquant sur le bouton radio correspondant
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <Label htmlFor="question-explanation">Explication</Label>
                  <Textarea
                    id="question-explanation"
                    value={currentQuestion?.explanation || ''}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'explanation', e.target.value)}
                    rows={3}
                    placeholder="Expliquez pourquoi cette réponse est correcte..."
                  />
                </div>
              </>
            ) : (
              // Preview Mode
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    {currentQuestion?.question || "Question vide"}
                  </h3>
                  
                  {/* Answer Options Preview */}
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option, index) => {
                      const isCorrect = index === currentQuestion.correct;
                      return (
                        <div
                          key={index}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                            isCorrect 
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{option || `Option ${index + 1} (vide)`}</span>
                            {isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Preview */}
                {currentQuestion?.explanation && (
                  <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Explication</p>
                        <p className="text-sm text-gray-700">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="text-sm text-muted-foreground">
            {formData.questions.length} question(s) • Module sélectionné: {
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