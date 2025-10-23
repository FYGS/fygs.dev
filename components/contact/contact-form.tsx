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

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  type: z.enum(['recruitment', 'collaboration', 'training', 'general']).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
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
          "Message envoyé avec succès !",
          "Je vous répondrai dans les plus brefs délais.",
          4000
        );
        // toast.success("Message envoyé !");
        reset();
      } else {
        notify.error(
          "Erreur lors de l'envoi",
          "Veuillez réessayer plus tard.",
          6000
        );
        // toast.error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      notify.error(
        "Erreur lors de l'envoi",
        "Veuillez réessayer plus tard.",
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
          title: 'Opportunité de Recrutement',
          description: 'Vous cherchez un développeur Full-Stack expérimenté ?',
          placeholder: 'Décrivez le poste, les technologies requises, le contexte de mission...'
        };
      case 'collaboration':
        return {
          icon: Handshake,
          title: 'Proposition de Collaboration',
          description: 'Vous avez un projet et cherchez un partenaire technique ?',
          placeholder: 'Présentez votre projet, vos objectifs, le type de collaboration envisagé...'
        };
      case 'training':
        return {
          icon: GraduationCap,
          title: 'Demande de Formation',
          description: 'Vous souhaitez vous former ou former vos équipes ?',
          placeholder: 'Décrivez vos besoins de formation, votre niveau actuel, vos objectifs...'
        };
      default:
        return {
          icon: MessageCircle,
          title: 'Contact Général',
          description: 'Une question ? Une demande d\'information ?',
          placeholder: 'Décrivez votre demande, posez votre question...'
        };
    }
  };

  const typeInfo = getContactTypeInfo(watchedType || 'general');
  const TypeIcon = typeInfo.icon;

  return (
    <Card className="p-6 shadow-lg border-0 bg-linear-to-br from-card via-card to-muted/20 hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Contactez-moi
        </h3>
        <p className="text-muted-foreground">
          Choisissez le type de contact pour une réponse personnalisée
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="type">Type de contact</Label>
          <Select 
            value={watchedType || 'general'} 
            onValueChange={(value) => {
              setValue('type', value as any);
            }}
          >
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Sélectionnez le type de contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Général
                </div>
              </SelectItem>
              <SelectItem value="recruitment">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Opportunité de Recrutement
                </div>
              </SelectItem>
              <SelectItem value="collaboration">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  Proposition de Collaboration
                </div>
              </SelectItem>
              <SelectItem value="training">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Demande de Formation
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
            <Label htmlFor="name">Nom complet</Label>
            <Input 
              id="name" 
              placeholder="Votre nom" 
              {...register("name")}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register("email")}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </div>
        </div>

        {/* Conditional fields based on contact type */}
        {(watchedType === 'recruitment' || watchedType === 'collaboration') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                placeholder="Nom de votre entreprise"
                {...register("company")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Votre poste</Label>
              <Input
                id="position"
                placeholder="Votre fonction"
                {...register("position")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject">Sujet</Label>
          <Input
            id="subject"
            placeholder={
              watchedType === 'recruitment' ? "Ex: Développeur Full-Stack - Mission 6 mois" :
              watchedType === 'collaboration' ? "Ex: Partenariat technique pour startup" :
              watchedType === 'training' ? "Ex: Formation React/Next.js pour équipe" :
              "De quoi souhaitez-vous parler ?"
            }
            {...register("subject")}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {errors.subject && (
            <span className="text-sm text-destructive">{errors.subject.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder={typeInfo.placeholder}
            className="min-h-[150px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            {...register("message")}
          />
          {errors.message && (
            <span className="text-sm text-destructive">{errors.message.message}</span>
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
              Envoi en cours...
            </>
          ) : (
            <>
              <TypeIcon className="mr-2 h-5 w-5" />
              Envoyer le message
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
