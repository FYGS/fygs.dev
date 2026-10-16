const LABELS = {
  fr: "Aller au contenu principal",
  en: "Skip to main content",
  es: "Saltar al contenido principal",
} as const;

export const MAIN_CONTENT_ID = "main-content";

/** First focusable element of every page: lets keyboard users bypass the header (WCAG 2.4.1). */
export function SkipLink({ locale }: { locale: string }) {
  const label = LABELS[(locale in LABELS ? locale : "fr") as keyof typeof LABELS];
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-ring"
    >
      {label}
    </a>
  );
}
