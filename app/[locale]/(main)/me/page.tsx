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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  Globe2,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Target,
  Train,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useIntlayer } from "next-intlayer/server";
import {
  CERTIFICATIONS,
  EDUCATION_ITEMS,
  EXPERIENCE_ITEMS,
  SKILLS,
} from "./data";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ResumePage({ params }: Props) {
  const { locale } = await params;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cv = useIntlayer("cv-page", locale);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cvData = useIntlayer("cv-data", locale);

  // Combine localized data with icons
  const experienceItems = [
    {
      icon: Briefcase,
      company: cvData.description.experience.allianz.company,
      role: cvData.description.experience.allianz.role,
    },
    {
      icon: Briefcase,
      company: cvData.description.experience.ge.company,
      role: cvData.description.experience.ge.role,
    },
    {
      icon: Rocket,
      company: cvData.description.experience.ouestech.company,
      role: cvData.description.experience.ouestech.role,
    },
  ];

  const expertiseItems = [
    {
      icon: Code2,
      title: cvData.description.expertise.react.title,
      description: cvData.description.expertise.react.description,
    },
    {
      icon: Workflow,
      title: cvData.description.expertise.nodejs.title,
      description: cvData.description.expertise.nodejs.description,
    },
    {
      icon: Code2,
      title: cvData.description.expertise.python.title,
      description: cvData.description.expertise.python.description,
    },
    {
      icon: Rocket,
      title: cvData.description.expertise.cloud.title,
      description: cvData.description.expertise.cloud.description,
    },
  ];

  const servicesItems = [
    cvData.description.services.items.webDev,
    cvData.description.services.items.modernization,
    cvData.description.services.items.optimization,
    cvData.description.services.items.cicd,
    cvData.description.services.items.api,
    cvData.description.services.items.training,
    cvData.description.services.items.workshops,
    cvData.description.services.items.support,
  ];

  const whyMeItems = [
    {
      icon: Target,
      text: cvData.description.whyMe.items.expertise,
    },
    {
      icon: Users,
      text: cvData.description.whyMe.items.translation,
    },
    {
      icon: Award,
      text: cvData.description.whyMe.items.results,
    },
  ];

  const preferenceSections = [
    {
      icon: Clock,
      title: cvData.preferences.workSchedule.title,
      options: ["5 days/week", "1-4 days/week"],
      current: "5 days/week",
      details: {
        "5 days/week": cvData.preferences.workSchedule.detail5days,
        "1-4 days/week": cvData.preferences.workSchedule.detail1to4days,
      },
    },
    {
      icon: Calendar,
      title: cvData.preferences.contractDuration.title,
      options: ["0-6 months", "6+ months"],
      current: "6+ months",
      details: {
        "0-6 months": cvData.preferences.contractDuration.detailShort,
        "6+ months": cvData.preferences.contractDuration.detailLong,
      },
    },
    {
      icon: Building2,
      title: cvData.preferences.workEnvironment.title,
      options: ["On-site", "Hybrid", "Remote"],
      current: "Hybrid",
      details: {
        "On-site": cvData.preferences.workEnvironment.detailOnsite,
        Hybrid: cvData.preferences.workEnvironment.detailHybrid,
        Remote: cvData.preferences.workEnvironment.detailRemote,
      },
    },
    {
      icon: Train,
      title: cvData.preferences.mobility.title,
      options: ["Île-de-France region"],
      current: "Île-de-France region",
      details: {
        "Île-de-France region": cvData.preferences.mobility.detail,
      },
    },
    {
      icon: MapPin,
      title: cvData.preferences.location.title,
      options: ["Paris, France"],
      current: "Paris, France",
      details: {
        "Paris, France": cvData.preferences.location.detail,
      },
    },
  ];

  // Build localized experience items
  const expEntries = [
    cvData.experiences.allianz,
    cvData.experiences.ouestech,
    cvData.experiences.geHealthcare1,
    cvData.experiences.geHealthcare2,
    cvData.experiences.schneider,
    cvData.experiences.atlanSpace,
  ];
  const contractTypeMap: Record<string, unknown> = {
    "Full-time": cvData.contractTypes.fullTime,
    Entrepreneurship: cvData.contractTypes.entrepreneurship,
    Internship: cvData.contractTypes.internship,
  };
  const localizedExperiences = EXPERIENCE_ITEMS.map((item, i) => {
    const exp = expEntries[i];
    return {
      ...item,
      title: exp.title as unknown as string,
      type: (contractTypeMap[item.type || ""] ??
        item.type) as unknown as string,
      description: Object.values(exp.description) as unknown as string[],
      achievements: Object.values(exp.achievements) as unknown as string[],
      context: exp.context as unknown as string,
      date: item.current
        ? item.date.replace("Present", String(cvData.present))
        : item.date,
    };
  });

  // Build localized education items
  const eduEntries = [
    cvData.education.sorbonne,
    cvData.education.upmc,
    cvData.education.ensa,
    cvData.education.lycee,
  ];
  const localizedEducation = EDUCATION_ITEMS.map((item, i) => {
    const edu = eduEntries[i];
    return {
      ...item,
      title: edu.title as unknown as string,
      description: Object.values(edu.description) as unknown as string[],
      achievements: Object.values(edu.achievements) as unknown as string[],
    };
  });

  // Build localized technical skills
  const categoryMap: Record<string, unknown> = {
    "Backend Development": cvData.skillCategories.backend,
    "Frontend Development": cvData.skillCategories.frontend,
    "Cloud & DevOps": cvData.skillCategories.cloud,
    "Databases & Storage": cvData.skillCategories.databases,
  };
  const localizedTechnicalSkills = SKILLS.technical.map(
    ({ category, skills }) => ({
      category: (categoryMap[category] ?? category) as unknown as string,
      skills,
    }),
  );

  // Build localized languages
  const localizedLanguages = [
    {
      language: cvData.spokenLanguages.french.name,
      level: cvData.spokenLanguages.french.level,
    },
    {
      language: cvData.spokenLanguages.english.name,
      level: cvData.spokenLanguages.english.level,
    },
  ];

  // Build localized soft skills
  const localizedSoftSkills = [
    cvData.softSkills.leadership,
    cvData.softSkills.problemSolving,
    cvData.softSkills.teamwork,
    cvData.softSkills.agile,
    cvData.softSkills.projectManagement,
    cvData.softSkills.clientComm,
  ];

  return (
    <Section className="flex flex-col gap-8 py-8">
      {/* Header */}
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Fernand SOUALO
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 rounded-full bg-primary" />
              <p className="text-lg sm:text-xl text-primary font-medium">
                {cv.role}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Paris, France
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> fygs.dev@gmail.com
              </span>
            </div>
          </div>
          <DownloadCVButton />
        </div>
      </Card>

      {/* Description Section avec effets de survol */}
      <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group border-t-2 border-t-primary/30">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary group-hover:scale-[1.01] transition-transform duration-300">
              {cvData.description.intro.title}
            </h2>
            <p className="text-lg text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
              {cvData.description.intro.subtitle}
            </p>
            <p className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
              {cvData.description.intro.mainText}
            </p>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {cvData.description.intro.description}
            </p>
          </div>

          {/* Industry Experience */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {cvData.description.experience.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {experienceItems.map((item, index) => (
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
              {cvData.description.services.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {servicesItems.map((service, index) => (
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
              {cvData.description.whyMe.title}
            </h3>
            <div className="space-y-2">
              {whyMeItems.map((item, index) => (
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
              {cvData.description.expertise.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expertiseItems.map((item, index) => (
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
                {cv.sections.experience}
              </h2>
            </div>
            <Timeline items={localizedExperiences} />
          </Card>

          {/* Education */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">
                {cv.sections.education}
              </h2>
            </div>
            <Timeline items={localizedEducation} variant="education" />
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
                  {cv.sections.technicalSkills}
                </h2>
              </div>

              <div className="space-y-6">
                {localizedTechnicalSkills.map(({ category, skills }) => (
                  <div
                    key={String(category)}
                    className="space-y-2.5 hover:translate-x-0.5 transition-transform duration-300"
                  >
                    <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-xs transition-all duration-300"
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
                  {cv.skills.learningNote}
                </p>
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                {cv.sections.languages}
              </h2>
            </div>
            <div className="space-y-3">
              {localizedLanguages.map(({ language, level }, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2.5 rounded-lg hover:bg-accent/50 transition-all duration-300 group/item cursor-default"
                >
                  <span className="font-medium group-hover/item:text-primary transition-colors duration-300">
                    {language}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-primary/20 group-hover/item:bg-primary/10 transition-all duration-300"
                  >
                    {level}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Soft Skills */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                {cv.sections.softSkills}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {localizedSoftSkills.map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-primary/5 text-primary/90 hover:bg-primary/15 hover:scale-105 transition-all duration-300 cursor-default"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                {cv.sections.certifications}
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
                          {cert.date} - {cvData.certification.validUntil}
                        </span>
                      </div>
                      <div className="text-muted-foreground/80 group-hover/cert:text-muted-foreground transition-colors duration-300">
                        {cv.certifications.credentialId} {cert.credentialId}
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
                <h2 className="text-xl font-semibold">
                  {cvData.preferences.title}
                </h2>
              </div>

              <div className="space-y-4">
                {preferenceSections.map((section, index) => (
                  <div
                    key={String(section.title) + index}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <section.icon className="h-4 w-4" />
                      <h3 className="text-sm font-medium">{section.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option: string) => (
                        <Tooltip key={option}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "text-sm px-3 py-1 rounded-full border transition-all duration-300",
                                "hover:scale-105 hover:shadow-md cursor-pointer",
                                "transform-gpu hover:-translate-y-0.5",
                                option === section.current
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/30",
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
                  {cv.preferences.flexNote}
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
            <h2 className="text-2xl font-bold">{cv.preview.title}</h2>
            <DownloadCVButton />
          </div>
          <CVPreview />
        </div>
      </Card>

      {/* Call to Action Section */}
      <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              {cv.cta.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {cv.cta.description}
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
                "group min-w-[200px] bg-primary/90 hover:bg-primary transition-all duration-300",
              )}
            >
              <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              {cv.cta.emailMe}
            </Link>

            {/* Calendrier de réservation */}
            {/* <BookingCalendar /> */}
            <Link
              href="https://calendly.com/fygs-dev/first-contact"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md transition-colors duration-300",
              )}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {cv.cta.scheduleMeeting}
            </Link>

            <Link
              href="https://www.linkedin.com/in/fernandsoualo"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "group min-w-[200px] hover:bg-primary/10 transition-all duration-300",
              )}
            >
              <Linkedin className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              {cv.cta.connectLinkedin}
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
            {cv.cta.availability}
          </div>
        </div>
      </Card>
    </Section>
  );
}
