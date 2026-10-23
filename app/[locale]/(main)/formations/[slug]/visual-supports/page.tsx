import { permanentRedirect } from "next/navigation";

/** The visual supports live in the learning area; this address is kept for old links and bookmarks. */
export default async function LegacyVisualSupportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/learn/${slug}/supports`);
}
