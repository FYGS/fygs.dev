import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Section } from "./Section";
import { GithubIcon } from "./icons/GithubIcon";
import { LinkedInIcon } from "./icons/LinkedInIcon";
import { GitLabIcon } from "./icons/GitlabIcon";
import { HashnodeIcon } from "./icons/HashnodeIcon";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-card backdrop-blur-md transition-colors duration-300 shadow-lg">
      <Section className="flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold text-foreground tracking-wide"
        >
          fygs.dev \_°&lt;
        </Link>
        <nav>
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href="https://www.linkedin.com/in/fernandsoualo"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-8 p-1"
                )}
                title="LinkedIn"
              >
                <LinkedInIcon size={16} className="text-foreground" />
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/fygs"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-8 p-1"
                )}
                title="GitHub"
              >
                <GithubIcon size={16} className="text-foreground" />
              </Link>
            </li>
            <li>
              <Link
                href="https://gitlab.com/fygs"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-8 p-1"
                )}
                title="GitLab"
              >
                <GitLabIcon size={16} className="text-foreground" />
              </Link>
            </li>
            <li>
              <Link
                href="https://hashnode.com/@FYGS"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-8 p-1"
                )}
                title="Hashnode"
              >
                <HashnodeIcon size={16} className="text-foreground" />
              </Link>
            </li>
          </ul>
        </nav>
      </Section>
    </header>
  );
};
