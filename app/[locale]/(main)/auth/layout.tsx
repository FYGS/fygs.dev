// use generateI18nMetadata function to make a seo oriented layout for auth pages
import { generateI18nMetadata } from "@/app/_lib/i18n-metadata";

import { type LocalesValues } from "intlayer";

const AuthLayout = async ({ children, params }: { children: React.ReactNode; params: Promise<{ locale: LocalesValues }> }) => {
  const { locale } = await params;

  const metadata = await generateI18nMetadata({
    locale,
    title: {
      fr: "Connexion | FYGS Learning Platform",
      en: "Login | FYGS Learning Platform",
      es: "Iniciar sesión | FYGS Learning Platform",
    },
    description: {
      fr: "Connectez-vous à votre compte FYGS pour accéder à nos formations premium.",
      en: "Log in to your FYGS account to access our premium courses.",
      es: "Inicie sesión en su cuenta de FYGS para acceder a nuestros cursos premium.",
    },
  });

  return (
    <>
      {/* Render metadata */}
      <head>
        <title>{String(metadata.title ?? "")}</title>
        <meta name="description" content={metadata.description ?? ""} />
      </head>
      <main>{children}</main>
    </>
  );
};

export default AuthLayout;
