<div align="center">
  <img src="public/images/logo-clean.svg" alt="FYGS Logo" width="180"/>

# FYGS.dev

**Plateforme d'apprentissage moderne & Portfolio technique**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.11-22C55E?style=flat-square)](https://better-auth.com)
[![Stripe](https://img.shields.io/badge/Stripe-18.5-635BFF?style=flat-square&logo=stripe)](https://stripe.com)
[![CI](https://img.shields.io/github/actions/workflow/status/fygs/fygs.dev/ci-cd.yml?style=flat-square&label=CI)](../../actions)
[![Tests](https://img.shields.io/badge/tests-107_passing-22C55E?style=flat-square)](vitest.config.ts)
[![Version](https://img.shields.io/badge/v1.0.2-stable-blue?style=flat-square)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Site](https://fygs.dev) · [Formations](https://fygs.dev/formations) · [Blog](https://fygs.dev/blog) · [Contact](https://fygs.dev/me)

</div>

---

## Vue d'ensemble

Plateforme fullstack combinant portfolio professionnel, cours interactifs et système de paiement. Architecture Next.js 15 App Router avec RSC, authentification Better Auth, base PostgreSQL et paiement Stripe.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Framework** | Next.js 15.5.9 (App Router, Turbopack, RSC) |
| **UI** | React 19.1.1, Tailwind CSS 4.1, shadcn/ui, Framer Motion 11.18 |
| **Auth** | Better Auth 1.3.11 (Google, GitHub, Apple, credentials) |
| **Base de données** | PostgreSQL + Prisma 7 (adapter pg) |
| **Cache** | Redis (ioredis 5.8.1) |
| **Paiement** | Stripe 18.5 (abonnements, remboursements, portail) |
| **State** | Zustand 5.0.3 (client), nuqs 2.4.1 (URL), RSC (serveur) |
| **Forms** | React Hook Form 7.55 + Zod 3.24 |
| **i18n** | Intlayer 7.0 + next-intlayer |
| **Tests** | Vitest 2.1.9 + Testing Library |
| **CI/CD** | GitHub Actions (lint → test → build → deploy) |
| **Hosting** | Vercel (Edge Runtime) |

## Fonctionnalités principales

### Formations (LMS)

- **Catalogue** avec filtres catégorie/niveau et accès tiered (Free/Premium)
- **Course Builder admin** : page unifiée à 6 onglets (Infos, Curriculum, Quiz, Supports, Preview, Paramètres)
- **Drag & drop** pour réordonner modules et leçons (@dnd-kit)
- **Auto-save** avec debounce et indicateur visuel
- **Preview mode** : prévisualisation instructeur avant publication
- **Inline CRUD** : création de modules/leçons sans quitter la page
- **Progression séquentielle** avec tracking du temps de visionnage (Redis)
- **Certificats auto-générés** (jsPDF) à 100% de complétion
- **Quiz avancé** : 3 colonnes, preview, réorganisation

### Paiement & Abonnement

- Abonnements mensuels/annuels avec changement de plan
- Période de remboursement 15 jours (calcul automatique)
- Accès à vie aux cours achetés même après résiliation
- Portail Stripe pour gestion autonome
- Idempotency keys + rate limiting (10 actions/5min)

### Design System

- **Palette indigo** avec variantes light/dark (next-themes)
- **Tokens CSS** : spacing scale, typography scale, motion tokens
- **Composants marketing** : SectionHero, FeatureGrid, TestimonialCarousel, PricingTable, FAQ
- **Tailwind CSS v4** avec `@theme`, `@utility`, `@layer`

### Analytics & Monitoring

- Event tracking PII-safe avec correlation IDs
- Structured logging contextualisé
- Métriques business : enrollment, completion, revenue
- Vercel Analytics + Speed Insights

## Architecture

```
src/
├── app/
│   ├── [locale]/(main)/       # Routes publiques (formations, blog, portfolio)
│   ├── [locale]/(admin)/      # Back-office admin/instructeur
│   ├── [locale]/(auth)/       # Authentification
│   └── api/                   # Route handlers (webhooks Stripe, etc.)
├── components/
│   ├── ui/                    # shadcn/ui + custom atoms
│   ├── marketing/             # SectionHero, FeatureGrid, FAQ, etc.
│   └── providers/             # ThemeProvider, AuthProvider
├── lib/
│   ├── auth/                  # Config Better Auth
│   ├── db/                    # Prisma client
│   ├── validators/            # Schémas Zod
│   └── utils/                 # Utilitaires partagés
├── hooks/                     # Custom hooks (useAutoSave, etc.)
├── stores/                    # Zustand stores
└── tests/
    └── unit/                  # 107 tests (10 fichiers)
```

## Démarrage rapide

```bash
# Prérequis : Node.js 22+, pnpm, PostgreSQL, Redis

git clone https://github.com/fygs/fygs.dev.git
cd fygs.dev

pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Créer les tables (le client Prisma est généré par pnpm install)
pnpm db:push

# Lancer le serveur dev (webpack)
pnpm dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Dev server (webpack) |
| `pnpm build` | Build production (webpack) |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:watch` | Tests en mode watch |
| `pnpm test:integration` | Tests d'intégration sur un PostgreSQL jetable (embarqué, rien à installer) |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Sync schema Prisma → DB |
| `pnpm db:studio` | Prisma Studio (GUI) |
| `pnpm db:seed` | Seed data |

## Tests

```
107 tests passing (10 fichiers) — Vitest 2.1.9

├── analytics-events       (18 tests)
├── structured-logger      (23 tests)
├── design-tokens          (10 tests)
├── curriculum-tab         (12 tests)
├── theme-provider          (7 tests)
├── use-auto-save           (7 tests)
├── faq-section             (9 tests)
├── pricing-table           (8 tests)
├── feature-grid            (6 tests)
└── section-hero            (7 tests)
```

## CI/CD

Pipeline GitHub Actions (`ci-cd.yml`) :

1. **Lint & Typecheck** — ESLint + `tsc --noEmit`
2. **Test** — Vitest avec Prisma generate
3. **Intégration** — Vitest sur un vrai PostgreSQL (embarqué et service container) + vérification des migrations
4. **Build** — Production build + artifact cache
5. **Security** — `pnpm audit` + CodeQL (PRs)

## Performance

| Métrique | Score |
|----------|-------|
| Lighthouse Performance | 100/100 |
| Lighthouse Accessibility | 100/100 |
| Lighthouse Best Practices | 100/100 |
| Lighthouse SEO | 100/100 |
| LCP | < 1.5s |
| CLS | < 0.1 |

## Documentation

| Fichier | Contenu |
|---------|---------|
| [AUDIT_FORMATIONS_ADMIN.md](AUDIT_FORMATIONS_ADMIN.md) | Audit complet + plan de modernisation (5 phases) |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Tokens, palette, typographie, composants |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guide de déploiement |
| [SETUP.md](SETUP.md) | Configuration détaillée |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution |
| [SECURITY.md](SECURITY.md) | Politique de sécurité |
| [CHANGELOG.md](CHANGELOG.md) | Journal des modifications |

## Licence

[MIT](LICENSE) — Fernand SOUALO (fygs.dev@gmail.com)
