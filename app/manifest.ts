import { MetadataRoute } from "next";

/**
 * PWA Manifest - Optimized for Android & iOS installability
 *
 * Key requirements for installability:
 * - Android: name, icons (192px + 512px), start_url, display, proper screenshots
 * - iOS: apple-touch-icon in <head>, apple-mobile-web-app-capable meta tag
 * - Both: HTTPS, service worker, manifest linked via <link rel="manifest">
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Identity
    id: "/",
    name: "FYGS DEV",
    short_name: "FYGS",
    description:
      "FYGS DEV est une plateforme d'apprentissage en ligne dédiée aux développeurs, offrant des formations de qualité, des ressources pédagogiques et une communauté engagée pour accompagner votre progression dans le développement web et mobile. Maîtrisez JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Formations premium avec projets pratiques.",

    // Navigation
    start_url: "/",
    scope: "/",

    // Display - standalone for native app feel
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],

    // Orientation
    orientation: "any",

    // Theme colors matching the app's dark theme
    theme_color: "#29333d",
    background_color: "#29333d",

    // Locale
    lang: "fr",
    dir: "ltr",

    // App store categories
    categories: ["education", "development", "productivity"],

    // Icons - comprehensive for all platforms
    icons: [
      // Standard favicons
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
      // Apple touch icon
      {
        src: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      // Android Chrome icons (required: 192px + 512px)
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
      // Maskable icons for adaptive icon support (Android)
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

    // Screenshots - REQUIRED for rich install UI on mobile
    screenshots: [
      {
        src: "/screenshots/home-desktop-1200x630.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "FYGS DEV - Vue bureau",
      },
      {
        src: "/screenshots/home-mobile-1080x1920.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "FYGS DEV - Vue mobile",
      },
    ],

    // Shortcuts for quick actions (max 4)
    shortcuts: [
      {
        name: "Formations",
        short_name: "Cours",
        url: "/formations",
        description: "Découvrir les formations disponibles",
        icons: [
          {
            src: "/screenshots/formations-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Blog",
        short_name: "Blog",
        url: "/blog",
        description: "Lire les derniers articles",
        icons: [
          {
            src: "/screenshots/blog-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Communauté",
        short_name: "Forum",
        url: "/community",
        description: "Rejoindre la communauté",
        icons: [
          {
            src: "/screenshots/community-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Tableau de bord",
        short_name: "Dashboard",
        url: "/dashboard",
        description: "Accéder au tableau de bord",
        icons: [
          {
            src: "/screenshots/dashboard-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],

    // Do not prefer native apps
    prefer_related_applications: false,
    related_applications: [],
  };
}
