"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BookOpen,
  Palette
} from "lucide-react";
import Link from "next/link";

interface TagCardProps {
  tag: {
    id: string;
    name: string;
    color: string;
    courseCount: number;
    publishedCourseCount: number;
    courses: Array<{
      id: string;
      title: string;
      published: boolean;
    }>;
  };
}

export function TagCard({ tag }: TagCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ backgroundColor: tag.color, borderColor: tag.color }}
            />
            <CardTitle className="text-lg">{tag.name}</CardTitle>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/tags/${tag.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/tags/${tag.id}/color`}>
                  <Palette className="mr-2 h-4 w-4" />
                  Changer la couleur
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{tag.courseCount}</div>
            <div className="text-muted-foreground">Formations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{tag.publishedCourseCount}</div>
            <div className="text-muted-foreground">Publiées</div>
          </div>
        </div>

        {/* Course List */}
        {tag.courses.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Formations associées:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tag.courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <Link 
                    href={`/admin/courses/${course.id}`}
                    className="truncate hover:text-blue-600 transition-colors"
                  >
                    {course.title}
                  </Link>
                  {course.published && (
                    <Badge variant="secondary" className="h-4 text-xs">
                      Publié
                    </Badge>
                  )}
                </div>
              ))}
              {tag.courses.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{tag.courses.length - 3} autres...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucune formation associée
          </div>
        )}

        {/* Usage Indicator */}
        <div className="flex items-center justify-center">
          <Badge 
            variant={tag.courseCount > 0 ? "default" : "secondary"}
            style={{ 
              backgroundColor: tag.courseCount > 0 ? tag.color : undefined,
              color: tag.courseCount > 0 ? "white" : undefined 
            }}
          >
            {tag.courseCount > 0 ? "En usage" : "Inutilisé"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}