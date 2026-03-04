import type { Metadata } from "next";
import type { LocalesValues } from "intlayer";
import { generateRouteMetadata } from "../../_lib/metadata-helpers";
import { sectionSEO } from "@/app/_lib/seo-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, sectionSEO.techMastryAiMastery);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}