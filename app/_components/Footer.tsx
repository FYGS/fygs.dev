import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BrainCircuitIcon,
  Code2Icon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  RocketIcon,
} from "lucide-react";
import Link from "next/link";
import { Section } from "./Section";

const FOOTER_LINKS = {
  main: [
    { href: "/projects", label: "Projects" },
    { href: "/interview-prep", label: "Interview Prep" },
    { href: "/blog", label: "Blog" },
    { href: "/resume", label: "Resume" },
  ],
  projects: [
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
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background/5 pointer-events-none" />

      <Section className="relative pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 p-4 rounded-lg bg-card/50 border shadow-sm">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight hover:text-primary transition-colors"
            >
              fygs.dev \_°&lt;
            </Link>
            <p className="text-sm text-muted-foreground">
              Freelance Full-Stack Developer specialized in modern web
              applications and technical consulting.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 p-4 rounded-lg bg-accent/5">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Navigation
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.main.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Projects */}
          <div className="space-y-4 p-4 rounded-lg bg-accent/5">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Featured Projects
            </h3>
            <ul className="space-y-3 [&_li]:relative [&_li]:pl-2 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-0.5 [&_li]:before:h-4 [&_li]:before:bg-muted-foreground/20 [&_li:hover]:before:bg-primary [&_li]:before:transition-colors">
              {FOOTER_LINKS.projects.map(
                ({ href, label, description, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group block space-y-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="text-sm font-semibold flex items-center gap-2 pb-2 border-b border-primary/10">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Get in Touch
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.contact.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" }),
                      "p-0 h-auto text-muted-foreground hover:text-primary"
                    )}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright with enhanced separator */}
        <div className="mt-16 pt-8 border-t relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent before:-top-px before:h-px">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fernand Soualo. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with Next.js 15, Tailwind CSS & Shadcn UI
            </p>
          </div>
        </div>
      </Section>
    </footer>
  );
}
