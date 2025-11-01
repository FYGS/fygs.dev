"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intlayer";
import { cn } from "@/lib/utils";
import {
  getLocaleDisplayName,
  getLocaleFlag,
  type Locale,
} from "@/lib/locale-utils";

interface LocaleBadgeProps {
  locale?: Locale;
  showFlag?: boolean;
  showName?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function LocaleBadge({
  locale,
  showFlag = true,
  showName = true,
  variant = "default",
  size = "md",
  animated = false,
  className,
}: LocaleBadgeProps) {
  const { locale: currentLocale } = useLocale();
  const displayLocale = locale || (currentLocale as Locale);

  const variantClasses = {
    default: "bg-primary text-primary-foreground border-transparent",
    outline: "bg-transparent text-foreground border-border",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    ghost: "bg-transparent text-foreground border-transparent hover:bg-accent",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const content = (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        "transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {showFlag && <span>{getLocaleFlag(displayLocale)}</span>}
      {showName && <span>{getLocaleDisplayName(displayLocale)}</span>}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

interface LocaleIndicatorProps {
  locale?: Locale;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  pulse?: boolean;
  className?: string;
}

export function LocaleIndicator({
  locale,
  position = "top-right",
  pulse = false,
  className,
}: LocaleIndicatorProps) {
  const { locale: currentLocale } = useLocale();
  const displayLocale = locale || (currentLocale as Locale);

  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn("absolute z-10", positionClasses[position], className)}
    >
      <div className="relative">
        <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-base shadow-lg">
          {getLocaleFlag(displayLocale)}
        </div>
        {pulse && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-primary"
          />
        )}
      </div>
    </motion.div>
  );
}

interface LocaleTagProps {
  locales: Locale[];
  maxDisplay?: number;
  size?: "sm" | "md";
  className?: string;
}

export function LocaleTag({
  locales,
  maxDisplay = 3,
  size = "sm",
  className,
}: LocaleTagProps) {
  const displayLocales = locales.slice(0, maxDisplay);
  const remaining = locales.length - maxDisplay;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayLocales.map((locale, index) => (
        <motion.div
          key={locale}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <LocaleBadge
            locale={locale}
            showName={false}
            variant="outline"
            size={size}
          />
        </motion.div>
      ))}
      {remaining > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: displayLocales.length * 0.05 }}
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "bg-muted text-muted-foreground font-medium",
            size === "sm" ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"
          )}
        >
          +{remaining}
        </motion.span>
      )}
    </div>
  );
}
