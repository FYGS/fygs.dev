"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import {
  AVAILABLE_LOCALES,
  getLocaleDisplayName,
  getLocaleFlag,
  type Locale,
} from "@/lib/locale-utils";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intlayer";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LOCALE_SELECTED_COOKIE = "locale_selected";

export function LocaleSelectorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();

  useEffect(() => {
    // Check if user has already selected a locale
    const hasSelected = document.cookie
      .split("; ")
      .find((row) => row.startsWith(LOCALE_SELECTED_COOKIE));

    if (!hasSelected) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocaleSelect = (locale: Locale) => {
    setSelectedLocale(locale);

    const segments = pathname.split("/");
    segments[1] = locale;
    const newPath = segments.join("/");

    // Set both cookies
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `${LOCALE_SELECTED_COOKIE}=true; path=/; max-age=31536000; SameSite=Lax`;

    // Smooth transition before closing
    setTimeout(() => {
      router.push(newPath);
      router.refresh();
      setIsOpen(false);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Globe className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-2xl text-center">
            Choose Your Language
          </DialogTitle>
          <DialogDescription className="text-center">
            Select your preferred language to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {AVAILABLE_LOCALES.map((locale, index) => (
            <motion.button
              key={locale}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLocaleSelect(locale)}
              disabled={selectedLocale !== null}
              className={cn(
                "group relative flex items-center gap-4 px-6 py-4 rounded-lg",
                "border-2 transition-all duration-200",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                selectedLocale === locale
                  ? "border-primary bg-primary/10"
                  : "border-border"
              )}
            >
              <span className="text-4xl">{getLocaleFlag(locale)}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">
                  {getLocaleDisplayName(locale)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {locale.toUpperCase()}
                </p>
              </div>
              <AnimatePresence>
                {selectedLocale === locale && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-6 h-6 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
              {currentLocale === locale && !selectedLocale && (
                <span className="text-xs text-muted-foreground">Current</span>
              )}
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-center text-muted-foreground"
        >
          You can change this later in settings
        </motion.p>
      </DialogContent>
    </Dialog>
  );
}
