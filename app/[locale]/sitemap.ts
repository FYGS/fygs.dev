import { generateSitemap } from "../_lib/sitemap";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await generateSitemap();
  return routes;
}
