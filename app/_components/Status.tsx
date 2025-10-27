"use client";
import { Card } from "@/components/ui/card";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { SIDE_PROJECTS, SideProject } from "./SideProjects";
import { Work, WORKS } from "./Work";
import { motion } from "framer-motion";
import { Briefcase, Code, Mail } from "lucide-react";

export const Status = () => {
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
            Portfolio & Contact
          </motion.div>
            <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            >
            Projects & Contact
            </motion.h2>
            <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            >
            Discover my personal projects and how to contact me
            </motion.p>
        </div>
        
        <div className="flex max-md:flex-col items-start gap-6">
          <div className="flex-3 w-full">
            <Card className="p-6 flex flex-col gap-4 w-full bg-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Fun Side Projects</h3>
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
                <h3 className="text-xl font-semibold text-foreground">Work</h3>
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
                <h3 className="text-xl font-semibold text-foreground">Contact</h3>
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
