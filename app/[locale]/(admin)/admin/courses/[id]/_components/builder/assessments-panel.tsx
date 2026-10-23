"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ExamDetail, QuizItem } from "@/lib/curriculum/assessments";
import type { ModuleSummary } from "@/lib/curriculum/curriculum";
import { addQuiz, removeFinalExam, removeQuiz, saveFinalExam, saveQuiz } from "../../_actions/assessment-actions";
import { emptyQuestion, questionsProblem, QuestionsEditor, QuizPreview, toDrafts, toInputs, type QuestionDraft } from "./questions-editor";

interface Props {
  courseId: string;
  modules: ModuleSummary[];
  quizzes: QuizItem[];
  onQuizzes: (quizzes: QuizItem[]) => void;
  exam: ExamDetail | null;
  onExam: (exam: ExamDetail | null) => void;
  onModulesChanged: () => void;
}

export function AssessmentsPanel({ courseId, modules, quizzes, onQuizzes, exam, onExam, onModulesChanged }: Props) {
  return (
    <div className="space-y-12">
      <QuizSection courseId={courseId} modules={modules} quizzes={quizzes} onQuizzes={(q) => { onQuizzes(q); onModulesChanged(); }} />
      <ExamSection courseId={courseId} exam={exam} onExam={onExam} />
    </div>
  );
}

// ------------------------------------------------------------------ quizzes

type QuizEditing = { id: string | null; moduleId: string };

