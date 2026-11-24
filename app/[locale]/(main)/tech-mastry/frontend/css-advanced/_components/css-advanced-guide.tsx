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

/* Pseudo-masonry : chaque item occupe N lignes de 10px (pas de subgrid ici) */
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

/* Scroll-driven animations : Chrome/Edge 115+, Safari 26+. Pas encore Baseline
   (Firefox n'a pas de support par défaut) : prévoyez un repli sans animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  animation: fadeIn auto both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}`,
        description: "Morphing, animations au scroll (compatibilité à vérifier), et animations de transform/opacity qui restent sur le compositeur.",
      },
      {
        title: "Réduire les animations & View Transitions",
        css: `/* Respecter la préférence « réduire les animations » (accessibilité) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

/* View Transitions (même document) : Baseline "newly available" depuis octobre 2025 */
/* JS : document.startViewTransition(() => updateDOM()); */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Nommer un élément pour l'animer d'un état à l'autre */
.product-image {
  view-transition-name: product-hero;
}

/* Transitions entre pages (cross-document) : opt-in en CSS,
   support plus récent et inégal : vérifiez la compatibilité */
@view-transition {
  navigation: auto;
}`,
        description: "Désactivez ou réduisez les animations pour les utilisateurs qui le demandent. Les View Transitions animent les changements d'état du DOM (même document : Baseline newly available).",
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
        description: "Responsive au niveau du composant, pas de la fenêtre. Les container queries de taille sont Baseline widely available depuis 2025.",
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
  .text-xl { font-size: 1.25rem; }
}
/* Attention : avec !important, l'ordre des layers s'inverse
   (base l'emporte sur utilities). Et le CSS hors layer
   l'emporte toujours sur le CSS en layer. */

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
        description: "Layers pour organiser la cascade, :has() comme sélecteur parent, et pseudo-classes logiques (:has() et les layers sont Baseline widely available).",
      },
      {
        title: "@scope, ancrage et if() : état du support",
        css: `/* @scope : limiter la portée des styles sans nommer chaque classe
   Baseline "newly available" (depuis mars 2026) */
@scope (.card) to (.card-footer) {
  :scope { border: 1px solid var(--border); }
  img { border-radius: 0.5rem; }  /* uniquement entre .card et .card-footer */
}

/* Anchor positioning : positionner un popover par rapport à un ancre, sans JS
   Statut Baseline : "limited" (octobre 2026) : vérifiez caniuse / MDN avant
   de l'utiliser sans repli */
.tooltip-trigger { anchor-name: --tip; }
.tooltip {
  position: absolute;
  position-anchor: --tip;
  position-area: top;            /* ou : bottom: anchor(top); */
  position-try-fallbacks: flip-block;
}

/* if() : conditions dans les valeurs de propriétés
   Chrome/Edge 137+ ; Baseline "limited" : à utiliser en amélioration progressive */
.button {
  padding: if(media(any-pointer: coarse): 1rem; else: 0.5rem);
}

/* Détecter le support avec @supports plutôt que par le user agent */
@supports (position-area: top) {
  .tooltip { /* styles d'ancrage */ }
}`,
        description: "Ces fonctionnalités récentes n'ont pas toutes le même statut : @scope est Baseline newly available, anchor positioning et if() restent limités. Vérifiez le statut sur MDN ou webstatus.dev avant de les utiliser en production.",
      },
    ],
  },
  {
    name: "Tailwind CSS v4",
    examples: [
      {
        title: "Configuration CSS-first",
        css: `/* app/globals.css — Tailwind v4 */
@import "tailwindcss";   /* remplace @tailwind base/components/utilities */

/* Les design tokens se déclarent en CSS avec @theme (plus de tailwind.config.js obligatoire) */
@theme {
  --color-brand: oklch(0.62 0.19 259);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
/* Génère les utilitaires bg-brand, text-brand, font-display, 3xl:... */

/* Utilitaires et variantes personnalisés */
@utility scrollbar-hidden {
  scrollbar-width: none;
}
@custom-variant dark (&:where(.dark, .dark *));

/* Dans le HTML :
   bg-(--my-var)        → variables CSS (anciennement bg-[--my-var])
   bg-linear-to-r       → renomme bg-gradient-to-r
   shadow-xs / rounded-xs → anciennes shadow-sm / rounded-sm
   outline-hidden       → ancien outline-none
   flex!                → modificateur important en suffixe (ancien !flex)
   @container + @lg:... → container queries intégrées */`,
        description: "Tailwind v4 : configuration en CSS (@theme), détection automatique des fichiers, plugin PostCSS ou Vite dédié, et utilitaires renommés. Nécessite des navigateurs modernes (Safari 16.4+, Chrome 111+, Firefox 128+).",
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
            "Comment optimiser les animations CSS pour un rendu fluide ? (transform, opacity, will-change avec parcimonie) Et prefers-reduced-motion ?",
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
