import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowUpRight, Menu, Search } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "../_lib/constants";
import { generateMetadata } from "../_lib/seo-utils";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { TopicsNav } from "./_components/topics-nav";

export const metadata: Metadata = generateMetadata({
  title: "Préparation aux Entretiens Techniques | Guide Complet FYGS",
  description:
    "Guide complet de préparation aux entretiens techniques : algorithmes, structures de données, systèmes distribués et bonnes pratiques. Ressources essentielles pour les développeurs.",
  keywords: [
    "Entretiens Techniques",
    "Algorithmes",
    "Structures de Données",
    "Systèmes Distribués",
    "Architecture Cloud",
    "Guide Développeur",
    "Préparation Entretien",
    "Best Practices",
  ],
  path: "/interview-prep",
  type: "article",
  image: `${SITE_URL}/interview-prep/og.png`,
});

export default function InterviewPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-background">
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
              <span className="font-semibold">Guide d&apos;Entretien</span>
              <Badge variant="secondary" className="font-normal">
                Beta
              </Badge>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8 bg-muted/50"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <TopicsNav />
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-72 lg:w-80">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-6 border-b">
            <span className="font-semibold tracking-tight">
              Guide d&apos;Entretien
            </span>
            <Badge variant="secondary" className="font-normal">
              Beta
            </Badge>
          </div>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-8 bg-muted/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-2">
            <TopicsNav />
          </div>
          <div className="border-t p-4">
            <a
              href="https://github.com/fygs/interview-prep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="text-muted-foreground">
                Contribuer sur GitHub
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <div className="md:hidden w-4" />{" "}
              {/* Spacer for mobile menu button */}
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-medium text-muted-foreground md:block">
                Votre chemin vers la réussite
              </span>
              <div className="h-4 w-px bg-border hidden md:block" />
              <Badge variant="secondary" className="hidden md:inline-flex">
                Nouveau
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1">
          <div className="container max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
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
        </main>

        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:h-14 md:flex-row lg:px-8">
            <p className="text-sm text-muted-foreground">
              Créé avec ❤️ pour aider les développeurs à réussir leurs
              entretiens
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} FYGS
              </p>
              <div className="h-4 w-px bg-border" />
              <a
                href="https://github.com/fygs/interview-prep"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
