import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Anek_Telugu } from "next/font/google";
import { cn } from "@/lib/utils";

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
    url: "https://www.fernandsoualo.com",
    images:
      "https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI",
  },
  twitter: {
    card: "summary_large_image",
    site: "@fernandsoualo",
    title:
      "Fernand SOUALO - Expert Software Engineer | NodeJS, TypeScript, React, NextJS, NestJS, AWS",
    description:
      "Fernand SOUALO is a highly skilled Backend Software Engineer based in France, specializing in NodeJS, TypeScript, React, NextJS, NestJS, and AWS serverless services. With extensive experience in building scalable and efficient applications, Fernand delivers top-notch software solutions.",
    images:
      "https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background text-foreground">
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
