# Codebase Audit: fygs.dev (branche feature/refactor-harmonize-codebase) - security

La couche applicative est solide (2FA du personnel, CSP à nonce, preuve de travail, SSRF, quotas, webhooks Stripe durables). Le risque se déplace vers les **secrets déjà exposés, l'hôte partagé, la chaîne d'approvisionnement et les comptes du propriétaire**.

- **Date**: 2026-11-20
- **Scope**: code de la branche, image Docker, déploiement Coolify (recette `fygs-v2` et site live), GitHub, DNS. Mesures passives et sondes bénignes sur vos propres actifs. Aucune campagne d'attaque.
- **Health**: poor (deux critiques systémiques hors code applicatif)
- **Findings**: 2 critical, 9 major, 6 minor

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🔴 | security | `.env.production@ecd3144`, `.env@1cbbba2` (historique git, 5 commits) | Les secrets **de production actuels** sont dans l'historique : `BETTER_AUTH_SECRET` (falsification de sessions), `DATABASE_URL` (accès complet à la base), mot de passe SMTP, secrets OAuth Google et GitHub, clé OpenAI, clés Stripe. Vérifié par empreinte : identiques aux valeurs du site live | Rotation de **tous** (base, SMTP, OAuth, Stripe, OpenAI, secret d'auth), puis purge de l'historique (`git filter-repo`) et révocation des clones. Les sessions existantes tomberont : voulu | M |
| 🔴 | security | VPS `51.68.121.128`, ports 22, 8000, 6001 | Le **tableau de bord Coolify (8000, HTTP clair)**, son canal temps réel (6001) et SSH sont joignables depuis Internet. Un compte Coolify compromis donne la main sur tous les projets et leurs variables d'environnement (hôte partagé) | Pare-feu : 80/443 publics seulement ; 22, 8000, 6001 limités à vos IP ou à un VPN (Tailscale/WireGuard). Dashboard uniquement via `deploy.bonsprofs.com` en HTTPS. SSH par clé, root désactivé, fail2ban | S |
| 🟡 | security | `lib/rate-limit.ts:334` + origine ouverte | `fygs.dev` est derrière Cloudflare, mais l'**origine répond aux requêtes directes** (443 et 80). Avec `TRUSTED_PROXY_HOPS=2`, un attaquant qui contourne Cloudflare choisit sa propre clé de limitation (`X-Forwarded-For`). Avec `1`, tous les visiteurs partagent l'IP de Cloudflare | Verrouiller l'origine sur les plages IP Cloudflare ou activer Authenticated Origin Pulls (mTLS), puis `TRUSTED_PROXY_HOPS=2` | M |
| 🟡 | security | Coolify app `ljml6qqgunnoa1iyvgctcl7t` (site live) | Le site actuel n'envoie **aucun en-tête de sécurité** (ni CSP, ni HSTS, ni X-Frame-Options), tourne avec des **clés Stripe de test**, et a tous ses secrets déclarés comme *build variables* (copiés dans les couches de l'image) | Basculer sur `fygs-v2` (docs/COOLIFY.md §11) ; rotation des secrets avant la bascule | M |
| 🟡 | security | DNS `fygs.dev` | **DMARC `p=none`**, aucun enregistrement SPF ni DKIM trouvé, pas de CAA. N'importe qui peut usurper `@fygs.dev` (phishing au nom de votre vitrine) | SPF + DKIM chez le fournisseur SMTP, DMARC `p=quarantine` puis `reject` avec `rua`, CAA `letsencrypt.org`, MTA-STS et TLS-RPT | S |
| 🟡 | security | GitHub `FYGS/fygs.dev` ; `.github/workflows/ci-cd.yml:31,34,42` | Secret scanning **désactivé**, protection de branche **indisponible** (dépôt privé en plan gratuit), actions tierces référencées par tag et non par SHA, pas de CODEOWNERS | Activer secret scanning et push protection, passer à un plan permettant les rulesets, épingler les actions par SHA (Dependabot les maintient), CODEOWNERS sur `.github/`, `Dockerfile`, `lib/auth*` | S |
| 🟡 | security | comptes propriétaire (GitHub, Cloudflare, Coolify, Neon, Stripe, Google, registrar) | La voie réaliste contre un adversaire étatique est la **prise de compte**, pas le code. Le staff a un TOTP, mais pas de WebAuthn côté application ni de clés matérielles imposées sur les comptes d'infrastructure | Deux clés FIDO2 sur tous les comptes d'infra, codes de secours hors ligne, WebAuthn/passkeys pour ADMIN dans better-auth | M |
| 🟡 | security | `docs/COOLIFY.md` §4, compose du service `fygs-v2-s3` | La clé applicative SeaweedFS a le droit `Admin` : elle peut créer, vider et supprimer des buckets. Pas de `nosniff` ni de CORS configurés sur le domaine S3 | Droits limités à `Read/Write/List` sur `fygs-videos` et `fygs-images`, deux clés distinctes ; middleware Traefik `nosniff` ; CORS `PUT` limité à l'origine du site | S |
| 🟡 | security | `Dockerfile:71-95`, config Coolify de `fygs-v2` | Conteneur non-root, mais sans `no-new-privileges`, sans `cap_drop: ALL`, système de fichiers modifiable | Options Docker Coolify : `--security-opt no-new-privileges --cap-drop ALL --read-only --tmpfs /tmp` (+ volume pour `.next/cache`), limites CPU et PIDs | S |
| 🟡 | security | `lib/auth.ts:132` | Sessions de 7 jours pour **tous** les rôles, y compris ADMIN, sans réauthentification pour les actions sensibles | Sessions courtes (1 à 12 h) et réauthentification pour ADMIN/INSTRUCTOR et pour remboursement, changement de rôle, suppression | M |
| 🟡 | security | hors dépôt : Neon, Redis, SeaweedFS | **Aucune sauvegarde ni restauration testée** (base, Redis, volume `s3-data`), pas de monitoring d'erreurs (Sentry non configuré), pas d'alerte de disponibilité, pas de plan de réponse à incident | Snapshots Neon planifiés, dump chiffré hors site, test de restauration trimestriel, Sentry + Uptime Kuma, runbook d'incident | M |
| 🟢 | security | `proxy.ts`, `app/[locale]/layout.tsx` | Un premier segment inconnu est accepté comme locale : `/.env` répond **200** avec `<html lang=".env">` (soft-404, pollution SEO) ; `TRACE` répond 500 au lieu de 405 | Valider la locale (`hasLocale`) et répondre 404 ; refuser les méthodes non gérées | S |
| 🟢 | security | `app/api/maintenance/route.ts:8` | `GET /api/maintenance` est public et renvoie la configuration de maintenance | Retirer ou limiter à l'état booléen | S |
| 🟢 | security | `lib/auth.ts:102` | Mot de passe minimum 8 caractères, pas de contrôle de fuite | Minimum 12 et vérification HIBP (k-anonymity) | S |
| 🟢 | security | `next.config.mjs:222` | HSTS `preload` envoyé, mais le domaine n'est pas inscrit sur hstspreload.org | Inscrire après vérification des sous-domaines HTTPS, sinon retirer `preload` | S |
| 🟢 | security | `app/[locale]/(main)/tech-mastry/playground/_components/pg-preview.tsx:250` | `allow-scripts allow-same-origin` sur l'iframe quand `serverUrl` existe : sûr seulement si cette URL est d'une autre origine que le site | Vérifier et affirmer en code que `serverUrl` est cross-origin, sinon retirer `allow-same-origin` | S |
| 🟢 | security | `docs/SECURITY-HARDENING-TRACKER.md` §5 | Aucune campagne d'attaque réelle jamais menée sur une instance en marche | Test d'intrusion externe (ou ZAP/Nuclei authentifié) avant la bascule | L |

