"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";

interface CoursePublicContentProps {
  course: {
    id: string;
    title: string;
    slug: string;
    publicStructure?: string | null;
    publicResources?: string | null;
    publicEvaluation?: string | null;
    publicPrerequisites?: string | null;
  };
}

/** What the instructor wrote for the sales page: structure, resources, evaluation, prerequisites. Only the sections that have text. */
export function CoursePublicContent({ course }: CoursePublicContentProps) {
  const sections = [
    { id: "structure", title: "Structure de la formation", content: course.publicStructure },
    { id: "prerequisites", title: "Prérequis et public visé", content: course.publicPrerequisites },
    { id: "resources", title: "Ressources incluses", content: course.publicResources },
    { id: "evaluation", title: "Évaluation et certification", content: course.publicEvaluation },
  ].filter((section) => section.content?.trim());

  if (sections.length === 0) return null;

  return (
    <section aria-labelledby="public-content-heading" className="rounded-xl border bg-card p-6">
      <h2 id="public-content-heading" className="mb-2 text-xl font-semibold">
        Informations sur la formation
      </h2>
      <Accordion type="multiple" defaultValue={[sections[0].id]}>
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="text-left">{section.title}</AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-neutral max-w-none dark:prose-invert prose-sm">
                <LessonContentRenderer content={section.content!} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
