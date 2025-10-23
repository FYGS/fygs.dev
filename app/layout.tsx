import { NavigationProgress } from "@/components/ui/navigation-progress";
import { PageTransition } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";
import { PageMemoryProvider } from "@/providers/page-memory-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { TransitionProvider } from "@/providers/transition-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Anek_Telugu } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { JsonLd } from "./_components/JsonLd";
import { SITE_URL } from "./_lib/constants";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/components/providers/notification-provider";

const AnekTelugu = Anek_Telugu({
  subsets: ["latin"],
  variable: "--font-caption",
});

export const metadata: Metadata = {
 metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            const devToolsDetector = () => {
              console.clear();
              const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const greenColor = isDarkMode ? '#00FF00' : '#008000';
              const purpleColor = isDarkMode ? '#FF00FF' : '#800080';
              const blueColor = isDarkMode ? '#00FFFF' : '#00080';
              const redColor = isDarkMode ? '#FF0000' : '#800000';

              console.log(\`%cHello, curious developer! 👋\`, \`font-size: 20px; font-weight: bold; color: \${greenColor};\`);
              console.log(\`%cWelcome to my professional portfolio site. Feel free to explore the code and learn more about my work!\`, \`font-size: 16px; color: \${purpleColor};\`);
              console.log(\`%cIf you're interested in collaborating or have any questions, don't hesitate to reach out.\`, \`font-size: 14px; color: \${blueColor};\`);
              console.log(\`%cHappy coding! 🚀\`, \`font-size: 18px; font-weight: bold; color: \${redColor};\`);
              console.log(\`%cContact Information:\`, \`font-size: 16px; font-weight: bold; color: \${greenColor};\`);
              console.log(\`%cLinkedIn: https://www.linkedin.com/in/fernandsoualo/\`, \`font-size: 14px; color: \${purpleColor};\`);
              console.log(\`%cGitHub: https://github.com/fygs\`, \`font-size: 14px; color: \${blueColor};\`);
              console.log(\`%cHashnode: https://hashnode.com/@FYGS\`, \`font-size: 14px; color: \${greenColor};\`);
              console.log(\`%cEmail: fygs.dev@gmail.com\`, \`font-size: 14px; color: \${redColor};\`);
            };

            let devToolsOpen = false;

            setInterval(() => {
              const widthThreshold = window.outerWidth - window.innerWidth > 160;
              const heightThreshold = window.outerHeight - window.innerHeight > 160;

              if (!devToolsOpen && (widthThreshold || heightThreshold)) {
                devToolsOpen = true;
                devToolsDetector();
              } else if (devToolsOpen && !widthThreshold && !heightThreshold) {
                devToolsOpen = false;
              }
            }, 1000);
          `,
          }}
        />
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
                <PageTransition>
                  <main>
                    <NuqsAdapter>{children}</NuqsAdapter>
                    <Toaster richColors closeButton />
                  </main>
                </PageTransition>
                <NotificationProvider />
              </TooltipProvider>
            </TransitionProvider>
          </PageMemoryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('ServiceWorker registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}