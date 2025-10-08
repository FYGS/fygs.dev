import {
  BrainCircuit,
  Building2,
  Fingerprint,
  Gift,
  GraduationCap,
  LayoutPanelLeft,
  LeafyGreenIcon,
  Loader,
  LucideIcon,
  Network,
  Utensils,
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
    id: "evopur",
    Logo: LeafyGreenIcon,
    title: "Evopur",
    description:
      "Professional ecological household cleaning services platform offering comprehensive home cleaning solutions with eco-friendly products and sustainable practices for a healthier living environment.",
    url: "https://evopur.ca",
  },
  {
    id: "ncr",
    Logo: Building2,
    title: "NCR - Certificats de Résidence",
    description:
      "A next-generation platform modernizing residence certificate management, streamlining administrative processes for local authorities and citizens alike.",
    url: "https://ncr.ouestech.com/",
  },
  {
    id: "quizzen",
    Logo: BrainCircuit,
    title: "QuizZen",
    description:
      "A specialized interactive platform for French naturalization interview preparation, covering history, values, and institutions of the French Republic.",
    url: "https://quizzen.fr/fr",
  },
  {
    id: "anumerique",
    Logo: Network,
    title: "A'Numérique",
    description:
      "An innovative service bridging the digital divide through personalized, at-home digital literacy training, fostering an inclusive digital society.",
    url: "https://www.anumerique.com/",
  },
  {
    id: "delices-rachetee",
    Logo: Utensils,
    title: "Les Délices de la Rachetée",
    description:
      "An artisanal French pastry showcase combining traditional craftsmanship with innovative techniques to deliver unique culinary experiences.",
    url: "https://lesdelicesdelarachetee.vercel.app/",
  },
  {
    id: "school-management",
    Logo: GraduationCap,
    title: "School Management System",
    description:
      "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions.",
    url: "https://school-management-app-psi.vercel.app",
  },
  {
    id: "plura-saas",
    Logo: LayoutPanelLeft,
    title: "Plura SaaS App",
    description:
      "A SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, project management module, and much more.",
    url: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
  },
  {
    id: "nextauth-v5",
    Logo: Fingerprint,
    title: "Next Auth v5 App",
    description:
      "A Next.js application that implements authentication using NextAuth v5, featuring user registration, login, logout functionalities, and Multi-Factor Authentication (MFA) with email code verification.",
    url: "https://gitlab.com/js-framework-projects/nextjs-projects/nextauth-v5-app",
  },
  {
    id: "js-universe",
    Logo: Loader,
    title: "JS Universe Blog App",
    description:
      "A blog application built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
    url: "https://js-universe-blog.netlify.app",
  },
  {
    id: "idees-kdo",
    Logo: Gift,
    title: "Idées KDO",
    description:
      "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords.",
    url: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
  },
];

interface SideProjectProps {
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
