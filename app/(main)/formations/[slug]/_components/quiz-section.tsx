"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Award, ChevronRight } from 'lucide-react';
import { SerializedCourse } from '../types';

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

interface QuizSectionProps {
  course: SerializedCourse;
  initialQuizzes: Quiz[];
}

const QuizSection: React.FC<QuizSectionProps> = ({ course, initialQuizzes }) => {
 const [currentModule, setCurrentModule] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState<Record<number, boolean>>({});

  // In a real implementation, this would come from the API
  const quizData = initialQuizzes;

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [`${currentModule}-${questionIndex}`]: answerIndex
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
    setQuizCompleted({
      ...quizCompleted,
      [currentModule]: true
    });
  };

  const calculateScore = () => {
    let correct = 0;
    quizData[currentModule].questions.forEach((q, index) => {
      if (selectedAnswers[`${currentModule}-${index}`] === q.correct) {
        correct++;
      }
    });
    return correct;
 };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
 };

  const nextModule = () => {
    if (currentModule < quizData.length - 1) {
      setCurrentModule(currentModule + 1);
      resetQuiz();
    }
  };

  if (!quizData || quizData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun quiz disponible pour cette formation.</p>
        </div>
      </div>
    );
  }

  const currentQuiz = quizData[currentModule];
  const calculatedScore = showResults ? calculateScore() : 0;
  const percentage = showResults ? Math.round((calculatedScore / currentQuiz.questions.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{course.title}</h2>
        <p className="text-indigo-100 mt-1">Quiz Interactif - Testez vos connaissances</p>
      </div>

      {/* Module Selection */}
      <div className="p-6 bg-gray-50 border-b">
        <h3 className="font-semibold text-gray-700 mb-3">Sélectionnez un module :</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {quizData.map((quiz, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentModule(index);
                resetQuiz();
              }}
              className={`p-3 rounded-lg text-sm font-medium transition-all relative ${
                currentModule === index
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {quiz.title}
              {quizCompleted[index] && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {!showResults ? (
        /* Quiz Questions */
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-indigo-900">{currentQuiz.title}</h3>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-semibold">
                {Object.keys(selectedAnswers).filter(key => key.startsWith(`${currentModule}-`)).length} / {currentQuiz.questions.length} répondues
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(Object.keys(selectedAnswers).filter(key => key.startsWith(`${currentModule}-`)).length / currentQuiz.questions.length) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentQuiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-indigo-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {qIndex + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900">{question.question}</h4>
                </div>

                <div className="space-y-2 ml-11">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[`${currentModule}-${qIndex}`] === oIndex;
                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-50 bg-indigo-50 text-indigo-900 font-medium'
                            : 'border-gray-200 hover:border-indigo-30 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).filter(key => key.startsWith(`${currentModule}-`)).length !== currentQuiz.questions.length}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Soumettre le Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Results */
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-indigo-50 to-purple-500 text-white rounded-full p-6 mb-4">
              <Award size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-90 mb-2">Résultats du Quiz</h3>
            <p className="text-gray-600">{currentQuiz.title}</p>
          </div>

          {/* Score Display */}
          <div className={`rounded-xl p-8 mb-8 text-center ${
            percentage >= 80 ? 'bg-green-50 border-2 border-green-300' :
            percentage >= 60 ? 'bg-yellow-50 border-2 border-yellow-300' :
            'bg-red-50 border-2 border-red-300'
          }`}>
            <div className="text-6xl font-bold mb-2">
              <span className={
                percentage >= 80 ? 'text-green-600' :
                percentage >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }>
                {percentage}%
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {calculatedScore} / {currentQuiz.questions.length} réponses correctes
            </p>
            <p className="text-gray-600">
              {percentage >= 80 ? '🎉 Excellent ! Vous maîtrisez ce module.' :
               percentage >= 60 ? '👍 Bien ! Quelques révisions conseillées.' :
               '📚 Révisez ce module avant de continuer.'}
            </p>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Détail des réponses :</h4>
            {currentQuiz.questions.map((question, qIndex) => {
              const userAnswer = selectedAnswers[`${currentModule}-${qIndex}`];
              const isCorrect = userAnswer === question.correct;

              return (
                <div key={qIndex} className={`border-2 rounded-lg p-6 ${
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0" size={24} />
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-3">{question.question}</h5>
                      
                      {!isCorrect && (
                        <div className="mb-3 p-3 bg-white rounded border-l-4 border-red-400">
                          <p className="text-sm text-gray-600 mb-1">Votre réponse :</p>
                          <p className="text-red-700 font-medium">{question.options[userAnswer]}</p>
                        </div>
                      )}

                      <div className="p-3 bg-white rounded border-l-4 border-green-40">
                        <p className="text-sm text-gray-600 mb-1">Réponse correcte :</p>
                        <p className="text-green-700 font-medium mb-2">{question.options[question.correct]}</p>
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-semibold">💡 Explication : </span>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="flex items-center justify-center gap-2 bg-gray-50 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={20} />
              Refaire ce quiz
            </button>
            {currentModule < quizData.length - 1 && (
              <button
                onClick={nextModule}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Module suivant
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Certificate Message */}
          {percentage >= 80 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                🏆 Félicitations ! Vous avez validé ce module.
              </p>
              <p className="text-gray-700">
                Continuez ainsi pour obtenir votre certification complète.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overall Progress */}
      <div className="p-6 bg-gray-50 border-t">
        <h3 className="font-bold text-gray-900 mb-4">Progression Globale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quizData.map((quiz, index) => (
            <div key={index} className="text-center p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-60 mb-1">Module {index + 1}</p>
              {quizCompleted[index] ? (
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((calculateScore() / quiz.questions.length) * 100)}%
                  </p>
                  <p className="text-xs text-gray-50">
                    {calculateScore()}/{quiz.questions.length}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-400">—</p>
              )}
            </div>
          ))}
        </div>

        {/* Total Score */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Score Global :</span>
            <span className="text-2xl font-bold text-indigo-600">
              {Object.keys(quizCompleted).length} / {quizData.length} modules complétés
            </span>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="p-6 bg-blue-50 border-t border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3 text-lg">💡 Conseils pour réussir :</h3>
        <ul className="space-y-2 text-gray-70">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Prenez le temps de bien lire chaque question et les options</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Révisez les explications des réponses incorrectes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Visez au minimum 80% pour valider un module</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Pratiquez avec les exercices du cours avant de passer le quiz</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QuizSection;