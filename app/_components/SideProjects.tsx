import {
  LucideIcon,
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

export interface SideProjectProps {
  id: string;
  Logo: LucideIcon;
  title: string;
  description: string;
  url?: string;
}

export const SideProject = ({
  Logo,
  title,
  description,
  id,
}: SideProjectProps) => {
  return (
    <Link
      href={`/projects/${id}`}
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
