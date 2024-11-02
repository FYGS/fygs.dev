"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { NavigationIndicator } from "@/components/ui/navigation-indicator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GithubIcon } from "./icons/GithubIcon";
import { GitLabIcon } from "./icons/GitlabIcon";
import { HashnodeIcon } from "./icons/HashnodeIcon";
import { LinkedInIcon } from "./icons/LinkedInIcon";

const NAVIGATION_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/blog", label: "Blog" },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/fernandsoualo",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/fygs",
    icon: GithubIcon,
    label: "GitHub",
  },
  {
    href: "https://gitlab.com/fygs",
    icon: GitLabIcon, // Assuming a similar icon for GitLab
    label: "GitLab",
  },
  {
    href: "https://hashnode.com/@fygs",
    icon: HashnodeIcon,
    label: "Hashnode",
  },
] as const;

export const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md transition-colors duration-300 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <nav className="flex items-center justify-between">
            {/* Logo avec nowrap et taille fixe */}
            <Link
              href="/"
              className="text-lg md:text-2xl font-extrabold text-foreground tracking-wide hover:text-primary transition-colors whitespace-nowrap flex-shrink-0"
              aria-label="Go to homepage"
            >
              <span className="sr-only">FYGS.dev - Homepage</span>
              fygs.dev \_°&lt;
            </Link>

            {/* Desktop Navigation - Masqué sur mobile */}
            <div className="hidden md:flex items-center gap-6">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-base font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex items-center gap-2 ml-2 border-l pl-4 border-border">
                <ThemeToggle />
                {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-8 p-1.5 hover:text-primary transition-colors"
                    )}
                    aria-label={label}
                  >
                    <Icon className="size-full" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu - Uniquement les contrôles essentiels visibles */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "flex-shrink-0"
                  )}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                  <SheetHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-left text-lg font-semibold">
                        Navigation
                      </SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="flex flex-col py-4">
                    {NAVIGATION_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "px-6 py-3 text-base transition-colors",
                          pathname === item.href
                            ? "bg-accent text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                        aria-current={pathname === item.href ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-border mt-4 pt-4 px-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        Follow me on
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              }),
                              "size-9"
                            )}
                            aria-label={label}
                          >
                            <Icon className="size-4" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>
      <NavigationIndicator
        items={NAVIGATION_ITEMS}
        className="z-40 hidden md:block"
      />
    </>
  );
};
