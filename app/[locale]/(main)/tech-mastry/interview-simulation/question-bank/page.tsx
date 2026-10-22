import { QuestionBank } from "./_components/question-bank";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/interview-simulation/question-bank");

export default function QuestionBankPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500/20 to-amber-500/20 mb-2">
          <span className="text-3xl">📚</span>
        </div>
        <h1 className="text-4xl font-bold">Banque de Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une vingtaine de questions d&apos;entretien technique classiques, classées par catégorie
          et difficulté, avec réponses détaillées. Les entreprises indiquées sont données
          à titre d&apos;exemple (types de questions courants), pas comme source officielle.
        </p>
      </div>
      <QuestionBank />
    </div>
  );
}
