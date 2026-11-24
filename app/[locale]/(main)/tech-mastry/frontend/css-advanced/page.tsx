import { CSSAdvancedGuide } from "./_components/css-advanced-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/css-advanced");

export default function CSSAdvancedPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
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
    </div>
  );
}
