"use client";

import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "next-intlayer";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LABELS = {
  fr: { show: "Afficher le mot de passe", hide: "Masquer le mot de passe" },
  en: { show: "Show password", hide: "Hide password" },
  es: { show: "Mostrar contraseña", hide: "Ocultar contraseña" },
} as const;

/** Icon button revealing/hiding a password field, with a localized accessible name. */
export function PasswordToggle({
  visible,
  onToggle,
  disabled,
  className,
}: {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();
  const labels = LABELS[(locale in LABELS ? locale : "fr") as keyof typeof LABELS];
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
        className,
      )}
      onClick={onToggle}
      disabled={disabled}
      aria-label={visible ? labels.hide : labels.show}
    >
      {visible ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
