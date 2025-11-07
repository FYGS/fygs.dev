import { MetadataRoute } from "next";
import { getTranslation, type LocalesValues } from "intlayer";

/**
 * Modern PWA Manifest with comprehensive i18n support
 * Implements latest PWA standards and best practices
 */
export default function manifest(): MetadataRoute.Manifest {
  // Default to French as primary language
  const locale: LocalesValues = "fr";

  const t = <T>(
    content: Required<Record<"fr", T>> & Partial<Record<LocalesValues, T>>
  ) => getTranslation(content, locale);

  // Localized strings
  const name = t({
    fr: "FYGS Learning Platform - Formations Premium pour Développeurs",
    en: "FYGS Learning Platform - Premium Developer Courses",
    es: "FYGS Learning Platform - Cursos Premium para Desarrolladores",
  });

  const shortName = t({
    fr: "FYGS Academy",
    en: "FYGS Academy",
    es: "FYGS Academy",
  });

  const description = t({
    fr: "Maîtrisez les technologies web modernes : JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Formations premium avec projets pratiques, certifications et communauté active.",
    en: "Master modern web technologies: JavaScript, TypeScript, React, Next.js, Node.js, AI and Cloud. Premium courses with hands-on projects, certifications and active community.",
    es: "Domina las tecnologías web modernas: JavaScript, TypeScript, React, Next.js, Node.js, IA y Cloud. Cursos premium con proyectos prácticos, certificaciones y comunidad activa.",
  });

  return {
    // Basic information
    id: "/?source=pwa",
    name,
    short_name: shortName,
    description,

    // Navigation
    start_url: "/",
    scope: "/",

    // Display modes (ordered by preference)
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],

    // Orientation
    orientation: "portrait-primary",

    // Theme colors (from globals.css - dark theme primary)
    theme_color: "#d9dce0", // --primary: 220 13% 86%
    background_color: "#29333d", // --background: 220 13% 18%

    // Locale and direction
    lang: locale,
    dir: "ltr",

    // Categories for app stores
    categories: [
      "education",
      "development",
      "technology",
      "productivity",
      "learning",
      "training",
    ],

    // Icons - comprehensive sizes for all platforms
    icons: [
      // Standard PNG icons with "any" purpose (not maskable to avoid loading issues)
      {
        src: "/images/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable icons for adaptive icons (Android) - duplicate with purpose maskable
      {
        src: "/images/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    // Screenshots for app store listings (both desktop and mobile)
    screenshots: [
      // Wide format for desktop/tablet
      {
        src: "/images/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: t({
          fr: "Écran principal de la plateforme FYGS",
          en: "FYGS Platform main screen",
          es: "Pantalla principal de la plataforma FYGS",
        }),
      },
      // Narrow format for mobile (required for rich install UI on mobile)
      {
        src: "/images/screenshot-mobile.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: t({
          fr: "Interface mobile de la plateforme FYGS",
          en: "FYGS Platform mobile interface",
          es: "Interfaz móvil de la plataforma FYGS",
        }),
      },
    ],

    // Shortcuts for quick actions (max 4 for best cross-platform support)
    shortcuts: [
      {
        name: t({
          fr: "Formations",
          en: "Courses",
          es: "Cursos",
        }),
        short_name: t({
          fr: "Cours",
          en: "Courses",
          es: "Cursos",
        }),
        url: "/formations?utm_source=pwa_shortcut",
        description: t({
          fr: "Explorer et découvrir les formations disponibles",
          en: "Explore and discover available courses",
          es: "Explorar y descubrir cursos disponibles",
        }),
        icons: [
          {
            src: "/images/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Blog",
        short_name: "Blog",
        url: "/blog?utm_source=pwa_shortcut",
        description: t({
          fr: "Lire les derniers articles et tutoriels",
          en: "Read latest articles and tutorials",
          es: "Leer últimos artículos y tutoriales",
        }),
        icons: [
          {
            src: "/images/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: t({
          fr: "Communauté",
          en: "Community",
          es: "Comunidad",
        }),
        short_name: t({
          fr: "Forum",
          en: "Forum",
          es: "Foro",
        }),
        url: "/community?utm_source=pwa_shortcut",
        description: t({
          fr: "Rejoindre et participer à la communauté",
          en: "Join and participate in the community",
          es: "Unirse y participar en la comunidad",
        }),
        icons: [
          {
            src: "/images/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: t({
          fr: "Mon Espace",
          en: "My Space",
          es: "Mi Espacio",
        }),
        short_name: t({
          fr: "Dashboard",
          en: "Dashboard",
          es: "Panel",
        }),
        url: "/dashboard?utm_source=pwa_shortcut",
        description: t({
          fr: "Accéder à votre tableau de bord personnel",
          en: "Access your personal dashboard",
          es: "Acceder a tu panel personal",
        }),
        icons: [
          {
            src: "/images/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],

    // Protocol handlers for deep linking
    protocol_handlers: [
      {
        protocol: "web+fygs",
        url: "/handle?type=%s",
      },
    ],

    // Share target for Web Share API
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "media",
            accept: ["image/*", "video/*", "audio/*", "application/pdf"],
          },
        ],
      },
    },

    // File handlers for opening specific file types
    file_handlers: [
      {
        action: "/dashboard/upload",
        accept: {
          "text/markdown": [".md", ".markdown"],
          "application/pdf": [".pdf"],
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
        },
      },
    ],

    // Related applications
    prefer_related_applications: false,
    related_applications: [],
  };
}
