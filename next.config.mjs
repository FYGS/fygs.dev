/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "media.licdn.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "encrypted-tbn0.gstatic.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "github.githubassets.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
