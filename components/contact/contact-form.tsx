"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner";
import { notify } from "@/lib/notification-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Briefcase, Handshake, GraduationCap, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useIntlayer } from "next-intlayer";

const contactSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must contain at least 5 characters"),
  message: z.string().min(10, "Message must contain at least 10 characters"),
  type: z.enum(['recruitment', 'collaboration', 'training', 'general']).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const content = useIntlayer("contact-form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'general'
    }
  });

  const watchedType = watch('type');

  // Sync watchedType with form value management
  useEffect(() => {
    if (watchedType) {
      // Form value is managed by react-hook-form
    }
  }, [watchedType]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }
      if (response.ok) {
        notify.success(
          content.notifications.success.title.value,
          content.notifications.success.description.value,
          40
        );
        // toast.success("Message envoyé !");
        reset();
      } else {
        notify.error(
          content.notifications.error.title.value,
          content.notifications.error.description.value,
          6000
        );
        // toast.error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      notify.error(
        content.notifications.error.title.value,
        content.notifications.error.description.value,
        6000
      );
      // toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactTypeInfo = (type: string) => {
    switch (type) {
      case 'recruitment':
        return {
          icon: Briefcase,
          title: content.contactTypes.recruitment.title.value,
          description: content.contactTypes.recruitment.description.value,
          placeholder: content.contactTypes.recruitment.placeholder.value
        };
      case 'collaboration':
        return {
          icon: Handshake,
          title: content.contactTypes.collaboration.title.value,
          description: content.contactTypes.collaboration.description.value,
          placeholder: content.contactTypes.collaboration.placeholder.value
        };
      case 'training':
        return {
          icon: GraduationCap,
          title: content.contactTypes.training.title.value,
          description: content.contactTypes.training.description.value,
          placeholder: content.contactTypes.training.placeholder.value
        };
      default:
        return {
          icon: MessageCircle,
          title: content.contactTypes.general.title.value,
          description: content.contactTypes.general.description.value,
          placeholder: content.contactTypes.general.placeholder.value
        };
    }
  };

  const typeInfo = getContactTypeInfo(watchedType || 'general');
  const TypeIcon = typeInfo.icon;

  return (
    <Card className="p-6 shadow-lg border-0 bg-linear-to-br from-card via-card to-muted/20 hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {content.title.value}
        </h3>
        <p className="text-muted-foreground">
          {content.description.value}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="type">{content.contactType.label.value}</Label>
          <Select
            value={watchedType || 'general'}
            onValueChange={(value) => {
              setValue('type', value as any);
            }}
          >
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder={content.contactType.placeholder.value} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {content.contactTypes.general.label.value}
                </div>
              </SelectItem>
              <SelectItem value="recruitment">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {content.contactTypes.recruitment.label.value}
                </div>
              </SelectItem>
              <SelectItem value="collaboration">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  {content.contactTypes.collaboration.label.value}
                </div>
              </SelectItem>
              <SelectItem value="training">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {content.contactTypes.training.label.value}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Header based on type */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <TypeIcon className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-primary">{typeInfo.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{content.formFields.name.label.value}</Label>
            <Input
              id="name"
              placeholder={content.formFields.name.placeholder.value}
              {...register("name")}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && (
              <span className="text-sm text-destructive">{content.formFields.name.error.value}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{content.formFields.email.label.value}</Label>
            <Input
              id="email"
              type="email"
              placeholder={content.formFields.email.placeholder.value}
              {...register("email")}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && (
              <span className="text-sm text-destructive">{content.formFields.email.error.value}</span>
            )}
          </div>
        </div>

        {/* Conditional fields based on contact type */}
        {(watchedType === 'recruitment' || watchedType === 'collaboration') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">{content.formFields.company.label.value}</Label>
              <Input
                id="company"
                placeholder={content.formFields.company.placeholder.value}
                {...register("company")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{content.formFields.position.label.value}</Label>
              <Input
                id="position"
                placeholder={content.formFields.position.placeholder.value}
                {...register("position")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject">{content.formFields.subject.label.value}</Label>
          <Input
            id="subject"
            placeholder={
              watchedType === 'recruitment' ? content.formFields.subject.placeholder.recruitment.value :
              watchedType === 'collaboration' ? content.formFields.subject.placeholder.collaboration.value :
              watchedType === 'training' ? content.formFields.subject.placeholder.training.value :
              content.formFields.subject.placeholder.general.value
            }
            {...register("subject")}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {errors.subject && (
            <span className="text-sm text-destructive">{content.formFields.subject.error.value}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">{content.formFields.message.label.value}</Label>
          <Textarea
            id="message"
            placeholder={typeInfo.placeholder}
            className="min-h-[150px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            {...register("message")}
          />
          {errors.message && (
            <span className="text-sm text-destructive">{content.formFields.message.error.value}</span>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {content.submitButton.sending.value}
            </>
          ) : (
            <>
              <TypeIcon className="mr-2 h-5 w-5" />
              {content.submitButton.send.value}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
