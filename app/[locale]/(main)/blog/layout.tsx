import { generateRouteMetadata } from "../_lib/metadata-helpers";
import { sectionSEO } from "@/app/_lib/seo-config";
import type { Metadata } from "next";
import type { LocalesValues } from "intlayer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, sectionSEO.blog);
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
