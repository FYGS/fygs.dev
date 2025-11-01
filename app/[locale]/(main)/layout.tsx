// import { AutoLoader } from "@/components/auto-loader";

import { Header } from "@/app/_components/Header";
import { MonacoInit } from "./tech-mastry/playground/_components/monaco-init";
import { Spacing } from "@/app/_components/Spacing";
import { Footer } from "@/app/_components/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Spacing size="md" />
      {children}
      <Spacing size="md" />
      <Footer />

      {/* <AutoLoader /> */}
      <MonacoInit />
    </>
  );
}
