import {
  BrainCircuitIcon,
  Code2Icon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  RocketIcon,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { Section } from "./Section";

const FOOTER_LINKS = {
  information: [
    { href: "/me", label: "CV", description: "Mon parcours professionnel" },
    { href: "/projects", label: "Projets", description: "Portfolio technique" },
    { href: "/blog", label: "Blog", description: "Articles & tutoriels" },
    { href: "/contact", label: "Contact", description: "Nous contacter" },
  ],
  apprentissage: [
    { href: "/formations", label: "Formations", description: "Cours premium" },
    { href: "/pricing", label: "Tarifs", description: "Plans & abonnements" },
    { href: "/tech-mastry", label: "TechMastry", description: "Préparation entretiens" },
    { href: "/dashboard", label: "Dashboard", description: "Espace apprenant" },
  ],
  legal: [
    { href: "/terms", label: "Conditions d'utilisation" },
    { href: "/privacy", label: "Politique de confidentialité" },
  ],
  projects: [
    {
      href: "https://evopur.ca",
      label: "Evopur",
      description: "Ecological Household Cleaning Services in Montreal",
      icon: Leaf,
    },
    {
      href: "https://ncr.ouestech.com",
      label: "NCR",
      description: "Administrative processes Platform",
      icon: Code2Icon,
    },
    {
      href: "https://quizzen.fr",
      label: "Quizzen",
      description: "AI-Powered Quiz Platform",
      icon: BrainCircuitIcon,
    },
    {
      href: "https://anumerique.com",
      label: "A'Numerique",
      description: "An innovative service bridging the digital divide",
      icon: RocketIcon,
    },
  ],
  contact: [
    {
      href: "mailto:fygs.dev@gmail.com",
      label: "fygs.dev@gmail.com",
      icon: MailIcon,
    },
    {
      href: "tel:+33644808530",
      label: "+33 6 44 80 85 30",
      icon: PhoneIcon,
    },
    {
      href: "https://github.com/fygs",
      label: "GitHub",
      icon: GithubIcon,
    },
    {
      href: "https://linkedin.com/in/fernandsoualo",
      label: "LinkedIn",
      icon: LinkedinIcon,
    },
  ],
} as const;

export function Footer() {
  return (
    <footer className="relative bg-card border-t">
      <div className="absolute inset-0 bg-linear-to-b from-background/0 to-background/5 pointer-events-none" />

      <Section className="relative pt-16 pb-8">
        {/* Main Footer Content - 4 Colonnes égales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Colonne 1: fygs.dev */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight hover:text-primary transition-colors block"
              >
                fygs.dev \_°&lt;
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plateforme d&apos;apprentissage premium pour développeurs modernes. 
                Formations JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {FOOTER_LINKS.contact.slice(2).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {FOOTER_LINKS.contact.slice(0, 2).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 2: Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              Information
            </h3>
            <div className="space-y-2">
              {FOOTER_LINKS.information.map(({ href, label, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="group block p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 3: Apprentissage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              Apprentissage
            </h3>
            <div className="space-y-2">
              {FOOTER_LINKS.apprentissage.map(({ href, label, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="group block p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 4: Projets Phares */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              Projets Phares
            </h3>
            <div className="space-y-3">
              {FOOTER_LINKS.projects.map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 rounded-xl bg-linear-to-br from-muted/30 to-muted/10 border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Fernand Soualo. All rights reserved.
              </p>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">
                Built with Next.js 15, Tailwind CSS & Shadcn UI
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">
                CGU
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <span>•</span>
              <Link href="/me" className="hover:text-primary transition-colors">
                CV
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </footer>
  );
}