## Top actions

1. **Rotation de tous les secrets et purge de l'historique git** (finding 1). C'est la seule action qui change l'issue d'une compromission passée. À faire avant la bascule, car la recette réutilise une partie de ces valeurs.
2. **Fermer 8000, 6001 et 22 au public** sur le VPS (finding 2) : cinq minutes pour supprimer le risque d'hôte partagé le plus élevé.
3. **Verrouiller l'origine sur Cloudflare** puis régler `TRUSTED_PROXY_HOPS=2` à la bascule (finding 3).
4. **Basculer sur `fygs-v2`** avec clés Stripe live, en-têtes de sécurité et secrets en variables d'exécution (finding 4).
5. **SPF, DKIM, DMARC strict, CAA** (finding 5) : la vitrine ne doit pas pouvoir être usurpée.
6. **Clés matérielles sur tous les comptes d'infrastructure et WebAuthn pour l'admin** (finding 7).
7. Durcissement du conteneur, S3 en moindre privilège, sauvegardes testées, Sentry, puis test d'intrusion externe.

## Coverage

- **Scanned**: security (code de la branche : routes API, auth, upload, rendu HTML, sandbox, en-têtes ; image Docker ; Coolify ; GitHub ; DNS ; sondes HTTP bénignes sur `fygs-v2` et sur le site live)
- **Skipped**: analyse statique automatisée (aucun SAST installé ; CodeQL tourne en CI mais ses résultats n'ont pas été lus) ; campagne d'attaque active ; revue exhaustive des 44 routes API (13 sans garde apparente repérées par heuristique, publiques par conception : santé, webhook signé, recherche, CSP-report, PoW, vues de blog, outils IA limités par budget) ; Cloudflare (réglages non accessibles) ; Neon (accès refusé)
