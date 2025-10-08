import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Star, TrendingUp, Play, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CourseHero() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="relative container">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            🚀 Plateforme d&apos;apprentissage premium
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Formations{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Modernes
            </span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground">
              pour Développeurs
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Maîtrisez JavaScript, TypeScript, React, Next.js, Node.js, l&apos;IA et le Cloud
            avec des formations pratiques conçues par un expert reconnu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="#courses">
                <Play className="mr-2 h-5 w-5" />
                Découvrir les formations
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/dashboard">
                Mon dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm text-muted-foreground">Formations</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Étudiants</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">À jour</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
