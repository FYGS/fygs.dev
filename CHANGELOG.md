# 📝 Changelog

> All notable changes to FYGS.dev will be documented in this file.

[![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-1.0.0-orange?style=flat-square)](https://keepachangelog.com/en/1.0.0/)
[![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-2.0.0-blue?style=flat-square)](https://semver.org/spec/v2.0.0.html)

## [Unreleased] - 2026-10

### Security
- Access control: community notifications and follower lists require the owner; lesson/course writes check ownership; the blog like endpoints use a server-side visitor id.
- Quiz answers are graded on the server; the browser never receives the correct answers.
- Rate limiting on 32 API routes and the auth endpoints (atomic Redis sliding window, in-process fallback, trusted-proxy IP).
- Content-Security-Policy and baseline security headers; Stripe webhook invalid signature now answers 400; refunds use the real PaymentIntent and an idempotency key.
- `BETTER_AUTH_SECRET` is required in production.

### Added
- AI tutor: streaming assistant in the playground (explain, debug, review, optimize, tests, refactor, hint, chat; insert/replace in the editor; "Explain this error") and on course lessons. Needs `ANTHROPIC_API_KEY`; works in a labelled offline mode without it. Rate limited (visitors 8/h, accounts 60/h).
- Stripe webhook events are processed once per event id (duplicate deliveries are acknowledged, failed handlers can be retried).

### Changed
- Dependencies moved to the latest stable majors (Next 16, zod 4, Stripe SDK 23, better-auth 1.7, vitest 5…); see docs/modernization-2026-10.md. Build and dev run on webpack; `middleware.ts` is now `proxy.ts`; CI runs on Node 22.
- Large files split into focused modules (community actions, visualizations, services, templates, forms).
- i18n dictionaries unified; analytics calls go through `AnalyticsHelper`.

### Fixed
- Playground: program output was erased (CRLF), real execution for every template, runaway programs can be stopped, preview isolation.
- Spacing tokens collapsed `max-w-*` utilities.

## [1.3.1] - 2025-10-08 🚀

### 🏗️ Major Infrastructure Upgrades

#### ✨ Added
- **Native Redis Implementation** - Replaced Upstash wrapper with native `ioredis` client v5.8.1
  - Singleton pattern with connection pooling for optimal performance
  - Robust error handling with retry logic and health monitoring
  - Native Redis commands for improved rate limiting and caching
- **GitHub CI/CD Pipeline** - Complete automation workflow
  - Comprehensive testing pipeline with PostgreSQL and Redis services
  - CodeQL security scanning and dependency review automation
  - Coolify deployment integration with webhook triggering
- **Professional Project Structure** - Modern development standards
  - Issue templates for bug reports, feature requests, and documentation
  - Pull request templates with standardized review process
  - Security policy with responsible disclosure guidelines
  - Contributing guidelines with clear development workflow

#### 🔄 Changed
- **Redis Architecture** - Complete migration to native client
  - Maintained same interface for zero-downtime migration
  - Enhanced performance with direct Redis pipeline operations
  - Improved connection management and error resilience
- **Package Dependencies** - Updated to latest stable versions
  - Next.js: 15.5.3 (App Router optimizations)
  - React: 19.1.1 (latest stable with concurrent features)
  - TypeScript: 5.8.2 (enhanced type checking)
  - Better Auth: 1.3.11 (security improvements)
  - Prisma: 6.16.3 (performance optimizations)
  - Stripe: 18.5.0 (latest API features)
  - Framer Motion: 11.18.2 (animation performance)

#### 🔐 Security Enhancements
- **Automated Security Scanning** - GitHub Actions integration
  - CodeQL analysis for code security vulnerabilities
  - Dependency review for supply chain security
  - Automated security update suggestions
- **Infrastructure Hardening** - Production-ready security
  - Native Redis with secure connection handling
  - Enhanced rate limiting with Redis pipeline optimization
  - Comprehensive error logging without PII exposure

#### 📚 Documentation Overhaul
- **README.md** - Complete rewrite with current architecture
  - Updated library versions and dependency information
  - Comprehensive feature overview with technical specifications
  - Modern badges reflecting actual technology stack
- **SETUP.md** - Professional development setup guide
  - Step-by-step environment configuration
  - Troubleshooting section with common issues
  - Docker and local Redis setup instructions
- **Environment Configuration** - Detailed `.env.example`
  - Native Redis configuration examples
  - Comprehensive variable documentation
  - Development and production environment separation

#### 🛠️ Developer Experience
- **GitHub Actions Workflow** - Professional CI/CD pipeline
  - Parallel testing with service dependencies
  - Multi-environment support (development, staging, production)
  - Automated deployment triggers for Coolify
- **Development Tools** - Enhanced local development
  - Updated VS Code configuration recommendations
  - Improved scripts for database and Redis management
  - Better error handling and logging in development mode

### 📦 Dependencies

#### Added
- `ioredis@5.8.1` - High-performance Redis client for Node.js
- `@types/ioredis@5.0.0` - TypeScript definitions for ioredis

#### Removed
- `@upstash/redis` - Replaced with native Redis implementation

#### Updated
- All major dependencies updated to latest stable versions
- Security patches applied across the entire dependency tree
- TypeScript definitions updated for improved type safety

---

## [1.3.0] - 2025-01-02 🏗️

### ✨ Added

- **Migration vers Server Actions** - Architecture Next.js 15+ moderne
  - Actions serveur pour l'inscription aux cours (`enrollCourse`)
  - Actions serveur pour le suivi des progrès (`updateLessonProgress`) 
  - Actions serveur pour l'annulation d'abonnement (`cancelSubscription`)
  - Actions serveur pour l'émission de certificats (`issueCertificate`)
- **Intégration Better Auth** - Système d'authentification moderne
  - Authentification JWT sécurisée
  - Support des fournisseurs sociaux (Google, GitHub, Apple)
  - Gestion avancée des sessions avec révocation
- **Middleware modernisé** - Contrôle d'accès robuste
  - Classification intelligente des routes
  - Contrôle d'accès aux leçons avec base de données
  - Intégration analytics et gestion d'erreurs améliorée
- **Documentation complète** - Architecture et migration
  - Documentation d'architecture mise à jour dans README.md
  - Guides de migration des API routes vers Server Actions
  - Spécifications de contrat pour les actions serveur

### 🔄 Changed

- **Migration API → Server Actions** - Amélioration de la sécurité et performance
  - Remplacement des routes API legacy par des actions serveur typées
  - Validation Zod intégrée dans toutes les mutations
  - Gestion idempotente des opérations critiques
- **Architecture d'authentification** - Passage de custom auth à Better Auth
  - Sessions JWT sécurisées avec rotation automatique
  - Middleware d'authentification optimisé pour Edge Runtime
  - Gestion centralisée des permissions et accès
- **Système de gestion des accès** - Contrôle précis des autorisations
  - Service d'accès centralisé avec validation en base
  - Vérification des abonnements en temps réel
  - Gestion des cours non publiés pour utilisateurs inscrits

### 🗑️ Removed

- **Routes API obsolètes** - Nettoyage architectural
  - `/api/progress` (POST) - remplacé par action serveur
  - `/api/lessons/access` - fonctionnalité intégrée au middleware
  - `/api/lesson/*` - structure simplifiée
- **Code mort** - Optimisation du bundle
  - Imports Prisma côté client (incompatibles Edge Runtime)
  - Handlers API redondants remplacés par Server Actions
  - Composants et utilitaires non utilisés

### 🔧 Fixed

- **Problèmes de build** - Compatibilité Edge Runtime
  - Résolution des conflits nodemailer/Edge Runtime
  - Imports côté client sécurisés pour Prisma
  - Optimisation des dépendances pour le build
- **Gestion d'erreurs** - Robustesse améliorée
  - Gestion centralisée des erreurs dans le middleware
  - Fallbacks appropriés pour les erreurs d'authentification
  - Analytics d'erreurs avec corrélation d'ID

### ⚠️ Breaking Changes

- **Migration API Routes** - Nécessite mise à jour côté client
  - Endpoints POST `/api/enroll`, `/api/progress`, `/api/subscription/cancel` supprimés
  - Utiliser les Server Actions correspondantes : `enrollCourse`, `updateLessonProgress`, `cancelSubscription`
  - Format de réponse standardisé : `{ success: boolean, data?: any, error?: string }`
- **Structure d'authentification** - Nouveaux patterns requis
  - Sessions Better Auth remplacent les sessions custom
  - Headers d'authentification modifiés pour JWT
  - Endpoints d'authentification : `/api/auth/*` (Better Auth standard)

### 📈 Upgrade Notes

1. **Pour les développeurs** :
   ```bash
   # Installer les nouvelles dépendances
   pnpm install
   
   # Mettre à jour la base de données si nécessaire
   pnpm prisma generate
   pnpm prisma db push
   ```

2. **Pour les intégrations externes** :
   - Mettre à jour les appels API vers les nouvelles Server Actions
   - Vérifier la compatibilité avec les nouveaux formats de réponse
   - Mettre à jour l'authentification pour Better Auth JWT

3. **Tests et validation** :
   - Exécuter la suite de tests : `pnpm test`
   - Valider les contrats API : `pnpm test:contract`
   - Vérifier les tests d'intégration : `pnpm test:integration`

## [1.2.0] - 2024-01-10 🚀

### ✨ Added

- Nouveau système de chargement automatique avec animation du favicon
  - Chargement automatique
  - Animation du favicon
- Pages d'erreur personnalisées (404, erreur globale, accès non autorisé)
  - Erreur 404
  - Erreur globale
  - Accès non autorisé
- Mode maintenance configurable avec API sécurisée
  - Mode maintenance
  - API sécurisée
- Système de gestion des erreurs global
  - Gestion des erreurs
- Middleware pour le routage en mode maintenance
  - Routage en mode maintenance

### 🔄 Changed

- Refonte du système de chargement pour une activation automatique
  - Activation automatique
- Amélioration des transitions de page avec Framer Motion
  - Transitions de page
- Optimisation des performances de chargement
  - Performances de chargement

### 🗑️ Removed

- Ancien système de chargement manuel (LoadingProvider)
  - LoadingProvider
- Composants de chargement obsolètes
  - Composants de chargement

## [1.1.0] - 2024-01-05 📈

### ✨ Added

- Plateforme de défis de codage
  - Défis de codage
- Exercices de manipulation de chaînes
  - Manipulation de chaînes
- Défis sur les tableaux
  - Tableaux
- Chronomètre de 5 minutes
  - Chronomètre
- Système de validation en temps réel
  - Validation en temps réel

### 🔄 Changed

- Amélioration de l'interface utilisateur
  - Interface utilisateur
- Optimisation des performances
  - Performances

## [1.0.0] - 2024-01-01 🎉

### 🚀 Initial Release

- Version initiale du portfolio
  - Portfolio
- Design responsive avec TailwindCSS
  - Design responsive
- Thème clair/sombre
  - Thème clair/sombre
- Navigation fluide
  - Navigation fluide
- Optimisation SEO
  - Optimisation SEO

## [1.0.2] - 2024-11-14 🚀

### ✨ Added

- 🖼️ Dynamic OG image generation for projects
  - Server-side image generation
  - Custom gradients and layouts
  - Project-specific previews
- 🎯 Enhanced SEO metadata
  - Structured data implementation
  - Rich snippets optimization
  - Social media cards
- ⚡ Edge runtime optimization
  - Global CDN deployment
  - Improved response times
  - Better caching strategy
- 🔄 GitLab CI/CD integration
  - Automated deployments
  - Quality checks
  - Performance monitoring

### 🔨 Changed

- 📁 Project structure optimization
  - Better component organization
  - Cleaner imports
  - Improved modularity
- 📚 Documentation improvements
  - Updated README
  - Added contributing guidelines
  - Enhanced API documentation
- 🎨 Image processing enhancements
  - WebP format support
  - Responsive images
  - Lazy loading
- 🛠️ Error handling refinements
  - Better error messages
  - Improved recovery
  - User-friendly fallbacks

### 🐛 Fixed

- 🖼️ Image optimization in production
  - Correct format serving
  - Size optimization
  - Loading performance
- 🎯 SEO metadata generation
  - Valid OpenGraph tags
  - Correct Twitter cards
  - Canonical URLs
- 📝 TypeScript definitions
  - Stricter types
  - Better interfaces
  - Fixed type errors
- 📊 Project data structure
  - Consistent format
  - Better validation
  - Improved typing

## [1.0.1] - 2024-11-07 📈

### ✨ Added

- 📝 Blog with MDX
  - Syntax highlighting
  - Code snippets
  - Interactive components
- 📋 Dynamic resume
  - Real-time status
  - Skills visualization
  - Experience timeline
- 🎨 Project showcase
  - Filtering system
  - Search functionality
  - Tags and categories
- 📬 Contact form
  - Form validation
  - SPAM protection
  - Email notifications

### 🔨 Changed

- ⚡ Next.js 14 upgrade
  - Server components
  - Improved routing
  - Better performance
- 📱 Responsive design
  - Mobile-first approach
  - Better tablets support
  - Touch interactions
- ♿ Accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
- 📦 Dependencies
  - Security updates
  - Performance improvements
  - Bug fixes

### 🐛 Fixed

- 📱 Mobile navigation
  - Better touch areas
  - Smoother transitions
  - Fixed overlays
- 🌓 Dark mode
  - System preference sync
  - Smooth transitions
  - Consistent colors
- 📝 Form validation
  - Better error messages
  - Real-time validation
  - UX improvements
- ⚡ Performance
  - Reduced bundle size
  - Faster page loads
  - Better caching

## [1.0.0] - 2024-11-01 🎉

### 🚀 Initial Release

- 🎨 Modern design
  - Clean aesthetics
  - Professional look
  - Consistent branding
- 🌓 Dark/light modes
  - System preference sync
  - Manual toggle
  - Persistent choice
- 📱 Responsive layout
  - Mobile optimization
  - Tablet support
  - Desktop enhancement
- 💼 Project showcase
  - Portfolio display
  - Project details
  - Live demos
- 📬 Contact system
  - Easy communication
  - Form validation
  - Response handling
- 🎯 SEO ready
  - Meta tags
  - Structured data
  - Sitemap
- 📊 Analytics
  - Performance tracking
  - User behavior
  - Page insights

[1.2.0]: https://gitlab.com/fygs/fygs.dev/compare/v1.1.0...v1.2.0
[1.1.0]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.0...v1.1.0
[1.0.2]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.1...v1.0.2
[1.0.1]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.0...v1.0.1
[1.0.0]: https://gitlab.com/fygs/fygs.dev/releases/tag/v1.0.0
