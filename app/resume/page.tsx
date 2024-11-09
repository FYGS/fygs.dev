import { CVPreview } from "@/app/_components/CVPreview";
import { Section } from "@/app/_components/Section";
import { Timeline } from "@/app/_components/Timeline";
import { AvailabilityIndicator } from "@/components/ui/availability-indicator";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DownloadCVButton } from "@/components/ui/download-cv-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Calendar,
  Code2,
  ExternalLink,
  Globe2,
  GraduationCap,
  Linkedin,
  Mail,
  Phone,
  Rocket,
  Target,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import {
  CERTIFICATIONS,
  DESCRIPTION,
  EDUCATION_ITEMS,
  EXPERIENCE_ITEMS,
  PREFERENCES,
  SKILLS,
} from "./data";

export const metadata: Metadata = {
  title: "Fernand SOUALO - Professional Resume | Senior Software Engineer",
  description:
    "View my professional experience, skills, and achievements. Download my resume to learn more about my expertise in NodeJS, TypeScript, React, and AWS.",
};

export default function ResumePage() {
  return (
    <Section className="flex flex-col gap-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Fernand SOUALO</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Senior Software Engineer
          </p>
        </div>
        <DownloadCVButton />
      </div>

      {/* Description Section avec effets de survol */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary group-hover:scale-[1.02] transition-transform duration-300">
              {DESCRIPTION.intro.title}
            </h2>
            <p className="text-lg text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
              {DESCRIPTION.intro.subtitle}
            </p>
            <p className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
              {DESCRIPTION.intro.mainText}
            </p>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {DESCRIPTION.intro.description}
            </p>
          </div>

          {/* Industry Experience */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {DESCRIPTION.experience.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DESCRIPTION.experience.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card hover:bg-accent/50"
                >
                  <item.icon className="h-5 w-5 text-primary mt-1 transition-transform duration-300 group-hover:scale-110" />
                  <div>
                    <p className="font-medium hover:text-primary transition-colors duration-300">
                      {item.company}
                    </p>
                    <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
                      {item.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              {DESCRIPTION.services.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {DESCRIPTION.services.items.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-all duration-300 group cursor-default"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Me */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {DESCRIPTION.whyMe.title}
            </h3>
            <div className="space-y-2">
              {DESCRIPTION.whyMe.items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Expertise */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              {DESCRIPTION.expertise.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESCRIPTION.expertise.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-primary mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Professional Experience */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">
                Professional Experience
              </h2>
            </div>
            <Timeline items={EXPERIENCE_ITEMS} />
          </Card>

          {/* Education */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Education</h2>
            </div>
            <Timeline items={EDUCATION_ITEMS} variant="education" />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technical Skills avec effets de survol */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold hover:text-primary transition-colors duration-300">
                  Technical Skills
                </h2>
              </div>

              <div className="space-y-6">
                {SKILLS.technical.map(({ category, skills }) => (
                  <div
                    key={category}
                    className="space-y-2 hover:translate-x-1 transition-transform duration-300"
                  >
                    <h3 className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm transition-all duration-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
                  Continuously learning and exploring new technologies to stay
                  at the forefront of web development.
                </p>
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                Languages
              </h2>
            </div>
            <div className="space-y-3">
              {SKILLS.languages.map(({ language, level }) => (
                <div
                  key={language}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/50 transition-all duration-300 group/item cursor-default"
                >
                  <span className="font-medium group-hover/item:text-primary transition-colors duration-300">
                    {language}
                  </span>
                  <span className="text-muted-foreground px-3 py-1 rounded-full border border-transparent group-hover/item:border-primary/30 group-hover/item:bg-primary/5 transition-all duration-300">
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                Certifications
              </h2>
            </div>
            <div className="space-y-4">
              {CERTIFICATIONS.map((cert) => (
                <Link
                  key={cert.title}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-accent/50 transition-all duration-300 group/cert"
                >
                  <div className="space-y-2">
                    <div className="font-medium group-hover/cert:text-primary transition-colors duration-300 flex items-center justify-between">
                      {cert.title}
                      <ExternalLink className="h-4 w-4 opacity-0 group-hover/cert:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground flex items-center justify-between">
                        <span className="group-hover/cert:text-foreground transition-colors duration-300">
                          {cert.issuer}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs border border-transparent group-hover/cert:border-primary/30 group-hover/cert:bg-primary/5 transition-all duration-300">
                          {cert.date} - {cert.validUntil}
                        </span>
                      </div>
                      <div className="text-muted-foreground/80 group-hover/cert:text-muted-foreground transition-colors duration-300">
                        Credential ID: {cert.credentialId}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{PREFERENCES.title}</h2>
              </div>

              <div className="space-y-4">
                {PREFERENCES.sections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <section.icon className="h-4 w-4" />
                      <h3 className="text-sm font-medium">{section.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option: string) => (
                        <TooltipProvider key={option}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "text-sm px-3 py-1 rounded-full border transition-all duration-300",
                                  "hover:scale-105 hover:shadow-md cursor-pointer",
                                  "transform-gpu hover:-translate-y-0.5",
                                  option === section.current
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/30"
                                )}
                              >
                                {option}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>
                                {
                                  section.details[
                                    option as keyof typeof section.details
                                  ]
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="pt-4 border-t opacity-0 translate-y-4 transition-all duration-500"
                style={{
                  animation: "fadeInSlideUp 0.5s ease-out 0.2s forwards",
                }}
              >
                <p className="text-sm text-muted-foreground">
                  Open to discussing flexible arrangements based on project
                  requirements
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CV Preview Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Preview CV</h2>
            <DownloadCVButton />
          </div>
          <CVPreview />
        </div>
      </Card>

      {/* Call to Action Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let&apos;s collaborate to transform your ideas into exceptional
              digital solutions. I&apos;m available for freelance projects and
              technical consulting.
            </p>

            {/* Indicateur de disponibilité */}
            <div className="flex justify-center">
              <AvailabilityIndicator />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="mailto:fygs.dev@gmail.com"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "group min-w-[200px] bg-primary/90 hover:bg-primary transition-all duration-300"
              )}
            >
              <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              Email Me
            </Link>

            {/* Calendrier de réservation */}
            {/* <BookingCalendar /> */}
            <Link
              href="https://calendly.com/fygs-dev/first-contact"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md transition-colors duration-300"
              )}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Meeting
            </Link>

            <Link
              href="https://www.linkedin.com/in/fernandsoualo"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "group min-w-[200px] hover:bg-primary/10 transition-all duration-300"
              )}
            >
              <Linkedin className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Connect on LinkedIn
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Mail className="h-4 w-4" />
              fygs.dev@gmail.com
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Phone className="h-4 w-4" />
              +33 6 44 80 85 30
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Linkedin className="h-4 w-4" />
              @fernandsoualo
            </div>
          </div>

          <div
            className="text-center pt-4 text-sm text-muted-foreground opacity-0 animate-fadeIn"
            style={{
              animation: "fadeIn 0.5s ease-in-out 0.5s forwards",
            }}
          >
            Available for projects worldwide • Quick response within 24 hours
          </div>
        </div>
      </Card>
    </Section>
  );
}
