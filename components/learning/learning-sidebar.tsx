"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, FileText, GraduationCap, HelpCircle, Images, PlayCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { itemHref, type OutlineItem } from "@/lib/learning/outline";
import { useLearning } from "./learning-context";
import { useCurrentItem } from "./use-current-item";

interface LearningSidebarProps {
  /** Hidden from view and from the keyboard (collapsed, or closed on a small screen). */
  hidden: boolean;
  /** Called when a link is followed, so a small screen can close the panel. */
  onNavigate: () => void;
  collapsedOnDesktop: boolean;
  /** Open over the page on a small screen: announced as a dialog. */
  modal?: boolean;
}

function ItemIcon({ item, done, current }: { item: OutlineItem; done: boolean; current: boolean }) {
  if (done) return <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  if (current) return <PlayCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
  if (item.kind === "quiz") return <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
  if (item.kind === "exam") return <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

const KIND_LABEL = { lesson: "Leçon", quiz: "Quiz", exam: "Examen final" } as const;

export function LearningSidebar({ hidden, onNavigate, collapsedOnDesktop, modal = false }: LearningSidebarProps) {
  const { outline, courseSlug, openableIds, isDone, progress, mode, hasSupports } = useLearning();
  const currentItem = useCurrentItem();
  const nextId = progress.next?.id;
  const exam = outline.items.find((i) => i.kind === "exam");

  const currentSection = outline.sections.findIndex((s) => s.items.some((i) => i.id === currentItem?.id));
  const [closedSections, setClosedSections] = useState<Record<number, boolean>>({});
  const isOpen = (index: number) => {
    const explicit = closedSections[index];
    if (explicit !== undefined) return !explicit;
    // Until the learner chooses, the section being worked on is open
    return currentSection === -1 ? index === 0 : index === currentSection;
  };

  const renderItem = (item: OutlineItem) => {
    const done = isDone(item);
    const current = currentItem?.id === item.id;
    const openable = openableIds.has(item.id);
    const href = openable ? itemHref(courseSlug, item) : `/formations/${courseSlug}`;
    return (
      <li key={item.id}>
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={current ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md p-2 text-sm transition-colors",
            current ? "bg-primary/10 font-medium text-primary" : "hover:bg-accent/60",
          )}
        >
          <ItemIcon item={item} done={done} current={current} />
          <span className="min-w-0 flex-1 truncate">
            <span className="sr-only">{KIND_LABEL[item.kind]} : </span>
            {item.title}
          </span>
          {!openable && <span className="shrink-0 text-xs text-muted-foreground">Inscrits</span>}
          {item.kind !== "quiz" && item.draft && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Brouillon
            </Badge>
          )}
          {done && <span className="sr-only">(terminé)</span>}
          {!done && !current && item.id === nextId && openable && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Suivant
            </Badge>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      id="learning-sidebar"
      aria-label="Plan de la formation"
      {...(modal ? { role: "dialog", "aria-modal": true } : {})}
      inert={hidden}
      className={cn(
        "fixed bottom-0 left-0 top-14 z-50 w-80 max-w-[85vw] border-r bg-background transition-transform duration-300 ease-in-out",
        // Small screens: slides in over the page. Large screens: docked unless collapsed.
        hidden ? "-translate-x-full" : "translate-x-0",
        !collapsedOnDesktop && "md:translate-x-0",
      )}
    >
      <ScrollArea className="h-full">
        <nav className="space-y-2 p-4">
          {mode === "preview" && (
            <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              Vous voyez les leçons d’aperçu. Le reste du contenu est réservé aux inscrits.
            </p>
          )}
          {outline.sections.map((section, index) => {
            const done = section.items.filter((i) => isDone(i)).length;
            const list = <ul className="space-y-0.5">{section.items.map(renderItem)}</ul>;
            if (!section.module) return <div key="standalone">{list}</div>;
            return (
              <Collapsible
                key={section.module.id}
                open={isOpen(index)}
                onOpenChange={(open) => setClosedSections((prev) => ({ ...prev, [index]: !open }))}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg p-2.5 text-left hover:bg-accent/60">
                  <span className="flex min-w-0 items-center gap-2">
                    {isOpen(index) ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className="truncate text-sm font-medium">{section.module.title}</span>
                  </span>
                  <Badge variant={done === section.items.length ? "default" : "secondary"} className="shrink-0 text-xs">
                    <span className="sr-only">Terminé : </span>
                    {done}/{section.items.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 pl-4">{list}</CollapsibleContent>
              </Collapsible>
            );
          })}
          {exam && (
            <ul className="border-t pt-2">{renderItem(exam)}</ul>
          )}
          {hasSupports && (
            <Link
              href={`/learn/${courseSlug}/supports`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-md border-t p-2 pt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <Images className="h-4 w-4" aria-hidden /> Supports visuels
            </Link>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
