import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

import { withIntlayer } from "next-intlayer/server";
import withPWAInit from "next-pwa";

import {
  buildGlobalCsp,
  buildPlaygroundCsp,
  buildReportOnlyCsp,
  CSP_HEADER as cspHeader,
  NON_PLAYGROUND_SOURCE,
  SANDBOX_SOURCE,
  buildSandboxCsp,
  REPORT_ONLY_HEADER,
  REPORTING_ENDPOINTS_HEADER,
  REPORTING_ENDPOINTS_VALUE,
} from "./lib/csp.mjs";

// Service worker (next-pwa/workbox): runtime caching only, no precache. Never caches /api, personalised
// areas (keep the deny list in sync with app/[locale]/(admin), (learning) and the personal parts of (main)).
// NB: the functions below are serialised into public/sw.js by workbox: they must stay self-contained.
// Offline fallback: a static, hydration-free page (a React page served under another URL cannot hydrate).
const OFFLINE_REVISION = createHash("md5")
  .update(readFileSync(new URL("./public/offline.html", import.meta.url)))
  .digest("hex");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Registration (and the update/refresh flow) lives in components/pwa/service-worker-registration.tsx;
  // letting next-pwa inject its own register script as well made the worker register twice.
  register: false,
  skipWaiting: true,
  // By default next-pwa precaches every file of public/ (~80 MB: screenshots, project images,
  // PDF) on each install. Only the offline page is precached; everything else is runtime cached.
  cacheStartUrl: false,
  additionalManifestEntries: [{ url: "/offline.html", revision: OFFLINE_REVISION }],
  // Fluid PWA: rely on runtime caching, not aggressive precaching
  dynamicStartUrl: false,
  runtimeCaching: [
    {
      // Never cache the API (auth/session, AI, Stripe, uploads, ...): always hit the network.
      urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
    },
    {
      // Public pages (full document navigations only) — network first, fall back to cache.
      // RSC/prefetch requests and personalised areas are excluded, and responses Next marks as
      // private/no-store (anything reading cookies or the session) are never written to the cache.
      urlPattern: ({ url, request, sameOrigin }) => {
        if (!sameOrigin || request.mode !== "navigate") return false;
        if (!/^[/](fr|en|es)([/]|$)/.test(url.pathname)) return false;
        return !/^[/](fr|en|es)[/](admin|dashboard|profile|me|auth|learn|certificates|offline|community[/](notifications|bookmarks|following|new|mentorship))([/]|$)/.test(
          url.pathname,
        );
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24h
        },
        networkTimeoutSeconds: 4,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              const cacheControl = response.headers.get("cache-control") || "";
              return /no-store|private/i.test(cacheControl) ? null : response;
            },
            // Offline and nothing cached for this page: show the precached static offline page.
            handlerDidError: async () => {
              const offline = await caches.match("/offline.html", { ignoreSearch: true });
              return offline || Response.error();
            },
          },
        ],
      },
    },
    {
      // Static assets (images, fonts, etc.) — cache first, same-origin only
      urlPattern: ({ url, sameOrigin }) =>
        sameOrigin && /[.](?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?|ttf|eot)$/i.test(url.pathname),
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // JS/CSS bundles — stale while revalidate
      urlPattern: /[/]_next[/]static[/]/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
  // Exclude large files from precaching
  buildExcludes: [/chunks\/.*\.js$/, /static\/monaco\/.*\.worker\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio-b8kcs4owo80c4sgoos4ck8gw.154.12.226.201.sslip.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add Monaco Editor webpack plugin only on client side
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["typescript", "javascript", "html", "css", "json"],
          filename: "static/monaco/[name].worker.js",
          publicPath: "/_next/",
        }),
      );
    }
    return config;
  },
  // Performance optimizations
  // lucide-react, date-fns and recharts are optimised by default; these are barrel-heavy too.
  experimental: {
    optimizePackageImports: ["framer-motion", "@radix-ui/react-icons", "react-icons/fa6"],
  },
  poweredByHeader: false,
  reactStrictMode: true,

  // WebContainer requires Cross-Origin Isolation headers (COOP/COEP)
  // Scoped only to the playground route to avoid breaking other pages
  async headers() {
    return [
      // Baseline security headers for every route (CSP: see lib/csp.ts).
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        source: NON_PLAYGROUND_SOURCE,
        headers: [
          { key: cspHeader, value: buildGlobalCsp() },
          { key: REPORT_ONLY_HEADER, value: buildReportOnlyCsp() },
          { key: REPORTING_ENDPOINTS_HEADER, value: REPORTING_ENDPOINTS_VALUE },
        ],
      },
      // The code sandbox: its own policy (eval for the worker, nothing else)
      {
        source: SANDBOX_SOURCE,
        headers: [
          { key: cspHeader, value: buildSandboxCsp() },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      // The playground page is cross-origin isolated (COEP require-corp, needed by
      // WebContainer). A worker whose script response lacks COEP is then blocked
      // (ERR_BLOCKED_BY_RESPONSE), and Monaco silently falls back to running its
      // language services on the main thread, freezing the UI.
      {
        source: "/_next/static/monaco/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/:locale/tech-mastry/playground",
        headers: [
          { key: cspHeader, value: buildPlaygroundCsp() },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

// The build runs on webpack (next-pwa and the Monaco plugin need it): say so explicitly
// instead of letting intlayer guess from the npm script.
export default withIntlayer(withPWA(nextConfig), { enableTurbopack: false });
