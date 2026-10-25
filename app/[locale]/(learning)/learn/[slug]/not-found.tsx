import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/** An unknown lesson, quiz or exam of a course (an unknown course is the site's 404, outside the shell). */
export default function LearningNotFound() {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-8 text-center">
      <SearchX className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-bold">Étape introuvable</h1>
      <p className="text-muted-foreground">
        Cette étape n’existe pas ou n’est plus publiée. Le plan de la formation, à gauche, mène à toutes ses étapes.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard/my-courses">Mon apprentissage</Link>
      </Button>
    </div>
  );
}
