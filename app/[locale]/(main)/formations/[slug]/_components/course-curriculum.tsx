"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Play,
  Lock,
  CheckCircle,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SerializedLesson, SerializedModule, SerializedQuiz } from "../types";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CourseCurriculumProps {
  modules: SerializedModule[];
  courseSlug: string;
  isEnrolled?: boolean;
  userProgress?: { lessonId: string; completed: boolean }[];
  isAuthenticated?: boolean;
  canPreview?: boolean;
  lastPosition?: { lessonId: string; slug: string } | null;
  nextLesson?: { lessonId: string; slug: string } | null;
  quizzes?: SerializedQuiz[];
}

export function CourseCurriculum({
  modules,
  courseSlug,
  isEnrolled = false,
  userProgress = [],
  isAuthenticated = false,
  canPreview = false,
  quizzes = [],
}: CourseCurriculumProps) {
  // State for collapsible modules - first module open by default
  const [openModules, setOpenModules] = useState<Record<number, boolean>>(
    modules.length > 0 ? { 0: true } : {},
  );

  const toggleModule = (moduleIndex: number) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex],
    }));
  };

  // Get quizzes for a specific module
  // Quiz.moduleId (Int) references Module.order (Int), not Module.id
  const getModuleQuizzes = (moduleOrder: number) => {
    return quizzes.filter((quiz) => quiz.moduleId === moduleOrder);
  };
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "À venir";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  // Calculate total duration and lessons count
  const totalLessons = modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0,
  );
  const totalDuration = modules.reduce((acc, module) => {
    return (
      acc +
      module.lessons.reduce(
        (modAcc, lesson) => modAcc + (lesson.duration || 0),
        0,
      )
    );
  }, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const getLessonStatus = (
    lesson: SerializedLesson,
    allLessons: SerializedLesson[],
    index: number,
  ) => {
    const progress = userProgress.find((p) => p.lessonId === lesson.id);

    if (progress?.completed) {
      return { icon: CheckCircle, color: "text-green-600", accessible: true };
    }

    if (!isAuthenticated) {
      return { icon: Lock, color: "text-muted-foreground", accessible: false };
    }
    if (!isEnrolled) {
      // Allow preview of first lesson if preview flag enabled
      if (index === 0 && canPreview) {
        return {
          icon: Play,
          color: "text-blue-600",
          accessible: true,
          preview: true,
        } as any;
      }
      return { icon: Lock, color: "text-muted-foreground", accessible: false };
    }

    // First lesson is always accessible if enrolled
    if (index === 0) {
      return { icon: Play, color: "text-blue-600", accessible: true };
    }

    // Check if previous lesson is completed
    const previousLesson = allLessons[index - 1];
    const previousProgress = userProgress.find(
      (p) => p.lessonId === previousLesson.id,
    );

    if (previousProgress?.completed) {
      return { icon: Play, color: "text-blue-600", accessible: true };
    }

    return { icon: Lock, color: "text-muted-foreground", accessible: false };
  };

  // Flatten all lessons to check sequential access
  const allLessons = modules.flatMap((module) =>
    [...module.lessons].sort((a, b) => a.order - b.order),
  );

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <span className="text-foreground">Contenu de la formation</span>
          <Badge variant="secondary" className="text-xs">
            {modules.length} modules • {totalLessons} leçons •{" "}
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}min
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {modules.length > 0 ? (
          modules.map((module, moduleIndex) => {
            // Sort lessons by order within the module
            const sortedLessons = [...module.lessons].sort(
              (a, b) => a.order - b.order,
            );
            const isOpen = openModules[moduleIndex];

            return (
              <Collapsible
                key={module.id}
                open={isOpen}
                onOpenChange={() => toggleModule(moduleIndex)}
              >
                <CollapsibleTrigger className="w-full text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-3">
                        <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {moduleIndex + 1}
                        </span>
                        <span className="text-foreground">{module.title}</span>
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {sortedLessons.length} leçons •{" "}
                          {formatDuration(
                            sortedLessons.reduce(
                              (acc, lesson) => acc + (lesson.duration || 0),
                              0,
                            ),
                          )}
                        </Badge>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="border-b border-border last:border-b-0">
                  <div className="p-4 space-y-2 bg-muted/30">
                    {sortedLessons.map((lesson, lessonIndex) => {
                      // Find the position of this lesson in the overall sequence
                      const overallIndex = allLessons.findIndex(
                        (l) => l.id === lesson.id,
                      );
                      const status = getLessonStatus(
                        lesson,
                        allLessons,
                        overallIndex,
                      );

                      const LessonContent = (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors bg-card/50">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                              {lessonIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">
                                {lesson.title}
                              </h4>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(lesson.duration)}</span>
                              <status.icon
                                className={`h-4 w-4 ${status.color}`}
                              />
                            </div>
                          </div>
                        </div>
                      );

                      if (
                        status.accessible &&
                        isAuthenticated &&
                        (isEnrolled || (overallIndex === 0 && canPreview))
                      ) {
                        const lessonHref = isEnrolled
                          ? `/learn/${courseSlug}/lessons/${lesson.slug}`
                          : `/formations/${courseSlug}/lessons/${lesson.slug}?preview=1`;

                        return (
                          <Link
                            key={lesson.id}
                            href={lessonHref}
                            className="block hover:scale-[1.02] transition-transform"
                          >
                            {LessonContent}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={lesson.id}
                          aria-disabled={status.accessible ? undefined : true}
                          className={
                            status.accessible
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-60"
                          }
                        >
                          {LessonContent}
                        </div>
                      );
                    })}

                    {/* Quizzes Section - Display as links at the end of each module */}
                    {isEnrolled &&
                      (() => {
                        const moduleQuizzes = getModuleQuizzes(module.order);

                        return (
                          moduleQuizzes.length > 0 && (
                            <div className="space-y-1">
                              {/* Quizzes */}
                              {moduleQuizzes.map((quiz) => (
                                <Link
                                  key={quiz.id}
                                  href={`/learn/${courseSlug}/quizzes/${quiz.id}`}
                                  className="block hover:scale-[1.02] transition-transform"
                                >
                                  <div className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-violet-950 to-purple-950 border-violet-700 hover:from-violet-900 hover:to-purple-900 transition-colors">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-medium">
                                        <Target className="h-3 w-3" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm text-violet-100">
                                          {quiz.title}
                                        </h4>
                                        <p className="text-xs text-violet-300 mt-1">
                                          Quiz interactif
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-violet-400">
                                        <span>
                                          {quiz.questionCount} questions
                                        </span>
                                        <Play className="h-4 w-4" />
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )
                        );
                      })()}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Le contenu de cette formation sera bientôt disponible.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
