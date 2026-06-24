import { Users, Star, TrendingUp } from "lucide-react";

interface SocialProofProps {
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
}

export function SocialProof({
  enrollmentCount,
  averageRating,
  reviewCount,
}: SocialProofProps) {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-center gap-8 text-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">{enrollmentCount}+</span>
          <span className="text-sm text-muted-foreground">étudiants</span>
        </div>

        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-bold">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({reviewCount} avis)
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Mis à jour régulièrement
          </span>
        </div>
      </div>
    </section>
  );
}
