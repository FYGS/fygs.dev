# Deploying fygs.dev on Coolify

Target: the Coolify server shared with other projects (prisma-consulting), until fygs.dev gets its own VPS. The procedure is the
same on the new server: only the Coolify URL and the DNS change.

> **Shared server.** Work only in the Coolify project **FYGS DEV**. Never edit, restart or delete a resource of another project
> (`Bons Profs`, `prisma-uat`, `BRVM Analytics`, `Educonnect`...).
>
> **Cutover done on 2026-11-24**: `fygs.dev` and `www.fygs.dev` are served by the application `fygs` (environment `production`).
> The old Railpack application and its throwaway database were deleted. The recette lives in the environment `staging`.
> Resource names below: production `fygs`, `fygs-prod-db`, `fygs-redis`, `fygs-s3`; staging `fygs-staging`, `fygs-staging-db`,
> `fygs-staging-redis`, `fygs-staging-s3`.

## 1. What runs where

```
Browser --HTTPS--> Cloudflare --> Traefik (Coolify) --> fygs  (Dockerfile, Next.js standalone, port 3000)
                                           |--> PostgreSQL  production: fygs-prod-db / staging: fygs-staging-db (Coolify)   DATABASE_URL
                                           |--> Redis       fygs-redis (Coolify, private)                                REDIS_URL
                                           |--> S3 storage  fygs-s3 (SeaweedFS, Coolify)                                 S3_*
                                           '--> SMTP / Stripe / Sentry (optional)
```

| Resource (project FYGS DEV) | Type | Notes |
|-----------------------------|------|-------|
| `fygs-v2` | Application, build pack **Dockerfile**, branch `feature/refactor-harmonize-codebase` (then `main`), port 3000 | Temporary domain `https://fygs-v2.51.68.121.128.sslip.io`; final `https://fygs.dev` |
| `fygs-redis` | Redis 7, **not public**, 128m | internal URL `redis://default:<password>@<uuid>:6379/0` |
| `fygs-s3` | SeaweedFS service, one S3 API on port 8333 | domains `s3.fygs.dev` (needs a DNS A record) and a `sslip.io` one |

## 1b. Environments of the FYGS DEV project

Like `Bons Profs` (production + preprod) and `prisma-uat` (production + uat), the project has two Coolify environments. They share
no database, no Redis, no storage and no secret: the recette cannot touch production data, and a recette secret is worthless in
production.

| | `production` | `staging` |
|---|---|---|
| Application | `fygs` on `https://fygs.dev` and `https://www.fygs.dev` | `fygs-staging` on `https://staging.fygs.dev` |
| Database | `fygs-prod-db` (Postgres 17): `fygs_v2`, empty, builds itself with `migrate deploy` | `fygs-staging-db` (Postgres 17): fictional seed data |
| Redis | `fygs-redis` | `fygs-staging-redis` |
| Storage | `fygs-s3` on `https://s3.fygs.dev` (CORS limited to `fygs.dev` and `www.fygs.dev`) | `fygs-staging-s3` on `https://s3-staging.fygs.dev` (its own keys, its own CORS middleware `fygs-s3-staging-headers`, runs as uid 1000) |
| Stripe | test keys until you go live (`STRIPE_EXPECT_MODE`) | test keys, webhook `https://staging.fygs.dev/api/stripe/webhook` |
| Content | real training content, created later | seeded courses (fictional, to be thrown away) |

Coolify's API cannot move a resource from one environment to another: create the staging ones in `staging`, never move them.
Traefik middleware names are global to the server: two services must never declare the same one (`fygs-s3-headers` is production's,
`fygs-s3-staging-headers` the recette's).

### Staging admin

`node scripts/ops/staging-admin.mjs enroll` then `login` give an authenticated session (password + TOTP) on the recette, for manual
checks and for an agent driving the workflows. Credentials and the TOTP secret stay in `~/.config/fygs-dev/staging-admin.env`
(outside the repository). The admin can change any user's role and ban users (`/admin/users`); users register themselves (e-mail,
Google, GitHub) and the admin promotes them, so one admin account is enough to get instructors, learners and other admins.

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
| `DATABASE_URL` | yes | internal URL `postgresql://fygs_v2:…@<fygs-prod-db uuid>:5432/fygs_v2` (no TLS needed on the internal Docker network) |
| `MIGRATE_DATABASE_URL` | yes | same internal URL (direct connection), used only by the migration |
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
The service `fygs-s3` runs SeaweedFS (same image as the S3 of the Bons Profs project) with a single S3 port (8333). Its identities are
defined in the compose file, each with the least rights it needs, **and none of them is the root key**:

