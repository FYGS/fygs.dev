#!/usr/bin/env bash
# Move the production database from the orphaned Neon project to Postgres on Coolify (issue #40).
# Run it yourself, in Git Bash. It never prints a password and never writes a secret inside the repository.
#
#   bash scripts/ops/migrate-neon-to-coolify.sh [dump|restore|check|cutover]     (no argument: dump, restore, check)
#
# dump     reads Neon with the URL Coolify already holds for the live site (read-only), writes a private dump file
# restore  creates database fygs_prod + role fygs_prod on fygs-v2-staging-db and loads the dump (over SSH)
# check    compares row counts Neon vs Coolify for every table
# cutover  points the LIVE site at the new database and restarts it (writes made on Neon after the dump are lost)
set -euo pipefail
export MSYS_NO_PATHCONV=1

COOLIFY_URL="https://deploy.bonsprofs.com"
COOLIFY_FILE="$HOME/.config/fygs-dev/coolify.env"
COOLIFY_FILE_PY="$(cygpath -m "$COOLIFY_FILE" 2>/dev/null || printf %s "$COOLIFY_FILE")"   # native python needs a Windows-style path
LIVE_APP="ljml6qqgunnoa1iyvgctcl7t"
DB_CONTAINER="4beedbxmriijxxeli5oypill"     # fygs-prod-db (postgres:17, dedicated to production)
SSH_TARGET="${SSH_TARGET:-ubuntu@51.68.121.128}"
REMOTE_DOCKER="${REMOTE_DOCKER:-sudo docker}"      # the ubuntu account has sudo but is not in the docker group
SSH_OPTS=(-i "$HOME/.ssh/id_rsa" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=10)
PG_IMAGE="postgres:17-alpine"          # keep it equal to the target server major (Neon is 17)
DIR="$HOME/fygs-dev-backups"; mkdir -p "$DIR"; chmod 700 "$DIR" 2>/dev/null || true
DUMP="$DIR/neon-live.dump"
OUT_ENV="$HOME/.config/fygs-dev/prod-db.env"

say()  { printf '%s\n' "$*"; }
ok()   { printf '  ✓ %s\n' "$*"; }
die()  { printf '  ✗ %s\n' "$*" >&2; exit 1; }
ask_yes() { read -r -p "$1 [y/N] " a; [[ "$a" == "y" || "$a" == "Y" ]]; }

# live_var KEY -> value of a runtime variable of the live app (stdout; callers keep it in a variable, never echo it)
live_var() {
  COOLIFY_FILE="$COOLIFY_FILE_PY" COOLIFY_URL="$COOLIFY_URL" python - "$LIVE_APP" "$1" <<'PY'
import json, os, sys, urllib.request
app, key = sys.argv[1:3]
tok = [l.split("=", 1)[1].strip().strip('"') for l in open(os.environ["COOLIFY_FILE"]) if l.startswith("COOLIFY_API_KEY")][0]
req = urllib.request.Request(f'{os.environ["COOLIFY_URL"]}/api/v1/applications/{app}/envs', headers={"Authorization": "Bearer " + tok})
for e in json.load(urllib.request.urlopen(req, timeout=60)):
    if e["key"] == key and not e.get("is_preview"):
        print(e["value"]); break
PY
}

neon_direct_url() { live_var DATABASE_URL | sed 's/-pooler\././'; }

remote_psql() { # stdin = SQL; $1 = database
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$REMOTE_DOCKER exec -i $DB_CONTAINER sh -c 'psql -U \"\$POSTGRES_USER\" -d $1 -v ON_ERROR_STOP=1 -At'"
}

stage_dump() {
  say "== 1/3 Dump Neon (read-only) =="
  command -v docker >/dev/null || die "docker is required (pg_dump runs in a $PG_IMAGE container)"
  local url; url="$(neon_direct_url)"; [[ -n "$url" ]] || die "could not read DATABASE_URL from Coolify"
  say "  stop writes first if you can (maintenance mode): anything written to Neon after this dump is lost at cutover."
  ask_yes "Dump now?" || exit 0
  NEON_URL="$url" docker run --rm -e NEON_URL "$PG_IMAGE" sh -c 'pg_dump "$NEON_URL" --format=custom --no-owner --no-acl' > "$DUMP" \
    || { rm -f "$DUMP"; die "pg_dump failed (a server version newer than 17 needs a newer PG_IMAGE)"; }
  chmod 600 "$DUMP"
  [[ -s "$DUMP" ]] || die "empty dump"
  ok "dump written: $DUMP ($(du -h "$DUMP" | cut -f1)). It holds your data: keep it private."
}

