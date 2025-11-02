"use client";

import { LocaleAwareLink } from "@/components/ui/locale-aware-nav";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
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
import { Menu, ExternalLink } from "lucide-react";
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
import { useIntlayer } from "next-intlayer";

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
  const content = useIntlayer("header");
  const [isOpen, setIsOpen] = useState(false);

  // Transform navigation items for NavigationIndicator (expects plain strings)
  const ALL_NAVIGATION = [
    ...content.navigation.primary.map((item) => ({
      href: item.href.value,
      label: item.label.value,
    })),
    ...content.navigation.secondary.map((item) => ({
      href: item.href.value,
      label: item.label.value,
    })),
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <nav
            className="flex items-center justify-between w-full"
            role="navigation"
            aria-label="Main navigation"
          >
            <LocaleAwareLink
              href="/"
              className="text-lg md:text-2xl font-extrabold text-foreground tracking-wide hover:text-primary transition-colors whitespace-nowrap shrink-0"
            >
              <span className="sr-only">FYGS.dev - Homepage</span>
              fygs.dev \_°&lt;
            </LocaleAwareLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* All Navigation Items - Displayed directly instead of in dropdown */}
              {content.navigation.primary.map((item) => (
                <LocaleAwareLink
                  key={item.href.value}
                  href={item.href.value}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-base font-medium transition-all duration-300 relative group",
                    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-linear-to-r after:from-primary after:to-primary/60 after:transition-transform after:duration-300",
                    "hover:scale-105 hover:shadow-xs"
                  )}
                  activeClassName="text-primary after:scale-x-100 shadow-xs"
                  showActiveIndicator
                >
                  {item.label.value}
                </LocaleAwareLink>
              ))}
              {content.navigation.secondary.map((item) => (
                <LocaleAwareLink
                  key={item.href.value}
                  href={item.href.value}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-base font-medium transition-all duration-300 relative group",
                    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-linear-to-r after:from-primary after:to-primary/60 after:transition-transform after:duration-300",
                    "hover:scale-105 hover:shadow-xs"
                  )}
                  activeClassName="text-primary after:scale-x-100 shadow-xs"
                  showActiveIndicator
                >
                  {item.label.value}
                </LocaleAwareLink>
              ))}

              <div className="flex items-center gap-2 ml-2 border-l pl-4 border-border">
                <LocaleSwitcher />
                <AuthNav />

                {/* Social Links Dropdown */}
                <Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "size-8"
                          )}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>
                        {content.social.dropdownLabel.value}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                        <DropdownMenuItem key={href} asChild>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent>
                    <p>{content.social.dropdownLabel.value}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "shrink-0 relative overflow-hidden group"
                  )}
                  aria-label="Open menu"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Menu className="size-5 relative z-10" />
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
                  <div className="flex flex-col h-full">
                    <div className="flex-1 py-4 overflow-y-auto">
                      {/* Main Navigation - Primary Items */}
                      <div className="px-6 space-y-1 mb-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {content.mobile.mainNavigation.value}
                        </p>
                        <div className="space-y-1">
                          {content.navigation.primary.map((item) => (
                            <LocaleAwareLink
                              key={item.href.value}
                              href={item.href.value}
                              onClick={() => setIsOpen(false)}
                              className="block px-6 py-4 text-base transition-all relative border-b border-border/20 last:border-b-0 text-foreground/80 hover:bg-accent/30 hover:text-foreground"
                              activeClassName="bg-linear-to-r from-primary/5 to-secondary/5 text-primary font-semibold"
                            >
                              {item.label.value}
                            </LocaleAwareLink>
                          ))}
                        </div>
                      </div>

                      {/* Secondary Navigation */}
                      <div className="px-6 space-y-1 mb-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {content.mobile.otherPages.value}
                        </p>
                        <div className="space-y-1">
                          {content.navigation.secondary.map((item) => (
                            <LocaleAwareLink
                              key={item.href.value}
                              href={item.href.value}
                              onClick={() => setIsOpen(false)}
                              className="block px-6 py-4 text-base transition-all relative border-b border-border/20 last:border-b-0 text-foreground/80 hover:bg-accent/30 hover:text-foreground"
                              activeClassName="bg-linear-to-r from-primary/5 to-secondary/5 text-primary font-semibold"
                            >
                              {item.label.value}
                            </LocaleAwareLink>
                          ))}
                        </div>
                      </div>

                      {/* Authentication Section for Mobile */}
                      <div className="px-6 mb-6">
                        <div className="p-5 bg-linear-to-br from-primary/5 to-secondary/5 rounded-xl border border-border/30 shadow-xs">
                          <AuthNav
                            isMobile
                            onItemClick={() => setIsOpen(false)}
                          />
                        </div>
                      </div>

                      {/* Locale Switcher Section */}
                      <div className="px-6 mb-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {content.mobile.language.value}
                        </p>
                        <LocaleSwitcher />
                      </div>
                    </div>

                    {/* Social Links Footer */}
                    <div className="px-6 py-4 border-t border-border bg-muted/20 mt-auto">
                      <p className="text-sm text-muted-foreground mb-3">
                        {content.mobile.followMe.value}
                      </p>
                      <div className="flex flex-col space-y-2">
                        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                          <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                              }),
                              "w-full justify-start"
                            )}
                            aria-label={label}
                          >
                            <Icon className="size-4 mr-2" />
                            {label}
                          </a>
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
        items={ALL_NAVIGATION}
        className="z-40 hidden md:block"
      />
    </>
  );
};
