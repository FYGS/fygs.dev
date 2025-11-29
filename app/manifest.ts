import { MetadataRoute } from "next";

/**
 * Modern PWA Manifest with comprehensive support
 * Implements latest PWA standards and best practices
 *
 * Note: Manifests are static in Next.js. For per-locale manifests,
 * use middleware or dynamic routes: /[locale]/manifest.webmanifest
 */
export default function manifest(): MetadataRoute.Manifest {
  // Default to multilingual support with French as primary
  const name = "FYGS Learning Platform - Formations Premium";
  const shortName = "FYGS DEV";
  const description =
    "Master modern web technologies: JavaScript, TypeScript, React, Next.js, Node.js, AI and Cloud. Premium courses with hands-on projects.";

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

    // Locale and direction (default, will be overridden by HTML lang)
    lang: "fr",
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
        src: "/screenshots/home-desktop-1200x630.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "FYGS Platform main screen",
      },
      // Narrow format for mobile (required for rich install UI on mobile)
      {
        src: "/screenshots/home-mobile-1080x1920.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "FYGS Platform mobile interface",
      },
    ],

    // Shortcuts for quick actions (max 4 for best cross-platform support)
    shortcuts: [
      {
        name: "Courses",
        short_name: "Courses",
        url: "/formations?utm_source=pwa_shortcut",
        description: "Explore and discover available courses",
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
        url: "/blog?utm_source=pwa_shortcut",
        description: "Read latest articles and tutorials",
        icons: [
          {
            src: "/screenshots/blog-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Community",
        short_name: "Forum",
        url: "/community?utm_source=pwa_shortcut",
        description: "Join and participate in the community",
        icons: [
          {
            src: "/screenshots/community-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard?utm_source=pwa_shortcut",
        description: "Access your personal dashboard",
        icons: [
          {
            src: "/screenshots/dashboard-96x96.png",
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
