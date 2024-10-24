import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export const WORKS: WorkProps[] = [
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQHFm07UkgElyg/company-logo_100_100/company-logo_100_100/0/1719827406274/allianz_technology_logo?e=1737590400&v=beta&t=YNk3EHsDR2GUIQK2_xjIociM3jV1rxLhIR1Vw7CsJ7c",
    title: "Allianz Technology",
    role: "Backend Developer",
    date: "2023-Present",
    url: "https://www.linkedin.com/company/allianz-technology/posts/?feedView=all",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4E0BAQGsvnH_VaICpQ/company-logo_100_100/company-logo_100_100/0/1695806357731/gehealthcare_logo?e=1737590400&v=beta&t=xdAnPGlSQCtnw3SDM7s0DMpM4Mts68drCAdd8jKE4zE",
    title: "GE Healthcare",
    role: "Software Engineer",
    date: "2019-2023",
    url: "https://www.linkedin.com/company/gehealthcare/posts/?feedView=all",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGNfeTPCu6Z-w/company-logo_100_100/company-logo_100_100/0/1631312208065?e=1737590400&v=beta&t=3cjBMwLhAPbiLn7BqhUd5I_hS__L-KteLkfQKNPGuVY",
    title: "Schneider Electric",
    role: "Software Development Engineer",
    date: "2019-2019",
    url: "https://www.linkedin.com/company/schneider-electric/posts/?feedView=all",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQHcRamGpx8bhQ/company-logo_100_100/company-logo_100_100/0/1660121048665/atlanspace_logo?e=1737590400&v=beta&t=IpbOkXBAh2pufA0aD_175eKvYEp9rwLgKV78VWMcWO8",
    title: "Atlanspace",
    role: "Embedded Software Development",
    date: "2017-2017",
    url: "https://www.linkedin.com/company/atlanspace/posts/?feedView=all",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQEdBM5K05bx3Q/company-logo_100_100/company-logo_100_100/0/1724419301337?e=1737590400&v=beta&t=d7Vk6bFmYo2JmGeIoXTbykAwT-8Lgztp7h-vuEEMXoY",
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
