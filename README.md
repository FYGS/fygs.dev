<div align="center">
  <img src="public/images/logo-clean.svg" alt="FYGS Logo" width="180"/>

# FYGS.dev

**Plateforme d'apprentissage en ligne et portfolio technique**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![CI](https://img.shields.io/github/actions/workflow/status/fygs/fygs.dev/ci-cd.yml?style=flat-square&label=CI)](../../actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Site](https://fygs.dev) · [Formations](https://fygs.dev/formations) · [Parcours](https://fygs.dev/parcours) · [Blog](https://fygs.dev/blog) · [Contact](https://fygs.dev/contact)

</div>

---

## Vue d'ensemble

Plateforme full-stack : formations en ligne (LMS complet, gratuites et payantes, parcours, certificats), TechMastery
(préparation technique interactive), blog, portfolio. Next.js App Router (React Server Components, Server Actions),
authentification Better Auth, PostgreSQL via Prisma, paiements Stripe. L'espace applicatif est en français.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Framework** | Next.js 16 (App Router, RSC, Server Actions, build webpack) |
| **UI** | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, thèmes clair et sombre |
| **Édition de contenu** | Tiptap 3 (texte riche), @dnd-kit (glisser-déposer) |
| **Auth** | Better Auth (e-mail et mot de passe, Google, GitHub) |
| **Base de données** | PostgreSQL + Prisma 7 (adapter pg), migrations versionnées |
| **Paiement** | Stripe (achat à l'unité, abonnement mensuel ou annuel, remboursements, factures, portail) |
| **Fichiers** | Stockage compatible S3 (vidéos, ressources, sous-titres, images) |
| **Cache / limites** | Redis (ioredis), repli en mémoire |
| **i18n** | Intlayer (pages publiques fr/en/es ; espace applicatif en français) |
| **Tests** | Vitest (unitaires, intégration sur PostgreSQL jetable), Playwright (e2e), axe-core (accessibilité) |
| **CI/CD** | GitHub Actions (lint, types, tests, intégration, migrations, build, CodeQL) |

## Formations (LMS)

### Pour les apprenants
- **Catalogue** : recherche, catégorie, niveau, accès (gratuites / Premium), tri, pagination, prix exacts.
- **Offres** : formation gratuite (inscription), formation Premium (achat à vie, ou incluse dans l'abonnement), accès offert par un administrateur. Une seule règle d'accès pour tous les écrans (`lib/access/entitlement.ts`).
- **Aperçu gratuit** : leçons d'aperçu visibles sans compte.
- **Espace d'apprentissage** (`/learn/[slug]`) : vidéo (fichier, YouTube ou Vimeo), sous-titres et transcription, texte de leçon, ressources téléchargeables, notes horodatées, questions au formateur, reprise à la seconde près, navigation libre avec étape suivante recommandée.
- **Évaluations** : quiz par module (corrigés sur le serveur, meilleur score conservé), examen final avec limite de temps.
- **Certificats** : délivrés à la fin de la formation ou du parcours, code de vérification public, PDF, partage LinkedIn.
- **Parcours** (`/parcours`) : suites ordonnées de formations, formations facultatives, progression et certificat propres.
- **Mon apprentissage** : formations en cours, terminées, parcours et certificats au même endroit.
- **Avis** : notes et commentaires des inscrits, modérés.

### Pour les formateurs et administrateurs
- **Builder unique** (`/admin/courses/[id]`) : infos, programme (modules et leçons, édition dans un panneau, sauvegarde automatique), évaluations, supports visuels, page de vente, aperçu et publication, statistiques, apprenants, paramètres.
- **Publication contrôlée** : liste de contrôle appliquée par le serveur, protections sur une formation en ligne.
- **Statistiques par formation** : inscrits, apprenants actifs, taux de complétion, scores moyens, abandon par étape.
- **Apprenants** : progression de chacun, source de l'accès, accès offert ou retiré.
- **Questions** (`/admin/questions`) : questions des apprenants sur les leçons, réponse en ligne.
- **Parcours** (`/admin/paths`) : composition, ordre, publication.

## Démarrage rapide

```bash
# Prérequis : Node.js 22+, pnpm, PostgreSQL (Redis facultatif)
git clone https://github.com/fygs/fygs.dev.git
cd fygs.dev
pnpm install
cp .env.example .env.local      # variables : voir SETUP.md
pnpm prisma migrate deploy      # crée les tables
pnpm db:seed                    # données de démonstration (facultatif)
pnpm dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` / `pnpm start` | Build et serveur de production |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:integration` | Tests d'intégration sur un PostgreSQL jetable (embarqué, rien à installer) |
| `pnpm db:check-migrations` | Vérifie que les migrations correspondent au schéma |
| `pnpm test:e2e` / `pnpm test:e2e:build` | Tests de bout en bout (Playwright) sur un build de production et une base jetable seedée |
| `pnpm db:seed` | Données de démonstration |

Audits (sur un serveur lancé par `node scripts/e2e.mjs --serve`) : `scripts/audit/a11y-audit.mjs` (axe, WCAG 2.2 AA),
`scripts/audit/smoke-crawl.mjs` (erreurs, exceptions, textes suspects), `scripts/audit/seed-routes.mjs` (routes des
données seedées). Voir [docs/accessibility-audit-2026-10.md](docs/accessibility-audit-2026-10.md).

## Architecture

```
app/
├── [locale]/(main)/          # Pages publiques et espace apprenant : formations, parcours, tableau de bord, certificats…
├── [locale]/(learning)/learn # Espace d'apprentissage (leçons, quiz, examen, supports, bilan)
├── [locale]/(admin)/admin    # Back-office (formations, parcours, questions, utilisateurs, paiements…)
├── actions/                  # Server Actions de l'apprentissage
└── api/                      # Route handlers (Stripe, uploads, certificats, progression, OG)
components/                   # learning/, courses/, paths/, admin/, ui/ (shadcn)…
lib/
├── access/                   # Règle d'accès unique, offres, cartes du catalogue
├── learning/                 # Plan de cours, progression, complétion, certificats, rendu sûr du contenu
├── curriculum/               # Écritures du builder (garde de propriété, ordre, publication, statistiques)
├── paths/                    # Parcours
├── payments/                 # Stripe
└── courses/                  # Libellés, anciennes adresses
prisma/                       # Schéma, migrations, seed
tests/                        # unit/, integration/, contract/, e2e/
```

## Documentation

| Fichier | Contenu |
|---------|---------|
| [docs/FORMATIONS-TRACKER.md](docs/FORMATIONS-TRACKER.md) | Formations : analyse, décisions, suivi |
| [docs/PLATFORM-COMPLETION-TRACKER.md](docs/PLATFORM-COMPLETION-TRACKER.md) | Plateforme : suivi de complétion |
| [docs/TECH-MASTERY-TRACKER.md](docs/TECH-MASTERY-TRACKER.md) | TechMastery : suivi |
| [docs/accessibility-audit-2026-10.md](docs/accessibility-audit-2026-10.md) | Audit d'accessibilité et méthode |
| [docs/security-ops-2026-10.md](docs/security-ops-2026-10.md) | Sécurité et exploitation |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Tokens, palette, typographie |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Déploiement |
| [SETUP.md](SETUP.md) | Configuration détaillée |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution |
| [SECURITY.md](SECURITY.md) | Politique de sécurité |
| [CHANGELOG.md](CHANGELOG.md) | Journal des modifications |

## Licence

[MIT](LICENSE) — Fernand SOUALO (fygs.dev@gmail.com)
