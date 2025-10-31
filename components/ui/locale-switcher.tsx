"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AVAILABLE_LOCALES,
  getLocaleDisplayName,
  getLocaleFlag,
  type Locale,
} from "@/lib/locale-utils";
import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLocale } from "next-intlayer";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();

  const handleLocaleChange = (newLocale: Locale) => {
    // Extract the path without the current locale
    const segments = pathname.split("/");
    segments[1] = newLocale; // Replace the locale segment
    const newPath = segments.join("/");

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate to the new locale path
    router.push(newPath);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {getLocaleFlag(currentLocale as Locale)}{" "}
            {getLocaleDisplayName(currentLocale as Locale)}
          </span>
          <span className="sm:hidden">
            {getLocaleFlag(currentLocale as Locale)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {AVAILABLE_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            <span className="flex items-center gap-2">
              {getLocaleFlag(locale)} {getLocaleDisplayName(locale)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
