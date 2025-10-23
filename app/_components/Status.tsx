import { Card } from "@/components/ui/card";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { SIDE_PROJECTS, SideProject } from "./SideProjects";
import { Work, WORKS } from "./Work";

export const Status = () => {
  return (
    <Section className="flex max-md:flex-col items-start gap-6">
      <div className="flex-3 w-full">
        <Card className="p-6 flex flex-col gap-4 w-full">
          <p className="text-xl text-muted-foreground font-semibold">
            Fun Side Projects
          </p>
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
        <Card className="p-6 flex-1">
          <p className="text-xl text-muted-foreground font-semibold">Work</p>
          <div className="flex flex-col gap-6">
            {WORKS.map((work, index) => (
              <Work key={index} {...work} />
            ))}
          </div>
        </Card>
        <Card className="p-6 flex-1 flex flex-col gap-4">
          <p className="text-xl text-muted-foreground font-semibold">
            Contact Me
          </p>
          <ContactCard
            url="mailto:fygs.dev@gmail.com"
            name="me@contact.com"
            description="Email me for any inquiries"
            image="https://lh3.googleusercontent.com/a/ACg8ocIMjYoOFbL2_xkgKy1N114BS3AvMok9pZfr_Qj9W03TOiJNCGw1=s83-c-mo"
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
    </Section>
  );
};
