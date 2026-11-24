"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enrollInPathAction } from "@/app/[locale]/(main)/parcours/_actions/path-enrollment";

/**
 * The one call to action of a path page. Visitor: sign in first. Not enrolled: start (enrols in the
 * path and in the courses the learner may take). Enrolled: continue where the next course left off.
 */
export function PathEnrollButton({
  pathId,
  slug,
  signedIn,
  enrolled,
  continueHref,
}: {
  pathId: string;
  slug: string;
  signedIn: boolean;
  enrolled: boolean;
  /** Where "Continuer" goes; `null` when there is nothing left to do */
  continueHref: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [needsAccess, setNeedsAccess] = useState<{ slug: string; title: string; optional: boolean }[]>([]);

  if (!signedIn) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/parcours/${slug}`)}`}>Se connecter pour commencer</Link>
      </Button>
    );
  }

  if (enrolled && continueHref) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href={continueHref}>Continuer le parcours</Link>
      </Button>
    );
  }
  if (enrolled) return null;

  const start = () =>
    startTransition(async () => {
      const result = await enrollInPathAction(pathId);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      setNeedsAccess(result.needsAccess ?? []);
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={start} disabled={pending}>
        {pending ? "Inscription…" : "Commencer le parcours"}
      </Button>
      {needsAccess.length > 0 && (
        <div role="status" className="rounded-md border p-3 text-sm">
          <p className="font-medium">À débloquer pour avancer :</p>
          <ul className="mt-1 list-disc pl-5">
            {needsAccess.map((course) => (
              <li key={course.slug}>
                <Link href={`/formations/${course.slug}`} className="underline">
                  {course.title}
                </Link>
                {course.optional && " (facultative)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
