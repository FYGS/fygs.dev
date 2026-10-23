"use client";

import { useState, useTransition } from "react";
import { Clock, PenLine, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createNote, deleteNote, updateNote } from "@/app/actions/note-actions";
import { formatTime } from "@/lib/learning/format-time";
import { useLessonSession } from "./lesson-session";

export interface LessonNote {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
}

interface LessonNotesProps {
  lessonId: string;
  initialNotes: LessonNote[];
  /** The lesson has a video: notes can be pinned to the moment being watched. */
  hasVideo: boolean;
}

/** Personal notes. A note taken while watching remembers the moment; clicking it jumps back there. */
export function LessonNotes({ lessonId, initialNotes, hasVideo }: LessonNotesProps) {
  const { getTime, seek } = useLessonSession();
  const [notes, setNotes] = useState(initialNotes);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftTime, setDraftTime] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const startAdding = () => {
    // the moment is fixed when the note is opened, not when it is saved
    setDraftTime(hasVideo ? Math.floor(getTime()) : null);
    setAdding(true);
  };

  const save = () => {
    const content = draft.trim();
    if (!content) return;
    startTransition(async () => {
      const result = await createNote({ lessonId, content, timestamp: draftTime });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => [
        {
          id: result.note.id,
          content: result.note.content,
          timestamp: result.note.timestamp,
          createdAt: new Date(result.note.createdAt).toISOString(),
        },
        ...prev,
      ]);
      setDraft("");
      setAdding(false);
    });
  };

  const saveEdit = (id: string) => {
    const content = editDraft.trim();
    if (!content) return;
    startTransition(async () => {
      const result = await updateNote(id, content);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
      setEditingId(null);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteNote(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
    });
  };

  return (
    <section aria-label="Mes notes" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Mes notes ({notes.length})</h3>
        <Button variant="outline" size="sm" onClick={startAdding} disabled={adding}>
          <Plus className="mr-1 h-4 w-4" aria-hidden /> Ajouter une note
        </Button>
      </div>

      {adding && (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Texte de la note"
            placeholder="Ce que vous voulez retenir…"
            className="min-h-20 resize-none text-sm"
            maxLength={5000}
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {draftTime !== null && (
                <>
                  <Clock className="h-3 w-3" aria-hidden /> à {formatTime(draftTime)}
                </>
              )}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                }}
              >
                Annuler
              </Button>
              <Button size="sm" onClick={save} disabled={!draft.trim() || pending}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="space-y-2 rounded-md border p-3 text-sm">
            {editingId === note.id ? (
              <>
                <Textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  aria-label="Modifier la note"
                  className="min-h-16 resize-none text-sm"
                  maxLength={5000}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                    <X className="mr-1 h-3 w-3" aria-hidden /> Annuler
                  </Button>
                  <Button size="sm" onClick={() => saveEdit(note.id)} disabled={pending || !editDraft.trim()}>
                    Mettre à jour
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between">
                  {note.timestamp !== null && hasVideo ? (
                    <button
                      type="button"
                      onClick={() => seek(note.timestamp!)}
                      className="flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                    >
                      <Clock className="h-3 w-3" aria-hidden /> Aller à {formatTime(note.timestamp)}
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Modifier la note"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditDraft(note.content);
                      }}
                    >
                      <PenLine className="h-3 w-3" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      aria-label="Supprimer la note"
                      onClick={() => remove(note.id)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {notes.length === 0 && !adding && (
        <p className="py-4 text-center text-sm text-muted-foreground">Aucune note pour cette leçon.</p>
      )}
    </section>
  );
}
