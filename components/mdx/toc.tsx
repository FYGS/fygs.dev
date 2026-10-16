"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useIntlayer } from "next-intlayer";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  className?: string;
}

export function TableOfContents({ className }: TOCProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const { tableOfContents } = useIntlayer("blog-post");

  useEffect(() => {
    // Only grab headings inside the article's mdx-content container
    const container = document.querySelector("article .mdx-content");
    if (!container) return;

    const elements = Array.from(container.querySelectorAll("h2, h3, h4"))
      .map((element, index) => {
        const id = element.id || `heading-${index}`;
        if (!element.id) {
          element.id = id;
        }
        // Strip trailing "#" added by HeadingAnchor component
        const rawText = element.textContent || "";
        const cleanText = rawText.replace(/\s*#\s*$/, "").trim();
        return {
          id,
          text: cleanText,
          level: Number(element.tagName.charAt(1)),
        };
      })
      .filter((heading) => heading.text); // Filter out empty headings

    const frame = requestAnimationFrame(() => setHeadings(elements));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%" },
    );

    elements.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <nav className={cn("relative space-y-2 text-sm", className)}>
      <p className="font-medium mb-4">{tableOfContents}</p>
      <ul className="space-y-2 relative">
        {/* Active Section Indicator */}
        {activeId && (
          <div
            className="absolute left-0 w-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{
              top: headings.findIndex((h) => h.id === activeId) * 28 + "px",
              height: "24px",
              opacity: activeId ? 1 : 0,
            }}
          />
        )}

        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                "pl-4 inline-block w-full transition-colors duration-300",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/50 rounded",
                activeId === heading.id && "text-primary font-medium",
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
