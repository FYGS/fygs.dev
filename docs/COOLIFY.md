# Deploying fygs.dev on Coolify

Target: the Coolify server shared with other projects (prisma-consulting), until fygs.dev gets its own VPS. The procedure is the
same on the new server: only the Coolify URL and the DNS change.

> **Shared server.** Work only in the Coolify project **FYGS DEV**. Never edit, restart or delete a resource of another project
> (`Bons Profs`, `prisma-uat`, `BRVM Analytics`, `Educonnect`...).
>
> **The current site is already served by this Coolify**: application `fygs.dev:main-...` (Railpack, branch `main`, domains
> `fygs.dev` and `www.fygs.dev`). The refonte is deployed next to it as `fygs-v2` on a temporary domain, validated, then the domains
> are moved (section 11). The old application is not modified until then.

## 1. What runs where

```
Browser --HTTPS--> Traefik (Coolify) --> fygs-v2  (Dockerfile, Next.js standalone, port 3000)
                                           |--> PostgreSQL  staging: fygs-v2-staging-db (Coolify) / production: Neon (TLS)   DATABASE_URL
                                           |--> Redis       fygs-v2-redis (Coolify, private)                                REDIS_URL
                                           |--> S3 storage  fygs-v2-s3 (SeaweedFS, Coolify)                                 S3_*
                                           '--> SMTP / Stripe / Sentry (optional)
```

| Resource (project FYGS DEV) | Type | Notes |
|-----------------------------|------|-------|
| `fygs-v2` | Application, build pack **Dockerfile**, branch `feature/refactor-harmonize-codebase` (then `main`), port 3000 | Temporary domain `https://fygs-v2.51.68.121.128.sslip.io`; final `https://fygs.dev` |
| `fygs-v2-redis` | Redis 7, **not public**, 128m | internal URL `redis://default:<password>@<uuid>:6379/0` |
| `fygs-v2-staging-db` | PostgreSQL 16, not public | recette only (disposable); production keeps using **Neon** |
| `fygs-v2-s3` | SeaweedFS service, one S3 API on port 8333 | domains `s3.fygs.dev` (needs a DNS A record) and a `sslip.io` one |

## 2. Build variables (tick "Build Variable")

They are frozen into the build. Changing one means a new build, not a restart.

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://fygs.dev` |
| `S3_PUBLIC_URL` | S3 address of the media bucket (bucket included) |
| `S3_IMAGES_PUBLIC_URL` | public address of the images bucket (`https://img.fygs.dev`) |
| `IMAGE_REMOTE_HOSTS` | other hosts `next/image` may fetch (comma separated), optional |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION`, `NEXT_PUBLIC_NORTON_VERIFICATION` | search-console tokens, optional |
| `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_RELEASE` | only with Sentry |

A build without `S3_PUBLIC_URL` prints `No storage host for the image optimiser` and uploaded covers stop displaying.

## 3. Runtime variables (not build variables)

The server **refuses to start** in production when a required one is missing or weak (`lib/env-guard.ts`).

| Variable | Required | Value |
|----------|----------|-------|
| `NODE_ENV` | yes | `production` |
| `BETTER_AUTH_URL` | yes | `https://fygs.dev` |
| `BETTER_AUTH_SECRET` | yes | `openssl rand -base64 48` (new value, never the development one) |
| `DATABASE_URL` | yes | Neon URL with `?sslmode=require` (pooled `-pooler` host is fine for the application) |
| `MIGRATE_DATABASE_URL` | yes | Neon **direct** URL (no `-pooler`), used only by the migration |
| `RUN_MIGRATIONS` | yes | `1` |
| `REDIS_URL` | yes | internal URL of `fygs-redis` |
| `TRUSTED_PROXY_HOPS` | yes | `1` (Traefik alone), `2` if Cloudflare is placed in front |
| `CRON_SECRET`, `ADMIN_API_KEY` | yes | 32+ random characters each (`openssl rand -base64 48`) |
| `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` | yes | OAuth apps, callback `https://fygs.dev/api/auth/callback/<provider>` |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID` | yes | **live** values; `STRIPE_EXPECT_MODE=live` makes the server refuse a test key |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_SERVER_HOST/PORT/USER/PASSWORD` | yes | transactional SMTP (not a personal Gmail) |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`, `S3_IMAGES_BUCKET`, `S3_IMAGES_PUBLIC_URL` | yes | storage, see section 4 |
| `HUMAN_PROOF_MODE` | no | `report` for the first days, then `enforce` (default) |
| `ANTHROPIC_API_KEY`, `AI_*` | no | AI assistant; without a key it runs in offline mode |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT` | no | error reporting |
| `ADMIN_BOOTSTRAP_EMAIL` | once | promotes an existing verified user to ADMIN, then remove it |

