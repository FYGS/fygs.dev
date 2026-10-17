"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { createCourse } from "../../_actions/create-course";
import { CourseCategory, CourseLevel, CourseAccessTier } from "@/lib/generated/prisma/browser";
import { BasicInfoSection } from "./course-form/basic-info-section";
import { CategorizationSection } from "./course-form/categorization-section";
import { FormActions } from "./course-form/form-actions";
import { PricingSection } from "./course-form/pricing-section";
import { PublicContentSection } from "./course-form/public-content-section";
import { PublishingSection } from "./course-form/publishing-section";
import { courseSchema, type CourseFormData, type TagType } from "./course-form/schema";
import { ThumbnailSection } from "./course-form/thumbnail-section";

interface CourseCreateFormProps {
  tags: TagType[];
}

export function CourseCreateForm({ tags }: CourseCreateFormProps) {
  const router = useRouter();
  const [isSavingDraft, startDraftTransition] = useTransition();
  const [isPublishing, startPublishTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const form = useForm<z.input<typeof courseSchema>, unknown, CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      category: CourseCategory.JAVASCRIPT,
      level: CourseLevel.BEGINNER,
      accessTier: CourseAccessTier.FREE,
      price: undefined,
      duration: undefined,
      published: false,
      featured: false,
      previewEnabled: true,
      thumbnail: "",
      tags: [],
      publicStructure: "",
      publicResources: "",
      publicEvaluation: "",
      publicPrerequisites: "",
      trailerUrl: "",
      faq: "",
    },
  });

  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    form.setValue("tags", newSelectedTags);
  };

  // Handle image upload
  const handleImageUpload = (url: string) => {
    form.setValue("thumbnail", url);
    setThumbnailUrl(url);
  };

  // The original onSubmit function is no longer needed since we have distinct handlers
  // for draft and publish actions

  // Handle publish and save as draft
  const handlePublishAndSave = () => {
    form.setValue("published", true);
    startPublishTransition(async () => {
      try {
        const result = await createCourse({
          ...form.getValues(),
          tags: selectedTags,
          thumbnail: thumbnailUrl || undefined,
        });

        if (result.success) {
          toast.success("Formation créée et publiée avec succès!");
          router.push(`/admin/courses/${result.course?.id}`);
        } else {
          toast.error(result.error || "Erreur lors de la création");
        }
      } catch (error) {
        console.error("Course creation error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const handleSaveAsDraft = () => {
    form.setValue("published", false);
    startDraftTransition(async () => {
      try {
        const result = await createCourse({
          ...form.getValues(),
          tags: selectedTags,
          thumbnail: thumbnailUrl || undefined,
        });

        if (result.success) {
          toast.success(
            "Brouillon sauvegardé — ajoutez maintenant vos modules et leçons",
          );
          router.push(`/admin/courses/${result.course?.id}`);
        } else {
          toast.error(
            result.error || "Erreur lors de la sauvegarde du brouillon",
          );
        }
      } catch (error) {
        console.error("Draft saving error:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        <form className="space-y-8">
          <BasicInfoSection form={form} />
          <ThumbnailSection
            thumbnailUrl={thumbnailUrl}
            handleImageUpload={handleImageUpload}
          />
          <CategorizationSection
            form={form}
            tags={tags}
            selectedTags={selectedTags}
            handleTagToggle={handleTagToggle}
          />
          <PublicContentSection form={form} />
          <PricingSection form={form} />
          <PublishingSection form={form} />
          <FormActions
            isSavingDraft={isSavingDraft}
            isPublishing={isPublishing}
            handleSaveAsDraft={handleSaveAsDraft}
            handlePublishAndSave={handlePublishAndSave}
          />
        </form>
      </Form>
    </div>
  );
}
