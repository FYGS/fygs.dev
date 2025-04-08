import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define Category type and make it available for export
export type Category =
  | "Soft Skills"
  | "Technique"
  | "Organisation"
  | "Carrière";

export interface PracticeHeaderProps {
  title: string;
  category: Category; // This enforces the category must be one of the defined values
  description: string;
  topics: string[];
}

const categoryColors: Record<Category, string> = {
  "Soft Skills": "bg-blue-500/10 text-blue-500",
  Technique: "bg-green-500/10 text-green-500",
  Organisation: "bg-yellow-500/10 text-yellow-500",
  Carrière: "bg-purple-500/10 text-purple-500",
};

export function PracticeHeader({
  title,
  category,
  description,
  topics,
}: PracticeHeaderProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/interview-prep/best-practices"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux meilleures pratiques
      </Link>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <Badge variant="secondary" className={categoryColors[category]}>
            {category}
          </Badge>
        </div>

        <p className="text-xl text-muted-foreground">{description}</p>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
