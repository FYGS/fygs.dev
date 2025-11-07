import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for profile page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Mon Profil | Plateforme d'apprentissage FYGS",
      en: "My Profile | FYGS Learning Platform",
      es: "Mi Perfil | Plataforma de Aprendizaje FYGS",
    },
    description: {
      fr: "Gérez votre profil et vos paramètres de compte sur la plateforme d'apprentissage FYGS.",
      en: "Manage your profile and account settings on the FYGS Learning Platform.",
      es: "Gestiona tu perfil y configuración de cuenta en la Plataforma de Aprendizaje FYGS.",
    },
    keywords: [
      {
        fr: "gestion profil",
        en: "profile management",
        es: "gestión perfil",
      },
      {
        fr: "paramètres compte",
        en: "account settings",
        es: "configuración cuenta",
      },
      {
        fr: "sécurité compte",
        en: "account security",
        es: "seguridad cuenta",
      },
      {
        fr: "informations personnelles",
        en: "personal information",
        es: "información personal",
      },
      {
        fr: "plateforme e-learning",
        en: "e-learning platform",
        es: "plataforma e-learning",
      },
      {
        fr: "apprentissage en ligne",
        en: "online learning",
        es: "aprendizaje online",
      },
    ],
    path: "/profile",
    image: "/api/og/profile",
  });
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}