Never set `SEED_ALLOW_PROD`, `NODE_TLS_REJECT_UNAUTHORIZED=0` or `DEBUG`.

## 4. File storage (SeaweedFS on Coolify)

MinIO is gone; the code talks to any S3-compatible service through the AWS SDK (`lib/s3-presign.ts`, `lib/image-storage.ts`).
The service `fygs-v2-s3` runs SeaweedFS (same image as the S3 of the Bons Profs project) with a single S3 port (8333) and its
identities defined in the compose file:

- `app`: the access key of the application (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` = the service variables `S3_KEY` / `S3_SECRET`),
  all rights;
- `anonymous`: `Read:fygs-images` only. Public images are served straight from the bucket, everything else needs a signature.

| Bucket | Content | Access | Variables |
|--------|---------|--------|-----------|
| `fygs-videos` | videos, resources, captions | **private**: the site signs 15-minute addresses | `S3_BUCKET`, `S3_PUBLIC_URL=https://s3.fygs.dev/fygs-videos` (only used to recognise stored addresses) |
| `fygs-images` | covers, avatars, lesson pictures | public read (anonymous identity) | `S3_IMAGES_BUCKET=fygs-images`, `S3_IMAGES_PUBLIC_URL=https://s3.fygs.dev/fygs-images` |

`S3_ENDPOINT=https://s3.fygs.dev`, `S3_REGION=us-east-1`, no `S3_IMAGES_PUBLIC_POLICY` (SeaweedFS has no bucket policies, the identity
above does the job). The stored image addresses contain the public base: **choose the final domain before the first real upload**.

Buckets are created once with the application key (`aws s3api create-bucket --bucket fygs-videos --endpoint-url https://s3.fygs.dev`,
same for `fygs-images`). Verified on the temporary domain: public image 200, private video 403, listing of the public bucket 403.

To do outside the code: DNS A record `s3.fygs.dev` to the server; CORS for browser uploads of videos (`PUT` from `https://fygs.dev`
only: SeaweedFS answers CORS from its own configuration, test an upload from the instructor screen); a Traefik middleware that adds
`X-Content-Type-Options: nosniff` on the S3 domain (the storage does not send it). Back up the `s3-data` volume.

Details, keys and checks: [storage-hardening.md](storage-hardening.md).

## 5. Application settings in Coolify

- Build pack **Dockerfile**, base directory `/`, port `3000`.
- **Health check**: turn Coolify's own check **off**. It runs `curl` inside the container, which the image does not have (the log says
  `curl: not found` and the check passes anyway). The image's `HEALTHCHECK` (`wget` on `http://127.0.0.1:3000/api/health`, start period 30 s)
  is then the one Coolify waits for.
- **Container hardening** (Application > Advanced > Custom Docker Options), verified from inside the running container:
  `--cap-drop=ALL --security-opt=no-new-privileges:true --read-only --tmpfs /tmp:rw,nosuid,size=128m --tmpfs /app/.next/cache:rw,nosuid,noexec,uid=1001,gid=65533,size=256m --pids-limit=512`,
  memory 1g with no swap, runtime variable `HOME=/tmp` (the Prisma CLI of the entrypoint writes a cache under `$HOME`).
  Observed: root filesystem read-only (`touch /app/x` fails), `/tmp` and the image cache writable, `CapEff` empty, `NoNewPrivs` 1, uid 1001.
  The image optimiser cache is in memory: it is lost at each restart, which only costs a re-optimisation.
- Domains: `https://fygs.dev`; add `www.fygs.dev` and redirect it to the apex. DNS: A records to the VPS.
- Webhook: Coolify gives a deploy webhook; store it as the `COOLIFY_WEBHOOK_URL` secret of GitHub Actions only if you want
  automatic deployments after a green CI.
- Resource limits: the build of this application is heavy (Monaco, 100+ pages). Build with 4 GB free, or build the image in CI
  and deploy it from a registry. Check `free -m` on the VPS before the first build.

## 6. Database migrations

`docker-entrypoint.sh` runs `prisma migrate deploy` before the server starts when `RUN_MIGRATIONS=1`, with `MIGRATE_DATABASE_URL`
(direct connection: the advisory lock of Prisma does not work through a pooler). A failed migration stops the new container before
it serves anything, so Coolify keeps the previous version up.

### First deployment against the existing Neon database

