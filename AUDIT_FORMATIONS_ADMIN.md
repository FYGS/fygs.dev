# 🎯 AUDIT COMPLET — Module Formations & Admin

> Réalisé le 29 mai 2026 | Périmètre : création de cours, expérience apprenant, présentation publique, design system

---

## 📊 RÉSUMÉ EXÉCUTIF

| Domaine | Score initial | Score actuel | Verdict |
|---------|--------------|--------------|---------|
| **Création de cours (admin)** | 6/10 | **8/10** | Builder unifié, drag & drop, auto-save, inline CRUD |
| **Expérience apprenant** | 7/10 | 7/10 | Solide techniquement, immersion non démarrée (Phase 3) |
| **Présentation publique** | 5.5/10 | 5.5/10 | Landing pages non démarrées (Phase 4) |
| **Design system & cohérence** | 5/10 | **8/10** | Palette indigo, tokens, dark/light, composants marketing |
| **Architecture technique** | 7.5/10 | **8.5/10** | Tests 107, CI, code propre, @dnd-kit, react-hook-form |

---

## 🔍 AUDIT DÉTAILLÉ

### 1. CRÉATION DE COURS (Admin) — Score: 6/10

#### ✅ Points forts
- Validation Zod rigoureuse sur toutes les actions
- Contrôle d'accès RBAC (ADMIN/INSTRUCTOR)
- Auto-génération de slugs
- Éditeur de quiz avancé (3 colonnes, preview, reorder)
- Gestion des supports visuels
- Module cards avec gradient et glow dans le formulaire d'édition

#### ❌ Problèmes identifiés

| # | Problème | Impact | Criticité |
|---|----------|--------|-----------|
| A1 | **Workflow fragmenté** : création cours → page séparée pour modules → page séparée pour leçons → page séparée pour quiz | Création d'un cours complet = 5+ navigations différentes | 🔴 Haute |
| A2 | **Pas d'éditeur de contenu riche pour les leçons** : simple `<Textarea>` pour le contenu des leçons | Impossible de créer du contenu visuel attractif | 🔴 Haute |
| A3 | **Leçons gérées séparément des cours** : `/admin/lessons/new` est une page isolée qui demande de sélectionner un cours | Incohérent avec le modèle mental "je crée MON cours" | 🟡 Moyenne |
| A4 | **Pas de drag & drop** pour réorganiser modules/leçons | Réorganisation via champs `order` numériques | 🟡 Moyenne |
| A5 | **Pas de preview "live"** du cours avant publication | L'auteur ne peut pas voir le rendu final | 🟡 Moyenne |
| A6 | **Form state management hybride** : react-hook-form dans certains formulaires, useState brut dans d'autres (course-edit-form) | Incohérence, bugs potentiels de validation | 🟡 Moyenne |
| A7 | **Pas de brouillon auto-save** | Perte de contenu possible | 🟡 Moyenne |
| A8 | **Upload vidéo limité** : simple champ URL, pas d'upload direct | Friction pour l'instructeur | 🟡 Moyenne |
| A9 | **Pas de tableau de bord instructeur dédié** | Instructeur voit le même admin que l'admin (filtré) | 🟢 Basse |
| A10 | **Pas de template/duplication de cours** | Pas de gain de temps pour des cours similaires | 🟢 Basse |

---

### 2. EXPÉRIENCE APPRENANT — Score: 7/10

#### ✅ Points forts
- Video player custom complet (playback rate, PiP, fullscreen, seek)
- Progression séquentielle avec logique de déverrouillage
- Resume banner intelligent (reprendre / commencer)
- Sidebar de progression sticky avec pourcentage
- Navigation leçon ←→ leçon fluide
- Rendu MDX avec remarque-gfm et rehype plugins
- Watch time tracking en temps réel

#### ❌ Problèmes identifiés

