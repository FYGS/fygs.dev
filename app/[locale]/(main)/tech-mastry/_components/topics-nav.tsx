"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Book } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { topics } from "./topics-nav/topics";
import { TopicSection } from "./topics-nav/topic-section";

// Re-exported for consumers of the navigation data (search index)
export { topics };

export function TopicsNav() {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="px-3">
        <Link
          href="/tech-mastry"
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
            pathname === "/tech-mastry" ? "bg-accent" : "transparent",
          )}
        >
          <Book className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="flex-1">Introduction</span>
          {pathname === "/tech-mastry" && (
            <motion.div
              layoutId="activeSection"
              className="h-1 w-1 rounded-full bg-primary"
            />
          )}
        </Link>
      </div>

      {topics.map((section) => (
        <TopicSection
          key={section.title}
          section={section}
          pathname={pathname}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        />
      ))}
    </div>
  );
}