| Identity | Rights | Used by |
|----------|--------|---------|
| `media` | `Read`, `Write` (includes delete), `List`, `Tagging` on `fygs-videos` only | the application: `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (service variables `S3_KEY` / `S3_SECRET`) |
| `images` | the same on `fygs-images` only | the application: `S3_IMAGES_ACCESS_KEY_ID` / `S3_IMAGES_SECRET_ACCESS_KEY` (service variables `S3_IMAGES_KEY` / `S3_IMAGES_SECRET`) |
| `admin` | `Admin` (create and delete buckets) | nobody at run time: only to create a bucket by hand; its key is in the owner's password manager and in the service variables `S3_ADMIN_*`, never in the application |
| `anonymous` | `Read:fygs-images` | the public, for the images |

Verified (with `aws s3api` against the running service): the media key cannot write to `fygs-images` nor create a bucket, the images key
cannot read `fygs-videos`, public image 200, private video 403, listing 403.

Response headers and CORS come from a Traefik middleware declared in the compose labels (`fygs-s3-headers`, attached to the two HTTPS
routers that Coolify generates for the domains): `X-Content-Type-Options: nosniff`, and CORS limited to the site origins (`GET, HEAD, PUT`),
so a browser upload of a video works from the site and not from another origin. **Keep the router names in the compose labels in sync**
with the ones Coolify generates (`https-0-<uuid>-s3-c082`: read them in the service's generated compose) and add the final origin
(`https://fygs.dev`, already listed) when the domain changes. The S3 container itself runs with `cap_drop: ALL`, `no-new-privileges`,
a read-only root file system and a 16 MB `tmpfs` for `/tmp`.

| Bucket | Content | Access | Variables |
|--------|---------|--------|-----------|
| `fygs-videos` | videos, resources, captions | **private**: the site signs 15-minute addresses | `S3_BUCKET`, `S3_PUBLIC_URL=https://s3.fygs.dev/fygs-videos` (only used to recognise stored addresses) |
| `fygs-images` | covers, avatars, lesson pictures | public read (anonymous identity) | `S3_IMAGES_BUCKET=fygs-images`, `S3_IMAGES_PUBLIC_URL=https://s3.fygs.dev/fygs-images` |

`S3_ENDPOINT=https://s3.fygs.dev`, `S3_REGION=us-east-1`, no `S3_IMAGES_PUBLIC_POLICY` (SeaweedFS has no bucket policies, the identity
above does the job). The stored image addresses contain the public base: **choose the final domain before the first real upload**.

Buckets are created once with the application key (`aws s3api create-bucket --bucket fygs-videos --endpoint-url https://s3.fygs.dev`,
same for `fygs-images`). Verified on the temporary domain: public image 200, private video 403, listing of the public bucket 403.

To do outside the code: DNS A record `s3.fygs.dev` to the server; test a real video upload from the instructor screen; back up the `s3-data` volume.

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

### Production database

The old Neon project only held throwaway development data (no real enrolment) and its account is lost, so it is **not migrated**.
Production runs on `fygs-prod-db` (Postgres 17, Coolify), with one database and one role per site:

| Database / role | Used by |
|---|---|
| `fygs_prod` | the current live site (a copy of the old dev data, dropped at cutover) |
| `fygs_v2` | `fygs` (production): starts **empty**, `migrate deploy` creates the 22 migrations |

Both `DATABASE_URL` and `MIGRATE_DATABASE_URL` point to the internal host (`<uuid>:5432`, no pooler needed). `fygs-v2-staging-db`
was deleted: the recette has its own `fygs-staging-db`. Then seed the content once from a trusted machine as described below.

If the database is empty (new project), `migrate deploy` creates everything, then run `pnpm db:seed` once from a trusted machine
(it refuses a non-local database unless `SEED_ALLOW_PROD=1` and `SEED_CONFIRM_DATABASE` are set; unset them afterwards).

## 7. Scheduled job

Coolify > `fygs` > Scheduled Tasks, or an external cron, `0 7 * * 1` (Monday, 07:00):

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://fygs.dev/api/cron/weekly-review-summaries
```

(Scheduled Tasks of `fygs` run a command inside the container, which has `wget` but not `curl`: use
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

Coolify > `fygs` > Deployments > redeploy the previous successful deployment. Migrations are forward-only: a rollback of the
application after a destructive migration needs a `pg_dump` of `fygs_v2` taken just before the release, so keep it until the release is validated.

## 11. Cutover (done on 2026-11-24)

What was done, in this order, and how to undo it:

1. `DATABASE_URL` and `MIGRATE_DATABASE_URL` of `fygs` set to the empty database `fygs_v2` on `fygs-prod-db` (22 migrations applied at start).
2. `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` (build variable) set to `https://fygs.dev`, **`TRUSTED_PROXY_HOPS=2`** (Cloudflare, then
   Traefik: with 1 every visitor would share Cloudflare's address in the rate limiter), rebuild, check on the temporary domain.
3. S3 CORS limited to the production origins; the temporary `sslip.io` domains removed from the application and from the storage.
4. `fygs.dev` and `www.fygs.dev` taken off the old application, given to `fygs`, old application stopped, `fygs` restarted (about one minute
   of 503).
5. Old application, `fygs-v2-staging-db` and the database `fygs_prod` deleted (throwaway development data, no rollback needed).

Left for later (tickets): live Stripe (#44, production runs on TEST keys and has no premium content, so do not publish any before),
Cloudflare origin lock (#42), e-mail authentication (#46), merge of the branch into `main` (#45).
