import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export const WORKS: WorkProps[] = [
  {
    image: "/companies/allianz_technology_logo.jpg",
    title: "Allianz Technology",
    role: "Backend Developer",
    date: "2023-Present",
    url: "https://www.linkedin.com/company/allianz-technology/posts/?feedView=all",
  },
  {
    image: "/companies/ge_healthcare_logo.png",
    title: "GE Healthcare",
    role: "Software Engineer",
    date: "2019-2023",
    url: "https://www.linkedin.com/company/gehealthcare/posts/?feedView=all",
  },
  {
    image: "/companies/schneider_electric_logo.webp",
    title: "Schneider Electric",
    role: "Software Development Engineer",
    date: "2019-2019",
    url: "https://www.linkedin.com/company/schneider-electric/posts/?feedView=all",
  },
  {
    image: "/companies/atlan_space_logo.png",
    title: "Atlanspace",
    role: "Embedded Software Development",
    date: "2017-2017",
    url: "https://www.linkedin.com/company/atlanspace/posts/?feedView=all",
  },
  {
    image: "/companies/ouestech_logo.png",
    title: "Ouestech",
    role: "Full Stack Software Development",
    date: "2019-Present",
    url: "https://www.linkedin.com/company/ouestech-sarl/posts/?feedView=all",
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

export const Work = ({
  image,
  title,
  role,
  date,
  url,
  freelance,
}: WorkProps) => {
  return (
    <Link
      href={url}
      className="inline-flex items-center gap-4 hover:bg-accent/50 transition-colors p-1 rounded"
      target="_blank"
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
