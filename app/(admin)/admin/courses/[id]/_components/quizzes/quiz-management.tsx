"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Trophy, Target, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { generateSampleQuizzes } from "@/lib/loaders/visual-supports-loader";
import { QuizEditor } from "./quiz-editor";
import { toast } from "sonner";
import { createQuiz, updateQuiz, deleteQuiz } from "../../_actions/quiz-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// Types for the props
type QuizModule = {
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

type Quiz = {
  id: string;
  courseId: string;
  moduleId: number;
  title: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correct: number;
    explanation: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    quizId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

interface QuizManagementProps {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  modules: QuizModule[];
  initialQuizzes: Quiz[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  order: number;
}

interface QuizData {
  id: string;
  moduleId: number;
  title: string;
  questions: QuizQuestion[];
}

interface UserAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export function QuizManagement({ 
  course,
  modules = [],
  initialQuizzes = []
}: Pick<QuizManagementProps, 'course'> & { 
  modules?: QuizModule[];
  initialQuizzes?: Quiz[];
}) {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null);

  // Load quiz data - prefer real data over samples
  useEffect(() => {
    if (initialQuizzes.length > 0) {
      // Convert real database data to component format
      const realData = initialQuizzes.map(quiz => ({
        id: quiz.id,
        moduleId: quiz.moduleId,
        title: quiz.title,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation || '',
          order: q.order
        }))
      }));
      setQuizzes(realData);
      if (realData.length > 0) {
        setSelectedModule(realData[0].moduleId);
      }
    } else {
      // Fallback to sample data for demonstration
      const sampleData = generateSampleQuizzes(course.title, course.slug);
      setQuizzes(sampleData);
      if (sampleData.length > 0) {
        setSelectedModule(sampleData[0].moduleId);
      }
    }
  }, [course.title, course.slug, initialQuizzes]);

  // Helper functions for editor
  const handleCreateNew = () => {
    setEditingQuiz(null);
    setShowEditor(true);
  };

  const handleEdit = (quiz: QuizData) => {
    setEditingQuiz(quiz);
    setShowEditor(true);
  };

  const handleDelete = async (quizId: string) => {
    try {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        toast.success('Quiz supprimé avec succès.');
      } else {
        toast.error(result.error || 'Erreur lors de la suppression.');
      }
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingQuiz) {
        // Update existing
        const result = await updateQuiz(editingQuiz.id, {
          title: data.title,
          questions: data.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            order: q.order
          }))
        });
        
        if (result.success) {
          setQuizzes(prev => prev.map(q => 
            q.id === editingQuiz.id ? { ...data, id: q.id } : q
          ));
          toast.success('Quiz mis à jour avec succès.');
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour.');
          return;
        }
      } else {
        // Create new
        const result = await createQuiz(course.id, {
          moduleId: data.moduleId,
          title: data.title,
          questions: data.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            order: q.order
          }))
        });
        
        if (result.success && result.quiz) {
          const newQuiz: QuizData = {
            id: result.quiz.id,
            moduleId: data.moduleId,
            title: data.title,
            questions: result.quiz.questions.map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation || '',
              order: q.order
            }))
          };
          setQuizzes(prev => [...prev, newQuiz]);
          toast.success('Quiz créé avec succès.');
        } else {
          toast.error(result.error || 'Erreur lors de la création.');
          return;
        }
      }
      setShowEditor(false);
      setEditingQuiz(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde.');
      throw error;
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingQuiz(null);
  };

  const currentQuiz = quizzes.find(quiz => quiz.moduleId === selectedModule);
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz?.questions.length || 0;

  const handleAnswerSelection = (optionIndex: number) => {
    if (hasAnswered) return;
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion?.correct;
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion?.id || '',
      selectedOption: optionIndex,
      isCorrect
    };
    
    setUserAnswers(prev => [...prev, newAnswer]);
    setHasAnswered(true);
    setShowExplanation(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const changeModule = (moduleId: number) => {
    setSelectedModule(moduleId);
    resetQuiz();
  };

  const getScorePercentage = () => {
    return totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'Excellent! You mastered this module! 🎉';
    if (percentage >= 60) return 'Good job! Review the concepts you missed. 👍';
    return 'Keep studying! Review the module content. 📚';
  };

  if (showEditor) {
    return (
      <QuizEditor
        modules={modules.map(m => ({ id: m.id, title: m.title, order: m.order }))}
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={editingQuiz ? {
          title: editingQuiz.title,
          moduleId: editingQuiz.moduleId,
          questions: editingQuiz.questions
        } : undefined}
      />
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quiz System</span>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un Quiz
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No quizzes available for this course.</p>
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
            <span>🎯 End-of-Module Quizzes</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Quiz
              </Button>
              <Badge variant="secondary">{quizzes.length} quizzes</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card 
                key={quiz.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedModule === quiz.moduleId 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => changeModule(quiz.moduleId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{quiz.title}</h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(quiz);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <ConfirmationModal
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        }
                        title="Confirmer la suppression"
                        description={`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ? Cette action est irréversible.`}
                        confirmText="Supprimer définitivement"
                        onConfirm={() => handleDelete(quiz.id)}
                        isDestructive={true}
                      />
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{quiz.questions.length} questions</span>
                    <Badge variant="outline">Module {quiz.moduleId}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Interface */}
      {currentQuiz && !quizCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📝 {currentQuiz.title}</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Badge variant="secondary">
                  Question {currentQuestionIndex + 1} / {totalQuestions}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {Math.round(((currentQuestionIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100)}%
                </span>
              </div>
              <Progress 
                value={((currentQuestionIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100} 
                className="h-2"
              />
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    {currentQuestion.question}
                  </h3>
                  
                  {/* Answer Options */}
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                      let buttonClass = "w-full text-left p-6 border-2 rounded-xl transition-all duration-300 group relative overflow-hidden ";
                      
                      if (hasAnswered) {
                        if (index === currentQuestion.correct) {
                          buttonClass += "border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-900 shadow-lg shadow-emerald-100/50";
                        } else if (index === selectedOption && index !== currentQuestion.correct) {
                          buttonClass += "border-red-400 bg-gradient-to-br from-red-50 to-red-100 text-red-900 shadow-lg shadow-red-100/50";
                        } else {
                          buttonClass += "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600";
                        }
                      } else {
                        if (selectedOption === index) {
                          buttonClass += "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-900 shadow-lg shadow-blue-100/50 scale-[1.02]";
                        } else {
                          buttonClass += "border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-700 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-800 hover:shadow-md hover:scale-[1.01]";
                        }
                      }

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={buttonClass}
                          onClick={() => handleAnswerSelection(index)}
                          disabled={hasAnswered}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                hasAnswered && index === currentQuestion.correct
                                  ? "bg-emerald-500 text-white"
                                  : hasAnswered && index === selectedOption && index !== currentQuestion.correct
                                  ? "bg-red-500 text-white"
                                  : selectedOption === index && !hasAnswered
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-200 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-700"
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="font-medium leading-relaxed">{option}</span>
                            </div>
                            {hasAnswered && (
                              <span className="ml-2 transition-transform duration-300">
                                {index === currentQuestion.correct ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-700">Correct</span>
                                  </div>
                                ) : index === selectedOption ? (
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <span className="text-sm font-semibold text-red-700">Incorrect</span>
                                  </div>
                                ) : null}
                              </span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    selectedOption === currentQuestion.correct 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-yellow-500 bg-yellow-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded-full ${
                        selectedOption === currentQuestion.correct 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        {selectedOption === currentQuestion.correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium mb-1">
                          {selectedOption === currentQuestion.correct ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-sm text-gray-700">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {hasAnswered && (
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Score: {score} / {currentQuestionIndex + 1}
                    </div>
                    <Button onClick={nextQuestion}>
                      {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Results */}
      {quizCompleted && currentQuiz && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🏆 Quiz Results - {currentQuiz.title}</span>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              {/* Score Display */}
              <div className="space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>
                  {score} / {totalQuestions}
                </div>
                <div className={`text-2xl font-semibold ${getScoreColor()}`}>
                  {getScorePercentage()}%
                </div>
                <p className="text-lg text-muted-foreground">
                  {getScoreMessage()}
                </p>
              </div>

              {/* Progress Ring Visualization */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${getScorePercentage() * 2.51} 251`}
                      className={getScoreColor().replace('text-', 'text-')}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getScoreColor()}`}>
                      {getScorePercentage()}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                {quizzes.findIndex(q => q.moduleId === selectedModule) < quizzes.length - 1 && (
                  <Button 
                    onClick={() => {
                      const nextQuiz = quizzes[quizzes.findIndex(q => q.moduleId === selectedModule) + 1];
                      changeModule(nextQuiz.moduleId);
                    }}
                  >
                    Next Module Quiz
                  </Button>
                )}
              </div>

              {/* Detailed Results */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Question Review</h4>
                <div className="space-y-3">
                  {currentQuiz.questions.map((question, index) => {
                    const userAnswer = userAnswers.find(a => a.questionId === question.id);
                    return (
                      <div key={question.id} className="text-left border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Question {index + 1}: {question.question}
                          </span>
                          {userAnswer?.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        {!userAnswer?.isCorrect && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Correct answer: {question.options[question.correct]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Quiz Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quizzes.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentQuiz ? currentQuiz.questions.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Current Quiz Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
