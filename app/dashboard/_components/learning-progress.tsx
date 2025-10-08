import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";

interface LearningProgressProps {
  userId: string;
}

export async function LearningProgress({ userId }: LearningProgressProps) {
  // Use repository for progress (still fetch categories via join to avoid extra queries)
  const progress = await db.progress.findMany({
    where: { userId },
    select: { completed: true, lesson: { select: { course: { select: { category: true } } } } }
  });

  const progressByCategory = progress.reduce((acc, p) => {
    const category = p.lesson.course.category;
    const bucket = acc[category] || { total: 0, completed: 0 };
    bucket.total += 1;
    if (p.completed) bucket.completed += 1;
    acc[category] = bucket;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

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

  const categories = Object.entries(progressByCategory).map(([category, data]) => ({
    name: CATEGORY_LABELS[category] || category,
    progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    completed: data.completed,
    total: data.total,
  }));

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Commencez une formation pour voir votre progression.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression par catégorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground">
                {category.completed}/{category.total} leçons
              </span>
            </div>
            <Progress value={category.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
