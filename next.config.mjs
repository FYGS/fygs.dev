import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

import { withIntlayer } from "next-intlayer/server";
import withPWAInit from "next-pwa";

import {
  buildGlobalCsp,
  buildPlaygroundCsp,
  buildReportOnlyCsp,
  CSP_HEADER as cspHeader,
  NON_PLAYGROUND_SOURCE,
  REPORT_ONLY_HEADER,
  REPORTING_ENDPOINTS_HEADER,
  REPORTING_ENDPOINTS_VALUE,
} from "./lib/csp.mjs";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Fluid PWA: rely on runtime caching, not aggressive precaching
  dynamicStartUrl: false,
  runtimeCaching: [
    {
      // Pages — network first, fall back to cache
      urlPattern: /^https?:\/\/[^/]+\/(fr|en|es)(\/.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24h
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // API calls — network first with shorter TTL
      urlPattern: /\/api\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60, // 5 min
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Static assets (images, fonts, etc.) — cache first
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?|ttf|eot)$/i,
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
      urlPattern: /\/_next\/static\/.*/,
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
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.githubassets.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "www.pexels.com",
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
