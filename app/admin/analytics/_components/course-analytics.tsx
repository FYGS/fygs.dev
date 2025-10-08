"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Star, 
  Euro,
  TrendingUp,
  ExternalLink,
  Award
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: number;
  level: string;
  category: string;
  enrollmentCount: number;
  averageRating: number;
  totalRevenue: number;
}

interface CourseAnalyticsProps {
  courses: Course[];
}

export function CourseAnalytics({ courses }: CourseAnalyticsProps) {
  const formatLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé',
      'EXPERT': 'Expert',
    };
    return levelMap[level] || level;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'EXPERT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'JAVASCRIPT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'TYPESCRIPT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'FRONTEND': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'BACKEND': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'FULLSTACK': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'AI': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'CLOUD': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // Calculer les métriques globales
  const totalRevenue = courses.reduce((sum, course) => sum + course.totalRevenue, 0);
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
  const avgRating = courses.length > 0 
    ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Performance des cours
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">
              Gérer les cours
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques globales */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalRevenue.toLocaleString()}€
              </div>
              <div className="text-xs text-muted-foreground">Revenus totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalEnrollments}
              </div>
              <div className="text-xs text-muted-foreground">Inscriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-current" />
                {avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Note moyenne</div>
            </div>
          </div>

          {/* Top courses */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top 5 des cours
            </h4>
            
            <div className="space-y-3">
              {courses.slice(0, 5).map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Ranking */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-bold flex items-center justify-center">
                    #{index + 1}
                  </div>

                  {/* Course info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-sm leading-tight line-clamp-1">
                        {course.title}
                      </h5>
                      <div className="flex gap-1">
                        <Badge className={getLevelColor(course.level)}>
                          {formatLevel(course.level)}
                        </Badge>
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{course.enrollmentCount} inscrits</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span>{course.totalRevenue.toLocaleString()}€</span>
                      </div>
                      
                      {course.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{course.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>{((course.totalRevenue / totalRevenue) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Cours le plus rentable: {courses[0]?.title}</p>
                <p>• Catégorie populaire: {Object.entries(courses.reduce((acc, course) => {
                  acc[course.category] = (acc[course.category] || 0) + course.enrollmentCount;
                  return acc;
                }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</p>
                <p>• Taux de satisfaction: {avgRating > 4.5 ? 'Excellent' : avgRating > 4 ? 'Très bon' : 'Bon'}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
