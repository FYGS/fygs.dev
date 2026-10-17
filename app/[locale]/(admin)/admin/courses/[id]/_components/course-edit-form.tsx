"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/use-auto-save";
import { Form } from "@/components/ui/form";
import { updateCourse, deleteCourse } from "../_actions/edit-course";
import { BasicInfoSection } from "./course-edit/basic-info-section";
import { CategorizationSection } from "./course-edit/categorization-section";
import { FormActions } from "./course-edit/form-actions";
import { MarketingContentSection } from "./course-edit/marketing-content-section";
import { PricingSection } from "./course-edit/pricing-section";
import { PublishingSection } from "./course-edit/publishing-section";
import { courseEditSchema, type CourseEditFormData } from "./course-edit/schema";
import type { CourseEditFormProps } from "./course-edit/types";

export function CourseEditForm({ course, tags }: CourseEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    course.tags.map((ct) => ct.tag.id),
  );

  const form = useForm<CourseEditFormData>({
    resolver: zodResolver(courseEditSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      level: course.level,
      accessTier: course.accessTier,
      price: course.price,
      duration: course.duration,
      published: course.published,
      featured: course.featured,
      previewEnabled: course.previewEnabled,
      thumbnail: course.thumbnail || "",
      tags: course.tags.map((ct) => ct.tag.id),
      publicStructure: course.publicStructure || "",
      publicResources: course.publicResources || "",
      publicEvaluation: course.publicEvaluation || "",
      publicPrerequisites: course.publicPrerequisites || "",
      trailerUrl: course.trailerUrl || "",
      faq: course.faq ? JSON.stringify(course.faq, null, 2) : "",
    },
  });

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  // Auto-save callback
  const handleAutoSave = useCallback(
    async (data: CourseEditFormData) => {
      try {
        const result = await updateCourse(course.id, {
          ...data,
          tags: selectedTags,
        });
        return { success: result.success, error: result.error };
      } catch {
        return { success: false, error: "Erreur réseau" };
      }
    },
    [course.id, selectedTags],
  );

  // Watch form values for auto-save
  const watchedValues = useWatch({ control: form.control }) as CourseEditFormData;
  const { status: autoSaveStatus, lastSaved } = useAutoSave({
    data: watchedValues,
    onSave: handleAutoSave,
    delay: 2000,
    enabled: true,
  });

  const onSubmit = (data: CourseEditFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCourse(course.id, {
          ...data,
          tags: selectedTags,
        });

        if (result.success) {
          toast.success("Formation mise à jour avec succès!");
          router.refresh();
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Course update error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCourse(course.id);
      if (result.success) {
        toast.success("Formation supprimée avec succès!");
        router.push("/admin/courses");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Course deletion error:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <BasicInfoSection form={form} />
          <MarketingContentSection form={form} />
          <CategorizationSection
            form={form}
            tags={tags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
          <PricingSection form={form} />
          <PublishingSection form={form} />
          <FormActions
            form={form}
            course={course}
            autoSaveStatus={autoSaveStatus}
            lastSaved={lastSaved}
            isPending={isPending}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
          />
        </form>
      </Form>
    </div>
  );
}
