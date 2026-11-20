# Deploying fygs.dev on Coolify

Target: the Coolify server shared with other projects (prisma-consulting), until fygs.dev gets its own VPS. The procedure is the
same on the new server: only the Coolify URL and the DNS change.

> **Shared server.** Create and touch only resources of the `fygs-prod` project. Never edit, restart or delete a resource of
> another project (`prisma-uat`, `prisma-prod`...).

## 1. What runs where

```
Browser --HTTPS--> Traefik (Coolify) --> fygs-web  (Dockerfile, Next.js standalone, port 3000)
                                           |--> PostgreSQL  Neon (external, TLS)        DATABASE_URL
                                           |--> Redis       Coolify resource, private   REDIS_URL
                                           |--> S3 storage  external or Coolify          S3_*
                                           '--> SMTP / Stripe / Sentry (optional)
```

| Resource | Type | Notes |
|----------|------|-------|
| `fygs-web` | Application, build pack **Dockerfile**, branch of the deployment, port `3000` | Domain `https://fygs.dev` (and `www` redirected to it) |
| `fygs-redis` | Database > Redis | **Not public.** Memory limit 128m. Use its *internal* URL |
| Database | **Neon** (already in use) | No PostgreSQL resource to create. Use a branch for tests |
| `fygs-garage` | Garage (S3-compatible, see section 4) | Private, only `s3.` and `img.` domains are published. MinIO is no longer used anywhere |

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

## 4. File storage (Garage on Coolify)

MinIO is gone; the code talks to any S3-compatible service through the AWS SDK (`lib/s3-presign.ts`, `lib/image-storage.ts`).
The chosen service is **Garage**, as a Coolify resource of the `fygs-prod` project (its volume holds the data: back it up).

Garage has no bucket policies, so public and private files live in **two buckets**:

| Bucket | Content | Access | Variables |
|--------|---------|--------|-----------|
| `fygs-videos` | videos, resources, captions | **private**: the site signs 15-minute addresses | `S3_BUCKET`, `S3_PUBLIC_URL` (the S3 API address of that bucket: `https://s3.fygs.dev/fygs-videos`, used only to recognise stored addresses) |
| `fygs-images` | covers, avatars, lesson pictures | **public read** through Garage's *website* endpoint | `S3_IMAGES_BUCKET=fygs-images`, `S3_IMAGES_PUBLIC_URL=https://img.fygs.dev` |

Setup (Garage CLI, in the Garage container):

```
garage layout assign -z dc1 -c 20G <node-id> && garage layout apply --version 1
garage bucket create fygs-videos && garage bucket create fygs-images
garage key create fygs-app                          # prints the access key id and the secret: S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
garage bucket allow --read --write --owner fygs-videos --key fygs-app
garage bucket allow --read --write --owner fygs-images --key fygs-app
garage bucket website --allow fygs-images           # public read of the images bucket only
```

- `S3_ENDPOINT=https://s3.fygs.dev` (Garage S3 API, port 3900), `S3_REGION=garage`, no `S3_IMAGES_PUBLIC_POLICY`.
- Domains in Coolify: `s3.fygs.dev` to port 3900 (API), `img.fygs.dev` to port 3902 (web endpoint, the website bucket is chosen by
  the `Host` header: set `root_domain`/`bucket alias` so that `img.fygs.dev` maps to `fygs-images`, see the Garage documentation for
  `[s3_web] root_domain` and `garage bucket alias`).
- CORS on `fygs-videos` for browser uploads of videos and resources: `PUT` from `https://fygs.dev` only
  (`aws s3api put-bucket-cors`, Garage supports it).
- Keep the Garage ports (3900, 3902, admin 3903, RPC 3901) closed on the host: only Traefik reaches them.

Details, keys and checks: [storage-hardening.md](storage-hardening.md). After the first deploy, run its two `curl -sI` checks
(private video = 403, public image = 200 with `nosniff`).

## 5. Application settings in Coolify

- Build pack **Dockerfile**, base directory `/`, port `3000`.
- **Health check**: path `/api/health`, host **`127.0.0.1`** (not `localhost`: IPv6 makes the probe fail), port `3000`, start period 30 s.
  The image has the same probe built in.
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

Coolify > `fygs-web` > Scheduled Tasks, or an external cron, `0 7 * * 1` (Monday, 07:00):

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://fygs.dev/api/cron/weekly-review-summaries
```

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

Coolify > `fygs-web` > Deployments > redeploy the previous successful deployment. Migrations are forward-only: a rollback of the
application after a destructive migration needs the Neon branch of step 1 of section 6, so keep it until the release is validated.
