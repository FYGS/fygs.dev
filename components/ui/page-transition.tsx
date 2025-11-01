"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={cn("min-h-screen", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface LocalePageTransitionProps {
  children: React.ReactNode;
  locale: string;
  className?: string;
}

export function LocalePageTransition({
  children,
  locale,
  className,
}: LocalePageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locale}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}

export function FadeTransition({
  children,
  show,
  className,
}: FadeTransitionProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  show: boolean;
  className?: string;
}

export function SlideTransition({
  children,
  direction = "right",
  show,
  className,
}: SlideTransitionProps) {
  const variants = {
    left: { x: -20 },
    right: { x: 20 },
    up: { y: -20 },
    down: { y: 20 },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, ...variants[direction] }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...variants[direction] }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}

export function ScaleTransition({
  children,
  show,
  className,
}: ScaleTransitionProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
