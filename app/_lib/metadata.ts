import { Metadata } from "next";

const defaultTitle =
  "Fernand SOUALO - Expert Software Engineer | Full-Stack Development";
const defaultDescription =
  "Experienced Software Engineer specializing in building modern, scalable web applications with TypeScript, React, Node.js, and cloud technologies. Explore my portfolio and technical insights.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://fygs-dev.vercel.app"),
  title: {
    default: defaultTitle,
    template: "%s | Fernand SOUALO",
  },
  description: defaultDescription,
  keywords: [
    "Fernand SOUALO",
    "Software Engineer",
    "Full-Stack Developer",
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "AWS",
    "Cloud Architecture",
    "Web Development",
    "Technical Blog",
    "Software Architecture",
  ],
  authors: [{ name: "Fernand SOUALO", url: "https://fygs-dev.vercel.app" }],
  creator: "Fernand SOUALO",
  publisher: "Fernand SOUALO",
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
    locale: "en_US",
    url: "https://fygs-dev.vercel.app",
    siteName: "Fernand SOUALO",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fernand SOUALO - Expert Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/og-image.png"],
    creator: "Fernand SOUALO",
    site: "https://fygs-dev.vercel.app",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      "norton-safeweb-site-verification":
        process.env.NEXT_PUBLIC_NORTON_VERIFICATION ?? "",
    },
  },
  alternates: {
    canonical: "https://fygs-dev.vercel.app",
    languages: {
      "en-US": "https://fygs-dev.vercel.app",
      "fr-FR": "https://fygs-dev.vercel.app/fr",
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      {
        url: "/images/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/images/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
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
    "msapplication-TileColor": "#da532c",
    "theme-color": "#ffffff",
  },
};
