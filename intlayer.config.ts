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
  // content: {
  //   contentDir: ["./content/locale"]
  // },
};

export default config;
