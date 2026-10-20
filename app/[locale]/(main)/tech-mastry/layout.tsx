import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowUpRight, Menu } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { ProgressTracker } from "./_components/progress-tracker";
import { SearchBar } from "./_components/search-bar";
import { TopicsNav } from "./_components/topics-nav";
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import { sectionSEO } from "@/app/_lib/seo-config";
import type { LocalesValues } from "intlayer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, sectionSEO.techMastry);
}

export default function InterviewPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-background">
      <ProgressTracker />
      {/* Mobile Navigation Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="fixed left-4 top-4 z-40 md:hidden"
            size="icon"
            aria-label="Menu de navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <nav className="flex h-full flex-col bg-background">
            <div className="flex h-14 items-center justify-between px-4 border-b">
              <span className="font-semibold">TechMastery</span>
              <Badge variant="secondary" className="font-normal">
                Beta
              </Badge>
            </div>
            <div className="p-4 border-b">
              <SearchBar />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <TopicsNav />
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 md:block md:w-72 lg:w-80 xl:w-96 2xl:w-[400px] transition-all duration-300 ease-in-out">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b bg-linear-to-r from-background via-background/80 to-background">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">TM</span>
              </div>
              <span className="font-semibold tracking-tight text-lg">
                TechMastery
              </span>
            </div>
            <Badge
              variant="secondary"
              className="font-normal bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Beta
            </Badge>
          </div>
          <div className="p-5 border-b bg-linear-to-r from-background to-background/90">
            <SearchBar />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Recherche intelligente</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">
                  Ctrl+K
                </kbd>
                <span>ou</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">
                  /
                </kbd>
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-3 px-2">
                NAVIGATION
              </h3>
              <div className="h-0.5 w-12 bg-linear-to-r from-primary/40 to-transparent rounded-full mb-4 ml-2"></div>
            </div>
            <TopicsNav />
          </div>
          <div className="border-t p-4 bg-linear-to-b from-background to-background/90">
            <a
              href="https://github.com/fygs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-linear-to-r from-primary/5 to-primary/10 border border-primary/10 px-4 py-3 text-sm transition-all hover:shadow-md hover:from-primary/10 hover:to-primary/20 hover:border-primary/20 group"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="h-4 w-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.52 21.272 9.52 21.008C9.52 20.768 9.512 20.058 9.508 19.192C6.726 19.8 6.139 17.782 6.139 17.782C5.685 16.642 5.028 16.334 5.028 16.334C4.132 15.728 5.097 15.74 5.097 15.74C6.094 15.809 6.628 16.757 6.628 16.757C7.52 18.376 8.97 17.829 9.54 17.575C9.631 16.928 9.889 16.482 10.175 16.219C7.954 15.953 5.62 15.127 5.62 11.477C5.62 10.387 6.01 9.492 6.649 8.787C6.546 8.535 6.203 7.629 6.747 6.476C6.747 6.476 7.587 6.208 9.497 7.611C10.295 7.39 11.15 7.28 12 7.275C12.85 7.28 13.705 7.39 14.505 7.611C16.413 6.208 17.251 6.476 17.251 6.476C17.797 7.629 17.454 8.535 17.351 8.787C17.991 9.492 18.379 10.387 18.379 11.477C18.379 15.138 16.041 15.949 13.813 16.209C14.172 16.531 14.496 17.175 14.496 18.156C14.496 19.562 14.484 20.676 14.484 21.008C14.484 21.275 14.662 21.587 15.171 21.489C19.138 20.162 22 16.417 22 12C22 6.477 17.523 2 12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  Me trouver sur GitHub
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
          <div className="flex h-full w-full max-w-[1920px] mx-auto items-center justify-between px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex items-center gap-6">
              <div className="md:hidden w-4" />{" "}
              {/* Spacer for mobile menu button */}
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-medium text-muted-foreground md:block">
                Maîtrisez les compétences techniques avancées plus facilement
              </span>
              <div className="h-4 w-px bg-border hidden md:block" />
              <Badge variant="secondary" className="hidden md:inline-flex">
                Nouveau
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1">
          <div className="w-full max-w-[1920px] mx-auto px-6 py-8 lg:px-8 lg:py-10 xl:px-12 2xl:px-16">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-32">
                  <div className="relative flex space-x-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
          <div className="flex w-full max-w-[1920px] mx-auto flex-col items-center justify-between gap-4 px-6 py-6 md:h-14 md:flex-row lg:px-8 xl:px-12 2xl:px-16">
            <p className="text-sm text-muted-foreground">
              Créé avec ❤️ pour aider les développeurs à maîtriser les
              compétences techniques avancées
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} FYGS
              </p>
              <div className="h-4 w-px bg-border" />
              <a
                href="https://github.com/fygs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
              <div className="h-4 w-px bg-border" />
              <a
                href="https://www.linkedin.com/in/fernandsoualo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                </svg>
                Me trouver sur LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
