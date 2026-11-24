import { permanentRedirect } from "next/navigation";

/** The programme, resources and prerequisites are on the course page itself. */
export default async function LegacyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/formations/${slug}`);
}
