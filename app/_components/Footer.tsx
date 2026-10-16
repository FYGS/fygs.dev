"use client";
import { BrainCircuitIcon, Code2Icon, MailIcon, PhoneIcon, RocketIcon, Leaf } from "lucide-react";
import { Github as GithubIcon, Linkedin as LinkedinIcon } from "@/components/icons/brand-icons";
import { LocaleAwareLink } from "@/components/ui/locale-aware-nav";
import { Section } from "./Section";
import { useIntlayer } from "next-intlayer";

const PROJECT_ICONS = {
  Evopur: Leaf,
  NCR: Code2Icon,
  Quizzen: BrainCircuitIcon,
  "A'Numerique": RocketIcon,
} as const;

const CONTACT_ICONS = [MailIcon, PhoneIcon, GithubIcon, LinkedinIcon] as const;

export function Footer() {
  const content = useIntlayer("footer");
  return (
    <footer className="relative bg-card border-t">
      <div className="absolute inset-0 bg-linear-to-b from-background/0 to-background/5 pointer-events-none" />

      <Section className="relative pt-16 pb-8">
        {/* Main Footer Content - 4 Colonnes égales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1: fygs.dev */}
          <div className="space-y-6">
            <div className="space-y-4">
              <LocaleAwareLink
                href="/"
                className="text-2xl font-bold tracking-tight hover:text-primary transition-colors block"
              >
                fygs.dev \_°&lt;
              </LocaleAwareLink>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.description.value}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {content.contact.items.slice(2).map((item, index) => {
                const Icon = CONTACT_ICONS[index + 2];
                return (
                  <a
                    key={item.href.value}
                    href={item.href.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
                    aria-label={item.label.value}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {content.contact.items.slice(0, 2).map((item, index) => {
                const Icon = CONTACT_ICONS[index];
                return (
                  <a
                    key={item.href.value}
                    href={item.href.value}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.label.value}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Colonne 2: Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              {content.information.label.value}
            </h3>
            <div className="space-y-2">
              {content.information.links.map((link) => (
                <LocaleAwareLink
                  key={link.href.value}
                  href={link.href.value}
                  className="group block p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {link.description.value}
                    </span>
                  </div>
                </LocaleAwareLink>
              ))}
            </div>
          </div>

          {/* Colonne 3: Learning */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              {content.learning.label.value}
            </h3>
            <div className="space-y-2">
              {content.learning.links.map((link) => (
                <LocaleAwareLink
                  key={link.href.value}
                  href={link.href.value}
                  className="group block p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {link.description.value}
                    </span>
                  </div>
                </LocaleAwareLink>
              ))}
            </div>
          </div>

          {/* Colonne 4: Featured Projects */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-primary/60" />
              {content.projects.label.value}
            </h3>
            <div className="space-y-3">
              {content.projects.items.map((project) => {
                const Icon =
                  PROJECT_ICONS[
                    project.label.value as keyof typeof PROJECT_ICONS
                  ];
                return (
                  <a
                    key={project.href.value}
                    href={project.href.value}
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
                          {project.label.value}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {project.description.value}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                © {new Date().getFullYear()} Fernand Soualo.{" "}
                {content.copyright.text.value}
              </p>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <RocketIcon className="h-3 w-3 text-primary animate-bounce" />
                <span>
                  {content.copyright.builtWith.text.value}{" "}
                  <span className="text-primary font-semibold">
                    {content.copyright.builtWith.nextjs.value}
                  </span>
                  ,{" "}
                  <span className="text-primary font-semibold">
                    {content.copyright.builtWith.tailwind.value}
                  </span>{" "}
                  &{" "}
                  <span className="text-primary font-semibold">
                    {content.copyright.builtWith.shadcn.value}
                  </span>
                </span>
                <span className="ml-1">❤️</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              {content.legal.links.map((link, index) => (
                <span key={link.href.value} className="flex items-center gap-3">
                  <LocaleAwareLink
                    href={link.href.value}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label.value}
                  </LocaleAwareLink>
                  {index < content.legal.links.length - 1 && <span>•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </footer>
  );
}
