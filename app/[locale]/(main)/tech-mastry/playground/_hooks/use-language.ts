import { useCallback } from "react";
import { languageDefaults, type Language } from "../_config/languages";
import { useEditorStore } from "../_stores/editor-store";

type LanguageDefaults = typeof languageDefaults;
type LanguageKey = keyof Omit<LanguageDefaults, "defaultLanguage">;

export function useLanguage() {
  const { language, setLanguage, setCode } = useEditorStore();

  // Get the language from the active file if available
  const currentLanguage = language;

  // Note: The files array doesn't have direct indexing by ID
  // We would need to find the file by ID in the array
  // This is a simplified version

  const changeLanguage = useCallback(
    (newLang: Language) => {
      setLanguage(newLang);
      if (isValidLanguageKey(newLang)) {
        setCode(languageDefaults[newLang].code);
      } else {
        setCode(""); // Fallback to empty string
      }
    },
    [setLanguage, setCode]
  );

  // Type guard to ensure language key is valid
  function isValidLanguageKey(key: string): key is LanguageKey {
    return (
      key in languageDefaults &&
      key !== "defaultLanguage" &&
      typeof languageDefaults[key as LanguageKey] === "object"
    );
  }

  return { language: currentLanguage, changeLanguage };
}
