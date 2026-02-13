# Architecture Multi-Agents — Implémentation Plan de Traduction

_Système de coordination pour l'implémentation parallélisée du plan de traduction Blog & CV_
_Version : 1.0 — Date : 2026-02-13_

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture des agents](#2-architecture-des-agents)
3. [Agent Lead — Superviseur](#3-agent-lead--superviseur)
4. [Équipe Content Creation](#4-équipe-content-creation)
5. [Équipe Blog Migration](#5-équipe-blog-migration)
6. [Équipe CV Migration](#6-équipe-cv-migration)
7. [Agent QA — Validation](#7-agent-qa--validation)
8. [Workflow de coordination](#8-workflow-de-coordination)
9. [Mécanisme de synchronisation](#9-mécanisme-de-synchronisation)
10. [Gestion des conflits](#10-gestion-des-conflits)

---

## 1. Vue d'ensemble

### Objectif
Implémenter le plan de traduction complet (BLOG_CV_TRANSLATION_PLAN.md) via une architecture multi-agents avec parallélisation maximale et coordination rigoureuse.

### Contraintes techniques
- **Pas de conflits Git** : Chaque agent travaille sur des fichiers distincts
- **Dépendances respectées** : Les migrations de composants ne commencent qu'après création des fichiers `.content.ts`
- **Validation continue** : TypeScript check après chaque batch d'agents
- **Cohérence i18n** : Tous les agents suivent le pattern intlayer standard

### Métriques de performance

| Métrique | Approche séquentielle | Approche multi-agents | Gain |
|---|---|---|---|
| Temps total | ~13h | ~4.5h | **65% réduction** |
| Parallelism factor | 1x | 3-4x | — |
| Risque de conflits | Faible | Moyen (mitigé) | — |

---

## 2. Architecture des agents

### Hiérarchie

```
┌─────────────────────────────────────────────────────┐
│         AGENT LEAD (Superviseur)                    │
│  - Orchestration globale                            │
│  - Synchronisation des phases                        │
│  - Résolution de conflits                           │
└─────────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
   ┌────▼───┐  ┌────▼───┐  ┌─────▼────┐  ┌─────▼────┐
   │Content │  │ Blog   │  │   CV     │  │    QA    │
   │Creation│  │Migration│  │Migration │  │Validation│
   │ Team   │  │  Team  │  │   Team   │  │          │
   └────┬───┘  └────┬───┘  └─────┬────┘  └─────┬────┘
        │           │            │              │
   ┌────┴────┐ ┌───┴────┐  ┌────┴────┐    ┌────┴────┐
   │7 agents │ │7 agents│  │3 agents │    │1 agent  │
   │parallèles│ │parallèles│ │séquence│    │continu  │
   └─────────┘ └────────┘  └─────────┘    └─────────┘
```

### Distribution des agents

| Équipe | Nombre d'agents | Mode | Durée estimée |
|---|---|---|---|
| **Content Creation** | 7 | Parallèle | ~1h (simultané) |
| **Blog Migration** | 7 | Parallèle | ~1.5h (simultané) |
| **CV Migration** | 3 | Séquentiel | ~2h (séquence) |
| **QA Validation** | 1 | Continu | ~1h (final) |
| **TOTAL** | 18 agents | Mixte | ~4.5h |

---

## 3. Agent Lead — Superviseur

### Responsabilités

#### 1. Orchestration des phases
```typescript
interface PhaseOrchestration {
  currentPhase: "PREP" | "CONTENT" | "BLOG" | "CV" | "QA" | "COMPLETE";
  nextPhase: () => void;
  canProceed: () => boolean;
  blockers: string[];
}
```

#### 2. État global du système
```typescript
interface GlobalState {
  contentFilesCreated: Record<string, boolean>; // 7 fichiers
  blogComponentsMigrated: Record<string, boolean>; // 7 composants
  cvMigrationStatus: {
    uiDone: boolean;
    dataDone: boolean;
    integrationDone: boolean;
  };
  qaChecks: {
    typescript: boolean;
    build: boolean;
    visual: boolean;
  };
}
```

#### 3. Synchronisation inter-équipes
- **Point de sync #1** : Après Content Creation → Avant Blog Migration
- **Point de sync #2** : Après Blog Migration → Avant CV Migration (optionnel)
- **Point de sync #3** : Après CV Migration → Avant QA finale

#### 4. Gestion des erreurs
```typescript
interface ErrorHandler {
  agentId: string;
  error: Error;
  retryStrategy: "immediate" | "wait" | "escalate";
  maxRetries: number;
}
```

### Décisions clés

| Situation | Décision |
|---|---|
| Agent bloqué | Réassigner la tâche à un agent libre |
| Conflit Git détecté | Bloquer les agents concernés, résoudre, relancer |
| TypeScript error | Arrêter la phase en cours, notifier les agents |
| Phase complète | Valider l'état global, déclencher la phase suivante |

---

## 4. Équipe Content Creation

### Composition : 7 agents parallèles

| Agent | Fichier cible | Dépendances | Durée |
|---|---|---|---|
| **Content-1** | `content/blog-page.content.ts` | Aucune | 10 min |
| **Content-2** | `content/blog-card.content.ts` | Aucune | 10 min |
| **Content-3** | `content/blog-stats.content.ts` | Aucune | 10 min |
| **Content-4** | `content/blog-social.content.ts` | Aucune | 15 min |
| **Content-5** | `content/blog-post.content.ts` | Aucune | 10 min |
| **Content-6** | `content/cv-page.content.ts` | Aucune | 15 min |
| **Content-7** | `content/cv-data.content.ts` | Aucune | 60 min |

### Workflow de chaque agent

```typescript
async function contentCreationAgent(agentId: string, targetFile: string) {
  // 1. Créer le fichier avec le template du plan
  await createFile(targetFile, getTemplateFromPlan(targetFile));
  
  // 2. Auto-validation : vérifier la syntaxe TypeScript
  const typeCheckResult = await runTypeCheck(targetFile);
  if (!typeCheckResult.success) {
    throw new Error(`[${agentId}] TypeScript error in ${targetFile}`);
  }
  
  // 3. Notifier le Lead
  await notifyLead({
    agentId,
    status: "COMPLETE",
    file: targetFile,
    duration: performance.now() - startTime,
  });
}
```

### Critères de validation
- ✅ Fichier créé dans `content/`
- ✅ Import `{ t, type Dictionary }` correct
- ✅ Structure `satisfies Dictionary` valide
- ✅ Toutes les clés FR/EN/ES présentes
- ✅ `npx tsc --noEmit` passe

### Notification au Lead
```typescript
interface ContentCreationReport {
  filesCreated: 7;
  typeErrors: 0;
  totalDuration: "~60 min";
  readyForNextPhase: true;
}
```

---

## 5. Équipe Blog Migration

### Composition : 7 agents parallèles

> **Dépendance** : Cette équipe ne démarre QUE si tous les fichiers `.content.ts` blog sont créés.

| Agent | Composant cible | Dict utilisé | Durée |
|---|---|---|---|
| **Blog-1** | `blog/page.client.tsx` | `blog-page` | 15 min |
| **Blog-2** | `blog-post-card.tsx` | `blog-card` | 15 min |
| **Blog-3** | `article-stats.tsx` | `blog-stats` | 15 min |
| **Blog-4** | `social-interactions-client.tsx` | `blog-social` | 20 min |
| **Blog-5** | `similar-articles.tsx` + `popular-articles.tsx` | `blog-post` | 20 min |
| **Blog-6** | `reading-progress.tsx` | `blog-stats` | 10 min |
| **Blog-7** | `category-filter.tsx` + `blog/[slug]/page.tsx` | `blog-page`, `blog-post` | 20 min |

### Workflow de chaque agent

```typescript
async function blogMigrationAgent(
  agentId: string,
  componentPath: string,
  dictKey: string
) {
  // 1. Lire le composant actuel
  const currentCode = await readFile(componentPath);
  
  // 2. Identifier les chaînes hardcodées à remplacer
  const hardcodedStrings = extractHardcodedStrings(currentCode);
  
  // 3. Ajouter l'import useIntlayer
  const withImport = addIntlayerImport(currentCode, dictKey);
  
  // 4. Remplacer inline strings par dictionnaire
  const migrated = replaceWithDictionary(withImport, hardcodedStrings, dictKey);
  
  // 5. Écrire le fichier
  await writeFile(componentPath, migrated);
  
  // 6. Auto-validation TypeScript
  const typeCheck = await runTypeCheck(componentPath);
  if (!typeCheck.success) {
    await rollback(componentPath, currentCode);
    throw new Error(`[${agentId}] Migration failed for ${componentPath}`);
  }
  
  // 7. Notifier le Lead
  await notifyLead({
    agentId,
    status: "COMPLETE",
    component: componentPath,
    stringsReplaced: hardcodedStrings.length,
  });
}
```

### Stratégie de migration

#### Pattern de remplacement
```typescript
// AVANT (inline)
const title = locale === "fr" ? "Blog Technique" : "Technical Blog";

// APRÈS (useIntlayer)
const { title } = useIntlayer("blog-page");
```

#### Gestion des imports
```typescript
// Ajouter en haut du fichier
import { useIntlayer } from "next-intlayer";

// Dans le composant
const content = useIntlayer("blog-page");
```

### Critères de validation
- ✅ Import `useIntlayer` ajouté
- ✅ Toutes les chaînes inline remplacées
- ✅ `useIntlayer("dict-key")` appelé correctement
- ✅ Pas de chaînes hardcodées restantes (sauf tech terms)
- ✅ `npx tsc --noEmit` passe

---

## 6. Équipe CV Migration

### Composition : 3 agents séquentiels

> **Dépendance** : Cette équipe démarre après création de `cv-page.content.ts` et `cv-data.content.ts`.

| Agent | Tâche | Dépendances | Durée |
|---|---|---|---|
| **CV-UI** | Migrer `me/page.tsx` UI strings | `cv-page.content.ts` | 30 min |
| **CV-Data** | Restructurer `me/data/index.ts` | `cv-data.content.ts`, CV-UI | 90 min |
| **CV-Integration** | Intégrer données traduites dans `me/page.tsx` | CV-Data | 30 min |

### Workflow CV-UI

```typescript
async function cvUiAgent() {
  const componentPath = "app/[locale]/(main)/me/page.tsx";
  
  // 1. Remplacer chaînes UI hardcodées
  const uiStrings = [
    "Senior Software Engineer",
    "Professional Experience",
    "Education",
    // ... (15+ strings)
  ];
  
  // 2. Ajouter useIntlayer("cv-page")
  const migrated = replaceUiStrings(componentPath, "cv-page");
  
  // 3. Valider
  await runTypeCheck(componentPath);
  
  notifyLead({ agent: "CV-UI", status: "COMPLETE" });
}
```

### Workflow CV-Data (le plus complexe)

```typescript
async function cvDataAgent() {
  const dataPath = "app/[locale]/(main)/me/data/index.ts";
  
  // 1. Analyser la structure actuelle (560 lignes)
  const currentStructure = parseDataFile(dataPath);
  
  // 2. Mapper chaque champ textuel vers cv-data.content.ts
  const mapping = {
    "EXPERIENCE_ITEMS[0].title": "experiences.allianz.title",
    "EXPERIENCE_ITEMS[0].description[0]": "experiences.allianz.description.d1",
    // ... (300+ mappings)
  };
  
  // 3. Restructurer : exporter des fonctions qui acceptent le locale
  const restructured = `
    import { useIntlayer } from "next-intlayer/server";
    
    export function getExperienceItems(locale: string) {
      const content = useIntlayer("cv-data", { locale });
      return [
        {
          date: "2023 - " + content.experiences.present,
          title: content.experiences.allianz.title,
          // ...
        },
      ];
    }
  `;
  
  // 4. Écrire le fichier restructuré
  await writeFile(dataPath, restructured);
  
  // 5. Valider
  await runTypeCheck(dataPath);
  
  notifyLead({ agent: "CV-Data", status: "COMPLETE" });
}
```

### Workflow CV-Integration

```typescript
async function cvIntegrationAgent() {
  const pagePath = "app/[locale]/(main)/me/page.tsx";
  
  // 1. Modifier les imports
  const updated = `
    import { getExperienceItems, getEducationItems, ... } from "./data";
    
    export default async function ResumePage({ params }: Props) {
      const { locale } = await params;
      const experiences = getExperienceItems(locale);
      const education = getEducationItems(locale);
      // ...
    }
  `;
  
  // 2. Remplacer EXPERIENCE_ITEMS par experiences
  await replaceDataUsage(pagePath, updated);
  
  // 3. Valider
  await runTypeCheck(pagePath);
  
  notifyLead({ agent: "CV-Integration", status: "COMPLETE" });
}
```

### Critères de validation
- ✅ UI strings migrées vers `cv-page`
- ✅ `me/data/index.ts` restructuré avec fonctions locales
- ✅ `me/page.tsx` utilise les données localisées
- ✅ Tous les champs textuels traduits (FR/EN/ES)
- ✅ `npx tsc --noEmit` passe

---

## 7. Agent QA — Validation

### Responsabilité
Validation continue et finale de tout le système.

### Workflow

```typescript
async function qaAgent() {
  // VALIDATION CONTINUE (après chaque phase)
  
  // 1. TypeScript Check
  const tsCheck = await runCommand("npx tsc --noEmit");
  if (tsCheck.exitCode !== 0) {
    notifyLead({ 
      type: "ERROR", 
      phase: getCurrentPhase(), 
      errors: tsCheck.stderr 
    });
    throw new Error("TypeScript errors detected");
  }
  
  // 2. Build Check
  const buildCheck = await runCommand("pnpm build");
  if (buildCheck.exitCode !== 0) {
    notifyLead({ 
      type: "ERROR", 
      phase: "BUILD", 
      errors: buildCheck.stderr 
    });
    throw new Error("Build failed");
  }
  
  // VALIDATION FINALE
  
  // 3. Visual Tests (3 locales)
  for (const locale of ["fr", "en", "es"]) {
    await testVisual({
      locale,
      pages: ["/blog", "/blog/[slug]", "/me"],
      assertions: [
        "no hardcoded EN strings when locale=fr",
        "dates formatted correctly",
        "toast messages localized",
      ],
    });
  }
  
  // 4. Generate Report
  const report = {
    contentFilesCreated: 7,
    blogComponentsMigrated: 7,
    cvPageMigrated: true,
    cvDataRestructured: true,
    typeScriptErrors: 0,
    buildSuccess: true,
    visualTestsPassed: true,
    estimatedCoverage: "100% (180 strings)",
  };
  
  notifyLead({ type: "QA_COMPLETE", report });
}
```

### Critères de réussite
- ✅ 7 fichiers `.content.ts` créés
- ✅ 7 composants blog migrés
- ✅ CV UI + Data migrés et intégrés
- ✅ 0 erreurs TypeScript
- ✅ Build réussi (373+ pages)
- ✅ Tests visuels FR/EN/ES passent
- ✅ PDF CV multilingue fonctionne

---

## 8. Workflow de coordination

### Timeline détaillée

```
┌─────────────────────────────────────────────────────┐
│ T+0h    : PREP — Agent Lead initialise             │
│           - Crée les branches de travail            │
│           - Distribue les tâches aux agents         │
└─────────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────┐
│ T+0h    : PHASE 1 — Content Creation (7 agents ║)  │
│ T+1h    : ✅ Sync Point #1 — Tous fichiers créés   │
│           - QA valide TypeScript                    │
│           - Lead autorise Phase 2                   │
└─────────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────┐
│ T+1h    : PHASE 2 — Blog Migration (7 agents ║)    │
│ T+2.5h  : ✅ Sync Point #2 — Tous composants migrés│
│           - QA valide TypeScript + Build partiel    │
│           - Lead autorise Phase 3                   │
└─────────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────┐
│ T+2.5h  : PHASE 3 — CV Migration (3 agents →)      │
│           - CV-UI (30 min)                          │
│           - CV-Data (90 min) ⚠️ tâche lourde       │
│           - CV-Integration (30 min)                 │
│ T+4.5h  : ✅ Sync Point #3 — CV complet            │
└─────────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────┐
│ T+4.5h  : PHASE 4 — QA Finale                      │
│           - Build complet (373+ pages)              │
│           - Tests visuels FR/EN/ES                  │
│           - Validation PDF CV                       │
│ T+5.5h  : ✅ COMPLETE — Merge to main              │
└─────────────────────────────────────────────────────┘
```

### Points de synchronisation

#### Sync Point #1 : Post-Content Creation
```typescript
interface SyncPoint1 {
  condition: "all 7 .content.ts files created";
  validations: [
    "TypeScript check passes",
    "All translations present (FR/EN/ES)",
    "Dictionary keys match plan"
  ];
  nextPhase: "Blog Migration";
  blocker: "Any file creation failure";
}
```

#### Sync Point #2 : Post-Blog Migration
```typescript
interface SyncPoint2 {
  condition: "all 7 blog components migrated";
  validations: [
    "TypeScript check passes",
    "No hardcoded strings remain",
    "useIntlayer correctly imported"
  ];
  nextPhase: "CV Migration";
  blocker: "Any migration failure";
}
```

#### Sync Point #3 : Post-CV Migration
```typescript
interface SyncPoint3 {
  condition: "CV UI + Data + Integration complete";
  validations: [
    "TypeScript check passes",
    "me/page.tsx uses localized data",
    "me/data/index.ts restructured"
  ];
  nextPhase: "QA Finale";
  blocker: "Data restructure failure";
}
```

---

## 9. Mécanisme de synchronisation

### État partagé (Redis ou in-memory)

```typescript
interface SharedState {
  // Phase tracking
  currentPhase: Phase;
  startTime: number;
  
  // Agent status
  agents: Record<AgentId, AgentStatus>;
  
  // File locks (pour éviter conflits)
  fileLocks: Record<FilePath, AgentId | null>;
  
  // Completion tracking
  tasksCompleted: number;
  tasksTotal: number;
  
  // Error tracking
  errors: Array<{
    agentId: string;
    timestamp: number;
    error: string;
    resolved: boolean;
  }>;
}
```

### API de coordination

```typescript
class CoordinationAPI {
  // Agents appellent ceci avant de commencer
  async acquireFileLock(agentId: string, filePath: string): Promise<boolean> {
    if (this.state.fileLocks[filePath]) {
      return false; // File already locked
    }
    this.state.fileLocks[filePath] = agentId;
    return true;
  }
  
  // Agents appellent ceci après complétion
  async releaseFileLock(agentId: string, filePath: string): Promise<void> {
    this.state.fileLocks[filePath] = null;
    this.state.tasksCompleted++;
    
    // Check if phase complete
    if (this.isPhaseComplete()) {
      await this.triggerSyncPoint();
    }
  }
  
  // Lead appelle ceci pour démarrer la phase suivante
  async startPhase(phase: Phase): Promise<void> {
    this.state.currentPhase = phase;
    this.state.tasksCompleted = 0;
    this.state.tasksTotal = this.getTaskCountForPhase(phase);
    
    // Spawn agents for this phase
    await this.spawnAgentsForPhase(phase);
  }
  
  // QA Agent appelle ceci en continu
  async runValidation(): Promise<ValidationResult> {
    const tsCheck = await this.runTypeScript();
    if (!tsCheck.success) {
      await this.notifyAllAgents("PAUSE");
      return { success: false, errors: tsCheck.errors };
    }
    return { success: true };
  }
}
```

---

## 10. Gestion des conflits

### Types de conflits potentiels

#### 1. Conflits de fichiers (Git)
**Probabilité** : Très faible (agents travaillent sur fichiers distincts)
**Mitigation** : File locks dans SharedState

```typescript
// Exemple : 2 agents tentent de modifier le même fichier
Agent Blog-4: acquireFileLock("social-interactions-client.tsx") → ✅ SUCCESS
Agent Blog-5: acquireFileLock("social-interactions-client.tsx") → ❌ LOCKED
// Agent Blog-5 attend ou est réassigné à une autre tâche
```

#### 2. Conflits de dépendances
**Probabilité** : Moyenne (si un agent démarre trop tôt)
**Mitigation** : Sync Points obligatoires

```typescript
// Exemple : Blog Migration démarre avant Content Creation
if (!allContentFilesCreated()) {
  throw new Error("Cannot start Blog Migration: dependencies not met");
}
```

#### 3. Conflits TypeScript
**Probabilité** : Moyenne (erreurs de syntaxe dans migrations)
**Mitigation** : Auto-validation + rollback

```typescript
// Chaque agent valide son travail
const result = await runTypeCheck(modifiedFile);
if (!result.success) {
  await rollback(modifiedFile);
  notifyLead({ error: result.errors });
}
```

### Stratégie de résolution

| Conflit | Détection | Résolution | Responsable |
|---|---|---|---|
| File lock | SharedState | Wait or reassign | Agent Lead |
| Dependencies | Sync Point | Block phase start | Agent Lead |
| TypeScript | Auto-validation | Rollback + retry | Agent individuel |
| Build failure | QA Agent | Pause all + debug | Agent Lead + QA |

---

## 11. Commandes d'exécution

### Démarrage manuel

```bash
# 1. Lead initialise le système
node agents/lead.js init --plan BLOG_CV_TRANSLATION_PLAN.md

# 2. Lead démarre Phase 1
node agents/lead.js start-phase content-creation

# 3. Monitor progress
node agents/lead.js status

# 4. Continue to next phase (après sync point)
node agents/lead.js start-phase blog-migration

# 5. Continue to CV migration
node agents/lead.js start-phase cv-migration

# 6. Run final QA
node agents/lead.js run-qa

# 7. Complete (merge to main)
node agents/lead.js complete
```

### Mode automatique

```bash
# Exécute tout le workflow de bout en bout
node agents/lead.js auto-execute \
  --plan BLOG_CV_TRANSLATION_PLAN.md \
  --max-parallel 7 \
  --sync-points 3
```

---

## 12. Métriques de succès

### KPIs par agent

| Agent | Métrique clé | Target | Tolérance |
|---|---|---|---|
| Content-1 à 7 | Temps de création | 10-60 min | ±10% |
| Blog-1 à 7 | Strings remplacées | ~40 total | 100% |
| CV-UI | Strings remplacées | ~15 | 100% |
| CV-Data | Champs traduits | ~300 | 100% |
| QA | Tests passants | 100% | 0% |

### KPIs globaux

| Métrique | Target | Résultat attendu |
|---|---|---|
| Durée totale | <6h | ~4.5h |
| Erreurs TypeScript | 0 | 0 |
| Build success | ✅ | ✅ 373+ pages |
| Couverture traduction | 100% | ~180 strings |
| Tests visuels | 100% | FR/EN/ES ✅ |

---

## 13. Documentation finale

À la fin de l'exécution, l'Agent Lead génère :

### `TRANSLATION_EXECUTION_REPORT.md`

```markdown
# Rapport d'Exécution — Traduction Blog & CV

## Résumé
- **Début** : 2026-02-13 10:00:00
- **Fin** : 2026-02-13 14:30:00
- **Durée** : 4h 30min
- **Statut** : ✅ SUCCESS

## Agents déployés
- Content Creation : 7 agents (parallèles)
- Blog Migration : 7 agents (parallèles)
- CV Migration : 3 agents (séquentiels)
- QA Validation : 1 agent (continu)

## Résultats
- Fichiers créés : 7/7 ✅
- Composants migrés : 10/10 ✅
- Strings traduites : 180/180 ✅
- Build : ✅ 373 pages
- Tests visuels : ✅ FR/EN/ES

## Problèmes rencontrés
1. CV-Data agent : timeout initial (90min → 95min) → résolu
2. Blog-4 : conflit détecté → rollback → retry → succès

## Recommandations
- CV-Data est la tâche la plus longue (90min) → envisager split
- Augmenter timeout par défaut de 60min → 120min pour data tasks
```

---

_Architecture validée et prête pour implémentation_
_Mainteneur : Agent Architecture Team_