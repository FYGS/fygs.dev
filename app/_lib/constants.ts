export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://www.fygs.dev"
    : "http://localhost:3000";

export const SITE_BASE_URL = new URL(SITE_URL);
