"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  GitBranch,
  Container,
  Cloud,
  Lock,
  Scan,
  AlertTriangle,
} from "lucide-react";

const concepts = [
  { icon: ShieldAlert, label: "OWASP", color: "text-red-400" },
  { icon: GitBranch, label: "CI/CD", color: "text-blue-400" },
  { icon: Container, label: "Docker", color: "text-cyan-400" },
  { icon: Cloud, label: "Cloud", color: "text-purple-400" },
  { icon: Lock, label: "AuthN/AuthZ", color: "text-green-400" },
  { icon: Scan, label: "Scanning", color: "text-orange-400" },
  { icon: AlertTriangle, label: "Incidents", color: "text-yellow-400" },
  { icon: Shield, label: "Hardening", color: "text-pink-400" },
];

export function SecurityDevopsHero() {
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
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 animate-pulse" />
        <Shield className="w-10 h-10 text-yellow-500 relative z-10" />
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
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
          Sécurité & DevOps
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sécurité applicative, CI/CD, conteneurisation et pratiques Cloud
          Native pour des systèmes robustes et résilients.
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
          <span className="text-2xl font-bold text-primary">4</span>{" "}
          <span className="block">Domaines</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">20+</span>{" "}
          <span className="block">Concepts</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">Interactif</span>{" "}
          <span className="block">Apprentissage</span>
        </div>
      </div>
    </section>
  );
}
