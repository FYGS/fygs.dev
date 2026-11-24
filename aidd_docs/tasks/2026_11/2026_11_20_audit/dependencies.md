# Codebase Audit: fygs.dev (branche feature/refactor-harmonize-codebase) - dependencies

La branche est déjà proche de l'état de l'art (patch/minor presque à jour, `onlyBuiltDependencies` limité, lockfile intègre). Reste `next` à mettre à jour et un peu de poids mort.

- **Date**: 2026-11-20
- **Scope**: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, workflows, Dockerfile, Dependabot du dépôt
- **Health**: fair
- **Findings**: 0 critical, 5 major, 4 minor

`pnpm audit` : 19 vulnérabilités (0 critique, 6 high, 11 moderate, 2 low). Dependabot sur le dépôt : 100 alertes ouvertes (9 critical, 29 high, 50 medium, 12 low), qui portent sur la branche `main` (anciennes dépendances) et disparaîtront à la fusion de la refonte.

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🟡 | dependencies | `package.json:110` | `next` 16.4.2 : **7 avis** corrigés en 16.4.5 (injection de réponse entre clients en auto-hébergé, exposition d'un cookie HttpOnly via un en-tête interne, empoisonnement de cache `use cache`, contournement du rejet SVG de l'optimiseur d'images). Les préconditions de chacun sont à confirmer, mais l'hébergement est auto-hébergé | Passer à `16.4.6` (et `eslint-config-next`), relancer build, e2e et recette | S |
| 🟡 | dependencies | `package.json:106` | `minio` est déclaré mais n'est plus importé ; il apporte `decode-uri-component` (high) et `fast-xml-parser` | `pnpm remove minio` | S |
| 🟡 | dependencies | `package.json:109` | `natural` embarque `mongoose` : 1 avis high et 3 moderate pour une base qui n'est pas utilisée | Vérifier l'usage réel de `natural` ; le remplacer ou l'isoler, sinon `overrides` `mongoose >=9.11.4` | M |
| 🟡 | dependencies | `package.json:41` | `@hookform/resolvers` 5.9.2 tire `effect` (high, ReDoS) ; `zod` < 4.6.6 via la CLI intlayer (high, mémoire) | Mettre à jour `@hookform/resolvers`, `intlayer` / `next-intlayer` (9.8.x), `zod` ; `overrides` si le correctif amont tarde | S |
| 🟡 | dependencies | `pnpm-workspace.yaml` | Aucun délai d'adoption des nouvelles versions : un paquet malveillant publié il y a une heure s'installe (vers npm de type Shai-Hulud). Aucune vérification de signatures ou de provenance | `minimumReleaseAge: 4320` (3 jours, pnpm 10.16+), `pnpm audit signatures` en CI, `--ignore-scripts` en CI, revue des nouveaux scripts de build | S |
| 🟢 | dependencies | `pnpm outdated` | 54 paquets en retard (patch/minor surtout) : `@aws-sdk/*`, `@sentry/nextjs` 11.8 -> 11.16, `better-auth` 1.7.12 -> 1.7.27, `nodemailer`, `framer-motion`, `lucide-react`, `tiptap`... | Un lot patch/minor après `next`, avec e2e | M |
| 🟢 | dependencies | `package.json` | Majeures en retard : TypeScript 7, ESLint 10, jsdom 31, `@hookform/resolvers` 7, `prisma` 8 (RC). `@types/node` 22 doit rester aligné sur Node 22 | Ne pas suivre `prisma` 8 RC ; ESLint 10 et TypeScript 7 dans un chantier dédié | L |
| 🟢 | dependencies | `Dockerfile:8,18,57,71` | Images de base `node:22-alpine` et `postgres:16-alpine` référencées par tag, pas par digest | Épingler par digest et laisser Dependabot (docker) les mettre à jour | S |
| 🟢 | dependencies | `.github/workflows/*.yml` | Aucune vérification de licences en CI ; le résultat de `pnpm audit` n'est pas un garde-fou de fusion | `dependency-review` avec liste d'autorisation, `pnpm audit --audit-level high` bloquant | S |

## Top actions

1. `next` 16.4.6 puis rebuild et nouvelle recette (finding 1).
2. `pnpm remove minio` ; traiter `natural`/`mongoose`, `effect`, `zod` (findings 2 à 4). Le lockfile sera regénéré : le diff sera bruité.
3. `minimumReleaseAge` et vérification de signatures en CI (finding 5).
4. Un lot patch/minor, puis les images de base épinglées.
5. Fusionner la refonte dans `main` : ferme d'un coup les 100 alertes Dependabot de l'ancien code.

## Coverage

- **Scanned**: dependencies (audit pnpm sur la branche, `pnpm outdated`, présence et intégrité du lockfile, scripts de build autorisés, dépendances git/URL absentes, alertes Dependabot du dépôt)
- **Skipped**: conformité des licences (aucun outil installé) ; dépendances inutilisées au-delà de `minio` (pas de `knip` ni `depcheck` lancé)
