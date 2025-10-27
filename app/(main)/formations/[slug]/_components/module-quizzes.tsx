'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Lock, Play, ChevronDown, ChevronUp, Target, Trophy, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  order: number;
}

interface Quiz {
  id: string;
  moduleId: number;
  title: string;
  questions: QuizQuestion[];
}

interface ModuleQuizzesProps {
  quizzes: Quiz[];
  courseSlug: string;
  isEnrolled?: boolean;
}

export function ModuleQuizzes({
  quizzes,
  courseSlug,
  isEnrolled = false
}: ModuleQuizzesProps) {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative">
            <CardTitle className="flex items-center justify-between text-2xl font-bold">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                Quiz Interactifs
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                0 quiz
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-700">Quiz Interactifs</h3>
              <p className="text-slate-500">Les quiz seront bientôt disponibles pour cette formation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative">
          <CardTitle className="flex items-center justify-between text-2xl font-bold">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="h-6 w-6" />
              </div>
              Quiz Interactifs
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {quizzes.length} quiz{quizzes.length > 1 ? 'zes' : ''}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-100 border-emerald-300/30">
                <Trophy className="h-4 w-4 mr-1" />
                Certifié
              </Badge>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id}
              className="group border-b border-slate-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
            >
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
                      {quiz.moduleId}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-lg text-slate-800 group-hover:text-purple-700 transition-colors">
                      {quiz.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>{quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>~{quiz.questions.length * 2} min</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Module {quiz.moduleId}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isEnrolled ? (
                    <Button
                      variant="default" 
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link href={`/formations/${courseSlug}/quizzes/${quiz.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                      className="border-slate-300 text-slate-500"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Verrouillé
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-purple-600"
                  >
                    {expandedQuiz === quiz.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              
              {expandedQuiz === quiz.id && (
                <div className="px-6 pb-6 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                  <div className="border-t border-slate-200 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-slate-700">Aperçu des Questions</h5>
                        <Progress 
                          value={75} 
                          className="w-24 h-2" 
                        />
                      </div>
                      
                      {quiz.questions.slice(0, 3).map((question, qIndex) => (
                        <div key={question.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center mt-1">
                              {qIndex + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 mb-3">{question.question}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {question.options.map((option, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant={idx === question.correct ? "default" : "secondary"}
                                    className={`text-xs justify-start p-2 ${
                                      idx === question.correct 
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + idx)}. {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {quiz.questions.length > 3 && (
                        <div className="text-center py-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            + {quiz.questions.length - 3} questions supplémentaires
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}