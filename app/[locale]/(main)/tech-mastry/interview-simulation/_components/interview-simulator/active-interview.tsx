"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Lightbulb,
  MessageSquare,
  Mic,
  MicOff,
  Target,
  Trophy,
  Video,
  VideoOff,
} from "lucide-react";
import { difficultyLabels, formatTime } from "./lib";
import type { InterviewSession, Question } from "./types";

interface ActiveInterviewProps {
  interviewSession: InterviewSession | null;
  currentQuestion: Question | null;
  timeRemaining: number;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleRecording: () => void;
  prevQuestion: () => void;
  nextQuestion: () => void;
}

export function ActiveInterview({
  interviewSession,
  currentQuestion,
  timeRemaining,
  userAnswer,
  setUserAnswer,
  isAudioOn,
  isVideoOn,
  isRecording,
  toggleAudio,
  toggleVideo,
  toggleRecording,
  prevQuestion,
  nextQuestion,
}: ActiveInterviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-xl bg-background/80 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>
                  {interviewSession?.title || "Session d'entretien"}
                </span>
              </CardTitle>
              <CardDescription>
                Question {(interviewSession?.currentQuestionIndex ?? 0) + 1}{" "}
                sur {interviewSession?.questions.length}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <Badge variant="outline">
                {currentQuestion
                  ? (difficultyLabels[currentQuestion.difficulty] ??
                    currentQuestion.difficulty)
                  : undefined}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">Question</span>
              </div>
              <h3 className="text-lg font-medium">
                {currentQuestion?.question}
              </h3>

              {currentQuestion?.hints &&
                currentQuestion.hints.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Indices</span>
                    </div>
                    <div className="space-y-2">
                      {currentQuestion.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                          <p>{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Votre réponse</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Saisissez votre réponse
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudio}
                    >
                      {isAudioOn ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <VideoOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRecording}
                    >
                      {isRecording ? (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span>Arrêter</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          <span>Enregistrer</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Saisissez votre réponse ici..."
                  className="w-full min-h-[200px] p-4 font-mono text-sm resize-none focus:outline-hidden bg-background/50"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={interviewSession?.currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserAnswer("");
                    if (
                      currentQuestion?.hints &&
                      currentQuestion.hints.length > 0
                    ) {
                      // Show first hint if available
                      toast.success("Indice révélé", {
                        description: currentQuestion.hints[0],
                      });
                    }
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Indice
                </Button>

                <Button onClick={nextQuestion} className="gap-2">
                  {interviewSession?.currentQuestionIndex ===
                  (interviewSession?.questions.length ?? 0) - 1 ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      Terminer l&apos;entretien
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Question suivante
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Progress
                value={
                  ((interviewSession?.currentQuestionIndex ?? 0) * 100) /
                  (interviewSession?.questions.length ?? 1)
                }
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {(interviewSession?.currentQuestionIndex ?? 0) + 1} sur{" "}
                {interviewSession?.questions.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
