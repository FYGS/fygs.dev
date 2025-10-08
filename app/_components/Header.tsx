"use client";

// import { ThemeToggle } from "@/components/theme-toggle";
import { NavItem } from "@/app/_components/ui/nav-item";
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
import { Menu, MoreHorizontal, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GithubIcon } from "./icons/GithubIcon";
import { GitLabIcon } from "./icons/GitlabIcon";
import { HashnodeIcon } from "./icons/HashnodeIcon";
import { LinkedInIcon } from "./icons/LinkedInIcon";
import { AuthNav } from "./auth-nav";

// Primary navigation items (always visible)
const PRIMARY_NAVIGATION = [
  { 
    href: "/formations", 
    label: "Formations",
    description: "Cours premium de développement web"
  },
  { 
    href: "/pricing", 
    label: "Tarifs",
    description: "Plans et abonnements"
  },
  { 
    href: "/projects", 
    label: "Projets",
    description: "Portfolio et réalisations"
  }
] as const;

// Secondary navigation items (in dropdown)
const SECONDARY_NAVIGATION = [
  { 
    href: "/blog", 
    label: "Blog",
    description: "Articles et tutoriels"
  },
  { 
    href: "/tech-mastry", 
    label: "TechMastry",
    description: "Préparation entretiens techniques"
  },
  { 
    href: "/contact", 
    label: "Contact",
    description: "Nous contacter"
  }
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
    icon: GitLabIcon,
    label: "GitLab",
  },
  {
    href: "https://hashnode.com/@fygs",
    icon: HashnodeIcon,
    label: "Hashnode",
  },
] as const;

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <nav className="flex items-center justify-between w-full" role="navigation" aria-label="Main navigation">
            <Link
              href="/"
              className="text-lg md:text-2xl font-extrabold text-foreground tracking-wide hover:text-primary transition-colors whitespace-nowrap flex-shrink-0"
              aria-label="Go to homepage"
            >
              <span className="sr-only">FYGS.dev - Homepage</span>
              fygs.dev \_°&lt;
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Primary Navigation */}
              {PRIMARY_NAVIGATION.map((item) => (
                <NavItem key={item.href} href={item.href} label={item.label} />
              ))}

              {/* More Menu Dropdown */}
              <Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <button className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "gap-1"
                        )}>
                          <MoreHorizontal className="h-4 w-4" />
                          Plus
                        </button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {SECONDARY_NAVIGATION.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="cursor-pointer">
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                <TooltipContent>
                  <p>Plus de pages : Blog, TechMastry, Contact</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2 ml-2 border-l pl-4 border-border">
                <AuthNav />
                
                {/* Social Links Dropdown */}
                <Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <TooltipTrigger asChild>
                          <button className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "size-8"
                          )}>
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Réseaux sociaux</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                          <DropdownMenuItem key={href} asChild>
                            <Link 
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  <TooltipContent>
                    <p>Mes réseaux sociaux et profils</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 md:hidden">
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
                <SheetContent
                  side="right"
                  className="w-[80vw] sm:w-[350px] p-0"
                >
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-left text-lg font-semibold">
                      Navigation
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col py-4">
                    {/* Main Navigation */}
                    <div className="px-6 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Navigation principale
                      </p>
                      {[...PRIMARY_NAVIGATION, ...SECONDARY_NAVIGATION].map((item) => (
                        <NavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          onClick={() => setIsOpen(false)}
                          isMobile
                        />
                      ))}
                    </div>
                    
                    
                    {/* Authentication Section for Mobile */}
                    <div className="border-t border-border mt-4 pt-4 px-6">
                      <div className="mb-4">
                        <AuthNav />
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4 px-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        Suivez-moi
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
        items={[...PRIMARY_NAVIGATION, ...SECONDARY_NAVIGATION]}
        className="z-40 hidden md:block"
      />
    </>
  );
};
