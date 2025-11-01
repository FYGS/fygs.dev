"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Globe, Check, Loader2, Info } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intlayer";
import { toast } from "sonner";
import {
  AVAILABLE_LOCALES,
  getLocaleDisplayName,
  getLocaleFlag,
  type Locale,
} from "@/lib/locale-utils";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function LocalePreferences() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    currentLocale as Locale
  );
  const [autoDetect, setAutoDetect] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
  };

  const handleSave = () => {
    startTransition(() => {
      const segments = pathname.split("/");
      segments[1] = selectedLocale;
      const newPath = segments.join("/");

      document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;

      if (autoDetect) {
        document.cookie = `LOCALE_AUTO_DETECT=true; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        document.cookie = `LOCALE_AUTO_DETECT=; path=/; max-age=0; SameSite=Lax`;
      }

      toast.success(
        `${getLocaleFlag(selectedLocale)} Preferences saved successfully`
      );

      router.push(newPath);
      router.refresh();
    });
  };

  const hasChanges = selectedLocale !== currentLocale;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Language Preferences
        </h2>
        <p className="text-muted-foreground mt-2">
          Customize your language and regional settings
        </p>
      </div>

      {/* Interface Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Interface Language
          </CardTitle>
          <CardDescription>
            Choose the language for menus, buttons, and system messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {AVAILABLE_LOCALES.map((locale, index) => (
              <motion.button
                key={locale}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleLocaleChange(locale)}
                disabled={isPending}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg",
                  "border-2 transition-all duration-200",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  selectedLocale === locale
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <span className="text-3xl">{getLocaleFlag(locale)}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold">
                    {getLocaleDisplayName(locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {locale.toUpperCase()}
                  </p>
                </div>
                {selectedLocale === locale && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>Fine-tune your language experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="auto-detect" className="text-base">
                Automatic Detection
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect language from your browser settings
              </p>
            </div>
            <Switch
              id="auto-detect"
              checked={autoDetect}
              onCheckedChange={setAutoDetect}
              disabled={isPending}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              When enabled, the system will try to match your browser&apos;s
              language settings. Your manual selection will always take
              precedence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasChanges ? "You have unsaved changes" : "All changes saved"}
        </p>
        <Button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          size="lg"
          className="min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
