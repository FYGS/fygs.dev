import {
  Code,
  LucideIcon,
  MessageCircle,
  Rss,
  StickyNote,
  Weight,
} from "lucide-react";
import Link from "next/link";

// import dynamic from "next/dynamic";

// // Dynamically import the Logo component with SSR disabled
// const DynamicLogo = dynamic(
//   () =>
//     Promise.resolve(({ icon: Icon, ...props }: { icon: LucideIcon }) => (
//       <Icon {...props} />
//     )),
//   { ssr: false }
// );

export const SIDE_PROJECTS: SideProjectProps[] = [
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

export const SideProject = ({
  Logo,
  title,
  description,
  url,
}: SideProjectProps) => {
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
