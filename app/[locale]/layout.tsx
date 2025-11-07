import { NavigationProgress } from "@/components/ui/navigation-progress";
import { PageTransition } from "@/components/ui/page-transition";
import { LocaleSelectorModal } from "@/components/ui/locale-selector-modal";
import { cn } from "@/lib/utils";
import { PageMemoryProvider } from "@/providers/page-memory-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { TransitionProvider } from "@/providers/transition-provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Anek_Telugu } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { JsonLd } from "../_components/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/components/providers/notification-provider";

import { type NextLayoutIntlayer, IntlayerClientProvider } from "next-intlayer";
import { getHTMLTextDir } from "intlayer";
import { generateI18nMetadata } from "@/app/_lib/i18n-metadata";
import { Metadata } from "next";
export { generateStaticParams } from "next-intlayer";

const AnekTelugu = Anek_Telugu({
  subsets: ["latin"],
  variable: "--font-caption",
});

/**
 * Generate metadata for each locale with proper canonical and hreflang
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return generateI18nMetadata({
    locale: locale as any,
    title: {
      fr: "FYGS Learning Platform - Formations Premium pour Développeurs",
      en: "FYGS Learning Platform - Premium Developer Courses",
      es: "FYGS Learning Platform - Cursos Premium para Desarrolladores",
    },
    description: {
      fr: "Maîtrisez les technologies web modernes : JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Formations premium avec projets pratiques, certifications et communauté active.",
      en: "Master modern web technologies: JavaScript, TypeScript, React, Next.js, Node.js, AI and Cloud. Premium courses with hands-on projects, certifications and active community.",
      es: "Domina las tecnologías web modernas: JavaScript, TypeScript, React, Next.js, Node.js, IA y Cloud. Cursos premium con proyectos prácticos, certificaciones y comunidad activa.",
    },
    keywords: [
      {
        fr: "formations développeur",
        en: "developer courses",
        es: "cursos desarrollador",
      },
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      { fr: "formations premium", en: "premium courses", es: "cursos premium" },
      {
        fr: "apprentissage en ligne",
        en: "online learning",
        es: "aprendizaje en línea",
      },
    ],
    path: "/",
  });
}

const LocaleLayout: NextLayoutIntlayer = async ({ children, params }) => {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      dir={getHTMLTextDir(locale)} /*suppressHydrationWarning*/
    >
      <head>
        <JsonLd />
      </head>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          AnekTelugu.variable,
          "font-sans h-full bg-background text-foreground"
        )}
        {...(process.env.NODE_ENV === "development"
          ? { "cz-shortcut-listen": "true" }
          : {})}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system">
          <PageMemoryProvider>
            <NavigationProgress />
            <TransitionProvider>
              <TooltipProvider>
                <IntlayerClientProvider locale={locale}>
                  <LocaleSelectorModal />
                  <PageTransition>
                    <main>
                      <NuqsAdapter>{children}</NuqsAdapter>
                      <Toaster richColors closeButton />
                    </main>
                  </PageTransition>
                  <NotificationProvider />
                </IntlayerClientProvider>
              </TooltipProvider>
            </TransitionProvider>
          </PageMemoryProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Register service worker after page load to avoid blocking
                window.addEventListener('load', () => {
                  // Use requestIdleCallback for better performance
                  if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                      navigator.serviceWorker.register('/sw.js').catch(() => {});
                    });
                  } else {
                    setTimeout(() => {
                      navigator.serviceWorker.register('/sw.js').catch(() => {});
                    }, 2000);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
};

export default LocaleLayout;
