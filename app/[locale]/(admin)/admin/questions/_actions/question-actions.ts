"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { answerLessonQuestion, ANSWER_MAX_LENGTH, setQuestionSolved } from "@/lib/curriculum/lesson-questions";
import { communityWriteBlock } from "@/app/actions/community/_rate-limit";

type Result = { success: true } | { success: false; error: string };

const id = z.string().min(1).max(64);

async function author() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") return null;
  return { id: session.user.id, role, name: session.user.name || session.user.email } as const;
}

function refresh(courseSlug: string | null, discussionId: string) {
  revalidatePath("/admin/questions");
  revalidatePath(`/community/discussions/${discussionId}`);
  if (courseSlug) revalidatePath(`/learn/${courseSlug}`, "layout");
}

/** Answers a question asked from a lesson, as the course's team; the learner is notified. */
export async function answerQuestion(discussionId: string, content: string, markSolved: boolean): Promise<Result> {
  try {
    const user = await author();
    if (!user) return { success: false, error: "Vous n'avez pas les permissions pour répondre." };
    const blocked = await communityWriteBlock(user.id);
    if (blocked) {
      return {
        success: false,
        error: /suspend/i.test(blocked) ? "Votre compte est suspendu de la communauté." : "Trop de messages à la suite, réessayez dans un instant.",
      };
    }
    const r = await answerLessonQuestion(
      user,
      id.parse(discussionId),
      z.string().max(ANSWER_MAX_LENGTH + 100).parse(content),
      z.boolean().parse(markSolved),
    );
    if (!r.success) return r;
    refresh(r.courseSlug, discussionId);
    return { success: true };
  } catch {
    return { success: false, error: "La réponse n'a pas pu être envoyée. Réessayez dans un instant." };
  }
}

export async function markQuestionSolved(discussionId: string, solved: boolean): Promise<Result> {
  try {
    const user = await author();
    if (!user) return { success: false, error: "Vous n'avez pas les permissions pour modifier cette question." };
    const r = await setQuestionSolved(user, id.parse(discussionId), z.boolean().parse(solved));
    if (!r.success) return r;
    refresh(r.courseSlug, discussionId);
    return { success: true };
  } catch {
    return { success: false, error: "La question n'a pas pu être mise à jour. Réessayez dans un instant." };
  }
}
