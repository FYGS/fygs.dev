import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { Mail, MessageCircle, Calendar } from "lucide-react";

export const ContactSection = () => {
  return (
    <Section className="flex flex-col items-start gap-8">
      <div className="text-center w-full">
        <Badge
          variant="outline"
          className="text-lg sm:text-xl text-muted-foreground font-semibold mb-4"
        >
          <Mail className="w-4 h-4 mr-2" />
          Contactez-moi
        </Badge>
        <h2 className="pb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Travaillons ensemble sur votre{" "}
          <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            prochain projet
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Que ce soit pour une formation personnalisée, un développement web ou une consultation technique,
          je suis là pour vous accompagner dans vos projets les plus ambitieux.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        {/* Contact Form */}
        <div className="order-2 lg:order-1">
          <ContactForm />
        </div>

        {/* Contact Information & Social Links */}
        <div className="order-1 lg:order-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Autres moyens de me contacter</h3>
            
            {/* Quick Contact Options */}
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Email direct</h4>
                  <p className="text-sm text-muted-foreground">fygs.dev@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Réponse rapide</h4>
                  <p className="text-sm text-muted-foreground">Généralement sous 24h</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Consultation gratuite</h4>
                  <p className="text-sm text-muted-foreground">30 min pour discuter de votre projet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Retrouvez-moi aussi sur</h4>
            <div className="grid gap-4">
              <ContactCard
                url="https://www.linkedin.com/in/fernandsoualo/"
                name="@fernandsoualo"
                description="Suivez-moi sur LinkedIn"
                image="/linkedin_profile_photo.jpeg"
                mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
              />
              <ContactCard
                url="https://github.com/fygs"
                name="@fygsdev"
                description="Découvrez mes projets sur GitHub"
                image="https://avatars.githubusercontent.com/u/24303747?v=4"
                mediumImage="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="p-6 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Prêt à commencer ?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Décrivez votre projet dans le formulaire ci-contre et recevez une réponse personnalisée avec une estimation gratuite.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Développement Web</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Formation</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Consulting</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
