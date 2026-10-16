"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getBadgeVariant } from "./lib";
import type { TopicSection as TopicSectionData } from "./types";

interface TopicSectionProps {
  section: TopicSectionData;
  pathname: string | null;
  expandedSection: string | null;
  setExpandedSection: (title: string | null) => void;
}

export function TopicSection({
  section,
  pathname,
  expandedSection,
  setExpandedSection,
}: TopicSectionProps) {
  return (
    <div className="px-3">
      <button
        onClick={() =>
          setExpandedSection(
            expandedSection === section.title ? null : section.title,
          )
        }
        className="group mb-2 flex w-full items-center justify-between px-3 text-left"
      >
        <div className="flex items-center gap-3">
          <section.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
            {section.title}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-all group-hover:text-primary",
            expandedSection === section.title && "rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {expandedSection === section.title && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 px-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={getBadgeVariant(item.badge) as any}
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeItem"
                        className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs opacity-80">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