| # | Problème | Impact | Criticité |
|---|----------|--------|-----------|
| B1 | **Pas de mode "focus/immersion"** : la page leçon garde le header de navigation principal | Distraction, perte de concentration | 🔴 Haute |
| B2 | **Layout 3 colonnes rigide** : video + contenu + sidebar sur desktop, empilé sur mobile | Sur mobile, la sidebar de progression est en bas (invisible) | 🟡 Moyenne |
| B3 | **Pas de gamification** : pas de streak, pas de points XP, pas de badges | Rétention faible, pas de motivation extrinsèque | 🟡 Moyenne |
| B4 | **Quiz UX basique** : pas d'animation sur réponse correcte/incorrecte, pas de feedback immersif | Manque de plaisir dans l'apprentissage | 🟡 Moyenne |
| B5 | **Pas de notes personnelles** intégrées au player | L'apprenant doit quitter pour prendre des notes | 🟡 Moyenne |
| B6 | **Pas de raccourcis clavier** documentés pour le video player | Friction pour les power users | 🟢 Basse |
| B7 | **Pas de "discussions/questions"** par leçon | Isolation de l'apprenant (model solitaire) | 🟡 Moyenne |
| B8 | **Certificat non visible dans le parcours** | Pas de motivation vers l'objectif final | 🟢 Basse |
| B9 | **Pas de recommandation de prochaine formation** après complétion | Fin de parcours = fin de l'engagement | 🟢 Basse |

---

### 3. PRÉSENTATION PUBLIQUE — Score: 5.5/10

#### ✅ Points forts
- Hero animé avec stats sociales (500+ étudiants, 4.9/5)
- Filtres par catégorie/niveau
- Course cards avec badges d'accès (Enrolled, Free, Premium)
- SEO metadata + OG images
- Breadcrumbs et structure de navigation claire

#### ❌ Problèmes identifiés

| # | Problème | Impact | Criticité |
|---|----------|--------|-----------|
| C1 | **Pas de landing page de vente dédiée par cours** : la page `/formations/[slug]` est un hybrid info/learning | Pas de funnel de conversion clair | 🔴 Haute |
| C2 | **Contenu marketing en MDX brut** (publicStructure, publicResources, etc.) : pas de sections visuelles structurées | Présentation plate et textuelle | 🔴 Haute |
| C3 | **Pas de vidéo d'introduction/trailer** sur la page publique | Impossible de "sentir" le cours avant d'acheter | 🟡 Moyenne |
| C4 | **Pas de témoignages mis en avant** avec photo/vidéo | Social proof faible | 🟡 Moyenne |
| C5 | **Curriculum affiché même pour non-inscrits mais verrouillé** : bon principe, mais icônes Lock peu engageantes | Sentiment de "mur" plutôt que de "promesse" | 🟡 Moyenne |
| C6 | **Pas de FAQ** sur la page cours | Questions non répondues = abandon | 🟡 Moyenne |
| C7 | **Pas de garantie/politique de remboursement visible** | Frein à l'achat | 🟡 Moyenne |
| C8 | **Pas de comparaison de plans** (FREE vs PREMIUM) claire | L'utilisateur ne comprend pas ce qu'il obtient | 🟡 Moyenne |
| C9 | **Pas de compteur d'urgence/scarcité** (optionnel) | Pas de FOMO | 🟢 Basse |

---

### 4. DESIGN SYSTEM & COHÉRENCE VISUELLE — Score: 5/10

#### ✅ Points forts
- Tailwind CSS v4 avec design tokens CSS custom properties
- shadcn/ui (style "new-york") pour les composants de base
- Geist Sans + Geist Mono + Anek Telugu (caption) — typographies modernes
- Gradient utilities définis (text-gradient-primary, text-gradient-heading)
- Container utilities (container-xl, container-content)
- Animation keyframes (blob, shimmer, fadeIn, gradient)

#### ❌ Problèmes identifiés

| # | Problème | Impact | Criticité |
|---|----------|--------|-----------|
| D1 | **Palette monochrome froide unique** : HSL 220° (bleu-gris) à 86% lightness pour primary — pas de couleur d'accent vibrante | Manque de personnalité, sentiment "terne" | 🔴 Haute |
| D2 | **Pas de mode light/dark toggle** : la CSS ne définit qu'une seule palette (dark-only) malgré `ThemeProvider` | Excluant pour les utilisateurs préférant le light mode | 🔴 Haute |
| D3 | **Pas de "course-specific" color theming** | Chaque cours a le même look, pas de différenciation visuelle | 🟡 Moyenne |
| D4 | **Typographie inconsistante** : certains composants utilisent 7xl, d'autres 4xl pour des headers de même importance | Hiérarchie visuelle brouillée | 🟡 Moyenne |
| D5 | **Pas de motion design system** : animations ad-hoc (hover-scale, hover-lift) mais pas de système cohérent | Certaines transitions sont abruptes | 🟡 Moyenne |
| D6 | **Espacement non systématique** : gap-6, gap-8, py-8, py-12 utilisés de manière incohérente | Rythme visuel cassé | 🟡 Moyenne |
| D7 | **Pas de composants "marketing"** dédiés : pas de Hero variant, Testimonial, Feature Grid, Pricing Card | Chaque page marketing est construite ad-hoc | 🟡 Moyenne |
| D8 | **Border-radius inconsistant** : var(--radius) = 0.5rem mais certains composants utilisent rounded-lg, rounded-xl arbitrairement | Incohérence subtile | 🟢 Basse |

