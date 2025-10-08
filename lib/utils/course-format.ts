// Shared course formatting utilities
// Centralizes presentation logic for duration, level labels, and (future) price formatting.

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "Durée variable";
  if (minutes <= 0) return "–";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

const levelMap: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export function formatLevel(level: string | null | undefined): string {
  if (!level) return "";
  return levelMap[level] || level;
}

// Placeholder for future currency/locale aware formatting
export function formatPrice(euros: number, locale: string = "fr-FR", currency: string = "EUR") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(euros);
  } catch {
    return `${euros}€`;
  }
}
