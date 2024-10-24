import {
  Fingerprint,
  Gift,
  GraduationCap,
  LayoutPanelLeft,
  Loader,
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

export const SIDE_PROJECTS: SideProjectProps[] = [
  {
    Logo: GraduationCap,
    title: "School Management System",
    description:
      "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions.",
    url: "https://school-management-app-hvm9.onrender.com",
  },
  {
    Logo: Fingerprint,
    title: "Next Auth v5 App",
    description:
      "A Next.js application that implements authentication using NextAuth v5, featuring user registration, login, logout functionalities, and Multi-Factor Authentication (MFA) with email code verification.",
    url: "https://gitlab.com/js-framework-projects/nextjs-projects/nextauth-v5-app",
  },
  {
    Logo: Gift,
    title: "Idées KDO",
    description:
      "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords.",
    url: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
  },
  {
    Logo: Loader,
    title: "JS Universe Blog App",
    description:
      "A blog application built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
    url: "https://js-universe-blog.netlify.app",
  },
  {
    Logo: LayoutPanelLeft,
    title: "Plura SaaS App",
    description:
      "A SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, project management module, and much more.",
    url: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
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
      target="_blank"
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
