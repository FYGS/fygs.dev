# TECH-MASTRY : Plan d'Implémentation Détaillé

> Document de référence pour la mise à niveau complète de la section Tech-Mastry.
> Généré après analyse exhaustive de 258+ fichiers dans pp/[locale]/(main)/tech-mastry/.

---

## Table des Matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Inventaire de l'existant](#2-inventaire-de-lexistant)
3. [Routes cassées — Corrections urgentes](#3-routes-cassées--corrections-urgentes)
4. [Évaluation qualitative par section](#4-évaluation-qualitative-par-section)
5. [Plan d'implémentation par priorité](#5-plan-dimplémentation-par-priorité)
6. [Détails techniques par section](#6-détails-techniques-par-section)
7. [Chantiers transversaux](#7-chantiers-transversaux)
8. [Estimation et planification](#8-estimation-et-planification)

---

## 1. Vue d'ensemble

### Architecture actuelle

`
tech-mastry/
├── layout.tsx           (221 lignes) — Sidebar + SearchBar + TopicsNav + Breadcrumbs + Sheet mobile
├── page.tsx             — InterviewPrepHero + PracticeSections (page d'accueil)
├── _components/         — Composants partagés
│   ├── topics-nav.tsx     (404 lignes) — Navigation sidebar, 7 sections expandables
│   ├── practice-sections.tsx (352 lignes) — 14 cartes de sections, pagination 6/page
│   ├── hero.tsx             — Section hero
│   ├── search-bar.tsx       — Recherche
│   └── breadcrumbs.tsx      — Fil d'Ariane
├── _utils/
│   └── search-index.ts     — Index de recherche pour SearchBar
├── algorithms/          — 6 sous-routes (complexity, sorting, searching, data-structures, visualizations, dynamic-programming)
├── backend/             — 1 page unique (BackendTopics)
├── best-practices/      — 6 sous-routes (code-quality, communication, design-patterns, negotiation, problem-solving, system-design)
├── challenges/          — 1 page (AdvancedCodingChallenges)
├── coding-challenges/   — 6 sous-routes (arrays, dp, graphs, strings, system-design, trees)
├── collaboration/       — 1 page (réutilise CollaborativeCoding du playground)
├── dashboard/           — 1 page (ProgressDashboard, mock data)
├── data-structures/     — 3 sous-routes (arrays, lists, trees)
├── frontend/            — 5 sous-routes (accessibility, component-patterns, performance, react-basics, state-management)
├── interview-simulation/— 1 page (InterviewSimulator)
├── playground/          — 31 fichiers (Monaco editor, AI assistant, collaborative coding, etc.)
├── preparation/         — 1 page (PreparationGuide)
├── qa/                  — 1 page (QAGuide)
└── system-design/       — 4 sous-routes (architecture, distributed, scalability, storage)
`

### Statistiques clés

| Métrique | Valeur |
|----------|--------|
| Fichiers .tsx totaux | 258+ |
| Sous-routes fonctionnelles | ~30 |
| Routes cassées (404) | 4 |
| Pages avec mock data uniquement | 3 (dashboard, interview-simulation, playground AI) |
| Sections sans page existante | 4 (architecture, security-devops, career, resources) |

---

## 2. Inventaire de l'existant

### ✅ Routes EXISTANTES et FONCTIONNELLES

| Route | Fichiers | Composants clés | Qualité |
|-------|----------|-----------------|---------|
| /tech-mastry | page.tsx | InterviewPrepHero, PracticeSections | ⭐⭐⭐ |
| /tech-mastry/algorithms | page.tsx + 5 sous-pages | TopicsList, AlgorithmsHero | ⭐⭐⭐ |
| /tech-mastry/algorithms/complexity | page.tsx + composants | BigOVisualization, TimeComplexityExplainer | ⭐⭐⭐⭐ |
| /tech-mastry/algorithms/sorting | page.tsx + composants | SortingVisualizer, AlgorithmComparison | ⭐⭐⭐⭐ |
| /tech-mastry/algorithms/searching | page.tsx + composants | SearchVisualizer, SearchComparison | ⭐⭐⭐⭐ |
| /tech-mastry/algorithms/data-structures | page.tsx + composants | DSVisualization | ⭐⭐⭐ |
| /tech-mastry/algorithms/dynamic-programming | page.tsx + composants | DPVisualizer, DPPatterns | ⭐⭐⭐ |
| /tech-mastry/algorithms/visualizations | page.tsx | AlgorithmVisualizations | ⭐⭐⭐ |
| /tech-mastry/data-structures | page.tsx + 3 sous-pages | DataStructuresHero, DSTopics | ⭐⭐⭐ |
| /tech-mastry/data-structures/arrays | page.tsx + composants | ArrayVisualization | ⭐⭐⭐ |
| /tech-mastry/data-structures/lists | page.tsx + composants | LinkedListVisualization | ⭐⭐⭐ |
| /tech-mastry/data-structures/trees | page.tsx + composants | TreeVisualization | ⭐⭐⭐ |
| /tech-mastry/system-design | page.tsx + 4 sous-pages | DesignTopics, SystemDesignHero | ⭐⭐⭐ |
| /tech-mastry/system-design/architecture | page.tsx + composants | ArchitecturePatterns | ⭐⭐⭐ |
| /tech-mastry/system-design/distributed | page.tsx + composants | MicroservicesVisualization, EventDrivenViz, ServiceMeshViz | ⭐⭐⭐⭐ |
| /tech-mastry/system-design/scalability | page.tsx + composants | LoadBalancerVisualization, CachingViz | ⭐⭐⭐⭐ |
| /tech-mastry/system-design/storage | page.tsx + composants | SQLvsNoSQL, Sharding, Replication, ACID/CAP | ⭐⭐⭐⭐ |
| /tech-mastry/frontend | page.tsx + 5 sous-pages | FrontendHero, FrontendTopics | ⭐⭐⭐ |
| /tech-mastry/frontend/react-basics | page.tsx + composants | ReactBasics sections | ⭐⭐⭐ |
| /tech-mastry/frontend/component-patterns | page.tsx + composants | ComponentPatterns | ⭐⭐⭐ |
| /tech-mastry/frontend/state-management | page.tsx + composants | Redux/Zustand/React Query/Context sections | ⭐⭐⭐⭐ |
| /tech-mastry/frontend/performance | page.tsx + composants | Memoization, CodeSplitting, BundleSize, RenderingOptimization | ⭐⭐⭐⭐ |
| /tech-mastry/frontend/accessibility | page.tsx + composants | ARIA, ScreenReaders, Keyboard, ColorContrast | ⭐⭐⭐⭐ |
| /tech-mastry/backend | page.tsx | BackendTopics (page de listing unique) | ⭐⭐ |
| /tech-mastry/best-practices | page.tsx + 6 sous-pages | PracticesList, PracticeHeader | ⭐⭐⭐ |
| /tech-mastry/best-practices/code-quality | page.tsx + composants | CodeQuality content | ⭐⭐⭐ |
| /tech-mastry/best-practices/communication | page.tsx + composants | Communication practices | ⭐⭐⭐ |
| /tech-mastry/best-practices/design-patterns | page.tsx + composants | DesignPatterns content | ⭐⭐⭐ |
| /tech-mastry/best-practices/negotiation | page.tsx + composants | Negotiation content | ⭐⭐⭐ |
| /tech-mastry/best-practices/problem-solving | page.tsx + composants | ProblemSolving content | ⭐⭐⭐ |
| /tech-mastry/best-practices/system-design | page.tsx + composants | SystemDesign practices | ⭐⭐⭐ |
| /tech-mastry/challenges | page.tsx | AdvancedCodingChallenges | ⭐⭐ |
| /tech-mastry/coding-challenges | page.tsx + 6 sous-pages | ChallengesHero, TopicsList | ⭐⭐⭐ |
| /tech-mastry/collaboration | page.tsx | Réutilise CollaborativeCoding du playground | ⭐⭐ |
| /tech-mastry/dashboard | page.tsx + 5 composants | ProgressDashboard (721 lignes, MOCK DATA) | ⭐⭐ |
| /tech-mastry/interview-simulation | page.tsx | InterviewSimulator (MOCK) | ⭐⭐ |
| /tech-mastry/playground | page.tsx + 31 fichiers | Monaco editor, AI assistant, collaborative coding | ⭐⭐⭐ |
| /tech-mastry/preparation | page.tsx + 1 composant | PreparationGuide | ⭐⭐ |
| /tech-mastry/qa | page.tsx | QAGuide | ⭐⭐ |

### ❌ Routes RÉFÉRENCÉES mais INEXISTANTES (404)

| Route cassée | Référencée dans | Description attendue |
|--------------|----------------|---------------------|
| /tech-mastry/architecture | practice-sections.tsx L159 | Clean Architecture, SOLID, DDD, patterns de conception |
| /tech-mastry/security-devops | practice-sections.tsx L168 | Sécurité applicative, CI/CD, Cloud Native, DevSecOps |
| /tech-mastry/career | practice-sections.tsx L177 | Négociation salariale, progression de carrière |
| /tech-mastry/resources | practice-sections.tsx L186 | Livres, cours, ressources recommandées |

### ⚠️ Routes dans search-index.ts sans pages correspondantes

| Route référencée | Existe ? |
|-----------------|----------|
| /tech-mastry/system-design/case-studies | ❌ Lien dans search-index.ts L186, DesignTopics L62 |
| /tech-mastry/system-design/security | ❌ Lien dans DesignTopics L43 |
| /tech-mastry/system-design/monitoring | ❌ Lien dans DesignTopics L50 |
| /tech-mastry/backend/api-design | ❌ Lien dans search-index.ts L323 |
| /tech-mastry/backend/databases | ❌ Lien dans search-index.ts L346 |
| /tech-mastry/backend/security | ❌ Lien dans search-index.ts L369 |
| /tech-mastry/architecture/clean-architecture | ❌ Lien dans search-index.ts L395 |
| /tech-mastry/architecture/design-patterns | ❌ Lien dans search-index.ts L419 |
| /tech-mastry/architecture/solid | ❌ Lien dans search-index.ts L446 |
| /tech-mastry/architecture/ddd | ❌ Lien dans search-index.ts L467 |
| /tech-mastry/preparation/mock-interviews | ❌ Lien dans search-index.ts L543 |
| /tech-mastry/preparation/stress-management | ❌ Lien dans search-index.ts L567 |
| /tech-mastry/career/salary-negotiation | ❌ Lien dans search-index.ts L591 |
| /tech-mastry/career/progression | ❌ Lien dans search-index.ts L613 |

---

## 3. Routes cassées — Corrections urgentes

### Priorité CRITIQUE — 4 sections principales manquantes

Ces sections sont affichées sur la page d'accueil de Tech-Mastry (practice-sections.tsx) mais mènent à des 404 :

#### 3.1 /tech-mastry/architecture (MANQUANTE)

**Ce qu'il faut créer :**
`
tech-mastry/architecture/
├── page.tsx                    — ArchitectureHero + ArchitectureTopics
├── _components/
│   ├── hero.tsx
│   └── architecture-topics.tsx
├── clean-architecture/
│   ├── page.tsx
│   └── _components/
│       ├── layers-diagram.tsx  — Visualisation interactive des couches
│       ├── dependency-rule.tsx — Règle de dépendance illustrée
│       └── code-examples.tsx   — Exemples concrets
├── design-patterns/
│   ├── page.tsx
│   └── _components/
│       ├── patterns-catalog.tsx — Catalogue interactif (Creational, Structural, Behavioral)
│       ├── pattern-detail.tsx   — Diagramme UML + code
│       └── use-cases.tsx
├── solid/
│   ├── page.tsx
│   └── _components/
│       ├── solid-explorer.tsx   — Chaque principe avec avant/après interactif
│       └── quiz.tsx
└── ddd/
    ├── page.tsx
    └── _components/
        ├── ddd-concepts.tsx     — Bounded Context, Aggregate, Entity, Value Object
        ├── strategic-design.tsx  — Context Map visualisation
        └── tactical-patterns.tsx
`

#### 3.2 /tech-mastry/security-devops (MANQUANTE)

**Ce qu'il faut créer :**
`
tech-mastry/security-devops/
├── page.tsx                    — SecurityDevopsHero + SecurityTopics
├── _components/
│   ├── hero.tsx
│   └── security-topics.tsx
├── owasp-top-10/
│   ├── page.tsx
│   └── _components/
│       ├── vulnerability-explorer.tsx — Les 10 vulnérabilités avec exemples de code
│       ├── attack-demo.tsx            — Démo interactive (XSS, SQLi, CSRF)
│       └── fix-examples.tsx
├── cicd/
│   ├── page.tsx
│   └── _components/
│       ├── pipeline-builder.tsx    — Visualisation de pipeline CI/CD
│       ├── github-actions.tsx      — Exemples GitHub Actions
│       └── deployment-strategies.tsx — Blue/Green, Canary, Rolling
├── docker-kubernetes/
│   ├── page.tsx
│   └── _components/
│       ├── container-concepts.tsx
│       ├── k8s-architecture.tsx
│       └── orchestration-demo.tsx
└── cloud-native/
    ├── page.tsx
    └── _components/
        ├── twelve-factor.tsx
        ├── serverless.tsx
        └── cloud-providers.tsx
`

#### 3.3 /tech-mastry/career (MANQUANTE)

**Ce qu'il faut créer :**
`
tech-mastry/career/
├── page.tsx                   — CareerHero + CareerTopics
├── _components/
│   ├── hero.tsx
│   └── career-topics.tsx
├── salary-negotiation/
│   ├── page.tsx
│   └── _components/
│       ├── negotiation-strategies.tsx  — Techniques de négociation
│       ├── market-research.tsx         — Comment rechercher les salaires de marché
│       ├── practice-scenarios.tsx      — Mises en situation interactives
│       └── counter-offer.tsx
├── progression/
│   ├── page.tsx
│   └── _components/
│       ├── career-ladder.tsx           — Junior → Senior → Staff → Principal
│       ├── skills-matrix.tsx           — Matrice de compétences par niveau
│       ├── ic-vs-management.tsx        — IC track vs Management track
│       └── personal-branding.tsx
└── interview-tips/
    ├── page.tsx
    └── _components/
        ├── behavioral-questions.tsx    — Questions STAR method
        ├── technical-presentation.tsx   — Comment présenter un projet technique
        └── company-research.tsx
`

#### 3.4 /tech-mastry/resources (MANQUANTE)

**Ce qu'il faut créer :**
`
tech-mastry/resources/
├── page.tsx                   — ResourcesHero + ResourcesList
├── _components/
│   ├── hero.tsx
│   ├── resource-card.tsx
│   └── resources-by-category.tsx
└── (données intégrées)
    - Livres recommandés (CTCI, System Design Interview, Clean Code, DDD, etc.)
    - Cours en ligne (avec liens)
    - Chaînes YouTube
    - Podcasts
    - Sites de pratique (LeetCode, HackerRank, etc.)
    - Communautés
`

### Priorité HAUTE — Sous-routes dans search-index et DesignTopics manquantes

| Route à créer | Effort | Contenu |
|---------------|--------|---------|
| system-design/case-studies | M | Études de cas réelles (Netflix, Twitter, Uber) |
| system-design/security | M | Auth, encryption, OWASP dans le system design |
| system-design/monitoring | M | Observabilité, alerting, SLO/SLI/SLA |
| ackend/api-design | M | REST, GraphQL, gRPC, WebSocket, API versioning |
| ackend/databases | M | SQL, NoSQL, indexing, query optimization |
| ackend/security | M | Auth, JWT, OAuth, rate limiting, input validation |
| preparation/mock-interviews | L | Simulateur d'entretien avec timer et feedback |
| preparation/stress-management | S | Techniques de gestion du stress, breathing exercises |

---

## 4. Évaluation qualitative par section

### 🔴 Sections nécessitant une refonte profonde

#### Dashboard (⭐⭐)
- **Problème** : Entièrement basé sur des MOCK DATA hardcodées (721 lignes)
- **Aucun** backend réel, aucune persistance
- **Fix requis** :
  - Option A (rapide) : Utiliser localStorage pour la progression
  - Option B (complet) : Modèle Prisma UserProgress, Server Actions pour tracking
  - Les composants SkillRadarChart, StreakCalendar, LearningPathCard, RecentActivities sont bien faits mais alimentés par des faux chiffres

#### Backend section (⭐⭐)
- **Problème** : Une seule page avec un simple listing de topics
- **Aucune** sous-page de contenu détaillé
- **Fix requis** : Créer des sous-pages (api-design, databases, security, authentication, caching, testing) avec du contenu interactif comparable au frontend

#### Interview Simulation (⭐⭐)
- **Problème** : Simulateur avec UI fonctionnelle mais logique entièrement mockée
- **Pas de** vrai moteur de questions, pas de scoring réel, pas de feedback IA
- **Fix requis** : Banque de questions structurée, scoring algorithmique, feedback contextuel

#### Preparation (⭐⭐)
- **Problème** : Un seul composant PreparationGuide assez basique
- **Manque** les sous-pages mock-interviews et stress-management promises dans le search-index
- **Fix requis** : Enrichir avec plan de préparation personnalisé, timeline, checklists

#### QA (⭐⭐)
- **Problème** : Page de Q&A assez simple
- **Fix requis** : Quiz interactifs avec scoring, catégorisation par difficulté, progression

#### Challenges (⭐⭐)
- **Problème** : Page d'exercices avancés mais sans éditeur intégré
- **Fix requis** : Rediriger vers le playground avec pré-chargement du challenge, ou intégrer un éditeur léger

#### Collaboration (⭐⭐)
- **Problème** : Réutilise CollaborativeCoding du playground, mais sans backend WebSocket réel
- **Fix requis** : Soit le supprimer, soit implémenter un vrai backend collab (Socket.io/WebSocket)

### 🟡 Sections correctes mais améliorables

#### Algorithms (⭐⭐⭐-⭐⭐⭐⭐)
- **Point fort** : Visualisations interactives (sorting, searching, complexity)
- **Amélioration** : Ajouter plus d'algorithmes (graphes, greedy), exercices intégrés avec validation
- **Manque** : Lien vers le playground pour s'exercer sur chaque algorithme

#### Data Structures (⭐⭐⭐)
- **Point fort** : Visualisations pour arrays, lists, trees
- **Amélioration** : Manque hash maps, graphs, heaps, stacks, queues
- **Manque** : Exercices pratiques, complexité pour chaque opération

#### System Design (⭐⭐⭐-⭐⭐⭐⭐)
- **Point fort** : Excellentes visualisations (distributed, scalability, storage)
- **Amélioration** : Ajouter case-studies, security, monitoring (routes dans DesignTopics mais pages manquantes)
- **Manque** : Exercice de conception système guidé (whiteboard interactif)

#### Frontend (⭐⭐⭐-⭐⭐⭐⭐)
- **Point fort** : Bonne couverture (React, state, perf, accessibility, patterns)
- **Amélioration** : Ajouter CSS avancé, testing frontend, Next.js patterns
- **Manque** : Exercices interactifs (sandbox code pour tester les patterns)

#### Coding Challenges (⭐⭐⭐)
- **Point fort** : 6 catégories (arrays, dp, graphs, strings, system-design, trees)
- **Amélioration** : Intégration avec le playground pour exécution de code
- **Manque** : Difficulté graduelle, hints progressifs, solutions expliquées

#### Best Practices (⭐⭐⭐)
- **Point fort** : Bonne couverture (code quality, communication, design patterns, negotiation, problem-solving)
- **Amélioration** : Plus d'exemples concrets, exercices situationnels
- **Manque** : Liens croisés avec d'autres sections

### 🟢 Sections de bonne qualité

#### Playground (⭐⭐⭐-⭐⭐⭐⭐)
- **Point fort** : 31 fichiers, Monaco editor, multi-langage, thèmes, format animation
- **Composants avancés** : AI assistant wrapper, interview mode, file explorer, HTML preview
- **Amélioration** : Vérifier que l'AI assistant est connecté (probablement mock), s'assurer que l'exécution de code fonctionne (sandboxée ?)
- **L'asset le plus précieux** de la section, à connecter avec les exercices des autres sections

---

## 5. Plan d'implémentation par priorité

### Phase 1 — Critique (Semaine 1-2) : Éliminer les 404s

| Tâche | Effort | Description |
|-------|--------|-------------|
| P1.1 | L | Créer /tech-mastry/architecture + 4 sous-pages (clean-architecture, design-patterns, solid, ddd) |
| P1.2 | L | Créer /tech-mastry/security-devops + 4 sous-pages (owasp, cicd, docker-k8s, cloud-native) |
| P1.3 | M | Créer /tech-mastry/career + 3 sous-pages (salary-negotiation, progression, interview-tips) |
| P1.4 | S | Créer /tech-mastry/resources (page unique avec données intégrées) |
| P1.5 | M | Créer les 3 sous-pages manquantes de system-design (case-studies, security, monitoring) |
| P1.6 | M | Créer les 3 sous-pages manquantes de backend (api-design, databases, security) |
| P1.7 | S | Créer les 2 sous-pages manquantes de preparation (mock-interviews, stress-management) |
| P1.8 | S | Mettre à jour search-index.ts pour synchroniser avec les nouvelles routes |

### Phase 2 — Haute priorité (Semaine 3-4) : Améliorer les sections faibles

| Tâche | Effort | Description |
|-------|--------|-------------|
| P2.1 | L | Refonte du backend — créer du contenu riche comparable au frontend (5+ sous-pages) |
| P2.2 | M | Data Structures — ajouter hash maps, graphs, heaps, stacks, queues |
| P2.3 | L | Dashboard — implémenter la persistance (localStorage ou Prisma) |
| P2.4 | M | Coding Challenges — intégrer avec le playground (pré-charger le challenge dans l'éditeur) |
| P2.5 | M | QA — transformer en quiz interactif avec scoring et progression |
| P2.6 | S | Preparation — enrichir avec timeline, checklists, plan personnalisé |

### Phase 3 — Amélioration (Semaine 5-6) : Contenu avancé

| Tâche | Effort | Description |
|-------|--------|-------------|
| P3.1 | L | Algorithms — ajouter graphes, greedy, backtracking avec visualisations |
| P3.2 | M | Frontend — ajouter CSS avancé, testing frontend, Next.js patterns |
| P3.3 | M | System Design — whiteboard interactif pour exercice de conception |
| P3.4 | L | Interview Simulation — banque de questions réelle, scoring algorithmique |
| P3.5 | M | Best Practices — exercices situationnels, liens croisés |
| P3.6 | S | Challenges — difficulté graduelle, hints progressifs, solutions expliquées |

### Phase 4 — Polish (Semaine 7-8) : Cohérence et UX

| Tâche | Effort | Description |
|-------|--------|-------------|
| P4.1 | L | Harmoniser la navigation — TopicsNav et PracticeSections doivent pointer vers les mêmes routes |
| P4.2 | M | Playground — vérifier/connecter l'AI assistant, s'assurer de l'exécution sandboxée |
| P4.3 | M | Collaboration — implémenter un vrai backend ou supprimer la section |
| P4.4 | S | Performance — lazy loading des visualisations lourdes, code splitting |
| P4.5 | M | i18n — toutes les pages en fr/en/es via intlayer |
| P4.6 | S | SEO — metadata, OG images, sitemap pour chaque sous-page |
| P4.7 | S | Responsive — vérifier toutes les pages sur mobile |
| P4.8 | M | Tests — tests e2e pour les parcours principaux |

---

## 6. Détails techniques par section

### 6.1 Architecture (P1.1) — NOUVELLE SECTION

**Objectif** : Pages riches avec visualisations interactives, pas juste du texte.

**Clean Architecture page** :
- Diagramme interactif des couches (Entities → Use Cases → Interface Adapters → Frameworks)
- Click sur chaque couche pour voir les détails et exemples de code
- Règle de dépendance illustrée avec des flèches animées
- Exemple complet : Todo App en Clean Architecture (côte à côte monolith vs clean)

**Design Patterns page** :
- Catalogue en 3 catégories : Creational, Structural, Behavioral
- Chaque pattern : diagramme UML SVG + code TypeScript + cas d'usage réel
- Patterns à couvrir : Singleton, Factory, Builder, Observer, Strategy, Command, Adapter, Decorator, Proxy, Composite, State, Template Method
- Filtrage par catégorie, recherche

**SOLID page** :
- Pour chaque principe : code "avant" (violation) et "après" (respecté) side-by-side
- Exemples en TypeScript avec des services réalistes
- Mini-quiz à la fin de chaque principe

**DDD page** :
- Concepts visuels : Bounded Context (diagramme), Aggregate (arbre), Entity vs Value Object
- Context Mapping interactif
- Exemple : modéliser un e-commerce avec Bounded Contexts

### 6.2 Security & DevOps (P1.2) — NOUVELLE SECTION

**OWASP Top 10 page** :
- Les 10 vulnérabilités avec code vulnérable vs code sécurisé
- Démonstration visuelle de XSS, SQL Injection (sandbox sécurisé)
- Checklist de sécurité téléchargeable

**CI/CD page** :
- Visualisation d'un pipeline (commit → test → build → deploy)
- Exemples concrets : GitHub Actions YAML, workflow de release
- Stratégies de déploiement avec diagrammes animés (Blue/Green, Canary)

**Docker & Kubernetes page** :
- Concepts clés illustrés (container vs VM, pods, services, deployments)
- Dockerfile best practices
- Architecture K8s animée

**Cloud Native page** :
- 12 Factor App checklist
- Serverless concepts + quand utiliser
- Comparaison cloud providers (architecture, pas prix)

### 6.3 Career (P1.3) — NOUVELLE SECTION

**Salary Negotiation page** :
- Framework de négociation en 5 étapes
- Scripts de négociation avec variantes
- Comment rechercher les salaires de marché (outils, sites)
- Exercices de mise en situation (scénarios interactifs)

**Career Progression page** :
- Échelle de carrière interactive : Junior → Mid → Senior → Staff → Principal
- Matrice de compétences attendues par niveau
- IC track vs Management track — aide à la décision
- Tips pour le personal branding (portfolio, blog, open source)

**Interview Tips page** :
- Méthode STAR pour les questions comportementales (avec générateur)
- Comment présenter un projet technique (structure, timing)
- Red flags et green flags par type d'entreprise
- Checklist pré-entretien

### 6.4 Resources (P1.4) — NOUVELLE SECTION

**Page unique avec données structurées** :
- Catégories : Livres / Cours / YouTube / Podcasts / Pratique / Communautés
- Chaque ressource : titre, auteur, description, niveau (débutant/intermédiaire/avancé), lien
- Filtrage par catégorie et niveau
- Section "Path recommandé" selon le profil (frontend, backend, fullstack, system design)

**Livres essentiels à lister** :
- Cracking the Coding Interview
- System Design Interview (Alex Xu)
- Clean Code / Clean Architecture (Robert C. Martin)
- Designing Data-Intensive Applications (Martin Kleppmann)
- Head First Design Patterns
- Domain-Driven Design (Eric Evans)
- The Pragmatic Programmer
- Refactoring (Martin Fowler)

### 6.5 Backend enrichi (P2.1) — REFONTE

**Sous-pages à créer :**

| Sous-page | Contenu |
|-----------|---------|
| pi-design | REST (conventions, status codes, versioning), GraphQL (schema, resolvers, subscriptions), gRPC (protobuf, streaming), WebSocket |
| databases | SQL (joins, indexes, transactions, normalization), NoSQL (MongoDB, Redis, DynamoDB), query optimization, connection pooling |
| security | Auth (JWT, OAuth2, session), input validation, rate limiting, CORS, HTTPS, secrets management |
| uthentication | Flows détaillés : login/register, social auth, MFA, token refresh, session management |
| caching | Cache strategies (write-through, write-back, cache-aside), Redis patterns, CDN, browser cache |
| 	esting | Unit tests, integration tests, API testing (Postman/MSW), load testing, contract testing |

### 6.6 Dashboard fonctionnel (P2.3) — REFONTE

**Option recommandée : localStorage d'abord, Prisma plus tard**

`	ypescript
// Modèle de progression localStorage
interface UserProgress {
  challengesCompleted: string[];     // IDs des challenges terminés
  quizScores: Record<string, number>; // Quiz ID → score
  visitedPages: string[];             // Routes visitées
  streakDates: string[];              // Dates de connexion (YYYY-MM-DD)
  timeSpent: Record<string, number>;  // Route → minutes
  lastVisit: string;                  // ISO date
}
`

**Actions à implémenter :**
- Hook useProgress() qui lit/écrit dans localStorage
- Tracking automatique des pages visitées via le layout
- Tracking des challenges/quizs complétés via des callbacks
- Calcul du streak à partir des dates de connexion
- Radar chart calculé à partir des quiz scores par catégorie

---

## 7. Chantiers transversaux

### 7.1 Cohérence de la navigation

**Problème actuel** : TopicsNav (sidebar) et PracticeSections (cards) ont des routes différentes et des structures inconsistantes.

**Solution** :
- Créer un fichier centralisé _utils/routes.ts avec toutes les routes
- TopicsNav et PracticeSections consomment la même source de vérité
- Chaque section a un icon, 	itle, description, href, subItems[]
- Automatiser la génération du search-index à partir de routes.ts

### 7.2 Pattern de page standard

**Chaque sous-page doit suivre ce pattern** :
`	sx
// page.tsx
import { Metadata } from "next";
import { SectionContent } from "./_components/section-content";

export const metadata: Metadata = {
  title: "[Title] | Tech-Mastry",
  description: "[Description]",
};

export default function SectionPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <SectionHero />
      <SectionContent />
    </main>
  );
}
`

**Chaque SectionContent doit inclure** :
1. Introduction/concept expliqué
2. Visualisation ou diagramme interactif
3. Exemples de code
4. Exercice pratique ou quiz
5. Lien vers le playground (si applicable)
6. Ressources complémentaires

### 7.3 Système de quiz unifié

Créer un composant réutilisable Quiz :
`	sx
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

// Composant: <Quiz questions={questions} onComplete={handleComplete} />
`

Utilisable dans toutes les sections pour validation des connaissances.

### 7.4 Système d'exercices intégrés

Créer un composant CodeExercise :
`	sx
interface CodeExercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  difficulty: "easy" | "medium" | "hard";
}

// Composant: <CodeExercise exercise={exercise} />
// Avec éditeur inline (Monaco), exécution, validation des tests
`

### 7.5 i18n

Toutes les nouvelles pages en français par défaut (comme l'existant), avec préparation pour intlayer :
- Strings dans des constantes exportées
- Pas de texte hardcodé dans le JSX
- Prêt pour wrapping intlayer ultérieur

---

## 8. Estimation et planification

### Légende des efforts

| Taille | Heures estimées | Description |
|--------|-----------------|-------------|
| S | 2-4h | Page simple, composants basiques |
| M | 4-8h | Page avec visualisations, quelques composants |
| L | 8-16h | Section complète avec sous-pages et interactions |
| XL | 16-32h | Refonte majeure avec backend |

### Résumé par phase

| Phase | Tâches | Effort total | Priorité |
|-------|--------|--------------|----------|
| Phase 1 — Corriger les 404s | 8 tâches | ~60-80h | CRITIQUE |
| Phase 2 — Améliorer les sections faibles | 6 tâches | ~50-70h | HAUTE |
| Phase 3 — Contenu avancé | 6 tâches | ~50-60h | MOYENNE |
| Phase 4 — Polish et cohérence | 8 tâches | ~40-60h | BASSE |
| **Total** | **28 tâches** | **~200-270h** | |

### Ordre d'exécution recommandé

1. **P1.4** Resources (S) — Quick win, page simple
2. **P1.1** Architecture (L) — Section très attendue, haute valeur
3. **P1.6** Backend sous-pages (M) — Comble un vide important
4. **P1.5** System-design sous-pages manquantes (M)
5. **P1.3** Career (M) — Différenciant fort
6. **P1.2** Security-DevOps (L) — Contenu riche nécessaire
7. **P1.7** Preparation sous-pages (S)
8. **P1.8** Sync search-index
9. **P4.1** Harmoniser navigation (L)
10. **P2.3** Dashboard fonctionnel (L)
11. Continue Phase 2 → Phase 3 → Phase 4

---

> **Ce document est la source de vérité pour l'implémentation de Tech-Mastry.**
> Mis à jour le 2026-02-13.
> Prochaine action : Phase 1.4 (Resources) puis Phase 1.1 (Architecture).
