import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.FRENCH,
      Locales.ENGLISH,
      Locales.SPANISH,
      // Vos autres locales
    ],
    requiredLocales: [Locales.FRENCH],
    defaultLocale: Locales.FRENCH,
  },
  // Dictionaries (*.content.ts) are discovered by glob: colocated with their
  // component, or in ./content for the ones shared across pages.
};

export default config;
