"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FadeInWhenVisible } from "@/components/ui/fade-in";
import { 
  Rocket,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Crown,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  "Accès illimité à toutes les formations",
  "Projets pratiques et certificats",
  "Support communautaire 24/7",
  "Mises à jour gratuites à vie",
];

export function CallToAction() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      
      <div className="container max-w-6xl mx-auto px-4 relative">
        <FadeInWhenVisible>
          <Card className="border-0 shadow-2xl bg-linear-to-br from-card via-card to-muted/20 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
            
            <div className="relative p-8 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      Offre Limitée
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                      Transformez votre carrière de{" "}
                      <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        développeur
                      </span>
                    </h2>
                    
                    <p className="text-lg text-muted-foreground">
                      Rejoignez plus de 15,000 développeurs qui ont déjà boosté leur carrière 
                      avec nos formations premium. Commencez dès aujourd&apos;hui !
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    {BENEFITS.map((benefit, index) => (
                      <FadeInWhenVisible key={benefit} delay={index * 0.1}>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-foreground">{benefit}</span>
                        </div>
                      </FadeInWhenVisible>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="group hover:scale-105 transition-transform bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      asChild
                    >
                      <Link href="/formations">
                        <Rocket className="h-5 w-5 mr-2" />
                        Commencer maintenant
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="group hover:scale-105 transition-transform"
                      asChild
                    >
                      <Link href="/pricing">
                        <Crown className="h-5 w-5 mr-2" />
                        Voir les tarifs
                      </Link>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center gap-6 pt-4 border-t border-muted">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">15K+</div>
                      <div className="text-sm text-muted-foreground">Étudiants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">4.9/5</div>
                      <div className="text-sm text-muted-foreground">Note moyenne</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">94%</div>
                      <div className="text-sm text-muted-foreground">Taux de réussite</div>
                    </div>
                  </div>
                </div>

                {/* Visual Elements */}
                <div className="relative">
                  <div className="relative z-10">
                    {/* Main Card */}
                    <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Formation Personnalisée</h3>
                            <p className="text-sm text-muted-foreground">Adaptée à votre niveau</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Résultats Rapides</h3>
                            <p className="text-sm text-muted-foreground">Progression visible en 30 jours</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Crown className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Expertise Reconnue</h3>
                            <p className="text-sm text-muted-foreground">Par des professionnels</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-primary/30 animate-pulse delay-1000" />
                  </div>

                  {/* Background Decoration */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-lg -rotate-3 scale-105" />
                </div>
              </div>
            </div>
          </Card>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
