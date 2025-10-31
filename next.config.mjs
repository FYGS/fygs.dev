import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

import { withIntlayer } from "next-intlayer/server";

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
          languages: ["typescript", "javascript", "html", "css"],
          filename: "static/monaco/[name].worker.js",
          publicPath: "/_next/",
        })
      );
    }
    return config;
  },
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withIntlayer(nextConfig);
