"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const topics = [
  {
    name: "CSS Grid Avancé",
    examples: [
      {
        title: "Grid Template Areas",
        css: `.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 250px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive */
@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}`,
        description: "Layouts complexes avec zones nommées et responsive sans media queries imbriquées.",
      },
      {
        title: "Auto-fit & Minmax",
        css: `.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Masonry-like avec subgrid */
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 10px;
  gap: 1rem;
}

.masonry-item {
  grid-row: span var(--rows);
}`,
        description: "Grilles responsives automatiques sans media queries. auto-fit + minmax = magie.",
      },
    ],
  },
  {
    name: "Animations & Transitions",
    examples: [
      {
        title: "Keyframes Avancés",
        css: `@keyframes morphing {
  0% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: rotate(0deg);
  }
  50% {
    border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%;
    transform: rotate(180deg);
  }
  100% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: rotate(360deg);
  }
}

.blob {
  animation: morphing 8s ease-in-out infinite;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Scroll-driven animations (Chrome 115+) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  animation: fadeIn auto both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}`,
        description: "Morphing, animations au scroll, et transitions GPU-accélérées.",
      },
    ],
  },
  {
    name: "Container Queries",
    examples: [
      {
        title: "Container Queries",
        css: `/* Conteneur */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Requêtes de conteneur */
@container card (min-width: 400px) {
  .card-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }
}

@container card (min-width: 600px) {
  .card-layout {
    grid-template-columns: 250px 1fr auto;
  }
  .card-actions { display: flex; }
}

/* Container Query Units */
.responsive-text {
  font-size: clamp(1rem, 3cqi, 2rem);
}`,
        description: "Responsive au niveau du composant, pas de la fenêtre. Le futur du responsive design.",
      },
    ],
  },
  {
    name: "Techniques Modernes",
    examples: [
      {
        title: "Cascade Layers & :has()",
        css: `/* Cascade Layers — Contrôle de la spécificité */
@layer base, components, utilities;

@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  .card h1 { font-size: 1.5rem; } /* Priorité sur base */
}

@layer utilities {
  .text-xl { font-size: 1.25rem !important; }
}

/* :has() — Parent selector enfin ! */
.card:has(img) {
  padding: 0;
}

.form:has(input:invalid) .submit-btn {
  opacity: 0.5;
  pointer-events: none;
}

/* :is() et :where() */
:is(h1, h2, h3):hover {
  color: var(--primary);
}`,
        description: "Layers pour organiser la cascade, :has() comme sélecteur parent, et pseudo-classes logiques.",
      },
    ],
  },
];

export function CSSAdvancedGuide() {
  const [activeTopic, setActiveTopic] = useState(0);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2">
        {topics.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTopic(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTopic === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {topics[activeTopic].examples.map((ex) => (
          <Card key={ex.title} className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{ex.title}</h3>
              <Badge variant="outline">CSS</Badge>
            </div>
            <p className="text-muted-foreground">{ex.description}</p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
              <code>{ex.css}</code>
            </pre>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Questions d&apos;entretien CSS fréquentes</h3>
        <ul className="space-y-2">
          {[
            "Expliquez la différence entre Grid et Flexbox — quand utiliser l'un ou l'autre ?",
            "Comment fonctionne la cascade CSS ? Qu'est-ce que la spécificité ?",
            "Comment optimiser les animations CSS pour 60fps ? (will-change, transform, opacity)",
            "Qu'est-ce que le BFC (Block Formatting Context) et comment l'utiliser ?",
            "Comment créer un layout responsive sans media queries ? (auto-fit, clamp, container queries)",
          ].map((q, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
