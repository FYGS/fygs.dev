import { Badge } from "@/components/ui/badge";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";

export const Contact = () => {
  return (
    <Section className="flex flex-col items-start gap-4">
      <Badge variant="outline">Contact me</Badge>
      <h2 className="pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Feel free to reach out to me through any of the following platforms.
        I&apos;m always open to discussing new projects, creative ideas, or
        opportunities to be part of your vision.
      </h2>
      <div className="flex max-md:flex-col w-full gap-4">
        <ContactCard
          className="flex-1"
          url="https://www.linkedin.com/in/fernandsoualo/"
          name="@fernandsoualo"
          description="Follow me on LinkedIn"
          image="https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI"
          mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
        />
        <ContactCard
          className="flex-1"
          url="https://github.com/fygs"
          name="@fygsdev"
          description="Follow me on GitHub"
          image="https://avatars.githubusercontent.com/u/24303747?v=4"
          mediumImage="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
        />
        <ContactCard
          className="flex-1"
          url="mailto:fygs.dev@gmail.com"
          name="me@contact.com"
          description="Email me for business inquiries"
          image="https://lh3.googleusercontent.com/a/ACg8ocIMjYoOFbL2_xkgKy1N114BS3AvMok9pZfr_Qj9W03TOiJNCGw1=s83-c-mo"
          mediumImage="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/640px-Gmail_icon_%282020%29.svg.png"
        />
      </div>
    </Section>
  );
};
