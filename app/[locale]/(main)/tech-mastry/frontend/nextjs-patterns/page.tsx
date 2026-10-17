import type { Metadata } from "next";
import { NextjsGuide } from "./_components/nextjs-guide";

export const metadata: Metadata = {
  title: "Next.js Patterns | Tech-Mastry",
  description: "Patterns avancés Next.js 14+ : App Router, Server Components, Server Actions, streaming et caching.",
};

export default function NextjsPatternsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-gray-500/20 to-zinc-500/20 mb-2">
          <span className="text-3xl">▲</span>
        </div>
        <h1 className="text-4xl font-bold">Next.js Patterns</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Patterns avancés pour Next.js 14+ avec App Router, React Server Components,
          Server Actions, et stratégies de caching.
        </p>
      </div>
      <NextjsGuide />
    </div>
  );
}
