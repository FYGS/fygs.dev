import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, FileText } from "lucide-react";

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    duration: number | null;
    order: number;
  };
}

export function LessonContent({ lesson }: LessonContentProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "À venir";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Leçon {lesson.order}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(lesson.duration)}</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          {lesson.title}
        </h1>
        
        {lesson.description && (
          <p className="text-lg text-gray-300 leading-relaxed">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Lesson Content */}
      {lesson.content && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Contenu de la leçon
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <MDXRemote source={lesson.content} />
          </CardContent>
        </Card>
      )}

      {/* Resources Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Ressources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300">
            <h4 className="font-semibold mb-2">Dans cette leçon, vous apprendrez :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Les concepts fondamentaux abordés</li>
              <li>Les bonnes pratiques à retenir</li>
              <li>Les exercices pratiques à réaliser</li>
              <li>Les ressources complémentaires</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              💡 <strong>Conseil :</strong> Prenez des notes pendant la vidéo et n&apos;hésitez pas à 
              revenir sur les parties importantes. La pratique est essentielle pour maîtriser ces concepts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
