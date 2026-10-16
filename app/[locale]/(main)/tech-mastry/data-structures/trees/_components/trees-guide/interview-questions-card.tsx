import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { interviewQuestions } from "./data";

export function InterviewQuestionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Questions d&apos;Entretien Courantes
        </CardTitle>
        <CardDescription>
          Préparez-vous aux questions fréquemment posées sur les arbres et
          graphes lors des entretiens techniques.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {interviewQuestions.map((q, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-medium text-lg">{q.question}</h3>
              <p className="text-muted-foreground text-sm">{q.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
