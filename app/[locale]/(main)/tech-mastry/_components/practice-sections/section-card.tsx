import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Section } from "./types";

interface SectionCardProps {
  section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <div className="group">
      <Link
        href={section.href}
        className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl block h-full"
      >
        <Card className="p-6 h-[200px] border border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative backdrop-blur-xs bg-background/80 group-hover:bg-linear-to-br group-hover:from-background group-hover:to-primary/5">
          {/* Background glow effect */}
          <div className="absolute -inset-1 bg-linear-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" />

          <div className="flex flex-col h-full justify-between">
            <div className="space-y-3">
              <div
                className={`inline-flex p-3 rounded-xl ${section.bgColor} group-hover:scale-110 transition-transform duration-300`}
                aria-hidden="true"
              >
                <section.icon
                  className={`w-6 h-6 ${section.color}`}
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground/80 transition-colors">
                  {section.description}
                </p>
              </div>
            </div>

            {/* Subtle arrow indicator */}
            <div className="self-end opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <div className="text-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.16667 10H15.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.8333 5L15.8333 10L10.8333 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
