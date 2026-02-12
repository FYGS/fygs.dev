import { Metadata } from "next";
import { SITE_BASE_URL, SITE_URL } from "./constants";

const defaultTitle =
  "FYGS Learning Platform - Formations Premium pour Développeurs";
const defaultDescription =
  "Maîtrisez les technologies web modernes : JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Formations premium avec projets pratiques, certifications et communauté active.";

export const defaultMetadata: Metadata = {
  metadataBase: SITE_BASE_URL,
  title: {
    default: defaultTitle,
    template: "%s | FYGS",
  },
  description: defaultDescription,
  keywords: [
    "FYGS",
    "formations développeur",
    "cours en ligne",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "développement web",
    "formation premium",
    "apprentissage en ligne",
    "IA",
    "Cloud",
    "Full-Stack",
  ],
  authors: [{ name: "FYGS", url: SITE_URL }],
  creator: "FYGS",
  publisher: "FYGS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "FYGS Learning Platform",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "FYGS Learning Platform - Formations Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/og-image.png"],
    creator: "@fernand_soualo",
    site: "@fygs_dev",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_NORTON_VERIFICATION
        ? {
            "norton-safeweb-site-verification":
              process.env.NEXT_PUBLIC_NORTON_VERIFICATION,
          }
        : {}),
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr-FR": `${SITE_URL}/fr`,
      "en-US": `${SITE_URL}/en`,
      "es-ES": `${SITE_URL}/es`,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      {
        url: "/images/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/images/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/images/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#29333d",
    "theme-color": "#29333d",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "FYGS",
    "mobile-web-app-capable": "yes",
    "application-name": "FYGS",
  },
};
