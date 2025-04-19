import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

type Difficulty = "Facile" | "Intermédiaire" | "Difficile" | "Expert";

interface ChallengeHeaderProps {
  title: string;
  difficulty: Difficulty; // Update type to use Difficulty union type
  estimatedTime: string;
  description: string;
  topics: string[];
}

const difficultyColors: Record<Difficulty, string> = {
  Facile: "bg-green-500/10 text-green-500",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500",
  Difficile: "bg-red-500/10 text-red-500",
  Expert: "bg-purple-500/10 text-purple-500",
};

export function ChallengeHeader({
  title,
  difficulty,
  estimatedTime,
  description,
  topics,
}: ChallengeHeaderProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/tech-mastry/coding-challenges"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux défis
      </Link>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={difficultyColors[difficulty]}>
              {difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {estimatedTime}
            </Badge>
          </div>
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