function QuizSection({ courseId, modules, quizzes, onQuizzes }: { courseId: string; modules: ModuleSummary[]; quizzes: QuizItem[]; onQuizzes: (q: QuizItem[]) => void }) {
  const [editing, setEditing] = useState<QuizEditing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuizItem | null>(null);

  return (
    <section aria-labelledby="quizzes-title" className="space-y-5">
      <div>
        <h2 id="quizzes-title" className="text-lg font-semibold">
          Quiz de module
        </h2>
        <p className="text-sm text-muted-foreground">Un quiz clôt un module : l&apos;apprenant le réussit à partir de 70 % de bonnes réponses.</p>
      </div>

      {modules.length === 0 && <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Créez d&apos;abord un module dans l&apos;onglet Programme.</p>}

      {modules.map((mod) => {
        const list = quizzes.filter((q) => q.moduleId === mod.id);
        return (
          <div key={mod.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">
                <span className="mr-2 text-muted-foreground">{mod.order}.</span>
                {mod.title}
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing({ id: null, moduleId: mod.id })}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Ajouter un quiz
              </Button>
            </div>
            {list.length === 0 && <p className="text-sm text-muted-foreground">Pas de quiz pour ce module.</p>}
            <ul className="space-y-2">
              {list.map((quiz) => (
                <li key={quiz.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}
                      {quiz.questions.length === 0 && " — un quiz sans question n'est pas proposé aux apprenants"}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing({ id: quiz.id, moduleId: quiz.moduleId })}>
                    <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                    Modifier
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(quiz)} aria-label={`Supprimer le quiz ${quiz.title}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
            {editing && editing.moduleId === mod.id && (
              <QuizEditor
                key={editing.id ?? "new"}
                courseId={courseId}
                modules={modules}
                quiz={quizzes.find((q) => q.id === editing.id) ?? null}
                moduleId={editing.moduleId}
                onSaved={(q) => {
                  onQuizzes(q);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        );
      })}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le quiz « {deleteTarget?.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>Ses questions et les résultats des apprenants sont supprimés. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (!target) return;
                const result = await removeQuiz(target.id);
                if (result.success) onQuizzes(result.quizzes);
                else toast.error(result.error);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function QuizEditor({
  courseId,
  modules,
  quiz,
  moduleId,
  onSaved,
  onCancel,
}: {
  courseId: string;
  modules: ModuleSummary[];
  quiz: QuizItem | null;
  moduleId: string;
  onSaved: (quizzes: QuizItem[]) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [targetModule, setTargetModule] = useState(moduleId);
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => (quiz ? toDrafts(quiz.questions) : [emptyQuestion()]));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const problem = !title.trim() ? "Donnez un titre au quiz." : questions.length === 0 ? "Ajoutez au moins une question." : questionsProblem(questions);

  async function save() {
    if (problem) return toast.error(problem);
    setSaving(true);
    const input = { title, questions: toInputs(questions) };
    const result = quiz ? await saveQuiz(quiz.id, { ...input, moduleId: targetModule }) : await addQuiz(courseId, targetModule, input);
    setSaving(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Quiz enregistré.");
    onSaved(result.quizzes);
  }

  return (
    <div className="space-y-5 rounded-lg border-2 border-primary/30 bg-background p-4">
      <h4 className="font-medium">{quiz ? "Modifier le quiz" : "Nouveau quiz"}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quiz-title">Titre</Label>
          <Input id="quiz-title" value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-module">Module</Label>
          <Select value={targetModule} onValueChange={setTargetModule}>
            <SelectTrigger id="quiz-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.order}. {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Questions ({questions.length})</h5>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
          {preview ? <EyeOff className="mr-1.5 h-4 w-4" aria-hidden /> : <Eye className="mr-1.5 h-4 w-4" aria-hidden />}
          {preview ? "Retour à l'édition" : "Aperçu apprenant"}
        </Button>
      </div>
      {preview ? <QuizPreview questions={questions} /> : <QuestionsEditor questions={questions} onChange={setQuestions} />}

      {problem && <p className="text-sm text-amber-600 dark:text-amber-400">{problem}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving || Boolean(problem)}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          Enregistrer le quiz
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ final exam

function ExamSection({ courseId, exam, onExam }: { courseId: string; exam: ExamDetail | null; onExam: (exam: ExamDetail | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <section aria-labelledby="exam-title" className="space-y-5">
      <div>
        <h2 id="exam-title" className="text-lg font-semibold">
          Examen final
        </h2>
        <p className="text-sm text-muted-foreground">
          Optionnel. Quand il est publié, il fait partie de ce qu&apos;il faut réussir pour obtenir le certificat.
        </p>
      </div>

      {!exam && !editing && (
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Créer l&apos;examen final
        </Button>
      )}

      {exam && !editing && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{exam.title}</p>
            <p className="text-sm text-muted-foreground">
              {exam.questions.length} question{exam.questions.length > 1 ? "s" : ""} · réussite à {exam.passingScore} %
              {exam.timeLimit ? ` · ${exam.timeLimit} min` : " · sans limite de temps"}
            </p>
          </div>
          <Badge variant={exam.published ? "default" : "secondary"}>{exam.published ? "Publié" : "Brouillon"}</Badge>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
            Modifier
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteOpen(true)} aria-label="Supprimer l'examen final">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}

      {editing && (
        <ExamEditor
          courseId={courseId}
          exam={exam}
          onSaved={(saved) => {
            onExam(saved);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;examen final ?</AlertDialogTitle>
            <AlertDialogDescription>Les questions et les résultats des apprenants sont supprimés. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await removeFinalExam(courseId);
                if (result.success) onExam(null);
                else toast.error(result.error);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function ExamEditor({ courseId, exam, onSaved, onCancel }: { courseId: string; exam: ExamDetail | null; onSaved: (exam: ExamDetail) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(exam?.title ?? "Examen final");
  const [description, setDescription] = useState(exam?.description ?? "");
  const [passingScore, setPassingScore] = useState(exam?.passingScore ?? 70);
  const [timed, setTimed] = useState(exam ? exam.timeLimit !== null : true);
  const [timeLimit, setTimeLimit] = useState(exam?.timeLimit ?? 60);
  const [published, setPublished] = useState(exam?.published ?? false);
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => (exam && exam.questions.length > 0 ? toDrafts(exam.questions) : [emptyQuestion()]));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const problem = !title.trim()
    ? "Donnez un titre à l'examen."
    : passingScore < 1 || passingScore > 100
      ? "Le seuil de réussite doit être compris entre 1 et 100 %."
      : timed && (timeLimit < 1 || timeLimit > 600)
        ? "La durée doit être comprise entre 1 et 600 minutes."
        : published && questions.length === 0
          ? "Ajoutez au moins une question pour publier l'examen."
          : questionsProblem(questions);

  async function save() {
    if (problem) return toast.error(problem);
    setSaving(true);
    const input = {
      title,
      description: description.trim() || null,
      passingScore,
      timeLimit: timed ? timeLimit : null,
      published,
      questions: toInputs(questions),
    };
    const result = await saveFinalExam(courseId, input);
    setSaving(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Examen enregistré.");
    onSaved({
      title: title.trim(),
      description: description.trim(),
      passingScore,
      timeLimit: input.timeLimit,
      published,
      questions: questions.map((q) => ({ question: q.question, options: q.options, correct: q.correct, explanation: q.explanation || null })),
    });
  }

  return (
    <div className="space-y-5 rounded-lg border-2 border-primary/30 bg-background p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="exam-title-input">Titre</Label>
          <Input id="exam-title-input" value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="exam-description">Consigne</Label>
          <Textarea id="exam-description" rows={2} value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exam-score">Seuil de réussite (%)</Label>
          <Input id="exam-score" type="number" min={1} max={100} value={passingScore} onChange={(e) => setPassingScore(Math.round(Number(e.target.value)))} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="exam-time">Durée limite (minutes)</Label>
            <Switch checked={timed} onCheckedChange={setTimed} aria-label="Limiter la durée" />
          </div>
          <Input id="exam-time" type="number" min={1} max={600} disabled={!timed} value={timed ? timeLimit : ""} placeholder="Sans limite" onChange={(e) => setTimeLimit(Math.round(Number(e.target.value)))} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Questions ({questions.length})</h5>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
          {preview ? <EyeOff className="mr-1.5 h-4 w-4" aria-hidden /> : <Eye className="mr-1.5 h-4 w-4" aria-hidden />}
          {preview ? "Retour à l'édition" : "Aperçu apprenant"}
        </Button>
      </div>
      {preview ? <QuizPreview questions={questions} /> : <QuestionsEditor questions={questions} onChange={setQuestions} />}

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="exam-published">Publié</Label>
          <p className="text-sm text-muted-foreground">Un examen publié est proposé aux apprenants et requis pour le certificat.</p>
        </div>
        <Switch id="exam-published" checked={published} onCheckedChange={setPublished} />
      </div>

      {problem && <p className="text-sm text-amber-600 dark:text-amber-400">{problem}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving || Boolean(problem)}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          Enregistrer l&apos;examen
        </Button>
      </div>
    </div>
  );
}