---

## 🏗️ PLAN DE RESTRUCTURATION & MODERNISATION

### Phase 1 — Fondations Design (Semaine 1-2)

| Tâche | Description | Fichiers concernés | Mesurable |
|-------|-------------|-------------------|-----------|
| **P1.1** | Refondre la palette de couleurs avec accent vibrant (emerald/indigo gradient) + définir light mode | `app/globals.css` | ✅ 2 thèmes fonctionnels (dark/light) |
| **P1.2** | Créer un Design Token system : spacing scale (4, 8, 12, 16, 24, 32, 48, 64), typography scale (display, heading, body, caption) | `app/globals.css`, nouveau `styles/tokens.css` | ✅ Variables documentées |
| **P1.3** | Standardiser les motion tokens : `--duration-fast: 150ms`, `--duration-normal: 300ms`, `--duration-slow: 500ms` + easing curves | `styles/animations.css` | ✅ Animations uniformes |
| **P1.4** | Créer composants marketing réutilisables : `<SectionHero>`, `<FeatureGrid>`, `<TestimonialCarousel>`, `<PricingTable>`, `<FAQ>` | `components/marketing/` | ✅ 5 composants créés |
| **P1.5** | Unifier la typographie : définir quand utiliser Geist Sans vs Anek Telugu, tailles par contexte | Documentation dans `DESIGN_SYSTEM.md` | ✅ Guide créé |

---

### Phase 2 — Refonte du Course Builder Admin (Semaine 2-4)

| Tâche | Description | Fichiers concernés | Mesurable |
|-------|-------------|-------------------|-----------|
| **P2.1** | **Créer un Course Builder unifié** : page unique avec tabs/steps (Infos → Modules → Leçons → Quiz → Preview → Publish) | `app/[locale]/(admin)/admin/courses/[id]/` refactorisé | ✅ Création cours en 1 page |
| **P2.2** | **Intégrer un éditeur de contenu riche** pour les leçons (MDX live editor ou block editor type Notion) | Nouveau composant `components/admin/block-editor.tsx` | ✅ Éditeur WYSIWYG fonctionnel |
| **P2.3** | **Drag & drop pour modules et leçons** avec @dnd-kit ou react-beautiful-dnd | `course-edit-form.tsx`, `module-create-form.tsx` | ✅ Réorganisation par drag |
| **P2.4** | **Auto-save avec debounce** sur les formulaires d'édition (500ms) | Hook `useAutoSave()` | ✅ Sauvegarde automatique visible |
| **P2.5** | **Preview mode** : bouton "Voir comme un apprenant" depuis l'admin | Route `/formations/[slug]?preview=true` | ✅ Preview accessible |
| **P2.6** | **Upload vidéo direct** avec progress bar (MinIO/S3) au lieu de simple URL | Composant `VideoUpload` + API route | ✅ Upload drag & drop |
| **P2.7** | **Unifier les forms sur react-hook-form** : refactoriser `course-edit-form.tsx` qui utilise useState brut | `course-edit-form.tsx` | ✅ Validation unifiée |
| **P2.8** | **Inline lesson creation** : créer une leçon directement dans le module (pas de navigation) | Modal ou inline form | ✅ 0 navigation pour ajouter |

---

### Phase 3 — Expérience Apprenant Immersive (Semaine 4-6)

