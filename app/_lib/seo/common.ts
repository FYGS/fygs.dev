import type { I18nMetadataProps } from "../i18n-metadata";

type IConfigLocales<T> = Required<Record<"fr", T>> & Partial<Record<string, T>>;

/** Section metadata config (without locale — resolved at runtime) */
export type SectionSEOConfig = Omit<I18nMetadataProps, "locale">;

// ─── Common Keywords (appended to every section) ────────────────────────────
export const COMMON_KEYWORDS: (IConfigLocales<string> | string)[] = [
  "FYGS",
  "Fernand SOUALO",
  {
    fr: "développement web",
    en: "web development",
    es: "desarrollo web",
  },
  "TypeScript",
  "React",
  "Next.js",
];
