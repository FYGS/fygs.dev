"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FadeInWhenVisible } from "@/components/ui/fade-in";
import { 
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp
} from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Martinez",
    role: "Senior Frontend Developer",
    company: "Spotify",
    avatar: "/api/placeholder/64/64",
    content: "Les formations FYGS m'ont permis de passer de junior à senior en 8 mois. L'approche pratique et les projets réels font toute la différence.",
    rating: 5,
    course: "React Avancé",
    beforeRole: "Junior Developer",
    afterRole: "Senior Frontend Developer",
    salaryIncrease: "+45%",
  },
  {
    id: 2,
    name: "Thomas Dubois",
    role: "Fullstack Engineer",
    company: "Airbnb",
    avatar: "/api/placeholder/64/64",
    content: "Grâce aux formations TypeScript et Node.js, j'ai décroché mon poste de rêve chez Airbnb. Le contenu est à jour et très professionnel.",
    rating: 5,
    course: "Fullstack TypeScript",
    beforeRole: "Frontend Developer",
    afterRole: "Fullstack Engineer",
    salaryIncrease: "+60%",
  },
  {
    id: 3,
    name: "Marie Chen",
    role: "Tech Lead",
    company: "Microsoft",
    avatar: "/api/placeholder/64/64",
    content: "L'expertise de Fernand en architecture et bonnes pratiques m'a aidée à évoluer vers un poste de Tech Lead. Formations exceptionnelles !",
    rating: 5,
    course: "Architecture & Patterns",
    beforeRole: "Senior Developer",
    afterRole: "Tech Lead",
    salaryIncrease: "+35%",
  },
  {
    id: 4,
    name: "Alex Johnson",
    role: "DevOps Engineer",
    company: "Netflix",
    avatar: "/api/placeholder/64/64",
    content: "Les formations Cloud et DevOps sont incroyables. J'ai pu implémenter des solutions complexes dès ma première semaine chez Netflix.",
    rating: 5,
    course: "Cloud & DevOps",
    beforeRole: "Backend Developer",
    afterRole: "DevOps Engineer",
    salaryIncrease: "+50%",
  },
];

const STATS = [
  { label: "Étudiants formés", value: "15,000+", icon: Users },
  { label: "Taux de réussite", value: "94%", icon: TrendingUp },
  { label: "Augmentation salariale moyenne", value: "+47%", icon: TrendingUp },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotation des témoignages
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <FadeInWhenVisible>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Quote className="h-4 w-4" />
              Témoignages
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Ils ont transformé leur carrière
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nos formations ont aidé des développeurs à atteindre leurs objectifs professionnels
            </p>
          </div>
        </FadeInWhenVisible>

        {/* Stats */}
        <FadeInWhenVisible delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </FadeInWhenVisible>

        {/* Testimonial Carousel */}
        <FadeInWhenVisible delay={0.2}>
          <div className="relative max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-muted/10">
              <CardContent className="p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  
                  {/* Avatar & Info */}
                  <div className="text-center lg:text-left space-y-4">
                    <Avatar className="w-24 h-24 mx-auto lg:mx-0 ring-4 ring-primary/20">
                      <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.name} />
                      <AvatarFallback className="text-lg font-semibold">
                        {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-xl font-bold">{currentTestimonial.name}</h3>
                      <p className="text-muted-foreground">{currentTestimonial.role}</p>
                      <p className="text-sm font-medium text-primary">{currentTestimonial.company}</p>
                    </div>

                    {/* Course Badge */}
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {currentTestimonial.course}
                    </Badge>
                  </div>

                  {/* Testimonial Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Quote */}
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                      <blockquote className="text-lg lg:text-xl leading-relaxed pl-6">
                        &ldquo;{currentTestimonial.content}&rdquo;
                      </blockquote>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${
                            i < currentTestimonial.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Career Evolution */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Avant</div>
                        <div className="font-medium">{currentTestimonial.beforeRole}</div>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-muted-foreground/50 to-primary/50" />
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Après</div>
                        <div className="font-medium text-primary">{currentTestimonial.afterRole}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Salaire</div>
                        <div className="font-bold text-green-600">{currentTestimonial.salaryIncrease}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Aller au témoignage ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
