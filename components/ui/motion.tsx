"use client";

import { cn } from "@/lib/utils";
import { MotionProps, motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps extends MotionProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function FadeIn({
  className,
  children,
  delay = 0,
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