The Neon database predates this branch (old schema, 15 migrations, possibly created with `db push`). Before the first deploy:

1. **Snapshot**: create a Neon branch from the production branch (point-in-time) and keep it until the release is validated.
2. **Look**: on a copy (the Neon branch), run `select migration_name, finished_at from _prisma_migrations order by started_at;`.
   - Table missing: the schema came from `db push`. Mark the migrations already reflected in the schema as applied, with
     `prisma migrate resolve --applied <name>` for each, up to the last one that matches what the database has, then let `migrate
     deploy` apply the rest.  Then `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` against the copy must report no difference.
   - Table present and its 15 names match the first 15 folders of `prisma/migrations`: nothing to resolve, `migrate deploy` applies the 7 newer ones (`20261020140000_add_quiz_attempts` to `20261102100000_security_hardening`).
3. **Duplicates**: run the duplicate checks at the top of `prisma/migrations/20261102100000_security_hardening/migration.sql`.
   That migration adds unique indexes and fails if duplicates exist.
4. **Rehearse** on the Neon copy: point a local container at it with `RUN_MIGRATIONS=1`, then open the site.
5. Only then deploy to production.

If the database is empty (new project), `migrate deploy` creates everything, then run `pnpm db:seed` once from a trusted machine
(it refuses a non-local database unless `SEED_ALLOW_PROD=1` and `SEED_CONFIRM_DATABASE` are set; unset them afterwards).

## 7. Scheduled job

Coolify > `fygs-v2` > Scheduled Tasks, or an external cron, `0 7 * * 1` (Monday, 07:00):

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://fygs.dev/api/cron/weekly-review-summaries
```

(Scheduled Tasks of `fygs-v2` run a command inside the container, which has `wget` but not `curl`: use
`wget -qO- --header="Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/cron/weekly-review-summaries`.)

(the route answers `GET`).

## 8. Stripe

- Live webhook endpoint `https://fygs.dev/api/stripe/webhook`, events listed in [SECURITY-OPERATIONS.md](SECURITY-OPERATIONS.md) section 5
  and `DEPLOYMENT.md`. Its signing secret goes into `STRIPE_WEBHOOK_SECRET`.
- Restricted API key, one webhook secret per environment, live and test keys never mixed.

## 9. After every deployment

Follow section 4 of [SECURITY-OPERATIONS.md](SECURITY-OPERATIONS.md), plus:

- [ ] Deployment logs show `[entrypoint] prisma migrate deploy` then `All migrations have been successfully applied` (or `No pending migrations`).
- [ ] No `[database]` warning (`NO_TLS`, `IGNORED_PARAMS`, `TLS_PRIVATE_CA`) in the logs; `GET /api/health` answers `ok` with `rateLimiter.mode: redis`.
- [ ] Sign in with Google and GitHub, buy with a Stripe live coupon at 100 %, then refund it; receive the e-mails.
- [ ] Upload an image as an administrator, see it on the site; open a paid video as a learner.
- [ ] Response headers: HSTS, CSP (nonce on `/fr/dashboard`), COOP.
- [ ] Uptime probe (Uptime Kuma resource or an external service) on `/api/health`.

## 10. Rollback

Coolify > `fygs-v2` > Deployments > redeploy the previous successful deployment. Migrations are forward-only: a rollback of the
application after a destructive migration needs the Neon branch of step 1 of section 6, so keep it until the release is validated.

## 11. Cutover from the current site (Railpack app) to `fygs-v2`

Do it only when the recette on the temporary domain is green and the points below are done.

1. Neon: snapshot branch, baseline and duplicate checks (section 6), `MIGRATE_DATABASE_URL` = direct Neon URL, `DATABASE_URL` = Neon URL.
2. Live Stripe keys, webhook `https://fygs.dev/api/stripe/webhook` and its signing secret (**the current site runs with `sk_test` keys**),
   `STRIPE_EXPECT_MODE=live`. OAuth redirect URIs and SMTP/SPF/DKIM for `fygs.dev`.
3. Build variables switched to the final domains (`NEXT_PUBLIC_SITE_URL`, `S3_PUBLIC_URL`, `S3_IMAGES_PUBLIC_URL`), `BETTER_AUTH_URL`,
   `HUMAN_PROOF_MODE=report` then `enforce`, `REDIS_URL` of `fygs-v2-redis`.
4. Remove `fygs.dev` and `www.fygs.dev` from the old application (it stays stopped, not deleted, for a week), add them to `fygs-v2`, redeploy.
5. Check section 9, watch the logs for an hour. Rollback: give the domains back to the old application and start it.