| Tâche | Description | Fichiers concernés | Mesurable |
|-------|-------------|-------------------|-----------|
| **P3.1** | **Mode Focus/Cinéma** : layout dédié sans header/footer pour les leçons, avec sidebar rétractable | Nouveau `app/[locale]/(learning)/` route group | ✅ Layout immersif |
| **P3.2** | **Navigation au clavier** pour le video player (Space=play, ←/→=seek, M=mute, F=fullscreen) | `video-player.tsx` | ✅ Shortcuts fonctionnels |
| **P3.3** | **Gamification basique** : barre XP, confettis à la complétion de module, streak counter | `components/learning/xp-bar.tsx`, `components/learning/streak.tsx` | ✅ 3 éléments gamifiés |
| **P3.4** | **Quiz UX amélioré** : animation Framer Motion sur réponse, feedback immédiat avec explication, progress ring | Refacto `quiz-student.tsx` | ✅ Feedback visuel riche |
| **P3.5** | **Notes inline** : panneau de notes personnelles collapsible dans la sidebar de leçon | `components/learning/lesson-notes.tsx` | ✅ Sauvegarde de notes |
| **P3.6** | **Minimap de progression** : vue d'ensemble visuelle du parcours (type roadmap) | `components/learning/course-roadmap.tsx` | ✅ Roadmap visible |
| **P3.7** | **Certificat dynamique** avec animation de déblocage + partage social | `components/learning/certificate-reveal.tsx` | ✅ Certificat partageable |
| **P3.8** | **Mobile-first lesson layout** : bottom sheet pour navigation, video plein écran, swipe pour avancer | Responsive redesign | ✅ UX mobile fluide |

---

### Phase 4 — Landing Pages de Vente (Semaine 6-7)

| Tâche | Description | Fichiers concernés | Mesurable |
|-------|-------------|-------------------|-----------|
| **P4.1** | **Séparer page publique (vente) et page learning** : `/formations/[slug]` = landing, `/learn/[slug]` = apprentissage | Nouvelle route group `(learning)` | ✅ 2 expériences distinctes |
| **P4.2** | **Landing page structurée** : Hero vidéo → Problème/Solution → Programme détaillé → Témoignages → Pricing → FAQ → CTA | `formations/[slug]/page.tsx` refactorisé | ✅ Sections de vente |
| **P4.3** | **Vidéo trailer/intro** uploadable par l'instructeur et affichée en hero | Champ `trailerUrl` dans schema + player auto-play | ✅ Trailer visible |
| **P4.4** | **Section FAQ éditable** par cours depuis l'admin | Nouveau model `CourseFAQ` ou champ JSON | ✅ FAQ affichée |
| **P4.5** | **Garantie et politique de remboursement** visible avec icônes de confiance | Composant `TrustBadges` | ✅ Elements de confiance |
| **P4.6** | **Social proof dynamique** : nombre d'inscrits en temps réel, derniers avis en carousel | `components/marketing/social-proof.tsx` | ✅ Données dynamiques |

---

### Phase 5 — Polish & Performance (Semaine 7-8)

| Tâche | Description | Fichiers concernés | Mesurable |
|-------|-------------|-------------------|-----------|
| **P5.1** | **Skeleton loading amélioré** : shimmer effect sur toutes les pages de cours | Loading files + Skeleton components | ✅ 0 flash de contenu |
| **P5.2** | **Optimistic updates** sur la progression (mark complete avant réponse serveur) | `lesson-progress.tsx`, server actions | ✅ Feedback instantané |
| **P5.3** | **Prefetch des leçons adjacentes** pour transition instantanée | `<Link prefetch>` + RSC cache | ✅ Navigation < 200ms |
| **P5.4** | **Image optimization** : thumbnails cours en format WebP/AVIF avec blur placeholder | Image pipeline | ✅ LCP < 2.5s |
| **P5.5** | **E2E tests** du parcours complet : inscription → paiement → lesson 1 → quiz → certificat | Playwright test suite | ✅ Tests green |

---

## 📐 ARCHITECTURE CIBLE

```
app/
├── [locale]/
│   ├── (main)/
│   │   └── formations/
│   │       ├── page.tsx              # Catalogue / découverte
│   │       └── [slug]/
│   │           ├── page.tsx          # Landing page de VENTE (public)
│   │           └── details/          # Infos complémentaires
│   ├── (learning)/                    # 🆕 NOUVEAU route group
│   │   └── learn/
│   │       └── [slug]/
│   │           ├── layout.tsx        # Layout immersif (pas de header)
│   │           ├── page.tsx          # Dashboard du cours (roadmap)
│   │           ├── lessons/[lessonSlug]/
│   │           │   └── page.tsx      # Player + contenu
│   │           └── quizzes/[quizId]/
│   │               └── page.tsx      # Quiz immersif
│   └── (admin)/
│       └── admin/
│           └── courses/
│               ├── page.tsx          # Liste
│               └── [id]/
│                   └── builder/      # 🆕 Course Builder unifié
│                       └── page.tsx  # Tabs: Info | Modules | Leçons | Quiz | Preview | Publish
```

