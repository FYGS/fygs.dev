"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  UserCheck,
  Award,
  Target,
  Briefcase,
  Handshake,
  Rocket,
} from "lucide-react";

const concepts = [
  { icon: DollarSign, label: "Salaire", color: "text-emerald-400" },
  { icon: TrendingUp, label: "Progression", color: "text-blue-400" },
  { icon: UserCheck, label: "Entretiens", color: "text-purple-400" },
  { icon: Award, label: "Expertise", color: "text-yellow-400" },
  { icon: Target, label: "Objectifs", color: "text-red-400" },
  { icon: Briefcase, label: "Portfolio", color: "text-orange-400" },
  { icon: Handshake, label: "Négociation", color: "text-cyan-400" },
  { icon: Rocket, label: "Carrière", color: "text-pink-400" },
];

export function CareerHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % concepts.length),
      2500,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-pulse" />
        <DollarSign className="w-10 h-10 text-emerald-500 relative z-10" />
        {concepts.map((c, i) => {
          const angle = (i / concepts.length) * 2 * Math.PI - Math.PI / 2;
          const r = 56;
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={`absolute w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${i === active ? "bg-primary/20 scale-125 shadow-lg" : "bg-muted/50 hover:bg-muted"}`}
              style={{
                left: `calc(50% + ${Math.cos(angle) * r}px - 16px)`,
                top: `calc(50% + ${Math.sin(angle) * r}px - 16px)`,
              }}
            >
              <Icon
                className={`w-4 h-4 ${i === active ? c.color : "text-muted-foreground"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
          Négociation & Carrière
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stratégies de négociation salariale, progression de carrière et
          conseils pour réussir vos entretiens et propulser votre parcours
          professionnel.
        </p>
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {concepts.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${i === active ? "bg-primary/10 text-primary border-primary/30 scale-105" : "border-border/40 text-muted-foreground hover:border-primary/20"}`}
            >
              <Icon className="w-3 h-3" />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <div>
          <span className="text-2xl font-bold text-primary">3</span>{" "}
          <span className="block">Modules</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">15+</span>{" "}
          <span className="block">Stratégies</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">Pratique</span>{" "}
          <span className="block">Exercices</span>
        </div>
      </div>
    </section>
  );
}
