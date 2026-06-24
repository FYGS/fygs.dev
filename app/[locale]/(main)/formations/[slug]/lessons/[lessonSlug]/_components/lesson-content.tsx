import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";

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
    <div className="space-y-8">
      {/* Lesson Header */}
      <div className="space-y-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary border-primary/30"
          >
            Leçon {lesson.order}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(lesson.duration)}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {lesson.title}
        </h1>

        {lesson.description && (
          <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Lesson Content */}
      {lesson.content && (
        <Card className="bg-gradient-to-br from-card via-card to-card/90 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-foreground text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Contenu de la leçon
            </CardTitle>
          </CardHeader>
          <CardContent
            className="mdx-content prose prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-foreground/85 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80
            prose-strong:text-foreground prose-strong:font-semibold
            prose-code:text-emerald-400 prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-transparent prose-pre:p-0
            prose-ul:text-foreground/85 prose-ol:text-foreground/85
            prose-li:text-foreground/85 prose-li:marker:text-primary
            prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:shadow-lg
          "
          >
            <LessonContentRenderer content={lesson.content} />
          </CardContent>
        </Card>
      )}

      {/* Resources Section */}
      <Card className="bg-gradient-to-br from-card via-card to-card/90 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-xl">Ressources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-foreground/85">
            <h4 className="font-semibold mb-3 text-lg text-foreground">
              Dans cette leçon, vous apprendrez :
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li className="text-muted-foreground leading-relaxed">
                Les concepts fondamentaux abordés
              </li>
              <li className="text-muted-foreground leading-relaxed">
                Les bonnes pratiques à retenir
              </li>
              <li className="text-muted-foreground leading-relaxed">
                Les exercices pratiques à réaliser
              </li>
              <li className="text-muted-foreground leading-relaxed">
                Les ressources complémentaires
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed bg-primary/10 border-l-4 border-primary/50 p-4 rounded-r-lg">
              💡 <strong className="text-primary">Conseil :</strong> Prenez des
              notes pendant la vidéo et n&apos;hésitez pas à revenir sur les
              parties importantes. La pratique est essentielle pour maîtriser
              ces concepts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
