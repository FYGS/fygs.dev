#!/bin/sh
# Only Cloudflare may reach fygs.dev / www.fygs.dev on the shared Coolify server (issue #42). Runs ON THE SERVER, as root.
#
#   fygs-cloudflare-origin.sh apply                 fetch Cloudflare's ranges and install the Traefik rule
#   fygs-cloudflare-origin.sh apply-guarded [secs]  same, and remove it after N seconds (default 90) unless /run/fygs-cf-keep exists
#   fygs-cloudflare-origin.sh refresh               re-fetch the ranges and rewrite the rule only if the rule is installed (timer)
#   fygs-cloudflare-origin.sh rollback              remove the rule (fygs.dev is served as before)
#   fygs-cloudflare-origin.sh status                show what is installed
#
# How it works
#   Traefik's file provider (/data/coolify/proxy/dynamic, not managed by Coolify) declares ONE router with priority 10000 for the two
#   hosts of the app, that wins over the routers Coolify generates and sends to the SAME service (https-0-<app uuid>@docker). An
#   ipAllowList middleware on it answers 403 to any client that is not in Cloudflare's published ranges. Nothing else changes: other
#   hosts (s3.fygs.dev, staging, the other projects) keep their routers; Coolify's labels are not edited; the redirect on port 80 is
#   left alone (it leaks nothing).
#   Known limit: any Cloudflare customer can send traffic from those ranges with Host: fygs.dev. Closing that needs a secret header
#   added by a Cloudflare rule, or Authenticated Origin Pulls with a per-zone certificate (see the issue).
set -eu

APP_UUID="dyvhvasvhwmzoc22iodzuygm"            # fygs, production (Coolify)
HOSTS='Host(`fygs.dev`) || Host(`www.fygs.dev`)'
DIR="${FYGS_CF_DIR:-/data/coolify/proxy/dynamic}"
FILE="$DIR/fygs-cloudflare-only.yaml"
KEEP=/run/fygs-cf-keep

fetch_ranges() {
  v4=$(curl -fsS -m 20 https://www.cloudflare.com/ips-v4) || { echo "cannot fetch Cloudflare's IPv4 ranges: refusing" >&2; return 1; }
  v6=$(curl -fsS -m 20 https://www.cloudflare.com/ips-v6) || { echo "cannot fetch Cloudflare's IPv6 ranges: refusing" >&2; return 1; }
  # A truncated or hijacked answer would lock the site out: demand a sane shape
  n4=$(printf '%s\n' "$v4" | grep -cE '^[0-9]{1,3}(\.[0-9]{1,3}){3}/[0-9]{1,2}$' || true)
  n6=$(printf '%s\n' "$v6" | grep -cE '^[0-9a-fA-F:]+/[0-9]{1,3}$' || true)
  [ "$n4" -ge 10 ] && [ "$n6" -ge 5 ] || { echo "unexpected Cloudflare list ($n4 IPv4, $n6 IPv6): refusing" >&2; return 1; }
  [ "$n4" = "$(printf '%s\n' "$v4" | grep -c .)" ] && [ "$n6" = "$(printf '%s\n' "$v6" | grep -c .)" ] || { echo "Cloudflare list has unexpected lines: refusing" >&2; return 1; }
}

write_rule() {
  fetch_ranges
  tmp=$(mktemp "$DIR/.fygs-cf.XXXXXX")
  {
    echo "# Managed by fygs-cloudflare-origin.sh (issue #42): do not edit, run the script"
    echo "http:"
    echo "  middlewares:"
    echo "    fygs-cloudflare-only:"
    echo "      ipAllowList:"
    echo "        sourceRange:"
    printf '%s\n%s\n' "$v4" "$v6" | sed 's/^/          - "/; s/$/"/'
    echo "  routers:"
    echo "    fygs-cloudflare-https:"
    echo "      entryPoints:"
    echo "        - https"
    echo "      rule: \"$HOSTS\""
    echo "      priority: 10000"
    echo "      middlewares:"
    echo "        - fygs-cloudflare-only"
    echo "        - gzip-sse@docker"
    echo "      service: https-0-$APP_UUID@docker"
    echo "      tls:"
    echo "        certResolver: letsencrypt"
  } > "$tmp"
  chmod 644 "$tmp"
  mv "$tmp" "$FILE"      # atomic: Traefik never reads a half-written file
}

case "${1:-}" in
  apply)
    [ -d "$DIR" ] || { echo "no $DIR" >&2; exit 2; }
    write_rule
    echo "installed: only Cloudflare's ranges reach fygs.dev and www.fygs.dev"
    ;;
  apply-guarded)
    [ -d "$DIR" ] || { echo "no $DIR" >&2; exit 2; }
    secs="${2:-90}"
    rm -f "$KEEP"
    write_rule
    nohup sh -c "sleep $secs; [ -e $KEEP ] || rm -f $FILE" >/dev/null 2>&1 &
    echo "installed; removed again in ${secs}s unless $KEEP exists"
    ;;
  refresh)
    [ -e "$FILE" ] || { echo "not installed: nothing to refresh"; exit 0; }
    write_rule
    echo "ranges refreshed"
    ;;
  rollback)
    rm -f "$FILE"
    echo "rule removed"
    ;;
  status)
    if [ -e "$FILE" ]; then echo "installed ($(grep -c '^          - ' "$FILE") ranges), written $(date -r "$FILE" '+%F %T')"; else echo "not installed"; fi
    ;;
  *)
    sed -n '2,19p' "$0"
    exit 1
    ;;
esac
