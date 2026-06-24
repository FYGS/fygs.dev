"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StickyNote, Plus, Trash2, Clock, PenLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createNote, updateNote, deleteNote } from "@/app/actions/note-actions";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
}

interface LessonNotesProps {
  lessonId: string;
  initialNotes: Note[];
  currentTimestamp?: number;
  className?: string;
}

export function LessonNotes({
  lessonId,
  initialNotes,
  currentTimestamp,
  className,
}: LessonNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!newContent.trim()) return;

    startTransition(async () => {
      const result = await createNote({
        lessonId,
        content: newContent.trim(),
        timestamp: currentTimestamp ?? null,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setNotes((prev) => [
        {
          id: result.note.id,
          content: result.note.content,
          timestamp: result.note.timestamp,
          createdAt: result.note.createdAt.toISOString
            ? result.note.createdAt.toISOString()
            : String(result.note.createdAt),
        },
        ...prev,
      ]);
      setNewContent("");
      setIsAdding(false);
    });
  };

  const handleUpdate = (noteId: string) => {
    if (!editContent.trim()) return;

    startTransition(async () => {
      const result = await updateNote(noteId, editContent.trim());

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, content: editContent.trim() } : n,
        ),
      );
      setEditingId(null);
      setEditContent("");
    });
  };

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      const result = await deleteNote(noteId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    });
  };

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Notes ({notes.length})</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="p-3 space-y-3">
          {/* New note form */}
          {isAdding && (
            <div className="space-y-2 p-3 rounded-md border bg-muted/30">
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Écrivez votre note..."
                className="min-h-[80px] resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center justify-between">
                {currentTimestamp !== undefined && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(Math.floor(currentTimestamp))}
                  </span>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      setNewContent("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={!newContent.trim() || isPending}
                  >
                    Sauver
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Existing notes */}
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-md border text-sm space-y-2 hover:bg-accent/30 transition-colors"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(note.id)}
                      disabled={isPending}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {note.timestamp !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(note.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                      >
                        <PenLine className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(note.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {notes.length === 0 && !isAdding && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune note pour cette leçon
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
