"use client";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { List } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function MobileToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [open, setOpen] = useState(false);
  const { tableOfContents } = useIntlayer("blog-post");

  useEffect(() => {
    const container = document.querySelector("article .mdx-content");
    if (!container) return;

    const elements = Array.from(container.querySelectorAll("h2, h3"))
      .map((element, index) => {
        const id = element.id || `heading-${index}`;
        if (!element.id) element.id = id;
        const rawText = element.textContent || "";
        const cleanText = rawText.replace(/\s*#\s*$/, "").trim();
        return {
          id,
          text: cleanText,
          level: Number(element.tagName.charAt(1)),
        };
      })
      .filter((h) => h.text);

    const frame = requestAnimationFrame(() => setHeadings(elements));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -66%" },
    );

    elements.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border/50 bg-card/60 px-3 py-2">
          <List className="h-4 w-4" />
          {tableOfContents}
          <span className="text-xs text-muted-foreground/60">
            ({headings.length})
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[350px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{tableOfContents}</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                setTimeout(() => {
                  document
                    .getElementById(heading.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 300);
              }}
              className={cn(
                "block py-1.5 px-3 text-sm rounded-md transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                heading.level === 3 && "pl-6 text-xs",
                activeId === heading.id &&
                  "text-primary font-medium bg-primary/5",
              )}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
