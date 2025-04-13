import Script from "next/script";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="monaco-workers-setup"
        src="/monaco-workers-setup.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
