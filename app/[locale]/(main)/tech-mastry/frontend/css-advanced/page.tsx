import type { Metadata } from "next";
import { CSSAdvancedGuide } from "./_components/css-advanced-guide";

export const metadata: Metadata = {
  title: "CSS Avancé | Tech-Mastry",
  description: "Grid, Flexbox avancé, animations CSS, Container Queries, et techniques modernes de layout.",
};

export default function CSSAdvancedPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-pink-500/20 to-rose-500/20 mb-2">
          <span className="text-3xl">🎨</span>
        </div>
        <h1 className="text-4xl font-bold">CSS Avancé</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez Grid, Flexbox avancé, animations et les nouvelles APIs CSS
          pour créer des interfaces modernes et performantes.
        </p>
      </div>
      <CSSAdvancedGuide />
    </main>
  );
}
