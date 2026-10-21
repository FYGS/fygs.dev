import { QAGuide } from "./_components/qa-guide";
import { QAQuiz } from "./_components/qa-quiz";
import { HelpCircle, Brain, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/qa");

export default function QAPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/20 mb-2">
          <HelpCircle className="w-8 h-8 text-violet-500" />
        </div>
        <h1 className="text-4xl font-bold">Questions & Réponses</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Testez vos connaissances avec notre quiz interactif ou parcourez
          les questions les plus fréquentes des entretiens techniques.
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary">Quiz interactif</Badge>
          <Badge variant="outline">Scoring en temps réel</Badge>
          <Badge>Explications détaillées</Badge>
        </div>
      </div>

      {/* Tabs: Quiz / Reference */}
      <Tabs defaultValue="quiz" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="quiz" className="gap-2">
            <Brain className="w-4 h-4" />
            Quiz Interactif
          </TabsTrigger>
          <TabsTrigger value="reference" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Référence Q&A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz">
          <QAQuiz />
        </TabsContent>

        <TabsContent value="reference">
          <QAGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
