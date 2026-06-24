"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

const noteSchema = z.object({
  lessonId: z.string().min(1),
  content: z.string().min(1).max(5000),
  timestamp: z.number().int().nonnegative().nullable(),
});

export async function createNote(input: z.infer<typeof noteSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" };

  const validated = noteSchema.parse(input);

  const note = await db.lessonNote.create({
    data: {
      userId: session.user.id,
      lessonId: validated.lessonId,
      content: validated.content,
      timestamp: validated.timestamp,
    },
  });

  return { note };
}

export async function updateNote(noteId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" };

  const existing = await db.lessonNote.findUnique({
    where: { id: noteId },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { error: "Note introuvable" };
  }

  const note = await db.lessonNote.update({
    where: { id: noteId },
    data: { content },
  });

  return { note };
}

export async function deleteNote(noteId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" };

  const existing = await db.lessonNote.findUnique({
    where: { id: noteId },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { error: "Note introuvable" };
  }

  await db.lessonNote.delete({ where: { id: noteId } });

  return { success: true };
}

export async function getLessonNotes(lessonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  return db.lessonNote.findMany({
    where: {
      userId: session.user.id,
      lessonId,
    },
    orderBy: { createdAt: "desc" },
  });
}
