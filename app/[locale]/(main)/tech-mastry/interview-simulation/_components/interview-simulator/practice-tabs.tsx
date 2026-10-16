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
          Technical
        </TabsTrigger>
        <TabsTrigger value="behavioral" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Behavioral
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
          title="Technical Interview Questions"
          description="Practice coding and technical questions commonly asked in interviews"
          questions={technicalQuestions}
          actionLabel="Try"
        />
      </TabsContent>

      <TabsContent value="behavioral" className="space-y-6">
        <QuestionListCard
          icon={User}
          title="Behavioral Interview Questions"
          description="Prepare for behavioral questions with the STAR method"
          questions={behavioralQuestions}
          actionLabel="Practice"
        />
      </TabsContent>

      <TabsContent value="system-design" className="space-y-6">
        <QuestionListCard
          icon={GitBranch}
          title="System Design Interview Questions"
          description="Practice designing scalable and robust systems"
          questions={systemDesignQuestions}
          actionLabel="Design"
          showTimeLimit
        />
      </TabsContent>
    </Tabs>
  );
}
