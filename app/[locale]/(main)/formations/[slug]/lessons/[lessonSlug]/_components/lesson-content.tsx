import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, FileText } from "lucide-react";
import { mdxComponents } from "@/app/_lib/mdx-components";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

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
      <div className="space-y-4 pb-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            Leçon {lesson.order}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(lesson.duration)}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          {lesson.title}
        </h1>

        {lesson.description && (
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Lesson Content */}
      {lesson.content && (
        <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/90 border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-white text-xl">
              <FileText className="h-5 w-5 text-blue-400" />
              Contenu de la leçon
            </CardTitle>
          </CardHeader>
          <CardContent
            className="mdx-content prose prose-invert prose-slate max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-200 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-emerald-400 prose-code:bg-gray-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-transparent prose-pre:p-0
            prose-ul:text-gray-200 prose-ol:text-gray-200
            prose-li:text-gray-200 prose-li:marker:text-blue-400
            prose-blockquote:border-blue-500/50 prose-blockquote:text-gray-300
            prose-img:rounded-lg prose-img:shadow-lg
          "
          >
            <MDXRemote
              source={lesson.content}
              components={mdxComponents as any}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Resources Section */}
      <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/90 border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-xl">Ressources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-200">
            <h4 className="font-semibold mb-3 text-lg text-white">
              Dans cette leçon, vous apprendrez :
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li className="text-gray-300 leading-relaxed">
                Les concepts fondamentaux abordés
              </li>
              <li className="text-gray-300 leading-relaxed">
                Les bonnes pratiques à retenir
              </li>
              <li className="text-gray-300 leading-relaxed">
                Les exercices pratiques à réaliser
              </li>
              <li className="text-gray-300 leading-relaxed">
                Les ressources complémentaires
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400 leading-relaxed bg-blue-500/10 border-l-4 border-blue-500/50 p-4 rounded-r-lg">
              💡 <strong className="text-blue-400">Conseil :</strong> Prenez des
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
