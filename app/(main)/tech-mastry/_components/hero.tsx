import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BrainCircuit,
  Code,
  GraduationCap,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function InterviewPrepHero() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background -z-10" />

      {/* Animated particles/grid background */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10 opacity-20" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 md:left-20 w-24 h-24 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 md:right-20 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl -z-10" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-purple-500/10 blur-2xl -z-10" />

      <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center justify-center mb-6 bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-xs animate-pulse-slow">
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            Plateforme d&apos;Excellence Technique
          </span>
        </div>

        {/* Main content */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 pb-1">
              TechMastery
            </h1>
            <div className="flex items-center justify-center mb-2">
              <div
                className={cn(
                  "px-4 py-2 rounded-full",
                  "bg-linear-to-r from-indigo-500/10 to-purple-500/10",
                  "border border-indigo-500/20",
                  "text-base md:text-lg font-medium text-indigo-500",
                  "flex items-center gap-2"
                )}
              >
                <Target className="w-4 h-4" />
                <span>Préparation aux Entretiens Techniques</span>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Une plateforme d&apos;excellence pour maîtriser les concepts
              techniques avancés,
              <span className="font-medium text-primary">
                {" "}
                exceller lors de vos entretiens techniques
              </span>{" "}
              et propulser votre carrière de développeur vers de nouveaux
              sommets.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 py-6">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm bg-background/80 backdrop-blur-xs border-primary/20 hover:bg-background/95 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
              Algorithmes & Structures
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm bg-background/80 backdrop-blur-xs border-primary/20 hover:bg-background/95 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <Code className="w-3.5 h-3.5 mr-1.5 text-green-500" />
              Frontend & Backend
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm bg-background/80 backdrop-blur-xs border-primary/20 hover:bg-background/95 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              System Design
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm bg-background/80 backdrop-blur-xs border-primary/20 hover:bg-background/95 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
              Entretiens Techniques
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              asChild
              variant="default"
              size="lg"
              className="gap-2 px-6 py-6 h-auto text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 bg-linear-to-r from-primary to-blue-600 hover:scale-105"
            >
              <Link href="/tech-mastry/playground">
                <GraduationCap className="w-5 h-5" />
                Code Playground
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 px-6 py-6 h-auto text-base rounded-xl border-2 hover:bg-primary/5 hover:scale-105 transition-all duration-300"
            >
              <Link href="/tech-mastry/dashboard">
                <BarChart3 className="w-5 h-5" />
                Learning Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
