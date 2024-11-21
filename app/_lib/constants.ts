export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://fygs-dev.vercel.app"
    : "http://localhost:3000";

export const SITE_BASE_URL = new URL(SITE_URL);
