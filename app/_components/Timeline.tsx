import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  date: string;
  title: string;
  company: string;
  description: string;
  technologies: string[];
  current?: boolean;
}

export const TimelineItem = ({
  date,
  title,
  company,
  description,
  technologies,
  current,
}: TimelineItemProps) => {
  return (
    <div className="relative pl-8 pb-8">
      <div className="absolute left-0 top-0 mt-1.5 h-full w-px bg-border" />
      <div
        className={cn(
          "absolute left-0 top-2 -ml-1.5 h-3 w-3 rounded-full border-2",
          current
            ? "border-primary bg-background"
            : "border-muted-foreground bg-background"
        )}
      />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <time className="text-sm text-muted-foreground">{date}</time>
          {current && (
            <Badge variant="outline" className="text-primary border-primary">
              Current
            </Badge>
          )}
        </div>
        <div className="font-semibold">{title}</div>
        <div className="text-muted-foreground">{company}</div>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Timeline = ({ items }: { items: TimelineItemProps[] }) => {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineItem key={index} {...item} />
      ))}
    </div>
  );
};