---

## 🎨 DIRECTION ARTISTIQUE PROPOSÉE

### Palette de couleurs cible

```css
:root {
  /* Primary: Indigo vibrant (apprentissage, confiance) */
  --primary: 238 75% 60%;           /* #6366F1 */
  --primary-foreground: 0 0% 100%;
  
  /* Accent: Emerald (progression, succès) */
  --accent-success: 160 84% 39%;    /* #10B981 */
  
  /* Accent: Amber (engagement, gamification) */
  --accent-warm: 38 92% 50%;        /* #F59E0B */
  
  /* Surface: Slate profond mais lumineux */
  --background: 222 47% 11%;        /* #0F172A */
  --card: 217 33% 17%;              /* #1E293B */
  --foreground: 210 40% 98%;        /* #F8FAFC */
}

/* Light mode */
.light {
  --background: 0 0% 100%;
  --card: 210 40% 98%;
  --foreground: 222 47% 11%;
  --primary: 238 75% 55%;
}
```

### Typographie cible

| Contexte | Font | Poids | Taille |
|----------|------|-------|--------|
| Display (hero) | Anek Telugu | 700 | 4rem-5rem |
| Heading (h1-h3) | Geist Sans | 600 | 1.5rem-2.5rem |
| Body | Geist Sans | 400 | 1rem |
| Code / technique | Geist Mono | 400 | 0.875rem |
| Caption / badge | Geist Sans | 500 | 0.75rem |

### Motion Design

| Interaction | Duration | Easing | Exemple |
|-------------|----------|--------|---------|
| Hover | 150ms | ease-out | Scale 1.02, shadow lift |
| Page transition | 300ms | ease-in-out | Fade + slide up 8px |
| Modal open | 250ms | spring(1, 80, 10) | Scale from 0.95 + fade |
| Progress update | 500ms | ease-out | Width animation |
| Confetti/reward | 1000ms | custom | canvas-confetti burst |

---

## 📋 PRIORISATION (Effort vs Impact)

```
IMPACT ↑
  │  
  │  ★ P2.1 (Course Builder)   ★ P4.1 (Landing séparée)
  │  ★ P1.1 (Palette)          ★ P3.1 (Mode Focus)
  │  ★ P2.2 (Rich Editor)      ★ P4.2 (Structured Landing)
  │  
  │  ○ P2.3 (Drag & Drop)      ○ P3.3 (Gamification)
  │  ○ P2.4 (Auto-save)        ○ P3.4 (Quiz UX)
  │  ○ P1.4 (Marketing comps)  ○ P4.3 (Trailer)
  │  
  │  · P2.6 (Video Upload)     · P3.5 (Notes)
  │  · P1.5 (Typo guide)       · P5.3 (Prefetch)
  │  
  └──────────────────────────────────────── EFFORT →
```

**Quick wins (< 1 jour, fort impact) :**
1. P1.1 — Refonte palette CSS (quelques heures)
2. P3.2 — Raccourcis clavier video player (1h)
3. P2.5 — Preview mode (2h)
4. P5.2 — Optimistic updates sur progression (2h)

---

## 🔢 MÉTRIQUES DE SUCCÈS

| KPI | Actuel (estimé) | Cible |
|-----|-----------------|-------|
| Temps création cours complet | 45+ min (multi-page) | < 15 min (builder unifié) |
| Taux de complétion d'un cours | ~20% | > 45% (gamification + immersion) |
| Taux de conversion page publique → achat | ~2-3% | > 6% (landing structurée) |
| Lighthouse Performance Score | ~70 | > 90 |
| Time to First Lesson (après paiement) | 3+ clics | 1 clic |
| Cohérence design (composants custom / total) | ~60% | > 95% |

---

## ✅ CHECKLIST DE SUIVI

> Dernière mise à jour : 29 mai 2026

