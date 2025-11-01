"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, X } from "lucide-react";
import {
  AVAILABLE_LOCALES,
  getLocaleDisplayName,
  getLocaleFlag,
  type Locale,
} from "@/lib/locale-utils";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intlayer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FloatingLanguageButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export function FloatingLanguageButton({
  position = "bottom-right",
  className,
}: FloatingLanguageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    toast.success(
      `${getLocaleFlag(newLocale)} Language changed to ${getLocaleDisplayName(
        newLocale
      )}`
    );

    router.push(newPath);
    router.refresh();
    setIsOpen(false);
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 bg-background border rounded-xl shadow-2xl p-2 min-w-[200px]"
          >
            <div className="space-y-1">
              {AVAILABLE_LOCALES.map((locale, index) => (
                <motion.button
                  key={locale}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLocaleChange(locale)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                    "hover:bg-accent transition-colors duration-150",
                    "text-left",
                    currentLocale === locale && "bg-accent"
                  )}
                >
                  <span className="text-2xl">{getLocaleFlag(locale)}</span>
                  <span className="font-medium">
                    {getLocaleDisplayName(locale)}
                  </span>
                  {currentLocale === locale && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Current
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label="Change language"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Languages className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 text-xs">
                {getLocaleFlag(currentLocale as Locale)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
