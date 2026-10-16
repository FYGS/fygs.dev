"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { toAssistantLocale, type AssistantContext } from "@/lib/ai/schema";
import { Bot, Sparkles } from "lucide-react";
import { useIntlayer, useLocale } from "next-intlayer";
import { useCallback, useEffect, useState } from "react";
import { AiChat } from "./ai-chat";
import { useAiChat } from "./use-ai-chat";
import { useBackendMode } from "./use-backend-mode";

export interface LessonAiTutorProps {
  lessonId: string;
  title: string;
  course?: string | null;
  description?: string | null;
  /** Lesson body (Markdown/MDX): only an excerpt is ever sent. */
  content?: string | null;
}

const EXCERPT_CHARS = 2_400;

/** The lesson, reduced to what a tutor needs to anchor its answers. */
export function buildLessonContext({ title, course, description, content }: LessonAiTutorProps): AssistantContext {
  const parts = [description?.trim(), content?.trim().slice(0, EXCERPT_CHARS)].filter(Boolean);
  return {
    surface: "lesson",
    lesson: {
      title: title.slice(0, 300),
      course: course ? course.slice(0, 300) : undefined,
      summary: parts.length ? parts.join("\n\n").slice(0, 3_000) : undefined,
    },
  };
}

/** The site themes itself with a `light` / `dark` class on <html>. */
function useSiteIsLight() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setLight(root.classList.contains("light"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return light;
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return narrow;
}

/**
 * "Ask the AI tutor" on a course lesson: a call-to-action card that opens a chat
 * (side sheet, bottom sheet on small screens) grounded on the lesson. Rendering
 * needs nothing but the props, so it cannot depend on the database.
 */
export function LessonAiTutor(props: LessonAiTutorProps) {
  const t = useIntlayer("ai-assistant");
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const narrow = useIsNarrow();
  const light = useSiteIsLight();

  const { lessonId } = props;
  const getContext = useCallback(() => buildLessonContext(props), [props]);
  const chat = useAiChat({
    scopeKey: `lesson:${lessonId}`,
    surface: "lesson",
    locale: toAssistantLocale(locale),
    getContext,
  });
  const backend = useBackendMode(chat.messages, open);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Bot className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-foreground">{t.lesson.title.value}</p>
            <p className="text-sm text-muted-foreground">{t.empty.lessonDescription.value}</p>
          </div>
        </div>
        <Button type="button" className="shrink-0 gap-2" onClick={() => setOpen(true)} data-testid="lesson-ai-trigger">
          <Sparkles className="h-4 w-4" aria-hidden />
          {t.lesson.trigger.value}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        {/* z-[80]: above the site's fixed theme/help buttons (z-70), which would cover the send button */}
        <SheetContent
          side={narrow ? "bottom" : "right"}
          className="z-[80] flex h-[85vh] flex-col gap-0 p-0 sm:h-full sm:max-w-md md:max-w-md [&>button.absolute]:hidden max-md:rounded-t-xl"
        >
          <SheetTitle className="sr-only">{t.lesson.title.value}</SheetTitle>
          <SheetDescription className="sr-only">{props.title}</SheetDescription>
          <AiChat
            chat={chat}
            variant="lesson"
            light={light}
            backend={backend}
            starterPrompts={t.lesson.prompts.map((p) => p.value)}
            scope={
              <span className="truncate">
                {t.lesson.about.value} : <span className="font-medium text-foreground/80">{props.title}</span>
              </span>
            }
            onClose={() => setOpen(false)}
            idPrefix="lesson-ai"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