- [x] **Phase 1** — Design Tokens & Palette ✅ COMPLÈTE
  - [x] P1.1 Palette indigo + Light/Dark mode (globals.css refait, next-themes)
  - [x] P1.2 Spacing & Typography scale (tokens CSS : --space-*, text-body-*, text-heading-*)
  - [x] P1.3 Motion tokens (--duration-fast/normal/slow, --ease-*)
  - [x] P1.4 Composants marketing (SectionHero, FeatureGrid, TestimonialCarousel, PricingTable, FAQ)
  - [x] P1.5 Guide typographique (DESIGN_SYSTEM.md)

- [ ] **Phase 2** — Course Builder Admin (6/8 complètes)
  - [x] P2.1 Builder unifié (page unique à 6 onglets : Infos, Curriculum, Quiz, Supports, Preview, Paramètres)
  - [ ] P2.2 Rich text editor pour leçons (non implémenté — nécessite @tiptap ou @blocknote)
  - [x] P2.3 Drag & drop modules/leçons (@dnd-kit intégré, reorder persisté)
  - [x] P2.4 Auto-save (hook useAutoSave + AutoSaveIndicator, testé)
  - [x] P2.5 Preview mode (?preview=true avec vérification ADMIN/INSTRUCTOR)
  - [ ] P2.6 Upload vidéo direct (non implémenté — nécessite MinIO/S3)
  - [x] P2.7 Unifier react-hook-form (course-edit-form refactorisé avec Zod + zodResolver)
  - [x] P2.8 Inline lesson creation (CurriculumTab avec formulaires inline + CRUD)

- [ ] **Phase 3** — Expérience Apprenant (non démarrée)
  - [ ] P3.1 Mode Focus/Cinéma
  - [ ] P3.2 Raccourcis clavier
  - [ ] P3.3 Gamification (XP, streak, confettis)
  - [ ] P3.4 Quiz UX amélioré
  - [ ] P3.5 Notes inline
  - [ ] P3.6 Minimap/Roadmap de progression
  - [ ] P3.7 Certificat animé + partage
  - [ ] P3.8 Mobile-first lesson layout

- [ ] **Phase 4** — Landing Pages (non démarrée)
  - [ ] P4.1 Séparer vente / learning
  - [ ] P4.2 Landing page structurée
  - [ ] P4.3 Vidéo trailer
  - [ ] P4.4 FAQ par cours
  - [ ] P4.5 Trust badges & garantie
  - [ ] P4.6 Social proof dynamique

- [ ] **Phase 5** — Polish (non démarrée)
  - [ ] P5.1 Skeleton shimmer
  - [ ] P5.2 Optimistic updates
  - [ ] P5.3 Prefetch leçons
  - [ ] P5.4 Image optimization
  - [ ] P5.5 Tests E2E

---

## � STRATÉGIE DE TESTS — Couverture Totale

### Principes

1. **Chaque fonctionnalité = tests associés** (pas de merge sans tests)
2. **Tests pyramidaux** : Unit (70%) → Integration (20%) → E2E (10%)
3. **Coverage minimum** : 80% sur les nouveaux fichiers, 90% sur les services critiques
4. **CI obligatoire** : tests run avant chaque push

### Stack de Tests

| Type | Outil | Cible |
|------|-------|-------|
| Unit | Vitest | Utilitaires, hooks, helpers, transformations |
| Component | Vitest + React Testing Library | Composants UI isolés |
| Integration | Vitest + Prisma (docker) | Server actions, repositories, services |
| E2E | Playwright | Parcours utilisateur complets |
| Visual Regression | Playwright screenshots | Design consistency |

### Tests par Phase

#### Phase 1 — Design System
- [ ] Test des utilitaires CSS (cn(), gradient classes)
- [ ] Test du ThemeProvider (toggle dark/light, persistence localStorage)
- [ ] Snapshot tests des composants marketing (Hero, FeatureGrid, FAQ, etc.)
- [ ] Visual regression tests sur les 2 thèmes (dark + light)

