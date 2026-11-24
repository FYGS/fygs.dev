# Durcissement de l'authentification (novembre 2026)

Document d'exploitation : ce qui a changé, ce qu'il faut configurer, comment dépanner.

## 1. Double authentification obligatoire pour le personnel

- Les rôles `ADMIN` et `INSTRUCTOR` ne sont effectifs qu'avec la double authentification (TOTP) activée.
- Application centrale : le plugin `customSession` de `lib/auth.ts` renvoie un compte du personnel sans 2FA avec le rôle `STUDENT`
  et `pendingStaffRole` (le vrai rôle). Toute vérification de rôle s'appuyant sur la session échoue donc « fermée ».
- Redirections explicites vers `/profile/security?required=1` : layout `(admin)`, `requireAdminPage`, `requireAuthor`.
- Le personnel ne peut pas désactiver sa 2FA (hook `/two-factor/disable` → 403). Aucun appareil n'est mémorisé (`trustDevice` refusé).
- Connexion via fournisseur (GitHub, Google) : refusée pour tout compte ayant une 2FA (`mustRefuseSession`), car le plugin ne couvre
  que la connexion par mot de passe. Un compte du personnel connecté uniquement par un fournisseur doit d'abord créer un mot de passe
  par « Mot de passe oublié ».
- Activation / désactivation : journal d'audit (`user.two_factor_enabled` / `user.two_factor_disabled`) et e-mail d'information.

### Perte du second facteur (secours)
Un administrateur ayant perdu son appareil et ses codes de secours :
```
ADMIN_BOOTSTRAP_EMAIL=adresse@exemple.fr ADMIN_BOOTSTRAP_RESET_2FA=1 npm run admin:bootstrap
```
Le script supprime la 2FA du compte (trace d'audit `user.two_factor_disabled`, `via: bootstrap-admin`). La personne doit ensuite la
réactiver au prochain accès à une page d'administration.

## 2. Premier administrateur
`db:seed:prod`, `db:push:prod` et `db:reset:prod` sont supprimés. Procédure :
1. La personne s'inscrit et vérifie son adresse.
2. `ADMIN_BOOTSTRAP_EMAIL=adresse@exemple.fr npm run admin:bootstrap` (refuse une adresse inconnue ou non vérifiée ; idempotent ; audité).
3. Elle active sa 2FA à la première connexion.

## 3. Garde du seed
`npm run db:seed` / `db:reset` refusent toute base non locale ou tout environnement de production, sauf
`SEED_ALLOW_PROD=1` **et** `SEED_CONFIRM_DATABASE=<nom exact de la base>`. Si votre `.env` de développement pointe vers une base
distante, définissez ces deux variables pour l'opération, en connaissance de cause.

## 4. Garde d'environnement de production
`lib/env-guard.ts`, appelé depuis `instrumentation.ts` au démarrage du serveur de production (jamais en build, test ou dev) :

| Contrôle | Effet |
|---|---|
| `BETTER_AUTH_SECRET` faible ou absent | arrêt |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL` non https (hors localhost) | arrêt |
| `DATABASE_URL` absent | arrêt |
| `CRON_SECRET`, `ADMIN_API_KEY` présents mais < 32 caractères | arrêt |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | arrêt |
| `TRUSTED_PROXY_HOPS` non défini ou invalide | avertissement / arrêt si invalide |

`baseURL` est fixé sur `BETTER_AUTH_URL` et `trustedOrigins` est épinglé en production.

## 5. Suppression de compte
« Supprimer mon compte » (`/profile/security`, `DELETE /api/profile`) : mot de passe (ou session de moins de 10 minutes pour un compte
sans mot de passe), mot « SUPPRIMER », code TOTP si la 2FA est active. Refusée (409) en cas d'abonnement en cours, de cours
rédigés ou de dernier administrateur.

Dans une seule transaction : sessions, comptes liés, 2FA, jetons, notes, notifications, relations, badges, XP, séries, demandes de
mentorat supprimés ; compte anonymisé (nom « Compte supprimé », e-mail `deleted-<id>@deleted.invalid`, banni) ; certificats au nom
« Titulaire supprimé » ; entrée d'audit sans donnée personnelle. **Conservés** : paiements, factures, avis, inscriptions,
progression (obligations comptables et intégrité pédagogique).

## 6. Autres changements
- Réinitialisation de mot de passe : toutes les sessions sont révoquées, e-mail d'information.
- Changement d'adresse : uniquement via `changeEmail` (approbation depuis l'ancienne adresse, puis confirmation de la nouvelle). `PATCH /api/profile` n'accepte plus que `name`.
- Adresses mises en minuscules à l'inscription ; clés de limitation par e-mail normalisées (minuscules, sans `+tag`).
- `callbackUrl` : toujours validé par `safeInternalPath` ; la page `auth/callback` est supprimée.
- Avatar : https uniquement, hôtes autorisés.
- Nom d'affichage : nettoyé (caractères invisibles et de contrôle), 2 à 100 caractères.
- Routes `/api/auth/*` : chemins normalisés avant la limitation, preuve humaine (`verifyHumanProof`), champ piège, corps limité à 16 Ko, e-mails jetables refusés à l'inscription.

## 7. Tests de bout en bout
Pas d'interrupteur de contournement de la 2FA : les comptes du personnel de test sont enrôlés avec un secret TOTP connu
(`tests/e2e/support/two-factor.ts`), chiffré avec le secret aléatoire de l'exécution (`E2E_AUTH_SECRET`, transmis par
`scripts/e2e.mjs`), et les fixtures calculent le code. Les scripts d'audit (`scripts/audit/staff-two-factor.mjs`) font de même.

## 8. Limites connues
- Adresses déjà enregistrées avec des majuscules : non migrées (à vérifier en base).
- Le limiteur interne de better-auth se base sur le `X-Forwarded-For` le plus à gauche ; le nôtre fait foi.
- Un code lisant le rôle directement en base (et non via la session) échappe au déclassement central.
