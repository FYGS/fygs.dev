import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, Star } from "lucide-react";

type Level = "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";

export interface Resource {
  title: string;
  author: string;
  description: string;
  level: Level;
  url?: string;
  tags: string[];
  recommended?: boolean;
}

const levelColors: Record<Level, string> = {
  "Débutant": "bg-green-500/10 text-green-500 border-green-500/20",
  "Intermédiaire": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Avancé": "bg-red-500/10 text-red-500 border-red-500/20",
  "Tous niveaux": "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const Wrapper = resource.url ? "a" : "div";
  const wrapperProps = resource.url
    ? { href: resource.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper {...wrapperProps} className="block group">
      <Card
        className={cn(
          "p-5 h-full space-y-3 transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
          "border border-border/40 bg-background/80 backdrop-blur-sm",
          resource.recommended && "ring-1 ring-primary/20"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {resource.recommended && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
              )}
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {resource.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{resource.author}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className={levelColors[resource.level]}>
              {resource.level}
            </Badge>
            {resource.url && (
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs px-2 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </Wrapper>
  );
}
