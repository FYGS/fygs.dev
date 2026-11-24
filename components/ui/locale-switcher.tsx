"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AVAILABLE_LOCALES,
  getLocaleDisplayName,
  getLocaleFlag,
  isTranslatedPath,
  removeLocaleFromPath,
  type Locale,
} from "@/lib/locale-utils";
import { usePathname, useRouter } from "next/navigation";
import { Languages, Check, Loader2 } from "lucide-react";
import { useLocale } from "next-intlayer";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  // The application area exists in French only: there is nothing to switch to there
  const hasTranslations = isTranslatedPath(removeLocaleFromPath(pathname));

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    setSelectedLocale(newLocale);

    // Show loading toast
    const toastId = toast.loading(
      `${getLocaleFlag(newLocale)} Switching to ${getLocaleDisplayName(
        newLocale
      )}...`
    );

    startTransition(() => {
      // Extract the path without the current locale
      const segments = pathname.split("/");
      segments[1] = newLocale; // Replace the locale segment
      const newPath = segments.join("/");

      // Set cookie for persistence
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Navigate to the new locale path
      router.push(newPath);
      router.refresh();

      // Success toast
      setTimeout(() => {
        toast.success(
          `${getLocaleFlag(
            newLocale
          )} Language changed to ${getLocaleDisplayName(newLocale)}`,
          { id: toastId }
        );
        setSelectedLocale(null);
      }, 500);
    });
  };

  if (!hasTranslations) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 relative overflow-hidden",
            "hover:scale-105 transition-transform duration-200",
            isPending && "opacity-70 cursor-wait"
          )}
          disabled={isPending}
        >
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Languages className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.span
              key={currentLocale}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:inline-block"
            >
              {getLocaleFlag(currentLocale as Locale)}{" "}
              {getLocaleDisplayName(currentLocale as Locale)}
            </motion.span>
          </AnimatePresence>

          <span className="sm:hidden text-lg">
            {getLocaleFlag(currentLocale as Locale)}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {AVAILABLE_LOCALES.map((locale, index) => (
          <motion.div
            key={locale}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <DropdownMenuItem
              onClick={() => handleLocaleChange(locale)}
              disabled={isPending}
              className={cn(
                "flex items-center justify-between gap-3 cursor-pointer",
                "hover:bg-accent transition-colors duration-150",
                currentLocale === locale && "bg-accent/50",
                isPending && "opacity-50 cursor-wait"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{getLocaleFlag(locale)}</span>
                <span className="font-medium">
                  {getLocaleDisplayName(locale)}
                </span>
              </span>

              {currentLocale === locale && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}

              {selectedLocale === locale && isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
