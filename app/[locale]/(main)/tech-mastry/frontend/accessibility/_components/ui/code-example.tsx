"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertCircle, Code, Lightbulb, Play } from "lucide-react";
import { useState } from "react";

interface CodeExampleProps {
  title: string;
  description?: string;
  code: string;
  language?: string;
  demo?: React.ReactNode;
  explanation?: React.ReactNode;
  tips?: string[];
  interviewQuestions?: {
    question: string;
    answer: string;
    difficulty?: string;
    tags?: string[];
  }[];
}

export function CodeExample({
  title,
  description,
  code,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language = "jsx",
  demo,
  explanation,
  tips,
  interviewQuestions,
}: CodeExampleProps) {
  const [activeTab, setActiveTab] = useState("code");

  return (
    <Card className="overflow-hidden border border-border/50 shadow-xs">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 bg-muted/30 border-y">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0">
            <TabsTrigger
              value="code"
              className={cn(
                "data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                "px-4 h-12"
              )}
            >
              <Code className="mr-2 h-4 w-4" />
              Code
            </TabsTrigger>
            {demo && (
              <TabsTrigger
                value="demo"
                className={cn(
                  "data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                  "px-4 h-12"
                )}
              >
                <Play className="mr-2 h-4 w-4" />
                Démo
              </TabsTrigger>
            )}
            {explanation && (
              <TabsTrigger
                value="explanation"
                className={cn(
                  "data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                  "px-4 h-12"
                )}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Explication
              </TabsTrigger>
            )}
            {interviewQuestions && interviewQuestions.length > 0 && (
              <TabsTrigger
                value="interview"
                className={cn(
                  "data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                  "px-4 h-12"
                )}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Questions d&apos;Entretien
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value="code" className="m-0">
            <div className="relative">
              <pre className="language-jsx p-4 overflow-x-auto text-sm" tabIndex={0}>
                <code>{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-clipboard"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
          </TabsContent>

          {demo && (
            <TabsContent value="demo" className="m-0">
              <div className="p-4 border-t">{demo}</div>
            </TabsContent>
          )}

          {explanation && (
            <TabsContent value="explanation" className="m-0">
              <div className="p-4 border-t prose prose-sm max-w-none prose-invert">
                {explanation}

                {tips && tips.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold">Conseils:</h4>
                    <ul className="mt-2">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-sm">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {interviewQuestions && interviewQuestions.length > 0 && (
            <TabsContent value="interview" className="m-0">
              <div className="p-4 border-t">
                <h4 className="text-sm font-semibold mb-4">
                  Questions fréquentes en entretien:
                </h4>
                <div className="space-y-4">
                  {interviewQuestions.map((qa, index) => (
                    <div
                      key={index}
                      className="space-y-2 pb-4 mb-4 border-b last:border-b-0 last:mb-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-sm">{qa.question}</p>
                        {(qa.difficulty || (qa.tags && qa.tags.length > 0)) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {qa.difficulty && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  qa.difficulty === "easy"
                                    ? "bg-green-900/30 text-green-400"
                                    : qa.difficulty === "medium"
                                    ? "bg-yellow-900/30 text-yellow-400"
                                    : "bg-red-900/30 text-red-400"
                                }`}
                              >
                                {qa.difficulty === "easy"
                                  ? "Facile"
                                  : qa.difficulty === "medium"
                                  ? "Moyen"
                                  : "Difficile"}
                              </span>
                            )}
                            {qa.tags?.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}
