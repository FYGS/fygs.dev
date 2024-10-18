import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  Code,
  LucideIcon,
  MessageCircle,
  Rss,
  StickyNote,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { Section } from "./Section";
// import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// // Dynamically import the Logo component with SSR disabled
// const DynamicLogo = dynamic(
//   () =>
//     Promise.resolve(({ icon: Icon, ...props }: { icon: LucideIcon }) => (
//       <Icon {...props} />
//     )),
//   { ssr: false }
// );

export const Status = () => {
  return (
    <Section className="flex max-md:flex-col items-start gap-4">
      <div className="flex-[3] w-full">
        <Card className="p-4 flex flex-col gap-2 w-full">
          <p className="text-lg text-muted-foreground">Fun Side projects.</p>
          <div className="flex flex-col gap-4">
            {SIDE_PROJECTS.map((project, index) => (
              <SideProject
                key={index}
                Logo={project.Logo}
                title={project.title}
                description={project.description}
                url={project.url}
              />
            ))}
          </div>
        </Card>
      </div>
      <div className="flex-[2] flex flex-col gap-4 w-full">
        <Card className="p-4 flex-1">Work</Card>
        <div className="flex flex-col gap-4">
          {WORKS.map((work, index) => (
            <Work key={index} {...work} />
          ))}
        </div>
        <Card className="p-4 flex-1 flex flex-col gap-2">
          <p className="text-lg text-muted-foreground">Contact me</p>
          <ContactCard
            name="@fygsdev"
            description="Follow me on LinkedIn"
            image="https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI"
            mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
          />
          <ContactCard
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

const ContactCard = ({
  image,
  mediumImage,
  name,
  description,
}: {
  image: string;
  mediumImage: string;
  name: string;
  description: string;
}) => {
  return (
    <Card className="p-3 bg-accent/10 hover:bg-accent/30 transition-colors group flex items-center gap-4">
      <div className="relative">
        <Image
          src={image}
          alt={name}
          width={32}
          height={32}
          className="size-10 rounded-full object-contain"
        />
        <Image
          src={mediumImage}
          alt={name}
          width={32}
          height={32}
          className="size-4 absolute -bottom-1 -right-1 rounded-full object-contain"
        />
      </div>
      <div className="mr-auto">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowUpRight
        className="group-hover:translate-x-2 mr-4 group-hover:-translate-y-2 transition-transform"
        size={16}
      />
    </Card>
  );
};

const SIDE_PROJECTS: SideProjectProps[] = [
  {
    Logo: Code,
    title: "Side Project",
    description: "Side Project",
    url: "https://github.com/your-username/your-repo",
  },
  {
    Logo: StickyNote,
    title: "Side Project",
    description: "Side Project",
    url: "https://github.com/your-username/your-repo",
  },
  {
    Logo: Rss,
    title: "Side Project",
    description: "Side Project",
    url: "https://github.com/your-username/your-repo",
  },
  {
    Logo: MessageCircle,
    title: "Side Project",
    description: "Side Project",
    url: "https://github.com/your-username/your-repo",
  },
  {
    Logo: Weight,
    title: "Side Project",
    description: "Side Project",
    url: "https://github.com/your-username/your-repo",
  },
];

interface SideProjectProps {
  Logo: LucideIcon;
  title: string;
  description: string;
  url: string;
}

const SideProject = ({ Logo, title, description, url }: SideProjectProps) => {
  return (
    <Link
      href={url}
      className="inline-flex items-center gap-4 hover:bg-accent/50 transition-colors p-1 rounded"
    >
      <span className="bg-accent text-accent-foreground p-3 rounded-sm">
        {/* <DynamicLogo icon={Logo} /> */}
        <Logo aria-hidden="true" focusable="false" size={16} />
      </span>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

const WORKS: WorkProps[] = [
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQHFm07UkgElyg/company-logo_100_100/company-logo_100_100/0/1719827406274/allianz_technology_logo?e=1737590400&v=beta&t=YNk3EHsDR2GUIQK2_xjIociM3jV1rxLhIR1Vw7CsJ7c",
    title: "Allianz Technology",
    role: "Backend Developer",
    date: "2023-Present",
    url: "/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4E0BAQGsvnH_VaICpQ/company-logo_100_100/company-logo_100_100/0/1695806357731/gehealthcare_logo?e=1737590400&v=beta&t=xdAnPGlSQCtnw3SDM7s0DMpM4Mts68drCAdd8jKE4zE",
    title: "GE Healthcare",
    role: "Software Engineer",
    date: "2019-2023",
    url: "/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGNfeTPCu6Z-w/company-logo_100_100/company-logo_100_100/0/1631312208065?e=1737590400&v=beta&t=3cjBMwLhAPbiLn7BqhUd5I_hS__L-KteLkfQKNPGuVY",
    title: "Schneider Electric",
    role: "Software Development Engineer",
    date: "2019-2019",
    url: "/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQHcRamGpx8bhQ/company-logo_100_100/company-logo_100_100/0/1660121048665/atlanspace_logo?e=1737590400&v=beta&t=IpbOkXBAh2pufA0aD_175eKvYEp9rwLgKV78VWMcWO8",
    title: "Atlanspace",
    role: "Embedded Software Development",
    date: "2017-2017",
    url: "/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQEdBM5K05bx3Q/company-logo_100_100/company-logo_100_100/0/1724419301337?e=1737590400&v=beta&t=d7Vk6bFmYo2JmGeIoXTbykAwT-8Lgztp7h-vuEEMXoY",
    title: "Ouestech",
    role: "Full Stack Software Development",
    date: "2019-Present",
    url: "/",
    freelance: true,
  },
];

interface WorkProps {
  image: string;
  title: string;
  role: string;
  date: string;
  url: string;
  freelance?: boolean;
}

const Work = ({ image, title, role, date, url, freelance }: WorkProps) => {
  return (
    <Link
      href={url}
      className="inline-flex items-center gap-4 hover:bg-accent/50 transition-colors p-1 rounded"
    >
      <Image
        src={image}
        alt={title}
        width={32}
        height={32}
        className="size-10 object-contain rounded-md"
      />
      <div className="mr-auto">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{title}</p>
          {freelance && (
            <Badge variant="outline" className="">
              Mission
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      <p className="text-xs text-end text-muted-foreground">{date}</p>
    </Link>
  );
};