stage_restore() {
  say "== 2/3 Restore on Coolify ($SSH_TARGET, container $DB_CONTAINER) =="
  [[ -s "$DUMP" ]] || die "no dump: run the dump stage first"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" true 2>/dev/null \
    || die "ssh to $SSH_TARGET failed. install your key first (ssh-copy-id) or set SSH_TARGET=user@host"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$REMOTE_DOCKER ps --format '{{.Names}}' | grep -qx $DB_CONTAINER" || die "container $DB_CONTAINER not running on the server"
  local exists; exists="$(printf "SELECT 1 FROM pg_database WHERE datname='fygs_prod';" | remote_psql postgres)"
  [[ -z "$exists" ]] || die "database fygs_prod already exists: drop it yourself if you want to start over"
  local pw; pw="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 40)"
  printf "CREATE ROLE fygs_prod LOGIN PASSWORD '%s';\nCREATE DATABASE fygs_prod OWNER fygs_prod;\n" "$pw" | remote_psql postgres >/dev/null
  ok "role and database fygs_prod created"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$REMOTE_DOCKER exec -i $DB_CONTAINER sh -c 'pg_restore -U \"\$POSTGRES_USER\" -d fygs_prod --no-owner --no-acl --role=fygs_prod --exit-on-error'" < "$DUMP" \
    || { printf "DROP DATABASE IF EXISTS fygs_prod;
DROP ROLE IF EXISTS fygs_prod;
" | remote_psql postgres >/dev/null || true; die "restore failed: fygs_prod was removed, you can retry"; }
  ok "data restored"
  umask 077
  printf 'PROD_DATABASE_URL="postgresql://fygs_prod:%s@%s:5432/fygs_prod"\n' "$pw" "$DB_CONTAINER" > "$OUT_ENV"
  ok "new URL stored in $OUT_ENV (mode 0600)"
}

stage_check() {
  say "== 3/3 Compare row counts =="
  local url; url="$(neon_direct_url)"
  local q="SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1;"
  local tables; tables="$(NEON_URL="$url" docker run --rm -e NEON_URL "$PG_IMAGE" sh -c "psql \"\$NEON_URL\" -At -c \"$q\"")"
  local bad=0 t a b
  for t in $tables; do
    a="$(NEON_URL="$url" docker run --rm -e NEON_URL "$PG_IMAGE" sh -c "psql \"\$NEON_URL\" -At -c 'SELECT count(*) FROM \"$t\"'")"
    b="$(printf 'SELECT count(*) FROM "%s";' "$t" | remote_psql fygs_prod)"
    if [[ "$a" == "$b" ]]; then printf '  ✓ %-40s %s\n' "$t" "$a"; else printf '  ✗ %-40s neon=%s coolify=%s\n' "$t" "$a" "$b"; bad=1; fi
  done
  [[ $bad -eq 0 ]] && ok "every table matches" || die "differences found: do not cut over"
}

stage_cutover() {
  say "== Cutover: the LIVE site now uses Postgres on Coolify =="
  [[ -r "$OUT_ENV" ]] || die "no $OUT_ENV: run the restore stage first"
  # shellcheck disable=SC1090
  . "$OUT_ENV"
  say "  The site restarts (1-2 minutes). Rows written on Neon after the dump are lost."
  ask_yes "Switch the live site to the new database?" || exit 0
  for k in DATABASE_URL MIGRATE_DATABASE_URL; do
    VALUE="$PROD_DATABASE_URL" COOLIFY_FILE="$COOLIFY_FILE_PY" COOLIFY_URL="$COOLIFY_URL" python - "$LIVE_APP" "$k" <<'PY'
import json, os, sys, urllib.request, urllib.error
app, key = sys.argv[1:3]
tok = [l.split("=", 1)[1].strip().strip('"') for l in open(os.environ["COOLIFY_FILE"]) if l.startswith("COOLIFY_API_KEY")][0]
def call(m, p, body=None):
    r = urllib.request.Request(os.environ["COOLIFY_URL"] + "/api/v1" + p, method=m, data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json", "Accept": "application/json"})
    raw = urllib.request.urlopen(r, timeout=60).read().decode(); return json.loads(raw) if raw else {}
have = [e for e in call("GET", f"/applications/{app}/envs") if e["key"] == key and not e.get("is_preview")]
body = {"key": key, "value": os.environ["VALUE"]}
if have: call("PATCH", f"/applications/{app}/envs", body)
else: call("POST", f"/applications/{app}/envs", {**body, "is_buildtime": False, "is_runtime": True})
print(f"  set {key}")
PY
  done
  local tok; tok="$(grep '^COOLIFY_API_KEY=' "$COOLIFY_FILE" | cut -d= -f2- | tr -d '\r"')"
  curl -s -m 60 -X POST -H "Authorization: Bearer $tok" "$COOLIFY_URL/api/v1/applications/$LIVE_APP/restart" >/dev/null && ok "restart queued"
  say "  Verify in 2 minutes: the site loads, you can log in (sessions were reset), /api/health answers ok."
  say "  If the app cannot reach the database (different Docker network), tell Claude: do not revert to Neon."
}

case "${1:-all}" in
  dump) stage_dump ;;
  restore) stage_restore ;;
  check) stage_check ;;
  cutover) stage_cutover ;;
  all) stage_dump; stage_restore; stage_check; say ""; say "Next: bash $0 cutover" ;;
  *) sed -n '2,11p' "$0"; exit 1 ;;
esac
