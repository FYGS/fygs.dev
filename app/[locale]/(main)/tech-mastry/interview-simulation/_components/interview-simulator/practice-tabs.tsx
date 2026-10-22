"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, GitBranch, User } from "lucide-react";
import {
  behavioralQuestions,
  systemDesignQuestions,
  technicalQuestions,
} from "./data";
import { QuestionListCard } from "./question-list-card";

interface PracticeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function PracticeTabs({ activeTab, setActiveTab }: PracticeTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
        <TabsTrigger value="technical" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Technique
        </TabsTrigger>
        <TabsTrigger value="behavioral" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Comportemental
        </TabsTrigger>
        <TabsTrigger
          value="system-design"
          className="flex items-center gap-2"
        >
          <GitBranch className="h-4 w-4" />
          System Design
        </TabsTrigger>
      </TabsList>

      <TabsContent value="technical" className="space-y-6">
        <QuestionListCard
          icon={Code}
          title="Questions d'entretien techniques"
          description="Entraînez-vous aux questions de code et aux questions techniques fréquemment posées en entretien"
          questions={technicalQuestions}
          actionLabel="Essayer"
        />
      </TabsContent>

      <TabsContent value="behavioral" className="space-y-6">
        <QuestionListCard
          icon={User}
          title="Questions d'entretien comportementales"
          description="Préparez-vous aux questions comportementales avec la méthode STAR"
          questions={behavioralQuestions}
          actionLabel="S'entraîner"
        />
      </TabsContent>

      <TabsContent value="system-design" className="space-y-6">
        <QuestionListCard
          icon={GitBranch}
          title="Questions d'entretien de System Design"
          description="Entraînez-vous à concevoir des systèmes scalables et robustes"
          questions={systemDesignQuestions}
          actionLabel="Concevoir"
          showTimeLimit
        />
      </TabsContent>
    </Tabs>
  );
}
