"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLessonAccess } from "@/lib/learning/lesson-access";

/** Personal notes on a lesson. Anyone who may open the lesson keeps notes on it, the course's author included. */

const content = z.string().trim().min(1, "La note est vide").max(5000, "Une note fait au plus 5 000 caractères");
const noteSchema = z.object({
  lessonId: z.string().min(1).max(64),
  content,
  timestamp: z.number().int().nonnegative().max(24 * 3600).nullable(),
});

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ? { id: session.user.id, role: session.user.role } : null;
}

export async function createNote(input: z.infer<typeof noteSchema>) {
  const user = await currentUser();
  if (!user) return { error: "Connectez-vous pour prendre des notes" };

  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Note invalide" };

  // A note belongs to a lesson the learner can open
  const access = await getLessonAccess(user, parsed.data.lessonId);
  if (!access?.canOpen) return { error: "Cette leçon ne vous est pas ouverte" };

  const note = await db.lessonNote.create({
    data: {
      userId: user.id,
      lessonId: parsed.data.lessonId,
      content: parsed.data.content,
      timestamp: parsed.data.timestamp,
    },
  });
  return { note };
}

export async function updateNote(noteId: string, text: string) {
  const user = await currentUser();
  if (!user) return { error: "Connectez-vous pour modifier vos notes" };

  const parsed = content.safeParse(text);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Note invalide" };

  const existing = await db.lessonNote.findUnique({ where: { id: noteId }, select: { userId: true } });
  if (!existing || existing.userId !== user.id) return { error: "Note introuvable" };

  const note = await db.lessonNote.update({ where: { id: noteId }, data: { content: parsed.data } });
  return { note };
}

export async function deleteNote(noteId: string) {
  const user = await currentUser();
  if (!user) return { error: "Connectez-vous pour modifier vos notes" };

  const existing = await db.lessonNote.findUnique({ where: { id: noteId }, select: { userId: true } });
  if (!existing || existing.userId !== user.id) return { error: "Note introuvable" };

  await db.lessonNote.delete({ where: { id: noteId } });
  return { success: true };
}
