"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface NavigationIndicatorProps {
  items: ReadonlyArray<{ href: string; label: string }>;
  className?: string;
}

export function NavigationIndicator({
  items,
  className,
}: NavigationIndicatorProps) {
  const pathname = usePathname();
  const currentIndex = items.findIndex((item) => item.href === pathname);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed top-[72px] left-0 right-0 h-0.5 bg-border/50",
        className
      )}
    >
      <motion.div
        className="h-full bg-primary origin-left"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: (currentIndex + 1) / items.length,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      />
      <div className="absolute top-1 flex justify-between w-full px-4 max-w-4xl left-1/2 -translate-x-1/2">
        {items.map((item, index) => (
          <motion.div
            key={item.href}
            className="relative"
            initial={false}
            animate={{
              scale: pathname === item.href ? 1.2 : 1,
            }}
          >
            <div
              className={cn(
                "size-2 rounded-full transition-colors",
                pathname === item.href
                  ? "bg-primary"
                  : index <= currentIndex
                  ? "bg-primary/50"
                  : "bg-border"
              )}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
