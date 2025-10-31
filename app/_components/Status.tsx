"use client";
import { Card } from "@/components/ui/card";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { SideProject, SideProjectProps } from "./SideProjects";
import { Work, WorkProps } from "./Work";
import { motion } from "framer-motion";
import { Briefcase, Code, Mail } from "lucide-react";
import { useIntlayer } from "next-intlayer";

// const WORKS: WorkProps[] = [
//   {
//     image: "/companies/allianz_technology_logo.jpg",
//     title: "Allianz Technology",
//     role: "Backend Developer",
//     date: "2023-Present",
//     url: "https://www.linkedin.com/company/allianz-technology/posts/?feedView=all",
//   },
//   {
//     image: "/companies/ge_healthcare_logo.png",
//     title: "GE Healthcare",
//     role: "Software Engineer",
//     date: "2019-2023",
//     url: "https://www.linkedin.com/company/gehealthcare/posts/?feedView=all",
//   },
//   {
//     image: "/companies/schneider_electric_logo.webp",
//     title: "Schneider Electric",
//     role: "Software Development Engineer",
//     date: "2019-2019",
//     url: "https://www.linkedin.com/company/schneider-electric/posts/?feedView=all",
//   },
//   {
//     image: "/companies/atlan_space_logo.png",
//     title: "Atlanspace",
//     role: "Embedded Software Development",
//     date: "2017-2017",
//     url: "https://www.linkedin.com/company/atlanspace/posts/?feedView=all",
//   },
//   {
//     image: "/companies/ouestech_logo.png",
//     title: "Ouestech",
//     role: "Full Stack Software Development",
//     date: "2019-Present",
//     url: "https://www.linkedin.com/company/ouestech-sarl/posts/?feedView=all",
//     freelance: true,
//   },
// ];

// const SIDE_PROJECTS: SideProjectProps[] = [
//   {
//     id: "evopur",
//     Logo: LeafyGreenIcon,
//     title: "Evopur",
//     description:
//       "Professional ecological household cleaning services platform offering comprehensive home cleaning solutions with eco-friendly products and sustainable practices for a healthier living environment.",
//     url: "https://evopur.ca",
//   },
//   {
//     id: "ncr",
//     Logo: Building2,
//     title: "NCR - Certificats de Résidence",
//     description:
//       "A next-generation platform modernizing residence certificate management, streamlining administrative processes for local authorities and citizens alike.",
//     url: "https://ncr.ouestech.com/",
//   },
//   {
//     id: "quizzen",
//     Logo: BrainCircuit,
//     title: "QuizZen",
//     description:
//       "A specialized interactive platform for French naturalization interview preparation, covering history, values, and institutions of the French Republic.",
//     url: "https://quizzen.fr/fr",
//   },
//   {
//     id: "anumerique",
//     Logo: Network,
//     title: "A'Numérique",
//     description:
//       "An innovative service bridging the digital divide through personalized, at-home digital literacy training, fostering an inclusive digital society.",
//     url: "https://www.anumerique.com/",
//   },
//   {
//     id: "delices-rachetee",
//     Logo: Utensils,
//     title: "Les Délices de la Rachetée",
//     description:
//       "An artisanal French pastry showcase combining traditional craftsmanship with innovative techniques to deliver unique culinary experiences.",
//     url: "https://lesdelicesdelarachetee.vercel.app/",
//   },
//   {
//     id: "school-management",
//     Logo: GraduationCap,
//     title: "School Management System",
//     description:
//       "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions.",
//     url: "https://school-management-app-psi.vercel.app",
//   },
//   {
//     id: "plura-saas",
//     Logo: LayoutPanelLeft,
//     title: "Plura SaaS App",
//     description:
//       "A SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, project management module, and much more.",
//     url: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
//   },
//   {
//     id: "nextauth-v5",
//     Logo: Fingerprint,
//     title: "Next Auth v5 App",
//     description:
//       "A Next.js application that implements authentication using NextAuth v5, featuring user registration, login, logout functionalities, and Multi-Factor Authentication (MFA) with email code verification.",
//     url: "https://gitlab.com/js-framework-projects/nextjs-projects/nextauth-v5-app",
//   },
//   {
//     id: "js-universe",
//     Logo: Loader,
//     title: "JS Universe Blog App",
//     description:
//       "A blog application built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
//     url: "https://js-universe-blog.netlify.app",
//   },
//   {
//     id: "idees-kdo",
//     Logo: Gift,
//     title: "Idées KDO",
//     description:
//       "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords.",
//     url: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
//   },
// ];

export const Status = () => {
  const content = useIntlayer("status");
  
  const WORKS: WorkProps[] = content.works.map((work) => ({
    image: work.image.value,
    title: work.title.value,
    role: work.role.value,
    date: work.date.value,
    url: work.url.value,
  }));

  const SIDE_PROJECTS: SideProjectProps[] = content.sideProjects.map((project) => ({
    id: project.id.value,
    Logo: project.Logo.value,
    title: project.title.value,
    description: project.description.value,
    url: project.url.value,
  }));

  return (
    <Section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Code className="h-4 w-4" />
            {content.title}
          </motion.div>
            <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            >
            {content.subtitle}
            </motion.h2>
            <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            >
            {content.description}
            </motion.p>
        </div>
        
        <div className="flex max-md:flex-col items-start gap-6">
          <div className="flex-3 w-full">
            <Card className="p-6 flex flex-col gap-4 w-full bg-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{content.sideProjectTitle}</h3>
              </div>
              <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent hover:scrollbar-thumb-accent/80">
                {SIDE_PROJECTS.map((project, index) => (
                  <SideProject
                    key={index}
                    id={project.id}
                    Logo={project.Logo}
                    title={project.title}
                    description={project.description}
                  />
                ))}
              </div>
            </Card>
          </div>
          <div className="flex-2 flex flex-col gap-6 w-full">
            <Card className="p-6 flex-1 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{content.workTitle}</h3>
              </div>
              <div className="flex flex-col gap-6">
                {WORKS.map((work, index) => (
                  <Work key={index} {...work} />
                ))}
              </div>
            </Card>
            <Card className="p-6 flex-1 flex flex-col gap-4 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{content.contactTitle}</h3>
              </div>
              <ContactCard
                url="mailto:fygs.dev@gmail.com"
                name="me@contact.com"
                description="Email me for any inquiries"
                image="https://lh3.googleusercontent.com/a/ACg8ocIMjYoOFbL2_xkgKy1N14BS3AvMok9pZfr_Qj9W03TOiJNCGw1=s83-c-mo"
                mediumImage="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/640px-Gmail_icon_%282020%29.svg.png"
              />
              <ContactCard
                url="https://www.linkedin.com/in/fernandsoualo/"
                name="@fernandsoualo"
                description="Follow me on LinkedIn"
                image="/linkedin_profile_photo.jpeg"
                mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
              />
              <ContactCard
                url="https://github.com/fygs"
                name="@fygsdev"
                description="Follow me on GitHub"
                image="https://avatars.githubusercontent.com/u/24303747?v=4"
                mediumImage="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
              />
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
};
