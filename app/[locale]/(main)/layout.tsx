// import { AutoLoader } from "@/components/auto-loader";
import { Footer } from "../_components/Footer";
import { Header } from "../_components/Header";
import { Spacing } from "../_components/Spacing";
import { MonacoInit } from "./tech-mastry/playground/_components/monaco-init";

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
