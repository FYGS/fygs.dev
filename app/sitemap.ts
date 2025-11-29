import { generateSitemap } from "./_lib/sitemap";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = await generateSitemap();
    return routes;
}
