"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  Star,
  Euro,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: number;
  enrollmentCount: number;
  averageRating: number;
  level: string;
  category: string;
}

interface PopularCoursesProps {
  courses: Course[];
}

export function PopularCourses({ courses }: PopularCoursesProps) {
  const formatLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      BEGINNER: "Débutant",
      INTERMEDIATE: "Intermédiaire",
      ADVANCED: "Avancé",
      EXPERT: "Expert",
    };
    return levelMap[level] || level;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-900 text-green-300';
      case 'INTERMEDIATE':
        return 'bg-blue-90 text-blue-300';
      case 'ADVANCED':
        return 'bg-orange-90 text-orange-300';
      case 'EXPERT':
        return 'bg-red-90 text-red-300';
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cours populaires
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">
              Voir tout
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px] w-full rounded-md">
          <div className="space-y-4 p-4">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun cours disponible</p>
              </div>
            ) : (
              courses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Ranking */}
                  <div className="shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white font-bold">
                        #{index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2">
                        {course.title}
                      </h4>
                      <Badge className={getLevelColor(course.level)}>
                        {formatLevel(course.level)}
                      </Badge>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{course.enrollmentCount} inscrits</span>
                      </div>

                      {course.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-40 text-yellow-400" />
                          <span>{course.averageRating.toFixed(1)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        <span>{course.price}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`} aria-label={`Gérer la formation ${course.title}`}>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
