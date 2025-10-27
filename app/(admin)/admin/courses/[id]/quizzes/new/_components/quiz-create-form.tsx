"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createQuiz } from "../../../_actions/quiz-actions";

// Schema for quiz creation
const quizSchema = z.object({
  moduleId: z.number().min(1, "Le module est requis"),
  title: z.string().min(1, "Le titre est requis"),
  questions: z.array(z.object({
    question: z.string().min(1, "La question est requise"),
    options: z.array(z.string().min(1, "L'option ne peut pas être vide")).min(2, "Au moins 2 options sont requises"),
    correct: z.number().min(0, "Sélectionnez la bonne réponse"),
    explanation: z.string().nullable(),
  })).min(1, "Au moins une question est requise"),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface QuizCreateFormProps {
  course: {
    id: string;
    title: string;
    modules: {
      id: string;
      title: string;
      order: number;
    }[];
  };
}

export function QuizCreateForm({ course }: QuizCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      moduleId: 1,
      title: "",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correct: 0,
          explanation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Handle form submission
  const onSubmit = async (data: QuizFormData) => {
    startTransition(async () => {
      try {
        const processedData = {
          ...data,
          questions: data.questions.map((q, index) => ({
            ...q,
            order: index + 1,
            explanation: q.explanation || null,
          })),
        };

        const result = await createQuiz(course.id, processedData);

        if (result.success) {
          toast.success("Quiz créé avec succès!");
          router.push(`/admin/courses/${course.id}?tab=quiz`);
        } else {
          toast.error(result.error || "Erreur lors de la création du quiz");
        }
      } catch (error) {
        console.error("Quiz creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const addQuestion = () => {
    append({
      question: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du quiz</CardTitle>
            <CardDescription>
              Configurez les informations de base de votre quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="moduleId">Module</Label>
                <Select
                  value={form.watch("moduleId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("moduleId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un module" />
                  </SelectTrigger>
                  <SelectContent>
                    {course.modules.map((module) => (
                      <SelectItem key={module.id} value={module.order.toString()}>
                        Module {module.order}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.moduleId && (
                  <p className="text-sm text-destructive">{form.formState.errors.moduleId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titre du quiz</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Ex: Quiz - Introduction à React"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Questions du quiz</span>
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </CardTitle>
            <CardDescription>
              Créez les questions et leurs réponses possibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, questionIndex) => (
              <div key={field.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Question {questionIndex + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(questionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`questions.${questionIndex}.question`}>
                    Question
                  </Label>
                  <Textarea
                    id={`questions.${questionIndex}.question`}
                    {...form.register(`questions.${questionIndex}.question`)}
                    placeholder="Entrez votre question..."
                  />
                  {form.formState.errors.questions?.[questionIndex]?.question && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.questions[questionIndex]?.question?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Réponses possibles</Label>
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={form.watch(`questions.${questionIndex}.correct`) === optionIndex}
                        onChange={() => form.setValue(`questions.${questionIndex}.correct`, optionIndex)}
                        className="w-4 h-4"
                      />
                      <Input
                        {...form.register(`questions.${questionIndex}.options.${optionIndex}`)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                  {form.formState.errors.questions?.[questionIndex]?.correct && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.questions[questionIndex]?.correct?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`questions.${questionIndex}.explanation`}>
                    Explication (optionnel)
                  </Label>
                  <Textarea
                    id={`questions.${questionIndex}.explanation`}
                    {...form.register(`questions.${questionIndex}.explanation`)}
                    placeholder="Expliquez pourquoi cette réponse est correcte..."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button variant="outline" asChild>
            <Link href={`/admin/courses/${course.id}?tab=quiz`}>
              Annuler
            </Link>
          </Button>
          
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Créer le quiz
          </Button>
        </div>
      </form>
    </div>
  );
}