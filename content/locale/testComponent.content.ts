import { t, type Dictionary } from "intlayer";

const testContent = {
  key: "test",
  content: {
    title: t({
      en: "Internationalization Test Page",
      fr: "Page de test d'internationalisation",
      es: "Página de prueba de internacionalización",
    }),
    description: t({
      en: "This page demonstrates the internationalization functionality using intlayer.",
      fr: "Cette page démontre la fonctionnalité d'internationalisation en utilisant intlayer.",
      es: "Esta página demuestra la funcionalidad de internacionalización usando intlayer.",
    }),
    welcome: t({
      en: "Welcome to the i18n test page!",
      fr: "Bienvenue sur la page de test i18n !",
      es: "¡Bienvenido a la página de prueba de i18n!",
    }),
    languageSwitcher: t({
      en: "Language Switcher",
      fr: "Sélecteur de langue",
      es: "Selector de idioma",
    }),
    currentLanguage: t({
      en: "Current Language",
      fr: "Langue actuelle",
      es: "Idioma actual",
    }),
    language: {
      english: t({
        en: "English",
        fr: "Anglais",
        es: "Inglés",
      }),
      french: t({
        en: "French",
        fr: "Français",
        es: "Francés",
      }),
      spanish: t({
        en: "Spanish",
        fr: "Espagnol",
        es: "Español",
      }),
    },
    navigation: {
      home: t({
        en: "Home",
        fr: "Accueil",
        es: "Inicio",
      }),
      test: t({
        en: "Test Page",
        fr: "Page de test",
        es: "Página de prueba",
      }),
    },
    content: {
      heading: t({
        en: "Internationalization with intlayer",
        fr: "Internationalisation avec intlayer",
        es: "Internacionalización con intlayer",
      }),
      body: t({
        en: "This content is dynamically translated based on the selected language.",
        fr: "Ce contenu est traduit dynamiquement en fonction de la langue sélectionnée.",
        es: "Este contenido se traduce dinámicamente según el idioma seleccionado.",
      }),
      features: [
        t({
          en: "Automatic language detection",
          fr: "Détection automatique de langue",
          es: "Detección automática de idioma",
        }),
        t({
          en: "URL-based locale routing",
          fr: "Routage local basé sur l'URL",
          es: "Enrutamiento local basado en URL",
        }),
        t({
          en: "Cookie-based language preference",
          fr: "Préférence de langue basée sur les cookies",
          es: "Preferencia de idioma basada en cookies",
        }),
        t({
          en: "Server-side rendering with proper language context",
          fr: "Rendu côté serveur avec contexte linguistique approprié",
          es: "Renderizado del lado del servidor con contexto de idioma adecuado",
        }),
      ],
    },
  },
} satisfies Dictionary;

export default testContent;