#### Phase 2 — Course Builder Admin
- [ ] **Unit** : validation schemas Zod (createCourse, updateCourse, createLesson)
- [ ] **Unit** : slug generation, duration formatting, form transforms
- [ ] **Integration** : server actions CRUD (create/update/delete course, module, lesson, quiz)
- [ ] **Integration** : permission checks (ADMIN vs INSTRUCTOR vs USER)
- [ ] **Component** : CourseBuilderTabs navigation, form submissions, auto-save hook
- [ ] **Component** : Drag & drop reordering (modules, lessons)
- [ ] **E2E** : Création d'un cours complet (info → modules → leçons → quiz → publish)

#### Phase 3 — Expérience Apprenant
- [ ] **Unit** : progression calculation, XP computation, streak logic
- [ ] **Unit** : video player time formatting, keyboard shortcut mapping
- [ ] **Integration** : markLessonComplete, updateWatchTime, saveNote
- [ ] **Integration** : sequential access logic (lesson unlock rules)
- [ ] **Component** : VideoPlayer controls, Quiz feedback animations, Notes panel
- [ ] **Component** : LessonProgress sidebar (states: locked, current, completed)
- [ ] **E2E** : Parcours apprenant complet (enrollment → lesson 1 → quiz → certificate)

#### Phase 4 — Landing Pages
- [ ] **Unit** : price formatting, enrollment count display, rating calculation
- [ ] **Component** : Landing page sections render (Hero, FAQ, Testimonials, Pricing)
- [ ] **Component** : CourseEnrollment widget states (unauthenticated, free, premium, enrolled)
- [ ] **E2E** : Funnel complet (découverte → landing → paiement → accès)

#### Phase 5 — Polish
- [ ] **Performance** : Lighthouse CI assertions (LCP < 2.5s, FID < 100ms)
- [ ] **Unit** : Optimistic update rollback logic
- [ ] **E2E** : Full regression suite (10+ scénarios critiques)
- [ ] **Visual** : Screenshot comparison sur pages clés (catalogue, landing, lesson)

### Structure des fichiers de test

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── access-service.test.ts
│   │   ├── course-completion.test.ts
│   │   ├── slug-utils.test.ts
│   │   └── xp-calculator.test.ts
│   ├── hooks/
│   │   ├── use-lesson-progress.test.ts
│   │   ├── use-auto-save.test.ts
│   │   └── use-keyboard-shortcuts.test.ts
│   └── validators/
│       ├── course-schema.test.ts
│       └── lesson-schema.test.ts
├── integration/
│   ├── actions/
│   │   ├── create-course.test.ts
│   │   ├── module-actions.test.ts
│   │   ├── quiz-actions.test.ts
│   │   └── progress-actions.test.ts
│   ├── repositories/
│   │   ├── course-repository.test.ts
│   │   └── progress-repository.test.ts
│   └── services/
│       └── access-service.integration.test.ts
├── components/
│   ├── admin/
│   │   ├── course-builder.test.tsx
│   │   └── quiz-editor.test.tsx
│   ├── learning/
│   │   ├── video-player.test.tsx
│   │   ├── lesson-progress.test.tsx
│   │   └── quiz-student.test.tsx
│   └── marketing/
│       ├── section-hero.test.tsx
│       └── pricing-table.test.tsx
└── e2e/
    ├── course-creation.spec.ts
    ├── learner-journey.spec.ts
    ├── payment-flow.spec.ts
    └── course-discovery.spec.ts
```

### Configuration CI

```yaml
# Tests run en parallèle
- Unit + Component: ~30s (vitest --run)
- Integration: ~2min (docker + prisma)
- E2E: ~5min (playwright, 3 workers)
# Total CI: < 8 minutes
```

---

## �🧠 NOTES TECHNIQUES

### Dépendances à ajouter (estimées)
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@tiptap/react": "^2.x" // ou @blocknote/react pour block editor
}
```

### Schema Prisma — Évolutions nécessaires
```prisma
// Ajouter au model Course
model Course {
  trailerUrl    String?    // Vidéo d'introduction
  faq           Json?      // [{question, answer}]
  colorAccent   String?    // Couleur personnalisée du cours
}

// Nouveau model pour gamification
model UserStreak {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  xpEarned  Int      @default(0)
  
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, date])
}

// Nouveau model pour notes
model LessonNote {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  content   String
  timestamp Int?     // Position dans la vidéo
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id])
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  @@unique([userId, lessonId])
}
```

---

_Audit réalisé à partir de l'analyse complète du code source — 12+ fichiers principaux, schema Prisma, design system, server actions, et composants UI._
