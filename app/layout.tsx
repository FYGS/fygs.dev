import { cn } from "@/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Anek_Telugu } from "next/font/google";
import "./globals.css";

const AnekTelugu = Anek_Telugu({
  subsets: ["latin"],
  variable: "--font-caption",
});

export const metadata: Metadata = {
  title:
    "Fernand SOUALO - Expert Software Engineer | NodeJS, TypeScript, React, NextJS, NestJS, AWS",
  description:
    "Fernand SOUALO is a highly skilled Backend Software Engineer based in France, specializing in NodeJS, TypeScript, React, NextJS, NestJS, and AWS serverless services. With extensive experience in building scalable and efficient applications, Fernand delivers top-notch software solutions.",
  keywords:
    "Fernand SOUALO, Software Engineer, Backend Developer, NodeJS, TypeScript, React, NextJS, NestJS, AWS, Serverless, France, Scalable Applications, Software Solutions",
  authors: [{ name: "Fernand SOUALO" }],
  robots: "index, follow",
  openGraph: {
    title:
      "Fernand SOUALO - Expert Software Engineer | NodeJS, TypeScript, React, NextJS, NestJS, AWS",
    description:
      "Fernand SOUALO is a highly skilled Backend Software Engineer based in France, specializing in NodeJS, TypeScript, React, NextJS, NestJS, and AWS serverless services. With extensive experience in building scalable and efficient applications, Fernand delivers top-notch software solutions.",
    type: "website",
    url: "https://fygs-dev.vercel.app",
    siteName: "fygs.dev",
    images: [
      {
        url: "https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI",
        width: 200,
        height: 200,
        alt: "Fernand SOUALO Profile Picture",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@fernandsoualo",
    title:
      "Fernand SOUALO - Expert Software Engineer | NodeJS, TypeScript, React, NextJS, NestJS, AWS",
    description:
      "Fernand SOUALO is a highly skilled Backend Software Engineer based in France, specializing in NodeJS, TypeScript, React, NextJS, NestJS, and AWS serverless services. With extensive experience in building scalable and efficient applications, Fernand delivers top-notch software solutions.",
    images: [
      {
        url: "https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI",
        alt: "Fernand SOUALO Profile Picture",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background text-foreground">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            const devToolsDetector = () => {
              console.clear();
              const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const greenColor = isDarkMode ? '#00FF00' : '#008000';
              const purpleColor = isDarkMode ? '#FF00FF' : '#800080';
              const blueColor = isDarkMode ? '#00FFFF' : '#000080';
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
          "font-sans h-full"
        )}
        {...(process.env.NODE_ENV === "development"
          ? { "cz-shortcut-listen": "true" }
          : {})}
      >
        {children}
      </body>
    </html>
  );
}
