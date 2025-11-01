"use client";

import { motion } from "framer-motion";
import { Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleLoadingProps {
  variant?: "page" | "inline" | "overlay";
  message?: string;
  className?: string;
}

export function LocaleLoading({
  variant = "inline",
  message = "Loading...",
  className,
}: LocaleLoadingProps) {
  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-background",
          className
        )}
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Globe className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Preparing your experience
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
          "flex items-center justify-center",
          className
        )}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-card border rounded-lg shadow-lg p-8 space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Globe className="w-6 h-6 text-primary" />
          </motion.div>
          <p className="text-center font-medium">{message}</p>
        </motion.div>
      </motion.div>
    );
  }

  // inline variant
  return (
    <div
      className={cn("flex items-center gap-2 text-muted-foreground", className)}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function LocaleSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="h-12 bg-muted rounded-lg"
        />
      ))}
    </div>
  );
}

export function LocaleTransition({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isLoading ? 0.5 : 1,
        scale: isLoading ? 0.98 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-background/80 backdrop-blur-sm rounded-lg p-4"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
