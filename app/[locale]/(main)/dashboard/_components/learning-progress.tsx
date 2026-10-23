import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserCoursesProgressOnce } from "@/lib/progress-summary";

interface LearningProgressProps {
  userId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
  CLOUD: "Cloud",
  AI: "IA",
  DEVOPS: "DevOps",
  PRODUCTIVITY: "Productivité",
};

/** Progress by subject, over the courses the learner is enrolled in (steps done out of steps in total). */
export async function LearningProgress({ userId }: LearningProgressProps) {
  const courses = await getUserCoursesProgressOnce(userId);

  const byCategory = new Map<string, { done: number; total: number }>();
  for (const course of courses) {
    const bucket = byCategory.get(course.category) ?? { done: 0, total: 0 };
    bucket.done += course.done;
    bucket.total += course.total;
    byCategory.set(course.category, bucket);
  }
  const categories = [...byCategory].map(([category, data]) => ({
    name: CATEGORY_LABELS[category] ?? category,
    percent: Math.floor((data.done / data.total) * 100),
    ...data,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression par catégorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Inscrivez-vous à une formation pour voir votre progression.</p>
        ) : (
          categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="text-muted-foreground">
                  {category.done}/{category.total} étapes
                </span>
              </div>
              <Progress value={category.percent} aria-label={`Progression en ${category.name}`} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
