"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFileSize } from "@/lib/format-size";
import { lessonResourcePath } from "@/lib/learning/media-paths";
import { LessonNotes, type LessonNote } from "./lesson-notes";
import { LessonQuestions, type LessonQuestion } from "./lesson-questions";

export interface LessonResourceItem {
  id: string;
  title: string;
  url: string;
  kind: "FILE" | "LINK";
  sizeBytes: number | null;
}

interface LessonTabsProps {
  lessonId: string;
  /** The lesson text, rendered on the server; null when the lesson has none. */
  content: ReactNode | null;
  transcript: string | null;
  /** Same-origin download address of the captions file, or null. */
  captionsDownload: string | null;
  /** The video is played by the platform's player: notes can be pinned to a moment of it. */
  timedVideo: boolean;
  notes: LessonNote[];
  resources: LessonResourceItem[];
  questions: LessonQuestion[];
  /** An enrolled learner may ask; a preview visitor reads. */
  canAsk: boolean;
  /** Why the visitor cannot ask, when signed in (not enrolled, or the course's own staff). */
  cannotAskReason?: string;
  /** Notes need an account; `loginHref` brings the visitor back here once signed in. */
  signedIn: boolean;
  loginHref: string;
}

/**
 * Everything around the video, in tabs just under it: the lesson text, the transcript, the resources, the
 * learner's notes and the questions. A note taken while the video is in view keeps the moment it was taken.
 */
export function LessonTabs({
  lessonId,
  content,
  transcript,
  captionsDownload,
  timedVideo,
  notes,
  resources,
  questions,
  canAsk,
  cannotAskReason,
  signedIn,
  loginHref,
}: LessonTabsProps) {
  const hasTranscript = !!transcript?.trim() || !!captionsDownload;
  const first = content ? "content" : hasTranscript ? "transcript" : resources.length > 0 ? "resources" : "notes";

  return (
    <Tabs defaultValue={first} className="space-y-4">
      <TabsList className="h-auto flex-wrap justify-start">
        {content && <TabsTrigger value="content">Leçon</TabsTrigger>}
        {hasTranscript && <TabsTrigger value="transcript">Transcription</TabsTrigger>}
        {resources.length > 0 && <TabsTrigger value="resources">Ressources ({resources.length})</TabsTrigger>}
        <TabsTrigger value="notes">Mes notes{signedIn && notes.length > 0 ? ` (${notes.length})` : ""}</TabsTrigger>
        <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
      </TabsList>

      {content && (
        <TabsContent value="content">
          <div className="mdx-content prose prose-neutral max-w-[70ch] dark:prose-invert prose-headings:font-bold prose-img:rounded-lg prose-pre:bg-transparent prose-pre:p-0">
            {content}
          </div>
        </TabsContent>
      )}

      {hasTranscript && (
        <TabsContent value="transcript" className="space-y-3">
          {transcript?.trim() ? (
            <div className="max-w-[70ch] whitespace-pre-line leading-relaxed">{transcript}</div>
          ) : (
            <p className="text-sm text-muted-foreground">Les sous-titres de la vidéo sont disponibles dans le lecteur.</p>
          )}
          {captionsDownload && (
            <Button asChild variant="outline" size="sm">
              <a href={`${captionsDownload}?download=1`} download>
                <FileText className="mr-2 h-4 w-4" aria-hidden /> Télécharger les sous-titres (.vtt)
              </a>
            </Button>
          )}
        </TabsContent>
      )}

      {resources.length > 0 && (
        <TabsContent value="resources">
          <ul className="divide-y rounded-md border">
            {resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.kind === "FILE" ? lessonResourcePath(r.id) : r.url}
                  {...(r.kind === "FILE" ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                  className="flex items-center gap-3 p-3 text-sm hover:bg-accent/40"
                >
                  {r.kind === "FILE" ? (
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">{r.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {r.kind === "FILE" ? formatFileSize(r.sizeBytes) || "Fichier" : "Lien externe"}
                  </span>
                  {r.kind === "LINK" && <span className="sr-only">(s’ouvre dans un nouvel onglet)</span>}
                </a>
              </li>
            ))}
          </ul>
        </TabsContent>
      )}

      <TabsContent value="notes">
        {signedIn ? (
          <LessonNotes lessonId={lessonId} initialNotes={notes} hasVideo={timedVideo} />
        ) : (
          <SignInPrompt href={loginHref} text="Connectez-vous pour prendre des notes : elles restent liées au moment de la vidéo." />
        )}
      </TabsContent>

      <TabsContent value="questions">
        <LessonQuestions
          lessonId={lessonId}
          questions={questions}
          canAsk={canAsk}
          cannotAskReason={signedIn ? cannotAskReason : null}
        />
        {!signedIn && (
          <div className="mt-3">
            <SignInPrompt href={loginHref} text="Connectez-vous pour poser une question au formateur et aux autres apprenants." />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function SignInPrompt({ href, text }: { href: string; text: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-4 text-sm">
      <p className="text-muted-foreground">{text}</p>
      <Button asChild size="sm" variant="outline">
        <Link href={href}>Se connecter</Link>
      </Button>
    </div>
  );
}
