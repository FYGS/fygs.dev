import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for community with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Communauté | FYGS Learning Platform",
      en: "Community | FYGS Learning Platform",
      es: "Comunidad | FYGS Learning Platform",
    },
    description: {
      fr: "Rejoignez notre communauté de développeurs : posez des questions, partagez vos connaissances, participez aux discussions et apprenez ensemble.",
      en: "Join our developer community: ask questions, share your knowledge, participate in discussions and learn together.",
      es: "Únete a nuestra comunidad de desarrolladores: haz preguntas, comparte tu conocimiento, participa en discusiones y aprende juntos.",
    },
    keywords: [
      {
        fr: "communauté développeurs",
        en: "developer community",
        es: "comunidad desarrolladores",
      },
      {
        fr: "forum programmation",
        en: "programming forum",
        es: "foro programación",
      },
      {
        fr: "discussions techniques",
        en: "technical discussions",
        es: "discusiones técnicas",
      },
      {
        fr: "entraide développeurs",
        en: "developer support",
        es: "ayuda desarrolladores",
      },
    ],
    path: "/community",
    image: "/api/og/community",
  });
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}
