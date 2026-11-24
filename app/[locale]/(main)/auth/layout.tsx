// Internationalized metadata for auth pages with proper SEO
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import { type LocalesValues } from "intlayer";
import { Metadata } from "next";

// Every page under /auth is rendered per request. This is what lets it carry the nonce of the Content-Security-Policy:
// the sign-in, sign-up, verification and second-factor pages are where a password is typed, so they are the pages
// that most need a policy without 'unsafe-inline'. A prerendered page has no nonce and cannot hydrate under that policy.
export const dynamic = "force-dynamic";

/**
 * Generate SEO-optimized metadata for auth pages
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Authentification | FYGS Learning Platform",
      en: "Authentication | FYGS Learning Platform",
      es: "Autenticación | FYGS Learning Platform",
    },
    description: {
      fr: "Connectez-vous ou créez votre compte FYGS pour accéder à nos formations premium, suivre votre progression et obtenir des certifications.",
      en: "Log in or create your FYGS account to access our premium courses, track your progress and earn certifications.",
      es: "Inicie sesión o cree su cuenta FYGS para acceder a nuestros cursos premium, seguir su progreso y obtener certificaciones.",
    },
    path: "/auth",
    image: "/api/og/auth",
  });
}

const AuthLayout = async ({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: LocalesValues }>;
}) => {
  return <div>{children}</div>;
};

export default AuthLayout;
